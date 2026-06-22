import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { scoreWriting, scoreSpeaking } from '@/lib/ai-scorer'
import { createCertificate } from '@/lib/certificate'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json()
  const { sessionId } = body

  const session = await prisma.testSession.findFirst({
    where: {
      id: sessionId,
      userId: dbUser.id,
      status: 'IN_PROGRESS',
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found or already completed' },
      { status: 404 }
    )
  }

  const aiScoringPromises = session.answers
    .filter(answer => 
      (answer.question.type === 'ESSAY' || answer.question.type === 'AUDIO_RESPONSE') &&
      !answer.aiScore
    )
    .map(async (answer) => {
      try {
        let scoreResult: any

        if (answer.question.type === 'ESSAY') {
          const response = answer.response as any
          scoreResult = await scoreWriting(
            (answer.question.content as any)?.prompt || '',
            response?.text || '',
            answer.question.rubric as any,
            answer.question.level
          )
        } else if (answer.question.type === 'AUDIO_RESPONSE') {
          const response = answer.response as any
          scoreResult = await scoreSpeaking(
            response?.audioBase64 || '',
            (answer.question.content as any)?.prompt || '',
            answer.question.level
          )
        }

        if (scoreResult) {
          await prisma.answer.update({
            where: { id: answer.id },
            data: {
              aiScore: scoreResult.score,
              aiFeedback: JSON.stringify(scoreResult),
              scoredAt: new Date(),
            },
          })
        }
      } catch (error) {
        console.error(`Error scoring answer ${answer.id}:`, error)
      }
    })

  await Promise.all(aiScoringPromises)

  const updatedSession = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  })

  if (!updatedSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const dimensionScores: any = {
    LISTENING: { total: 0, earned: 0 },
    READING: { total: 0, earned: 0 },
    SPEAKING: { total: 0, earned: 0 },
    WRITING: { total: 0, earned: 0 },
    MEDIATION: { total: 0, earned: 0 },
    INTEGRATED: { total: 0, earned: 0 },
  }

  updatedSession.answers.forEach(answer => {
    const dimension = answer.question.dimension
    const points = answer.question.points
    const score = answer.aiScore ?? answer.rawScore ?? 0

    dimensionScores[dimension].total += points
    dimensionScores[dimension].earned += score
  })

  const calculatePercentage = (total: number, earned: number) => {
    return total > 0 ? (earned / total) * 100 : 0
  }

  const listeningScore = calculatePercentage(dimensionScores.LISTENING.total, dimensionScores.LISTENING.earned)
  const readingScore = calculatePercentage(dimensionScores.READING.total, dimensionScores.READING.earned)
  const speakingScore = calculatePercentage(dimensionScores.SPEAKING.total, dimensionScores.SPEAKING.earned)
  const writingScore = calculatePercentage(dimensionScores.WRITING.total, dimensionScores.WRITING.earned)
  const mediationScore = calculatePercentage(dimensionScores.MEDIATION.total, dimensionScores.MEDIATION.earned)
  const integratedScore = calculatePercentage(dimensionScores.INTEGRATED.total, dimensionScores.INTEGRATED.earned)

  const overallScore = (listeningScore + readingScore + speakingScore + writingScore + mediationScore + integratedScore) / 6

  const getCEFRLevel = (score: number): string => {
    if (score >= 90) return 'C2'
    if (score >= 75) return 'C1'
    if (score >= 60) return 'B2'
    if (score >= 40) return 'B1'
    if (score >= 20) return 'A2'
    return 'A1'
  }

  const overallLevel = getCEFRLevel(overallScore)

  const recommendations = []
  
  if (listeningScore < 60) {
    recommendations.push({
      dimension: 'LISTENING',
      score: listeningScore,
      suggestion: 'Practice listening to Indonesian podcasts and conversations daily',
    })
  }
  
  if (readingScore < 60) {
    recommendations.push({
      dimension: 'READING',
      score: readingScore,
      suggestion: 'Read Indonesian articles and books regularly to improve comprehension',
    })
  }
  
  if (speakingScore < 60) {
    recommendations.push({
      dimension: 'SPEAKING',
      score: speakingScore,
      suggestion: 'Practice speaking with native speakers or language partners',
    })
  }
  
  if (writingScore < 60) {
    recommendations.push({
      dimension: 'WRITING',
      score: writingScore,
      suggestion: 'Write journal entries or essays in Indonesian regularly',
    })
  }

  const testResult = await prisma.testResult.create({
    data: {
      sessionId: session.id,
      overallLevel: overallLevel as any,
      overallScore,
      listeningScore,
      readingScore,
      speakingScore,
      writingScore,
      mediationScore,
      integratedScore,
      recommendations,
    },
  })

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      finishedAt: new Date(),
    },
  })

  let certificate = null
  try {
    certificate = await createCertificate(testResult.id)
  } catch (error) {
    console.error('Error generating certificate:', error)
  }

  return NextResponse.json({
    result: testResult,
    certificate,
    session: {
      id: session.id,
      status: 'COMPLETED',
    },
  })
}
