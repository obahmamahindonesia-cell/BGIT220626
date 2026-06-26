import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { resolveBigtLevel, mapToTestResultData } from '@/lib/test-scoring/resolveBigtLevel'
import { resolveLevelExamResult, mapLevelToTestResultData } from '@/lib/test-scoring/resolveLevelExamResult'
import type { ScoredItem } from '@/lib/test-scoring/resolveBigtLevel'
import type { BlueprintId } from '@/lib/test-blueprint/bigtBlueprint'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CEFR_SCORE_THRESHOLDS = [
  { level: 'C2', minScore: 90 },
  { level: 'C1', minScore: 75 },
  { level: 'B2', minScore: 60 },
  { level: 'B1', minScore: 45 },
  { level: 'A2', minScore: 30 },
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
            question: { select: { id: true, dimension: true, code: true, level: true } },
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

    const completedAt = new Date()

    // === BLUEPRINT-BASED SCORING ===
    const metadata = session.metadata as any
    const blueprintId = metadata?.blueprintId as string | undefined

    const isLevelBlueprint = blueprintId && ['A1_LEVEL_EXAM', 'A2_LEVEL_EXAM', 'A1_A2_PLACEMENT', 'QUICK_PLACEMENT'].includes(blueprintId)

    if (isLevelBlueprint) {
      const scoredItems: ScoredItem[] = session.sessionItems.map(item => {
        const snapshot = item.questionSnapshot as any
        const code = item.question?.code || ''
        const isCorrect = item.answer?.isCorrect ?? false
        return {
          questionId: code,
          cefr: item.question?.level || snapshot?.cefr || (code.startsWith('BIGT-A1') ? 'A1' : 'A2'),
          skill: item.dimension === 'READING' ? 'reading' : 'listening',
          subskill: snapshot?.subskill || '',
          difficulty: item.difficulty || 5,
          isCorrect,
          score: item.answer?.score || 0,
          maxScore: item.maxScore || 10,
        }
      })

      const result = resolveLevelExamResult(session.id, blueprintId, scoredItems)
      const testResultData = mapLevelToTestResultData(result)

      await prisma.testSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          completedAt,
          durationSeconds,
          totalScore: result.percentage,
          cefrLevel: result.resultLevel,
        },
      })

      const testResult = await prisma.testResult.create({
        data: {
          sessionId: session.id,
          overallLevel: result.resultLevel as any,
          overallScore: result.percentage,
          listeningScore: result.listeningTotal > 0 ? (result.listeningScore / result.listeningTotal) * 100 : null,
          readingScore: result.readingTotal > 0 ? (result.readingScore / result.readingTotal) * 100 : null,
          recommendations: testResultData.recommendations as any,
        },
      })

      await prisma.userProfile.updateMany({
        where: { userId: dbUser.id },
        data: { currentLevel: result.resultLevel },
      })

      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          blueprintId: result.blueprintId,
          targetLevel: result.targetLevel,
          totalScore: result.totalScore,
          totalItems: result.totalItems,
          percentage: result.percentage,
          resultLevel: result.resultLevel,
          resultLabel: result.resultLabel,
          readingScore: result.readingScore,
          readingTotal: result.readingTotal,
          listeningScore: result.listeningScore,
          listeningTotal: result.listeningTotal,
          levelBreakdown: result.levelBreakdown,
          skillBreakdown: result.skillBreakdown,
          recommendation: result.recommendation,
          canProceedTo: result.canProceedTo,
          skillFloorHit: result.skillFloorHit,
          resultId: testResult.id,
        },
      })
    }

    if (blueprintId && isBlueprintId(blueprintId)) {
      const scoredItems: ScoredItem[] = session.sessionItems.map(item => {
        const snapshot = item.questionSnapshot as any
        const code = item.question?.code || ''
        const isCorrect = item.answer?.isCorrect ?? false
        return {
          questionId: code,
          cefr: item.question?.level || snapshot?.cefr || (code.startsWith('BIGT-A1') ? 'A1' : 'A2'),
          skill: item.dimension === 'READING' ? 'reading' : 'listening',
          subskill: snapshot?.subskill || '',
          difficulty: item.difficulty || 5,
          isCorrect,
          score: item.answer?.score || 0,
          maxScore: item.maxScore || 10,
        }
      })

      const result = resolveBigtLevel(session.id, blueprintId as BlueprintId, scoredItems)
      const testResultData = mapToTestResultData(result)

      // Update session
      await prisma.testSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          completedAt,
          durationSeconds,
          totalScore: result.percentage,
          cefrLevel: result.resultLevel,
        },
      })

      // Create TestResult
      const testResult = await prisma.testResult.create({
        data: {
          sessionId: session.id,
          overallLevel: result.resultLevel as any,
          overallScore: result.percentage,
          listeningScore: result.listeningTotal > 0 ? (result.listeningScore / result.listeningTotal) * 100 : null,
          readingScore: result.readingTotal > 0 ? (result.readingScore / result.readingTotal) * 100 : null,
          recommendations: testResultData.recommendations as any,
        },
      })

      // Sync UserProfile.currentLevel
      await prisma.userProfile.updateMany({
        where: { userId: dbUser.id },
        data: { currentLevel: result.resultLevel },
      })

      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          blueprintId: result.blueprintId,
          totalScore: result.totalScore,
          totalItems: result.totalItems,
          percentage: result.percentage,
          resultLevel: result.resultLevel,
          resultLabel: result.resultLabel,
          readingScore: result.readingScore,
          readingTotal: result.readingTotal,
          listeningScore: result.listeningScore,
          listeningTotal: result.listeningTotal,
          levelBreakdown: result.levelBreakdown,
          skillBreakdown: result.skillBreakdown,
          recommendation: result.recommendation,
          canProceedTo: result.canProceedTo,
          skillFloorHit: result.skillFloorHit,
          resultId: testResult.id,
        },
      })
    }

    // === LEGACY SCORING (non-blueprint) ===
    const answeredItems = session.sessionItems.filter(item => item.answer)
    const totalItems = session.sessionItems.length
    const totalScore = answeredItems.reduce((sum, item) => sum + (item.answer?.score || 0), 0)
    const maxPossibleScore = totalItems * 10
    const scorePercent = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

    let cefrLevel = 'A1'
    for (const threshold of CEFR_SCORE_THRESHOLDS) {
      if (scorePercent >= threshold.minScore) {
        cefrLevel = threshold.level
        break
      }
    }

    const dimScores: Record<string, number[]> = {}
    for (const item of answeredItems) {
      const dim = (item.question?.dimension || item.dimension || (item.questionSnapshot as any)?.dimension) as string | null
      if (!dim) continue
      if (!dimScores[dim]) dimScores[dim] = []
      dimScores[dim].push(item.answer?.score || 0)
    }

    const dimAverages: Record<string, number> = {}
    for (const [dim, scores] of Object.entries(dimScores)) {
      dimAverages[dim] = scores.reduce((a, b) => a + b, 0) / scores.length
    }

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

    await prisma.userProfile.updateMany({
      where: { userId: dbUser.id },
      data: { currentLevel: cefrLevel },
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

function isBlueprintId(id: string): id is BlueprintId {
  return ['A1_DIAGNOSTIC', 'A2_DIAGNOSTIC', 'A1_A2_PLACEMENT', 'QUICK_PLACEMENT'].includes(id)
}
