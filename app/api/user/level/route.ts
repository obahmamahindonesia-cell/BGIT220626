import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const CEFR_LABELS: Record<string, string> = {
  A1: 'Pemula',
  A2: 'Dasar',
  B1: 'Madya',
  B2: 'Madya Atas',
  C1: 'Mahir',
  C2: 'Sangat Mahir',
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) {
      return NextResponse.json({
        level: null,
        label: null,
        progressPercent: 0,
        hasTest: false,
        hasPendingTest: false,
        source: null,
      })
    }

    const latestResult = await prisma.testResult.findFirst({
      where: { session: { userId: dbUser.id } },
      orderBy: { createdAt: 'desc' },
    })

    const pendingSession = await prisma.testSession.findFirst({
      where: { userId: dbUser.id, status: 'IN_PROGRESS' },
    })

    let level: string | null = null
    let source: string | null = null

    if (latestResult) {
      level = latestResult.overallLevel
      source = 'latest'
    }

    if (level && CEFR_LEVELS.includes(level as any)) {
      const levelIndex = CEFR_LEVELS.indexOf(level as any)
      const progressPercent = ((levelIndex + 1) / CEFR_LEVELS.length) * 100
      return NextResponse.json({
        level,
        label: CEFR_LABELS[level],
        progressPercent,
        hasTest: true,
        hasPendingTest: !!pendingSession,
        source,
      })
    }

    if (pendingSession) {
      return NextResponse.json({
        level: null,
        label: null,
        progressPercent: 0,
        hasTest: false,
        hasPendingTest: true,
        source: null,
      })
    }

    return NextResponse.json({
      level: null,
      label: null,
      progressPercent: 0,
      hasTest: false,
      hasPendingTest: false,
      source: null,
    })
  } catch (error) {
    console.error('Error fetching user level:', error)
    return NextResponse.json({
      level: null,
      label: null,
      progressPercent: 0,
      hasTest: false,
      hasPendingTest: false,
      source: null,
      error: 'Level belum tersedia',
    })
  }
}
