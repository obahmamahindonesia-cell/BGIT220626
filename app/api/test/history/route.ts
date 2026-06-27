import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function safeMapSession(s: Record<string, unknown>): Record<string, unknown> | null {
  try {
    const sessionItems = (s.sessionItems as Array<{ answer: unknown }>) || []
    const answeredQuestions = sessionItems.filter(i => i.answer).length
    const totalQuestions = (s.questionCount as number) || sessionItems.length
    const product = (s.product as string) || 'BIGT Akademik'
    const status = (s.status as string) || 'UNKNOWN'
    const displayStatus = status === 'CONFIGURED' ? 'IN_PROGRESS' : status

    const result = s.result as Record<string, unknown> | null

    const dims: Array<{ name: string; score: number | null }> = result
      ? [
          { name: 'LISTENING', score: (result.listeningScore as number) ?? null },
          { name: 'READING', score: (result.readingScore as number) ?? null },
          { name: 'SPEAKING', score: (result.speakingScore as number) ?? null },
          { name: 'WRITING', score: (result.writingScore as number) ?? null },
          { name: 'MEDIATION', score: (result.mediationScore as number) ?? null },
          { name: 'INTEGRATED', score: (result.integratedScore as number) ?? null },
        ].filter(d => d.score != null)
      : []

    return {
      id: s.id as string,
      product,
      status: displayStatus,
      totalQuestions,
      answeredQuestions,
      score: (s.totalScore as number) ?? null,
      level: (s.cefrLevel as string) ?? null,
      dimensions: dims,
      startedAt: s.startedAt instanceof Date
        ? s.startedAt.toISOString()
        : typeof s.startedAt === 'string'
          ? s.startedAt
          : new Date().toISOString(),
      finishedAt: s.completedAt instanceof Date
        ? s.completedAt.toISOString()
        : null,
      durationSeconds: (s.durationSeconds as number) ?? null,
    }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
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

    const where: Record<string, unknown> = { userId: dbUser.id }
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

    const mapped = sessions
      .map(s => safeMapSession(s as unknown as Record<string, unknown>))
      .filter((s): s is Record<string, unknown> => s !== null)

    const completed = mapped.filter(s => s.status === 'COMPLETED' || s.status === 'SCORED' || s.status === 'SUBMITTED')
    const inProgress = mapped.filter(s => s.status === 'IN_PROGRESS')
    const scores = completed.map(s => (s.score as number) ?? 0)
    const highestScore = scores.length > 0 ? Math.round(Math.max(...scores)) : null

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
    console.error('[test-history:get] failed', {
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
    })
    return NextResponse.json(
      { success: false, error: 'Gagal memuat riwayat tes.', code: 'TEST_HISTORY_LOAD_FAILED' },
      { status: 500 }
    )
  }
}
