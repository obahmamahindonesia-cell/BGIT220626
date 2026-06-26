import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getQuestionsForTest } from '@/lib/question-bank/loadQuestionBank'
import { syncQuestionItem } from '@/lib/question-bank/syncQuestionItem'
import type { Cefr, Skill } from '@/types/question-bank'

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

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { cefr, skill, limit = 10 } = body

    const validCefr: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const validSkills: Skill[] = ['reading', 'listening', 'writing', 'speaking', 'integrated']

    if (!validCefr.includes(cefr)) {
      return NextResponse.json({ success: false, error: `CEFR "${cefr}" tidak valid.` }, { status: 400 })
    }
    if (!validSkills.includes(skill)) {
      return NextResponse.json({ success: false, error: `Skill "${skill}" tidak valid.` }, { status: 400 })
    }

    const questions = getQuestionsForTest({ cefr, skill, limit })

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Tidak ada soal untuk ${cefr} ${skill}.`,
      }, { status: 422 })
    }

    const session = await prisma.testSession.create({
      data: {
        userId: dbUser.id,
        product: 'TRYOUT',
        targetLevel: cefr,
        status: 'IN_PROGRESS',
        questionCount: questions.length,
        metadata: {
          source: 'file-bank',
          cefr,
          skill,
          durationMinutes: Math.max(10, Math.round(questions.length * 1.5)),
        },
      },
    })

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const prismaId = await syncQuestionItem(q.questionId)

      if (!prismaId) {
        console.warn(`Could not sync question ${q.questionId}, skipping`)
        continue
      }

      const dimMap: Record<string, string> = {
        reading: 'READING',
        listening: 'LISTENING',
        writing: 'WRITING',
        speaking: 'SPEAKING',
        integrated: 'INTEGRATED',
      }

      await prisma.testSessionItem.create({
        data: {
          sessionId: session.id,
          questionId: prismaId,
          order: i + 1,
          dimension: (dimMap[skill] || 'READING') as any,
          level: cefr as any,
          difficulty: Math.max(1, Math.round(q.difficulty * 18)),
          questionSnapshot: q as any,
          maxScore: q.points * 10,
        },
      })
    }

    const finalItems = await prisma.testSessionItem.count({ where: { sessionId: session.id } })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        redirectTo: `/test/${session.id}`,
        questionCount: finalItems,
        questions: questions.map(q => ({
          questionId: q.questionId,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          passageTitle: q.passageTitle,
          passageText: q.passageText,
          audioUrl: q.audioUrl,
          topic: q.topic,
          subskill: q.subskill,
          difficulty: q.difficulty,
          points: q.points,
        })),
      },
    })
  } catch (err: any) {
    console.error('Error starting tryout:', err)
    return NextResponse.json({ success: false, error: err.message || 'Gagal memulai tryout.' }, { status: 500 })
  }
}
