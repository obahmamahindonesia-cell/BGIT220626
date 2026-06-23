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

  const rawQuestions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
  })

  const idMap = Object.fromEntries(rawQuestions.map(q => [q.id, q]))

  const questions = session.questionIds.map(qid => {
    const q = idMap[qid]
    if (!q) return null
    return {
      id: q.id,
      dimension: q.dimension,
      skill: q.skill,
      type: q.type,
      level: q.level,
      difficulty: q.difficulty,
      points: q.points,
      content: q.content,
    }
  }).filter(Boolean)

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
    },
    questions,
  })
}
