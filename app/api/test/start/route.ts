import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dimensions = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'] as const
    const questionsPerDimension = 5

    const allQuestions = []
    for (const dimension of dimensions) {
      const questions = await prisma.question.findMany({
        where: { dimension, isActive: true },
        take: questionsPerDimension,
        orderBy: { createdAt: 'desc' },
      })
      allQuestions.push(...questions)
    }

    const shuffled = allQuestions.sort(() => Math.random() - 0.5)

    const testSession = await prisma.testSession.create({
      data: { userId: user.id },
    })

    return NextResponse.json({
      sessionId: testSession.id,
      questions: shuffled.map((q) => ({
        id: q.id,
        dimension: q.dimension,
        type: q.type,
        level: q.level,
        content: q.content,
        rubric: q.rubric,
        points: q.points,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
