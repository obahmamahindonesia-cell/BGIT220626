import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateWithAI } from '@/lib/scoring/ai-scorer'
import { calculateCEFRLevel, calculateTOEFLEquivalent, calculateIELTSEquivalent, calculateDimensionScore } from '@/lib/scoring/level-calculator'
import { Dimension } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID wajib diisi' }, { status: 400 })
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: { include: { question: true } },
      },
    })

    if (!testSession) {
      return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
    }

    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: 'SUBMITTED',
        finishedAt: new Date(),
        durationSeconds: Math.floor((Date.now() - testSession.startedAt.getTime()) / 1000),
      },
    })

    const aiQuestions = testSession.answers.filter(
      (a) => (a.question.type === 'ESSAY' || a.question.type === 'AUDIO_RESPONSE' || a.question.type === 'SHORT_ANSWER' || a.question.type === 'INTEGRATED_TASK') && a.aiScore === null
    )

    for (const answer of aiQuestions) {
      try {
        const questionContent = answer.question.content as { prompt: string }
        const answerResponse = answer.response as { text?: string }
        const aiResult = await evaluateWithAI(
          questionContent.prompt,
          answerResponse.text || '',
          answer.question.rubric as Parameters<typeof evaluateWithAI>[2]
        )
        await prisma.answer.update({
          where: { id: answer.id },
          data: {
            aiScore: aiResult.score,
            aiFeedback: JSON.stringify(aiResult),
            scoredAt: new Date(),
          },
        })
      } catch {
        console.error(`Failed to score answer ${answer.id}`)
      }
    }

    const updatedAnswers = await prisma.answer.findMany({
      where: { sessionId },
      include: { question: true },
    })

    const dimensionScores: Record<Dimension, number> = {
      LISTENING: 0,
      READING: 0,
      SPEAKING: 0,
      WRITING: 0,
      MEDIATION: 0,
      INTEGRATED: 0,
    }

    const dimensions: Dimension[] = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED']

    for (const dim of dimensions) {
      const dimAnswers = updatedAnswers.filter((a) => a.question.dimension === dim)
      dimensionScores[dim] = calculateDimensionScore(
        dimAnswers.map((a) => ({
          rawScore: a.rawScore,
          aiScore: a.aiScore,
          question: { points: a.question.points },
        }))
      )
      if (dimAnswers.length > 0) {
        const totalPoints = dimAnswers.reduce((sum, a) => sum + a.question.points, 0)
        const earnedPoints = dimAnswers.reduce((sum, a) => {
          const score = a.aiScore ?? a.rawScore ?? 0
          return sum + (score / 10) * a.question.points
        }, 0)
        dimensionScores[dim] = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
      }
    }

    const overallScore = Object.values(dimensionScores).reduce((sum, s) => sum + s, 0) / dimensions.length
    const overallLevel = calculateCEFRLevel(overallScore)

    const recommendations = dimensions.map((dim) => ({
      dimension: dim,
      score: dimensionScores[dim],
      level: calculateCEFRLevel(dimensionScores[dim]),
      feedback: `Skor ${dim} Anda adalah ${dimensionScores[dim].toFixed(1)}%`,
      canDoStatements: [],
      recommendations: [],
    }))

    const testResult = await prisma.testResult.create({
      data: {
        sessionId,
        overallLevel,
        overallScore,
        listeningScore: dimensionScores.LISTENING,
        readingScore: dimensionScores.READING,
        speakingScore: dimensionScores.SPEAKING,
        writingScore: dimensionScores.WRITING,
        mediationScore: dimensionScores.MEDIATION,
        integratedScore: dimensionScores.INTEGRATED,
        toefEquivalent: calculateTOEFLEquivalent(overallScore),
        ieltsEquivalent: calculateIELTSEquivalent(overallScore),
        recommendations,
      },
    })

    await prisma.testSession.update({
      where: { id: sessionId },
      data: { status: 'SCORED' },
    })

    return NextResponse.json({ success: true, result: testResult })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
