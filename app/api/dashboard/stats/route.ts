import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { calculateIELTSEquivalent } from '@/lib/scoring/level-calculator'

const DIMENSION_LABELS: Record<string, string> = {
  LISTENING: 'Menyimak',
  READING: 'Membaca',
  SPEAKING: 'Berbicara',
  WRITING: 'Menulis',
  MEDIATION: 'Mediasi',
  INTEGRATED: 'Tugas Terintegrasi',
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({
        user: { name: user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna', email: user.email },
        currentLevel: null,
        overallScore: null,
        totalTestsCompleted: 0,
        totalCertificates: 0,
        highestScore: 0,
        studyHours: 0,
        dimensionScores: [],
        scoreHistory: [],
        recentTests: [],
        weakestDimension: null,
        latestCertificate: null,
        pendingSessionCount: 0,
      })
    }

    const completedSessions = await prisma.testSession.findMany({
      where: {
        userId: dbUser.id,
        status: 'COMPLETED',
      },
      orderBy: { startedAt: 'desc' },
      include: {
        result: true,
        _count: { select: { answers: true } },
      },
    })

    const pendingSession = await prisma.testSession.findFirst({
      where: {
        userId: dbUser.id,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
      select: { id: true, startedAt: true, _count: { select: { answers: true } } },
    })

    const latestCertificate = await prisma.certificate.findFirst({
      where: { userId: dbUser.id, isActive: true },
      orderBy: { issuedAt: 'desc' },
    })

    const latestResult = await prisma.testResult.findFirst({
      where: { session: { userId: dbUser.id } },
      orderBy: { createdAt: 'desc' },
    })

    const cefrMap: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }
    const reverseCefr = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

    let currentLevel = null
    let overallScore = null
    if (latestResult) {
      currentLevel = latestResult.overallLevel
      overallScore = Math.round(latestResult.overallScore)
    }

    const dimensionScores = []
    const dims = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'] as const
    for (const dim of dims) {
      const key = `${dim.toLowerCase()}Score` as keyof typeof latestResult
      if (latestResult && latestResult[key] !== null) {
        dimensionScores.push({
          dimension: DIMENSION_LABELS[dim],
          key: dim,
          score: Math.round(Number(latestResult[key])),
        })
      }
    }

    const scoreHistory = completedSessions.slice(0, 5).reverse().map(s => ({
      date: s.startedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      score: s.result ? Math.round(s.result.overallScore) : null,
    }))

    const totalHours = completedSessions.reduce((sum, s) => {
      if (s.durationSeconds) return sum + s.durationSeconds / 3600
      if (s.finishedAt && s.startedAt) {
        const secs = (s.finishedAt.getTime() - s.startedAt.getTime()) / 1000
        return sum + secs / 3600
      }
      return sum
    }, 0)

    const recentTests = completedSessions.slice(0, 4).map(s => {
      const dimsFromSession = (s as any).questionIds?.length
        ? Array.isArray((s as any).questionIds)
          ? ['LISTENING', 'READING', 'WRITING'] 
          : []
        : []
      return {
        id: s.id,
        date: s.startedAt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        dimensions: dimsFromSession,
        score: s.result ? Math.round(s.result.overallScore) : null,
        level: s.result?.overallLevel || null,
        status: s.status,
      }
    })

    let weakestDimension = null
    if (latestResult) {
      const dimScores = [
        { key: 'LISTENING', label: DIMENSION_LABELS.LISTENING, score: latestResult.listeningScore },
        { key: 'READING', label: DIMENSION_LABELS.READING, score: latestResult.readingScore },
        { key: 'SPEAKING', label: DIMENSION_LABELS.SPEAKING, score: latestResult.speakingScore },
        { key: 'WRITING', label: DIMENSION_LABELS.WRITING, score: latestResult.writingScore },
        { key: 'MEDIATION', label: DIMENSION_LABELS.MEDIATION, score: latestResult.mediationScore },
        { key: 'INTEGRATED', label: DIMENSION_LABELS.INTEGRATED, score: latestResult.integratedScore },
      ]
      const sorted = dimScores.sort((a, b) => a.score - b.score)
      if (sorted.length > 0) {
        const weakest = sorted[0]
        const ceifLevelIndex = Math.max(1, Math.min(6, Math.floor(weakest.score / 16) + 1))
        weakestDimension = {
          dimension: weakest.label,
          key: weakest.key,
          score: Math.round(weakest.score),
          level: reverseCefr[ceifLevelIndex],
        }
      }
    }

    const highestScore = completedSessions.reduce((max, s) => {
      return s.result && s.result.overallScore > max ? Math.round(s.result.overallScore) : max
    }, 0)

    const profile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    })

    return NextResponse.json({
      needsOnboarding: !profile?.onboardingCompleted,
      user: {
        name: dbUser.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna',
        email: user.email,
      },
      currentLevel,
      overallScore,
      ieltsEquivalent: latestResult ? calculateIELTSEquivalent(overallScore || 0) : null,
      totalTestsCompleted: completedSessions.length,
      totalCertificates: latestCertificate ? 1 : 0,
      highestScore,
      studyHours: Math.round(totalHours * 10) / 10,
      dimensionScores,
      scoreHistory,
      recentTests,
      weakestDimension,
      latestCertificate: latestCertificate
        ? {
            id: latestCertificate.id,
            certificateId: latestCertificate.certificateId,
            overallLevel: latestCertificate.overallLevel,
            overallScore: Math.round(latestCertificate.overallScore),
            issuedAt: latestCertificate.issuedAt.toISOString(),
          }
        : null,
      pendingSessionCount: pendingSession ? 1 : 0,
      pendingSessionId: pendingSession?.id || null,
      pendingSessionAnswers: pendingSession?._count?.answers || 0,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
