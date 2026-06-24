import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
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
          orderBy: { order: 'asc' },
          include: {
            answer: true,
            question: {
              select: {
                id: true,
                correctAnswer: true,
              },
            },
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

    // Return items WITH answer key only if session is completed
    const isComplete = session.status === 'COMPLETED' || session.status === 'SCORED' || session.status === 'SUBMITTED'

    const items = session.sessionItems.map(item => {
      const base: any = {
        id: item.id,
        order: item.order,
        dimension: item.dimension,
        level: item.level,
        difficulty: item.difficulty,
        question: item.questionSnapshot,
        maxScore: item.maxScore,
        stage: item.stage,
        answer: item.answer
          ? {
              id: item.answer.id,
              answer: item.answer.answer,
              score: item.answer.score,
              aiScore: item.answer.aiScore,
              aiFeedback: item.answer.aiFeedback,
              isCorrect: item.answer.isCorrect,
              submittedAt: item.answer.submittedAt,
            }
          : null,
      }

      // Only expose correctAnswer when test is complete
      if (isComplete) {
        base.question = {
          ...base.question,
          correctAnswer: item.question.correctAnswer,
          explanation: (item.questionSnapshot as any)?.explanation || null,
        }
      }

      return base
    })

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        product: session.product,
        targetLevel: session.targetLevel,
        status: session.status,
        questionCount: session.questionCount,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() || null,
        durationSeconds: session.durationSeconds,
        totalScore: session.totalScore,
        cefrLevel: session.cefrLevel,
        metadata: session.metadata,
        items,
      },
    })
  } catch (err: any) {
    console.error('Error fetching session:', err)
    return NextResponse.json({ success: false, error: 'Gagal memuat sesi.' }, { status: 500 })
  }
}
