import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const statusFilter = request.nextUrl.searchParams.get('status')

    const where: any = { userId: dbUser.id }
    if (statusFilter && ['IN_PROGRESS', 'SUBMITTED', 'SCORED', 'COMPLETED', 'FAILED'].includes(statusFilter)) {
      where.status = statusFilter
    }

    const sessions = await prisma.testSession.findMany({
      where,
      include: {
        result: true,
        answers: true,
        _count: { select: { answers: true } },
      },
      orderBy: { startedAt: 'desc' },
    })

    const mapped = sessions.map((s) => {
      const answeredQuestions = s.answers ? s.answers.length : 0
      const totalQuestions = s.questionIds ? s.questionIds.length : 0
      const product = 'BIGT Akademik'

      return {
        id: s.id,
        product,
        status: s.status,
        totalQuestions,
        answeredQuestions,
        score: s.result?.overallScore ?? null,
        level: s.result?.overallLevel ?? null,
        dimensions: s.result
          ? [
              { name: 'LISTENING', score: s.result.listeningScore },
              { name: 'READING', score: s.result.readingScore },
              { name: 'SPEAKING', score: s.result.speakingScore },
              { name: 'WRITING', score: s.result.writingScore },
            ].filter((d) => d.score != null)
          : [],
        startedAt: s.startedAt.toISOString(),
        finishedAt: s.finishedAt?.toISOString() ?? null,
        durationSeconds: s.durationSeconds,
      }
    })

    const completed = mapped.filter((s) => s.status === 'COMPLETED' || s.status === 'SCORED')
    const inProgress = mapped.filter((s) => s.status === 'IN_PROGRESS')
    const highestScore = completed.length > 0
      ? Math.round(Math.max(...completed.map((s) => s.score ?? 0)))
      : null

    return NextResponse.json({
      success: true,
      sessions: mapped,
      summary: {
        total: mapped.length,
        completed: completed.length,
        inProgress: inProgress.length,
        highestScore,
      },
    })
  } catch (err: any) {
    console.error('Error fetching test history:', err)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat riwayat tes.' },
      { status: 500 }
    )
  }
}
