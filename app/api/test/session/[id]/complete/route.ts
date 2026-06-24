import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const CEFR_SCORE_THRESHOLDS = [
  { level: 'C2', minScore: 90 },
  { level: 'C1', minScore: 75 },
  { level: 'B2', minScore: 60 },
  { level: 'B1', minScore: 45 },
  { level: 'A2', minScore: 25 },
  { level: 'A1', minScore: 0 },
]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const session = await prisma.testSession.findUnique({
      where: { id: params.id },
      include: {
        sessionItems: {
          include: {
            answer: true,
            question: { select: { id: true, dimension: true } },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sesi tidak ditemukan.' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser || session.userId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Sesi bukan milik Anda.' }, { status: 403 })
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: false, error: 'Sesi sudah selesai.' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const durationSeconds = body.durationSeconds || null

    // Calculate scores
    const answeredItems = session.sessionItems.filter(item => item.answer)
    const totalItems = session.sessionItems.length
    const totalScore = answeredItems.reduce((sum, item) => sum + (item.answer?.score || 0), 0)
    const maxPossibleScore = totalItems * 10
    const scorePercent = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

    // Determine CEFR level
    let cefrLevel = 'A1'
    for (const threshold of CEFR_SCORE_THRESHOLDS) {
      if (scorePercent >= threshold.minScore) {
        cefrLevel = threshold.level
        break
      }
    }

    // Calculate per-dimension scores
    const dimScores: Record<string, number[]> = {}
    for (const item of answeredItems) {
      const dim = item.question.dimension
      if (!dimScores[dim]) dimScores[dim] = []
      dimScores[dim].push(item.answer?.score || 0)
    }

    const dimAverages: Record<string, number> = {}
    for (const [dim, scores] of Object.entries(dimScores)) {
      dimAverages[dim] = scores.reduce((a, b) => a + b, 0) / scores.length
    }

    // Update session
    const completedAt = new Date()
    await prisma.testSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        completedAt,
        durationSeconds,
        totalScore: scorePercent,
        cefrLevel,
      },
    })

    // Create TestResult
    const result = await prisma.testResult.create({
      data: {
        sessionId: session.id,
        overallLevel: cefrLevel as any,
        overallScore: scorePercent,
        listeningScore: dimAverages['LISTENING'] || null,
        readingScore: dimAverages['READING'] || null,
        speakingScore: dimAverages['SPEAKING'] || null,
        writingScore: dimAverages['WRITING'] || null,
        mediationScore: dimAverages['MEDIATION'] || null,
        integratedScore: dimAverages['INTEGRATED'] || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        totalScore: Math.round(scorePercent),
        cefrLevel,
        dimensionScores: dimAverages,
        totalAnswered: answeredItems.length,
        totalQuestions: totalItems,
        durationSeconds,
        resultId: result.id,
      },
    })
  } catch (err: any) {
    console.error('Error completing session:', err)
    return NextResponse.json({ success: false, error: 'Gagal menyelesaikan sesi.' }, { status: 500 })
  }
}
