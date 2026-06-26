import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    if (statusFilter && ['CONFIGURED', 'IN_PROGRESS', 'SUBMITTED', 'SCORED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(statusFilter)) {
      where.status = statusFilter
    }

    const sessions = await prisma.testSession.findMany({
      where,
      include: {
        result: true,
        sessionItems: { include: { answer: true } },
      },
      orderBy: { startedAt: 'desc' },
    })

    const mapped = sessions.map((s) => {
      const answeredQuestions = s.sessionItems.filter(i => i.answer).length
      const totalQuestions = s.questionCount || s.sessionItems.length
      const product = s.product || 'BIGT Akademik'

      // Map old statuses for backward compat
      const displayStatus = s.status === 'CONFIGURED' ? 'IN_PROGRESS' : s.status

      return {
        id: s.id,
        product,
        status: displayStatus,
        totalQuestions,
        answeredQuestions,
        score: s.totalScore ?? null,
        level: s.cefrLevel ?? null,
        dimensions: s.result
          ? [
              { name: 'LISTENING', score: s.result.listeningScore },
              { name: 'READING', score: s.result.readingScore },
              { name: 'SPEAKING', score: s.result.speakingScore },
              { name: 'WRITING', score: s.result.writingScore },
              { name: 'MEDIATION', score: s.result.mediationScore },
              { name: 'INTEGRATED', score: s.result.integratedScore },
            ].filter((d) => d.score != null)
          : [],
        startedAt: s.startedAt.toISOString(),
        finishedAt: s.completedAt?.toISOString() ?? null,
        durationSeconds: s.durationSeconds,
      }
    })

    const completed = mapped.filter((s) => s.status === 'COMPLETED' || s.status === 'SCORED' || s.status === 'SUBMITTED')
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
