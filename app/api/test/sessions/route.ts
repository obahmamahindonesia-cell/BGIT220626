import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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

    const dbUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: { email: user.email!, name: user.user_metadata?.name || undefined },
      create: {
        supabaseId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
      },
    })

    const body = await request.json()
    const { dimensions, level, questionCount = 20 } = body

    const where: any = { isActive: true }
    
    if (dimensions && dimensions.length > 0) {
      where.dimension = { in: dimensions }
    }
    
    if (level) {
      where.level = level
    }

    const questions = await prisma.question.findMany({
      where,
      take: questionCount,
      orderBy: { createdAt: 'desc' },
    })

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the selected criteria' },
        { status: 400 }
      )
    }

    const session = await prisma.testSession.create({
      data: {
        userId: dbUser.id,
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
      },
      questions: questions.map(q => ({
        id: q.id,
        dimension: q.dimension,
        skill: q.skill,
        type: q.type,
        level: q.level,
        difficulty: q.difficulty,
        points: q.points,
        content: q.content,
      })),
    })
  } catch (err: any) {
    console.error('Error creating test session:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
