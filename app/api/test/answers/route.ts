import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

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
  const { sessionId, questionId, answer } = body

  const session = await prisma.testSession.findFirst({
    where: {
      id: sessionId,
      userId: dbUser.id,
      status: 'IN_PROGRESS',
    },
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found or already completed' },
      { status: 404 }
    )
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  let rawScore: number | null = null
  const aiScore: number | null = null

  if (question.type === 'MCQ') {
    const content = question.content as any
    const correctAnswer = content?.correctAnswer
    if (correctAnswer && answer.selectedOption === correctAnswer) {
      rawScore = question.points
    } else {
      rawScore = 0
    }
  }

  const existingAnswer = await prisma.answer.findFirst({
    where: {
      sessionId,
      questionId,
    },
  })

  if (existingAnswer) {
    await prisma.answer.update({
      where: { id: existingAnswer.id },
      data: {
        response: answer,
        rawScore,
        aiScore,
      },
    })
  } else {
    await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        response: answer,
        rawScore,
        aiScore,
      },
    })
  }

  return NextResponse.json({ success: true })
}
