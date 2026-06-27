import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { selectTrialItems } from '@/lib/test-assembly/selectTrialItems'
import { syncQuestionItem } from '@/lib/question-bank/syncQuestionItem'
import { CONSTRUCTED_RESPONSE } from '@/lib/features/constructed-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check — only admin/founder can start trial mode
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: { profile: true },
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const isAdmin = dbUser.role === 'ADMIN'
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Hanya admin yang dapat memulai mode uji coba.' }, { status: 403 })
    }

    if (!CONSTRUCTED_RESPONSE.CONSTRUCTED_TRIAL_MODE_ENABLED) {
      return NextResponse.json({ success: false, error: 'Mode uji coba sedang dinonaktifkan.' }, { status: 403 })
    }

    const body = await request.json()
    const { level, mode } = body

    if (!level || !['A1', 'A2'].includes(level)) {
      return NextResponse.json({ success: false, error: 'Level harus A1 atau A2.' }, { status: 400 })
    }
    if (!mode || !['trial_constructed', 'dev_full'].includes(mode)) {
      return NextResponse.json({ success: false, error: 'Mode harus trial_constructed atau dev_full.' }, { status: 400 })
    }

    const product = mode === 'dev_full' ? 'DEV_FULL' : `TRIAL_${level}`
    const durationMin = mode === 'dev_full' ? 60 : level === 'A1' ? 45 : 50

    const assembly = selectTrialItems(level, mode)
    if (!assembly.success || assembly.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Gagal menyusun tes uji coba: ' + (assembly.error || 'tidak ada soal.'),
        warnings: assembly.warnings,
      }, { status: 422 })
    }

    const session = await prisma.testSession.create({
      data: {
        userId: dbUser.id,
        product,
        targetLevel: level,
        status: 'IN_PROGRESS',
        questionCount: assembly.items.length,
        metadata: {
          examMode: mode,
          trialLevel: level,
          durationMinutes: durationMin,
          sections: assembly.sections.map(s => ({ skill: s.skill, count: s.items.length })),
          warnings: assembly.warnings,
        },
      },
    })

    const dimMap: Record<string, string> = {
      reading: 'READING', listening: 'LISTENING',
      writing: 'WRITING', speaking: 'SPEAKING',
      integrated: 'INTEGRATED', mediation: 'MEDIATION',
    }

    for (let i = 0; i < assembly.items.length; i++) {
      const q = assembly.items[i]
      const skill = q.trialSkill || 'reading'
      const dim = dimMap[skill] || 'READING'
      const cefrGuess = q.trialLevel || (q.questionId?.startsWith('BIGT-A1') ? 'A1' : 'A2') || level

      let prismaId: string | null = null
      try {
        prismaId = await syncQuestionItem(q.questionId)
      } catch {
        // If sync fails (e.g. constructed item), create minimal QuestionItem
        const created = await prisma.questionItem.create({
          data: {
            code: q.questionId,
            dimension: dim as any,
            subskill: q.subskill || '',
            questionType: q.questionType as any || 'MCQ',
            level: cefrGuess as any,
            difficulty: Math.max(1, Math.round((q.difficulty || 0.5) * 18)),
            prompt: q.prompt,
            status: 'DRAFT',
            tags: ['file-bank', `trial:${product}`],
          },
        })
        prismaId = created.id
      }

      if (!prismaId) continue

      await prisma.testSessionItem.create({
        data: {
          sessionId: session.id,
          questionId: prismaId,
          order: i + 1,
          dimension: dim as any,
          level: cefrGuess as any,
          difficulty: Math.max(1, Math.round((q.difficulty || 0.5) * 18)),
          questionSnapshot: q as any,
          maxScore: q.constructed?.maxScore || q.points || 10,
        },
      })
    }

    const finalItems = await prisma.testSessionItem.count({ where: { sessionId: session.id } })
    if (finalItems === 0) {
      await prisma.testSession.delete({ where: { id: session.id } })
      return NextResponse.json({ success: false, error: 'Gagal menyinkronkan soal.' }, { status: 500 })
    }

    const questions = assembly.items.map(q => ({
      questionId: q.questionId,
      type: q.questionType,
      subskill: q.subskill,
      difficulty: q.difficulty,
      prompt: q.prompt,
      options: q.options || undefined,
      passageTitle: q.passageTitle,
      passageText: q.passageText,
      audioUrl: q.audioUrl,
      stimulus: q.stimulus,
      topic: q.topic,
      points: q.points,
      instruction: q.instruction,
      constructed: q.constructed,
      trialSkill: q.trialSkill,
      trialLevel: q.trialLevel,
    }))

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        product,
        targetLevel: level,
        totalItems: finalItems,
        estimatedDurationMinutes: durationMin,
        examMode: mode,
        sections: assembly.sections.map(s => ({
          skill: s.skill,
          count: s.items.length,
        })),
        questions,
        warnings: assembly.warnings,
      },
    })
  } catch (err: any) {
    console.error('Error starting trial test:', err)
    return NextResponse.json({ success: false, error: err.message || 'Gagal memulai uji coba.' }, { status: 500 })
  }
}
