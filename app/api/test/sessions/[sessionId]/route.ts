import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

  const session = await prisma.testSession.findFirst({
    where: {
      id: params.sessionId,
      userId: dbUser.id,
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
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const questions = session.answers.map(answer => ({
    id: answer.question.id,
    dimension: answer.question.dimension,
    skill: answer.question.skill,
    type: answer.question.type,
    level: answer.question.level,
    difficulty: answer.question.difficulty,
    points: answer.question.points,
    content: answer.question.content,
  }))

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
    },
    questions,
  })
}
