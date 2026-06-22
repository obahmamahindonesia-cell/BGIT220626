import { NextRequest, NextResponse } from 'next/server'
import { scoreWriting, scoreSpeaking } from '@/lib/ai-scorer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answerId, type } = body

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
      },
    })

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    let scoreResult: any

    if (type === 'WRITING' || answer.question.type === 'ESSAY') {
      const response = answer.response as any
      scoreResult = await scoreWriting(
        (answer.question.content as any)?.prompt || '',
        response?.text || '',
        answer.question.rubric as any,
        answer.question.level
      )
    } else if (type === 'SPEAKING' || answer.question.type === 'AUDIO_RESPONSE') {
      const response = answer.response as any
      scoreResult = await scoreSpeaking(
        response?.audioBase64 || '',
        (answer.question.content as any)?.prompt || '',
        answer.question.level
      )
    } else {
      return NextResponse.json({ error: 'Invalid question type for AI scoring' }, { status: 400 })
    }

    await prisma.answer.update({
      where: { id: answerId },
      data: {
        aiScore: scoreResult.score,
        aiFeedback: JSON.stringify(scoreResult),
        scoredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      score: scoreResult.score,
      feedback: scoreResult,
    })
  } catch (error: any) {
    console.error('Error scoring answer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to score answer' },
      { status: 500 }
    )
  }
}
