import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { assessAnswer } from '@/lib/assessment/ai-scoring'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    })

    if (!session) {
      return NextResponse.json({ success: false, error: 'Sesi tidak ditemukan.' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser || session.userId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Sesi bukan milik Anda.' }, { status: 403 })
    }

    const body = await request.json()
    const { sessionItemId, answer } = body

    if (!sessionItemId) {
      return NextResponse.json({ success: false, error: 'sessionItemId wajib diisi.' }, { status: 400 })
    }

    // Verify session item belongs to session
    const sessionItem = await prisma.testSessionItem.findUnique({
      where: { id: sessionItemId },
      include: { question: true },
    })

    if (!sessionItem || sessionItem.sessionId !== session.id) {
      return NextResponse.json({ success: false, error: 'Item tidak ditemukan dalam sesi ini.' }, { status: 400 })
    }

    // Auto-score for MCQ / SHORT_ANSWER
    const assessment = await assessAnswer(
      {
        questionType: sessionItem.question.questionType,
        prompt: (sessionItem.questionSnapshot as any)?.prompt,
        correctAnswer: sessionItem.question.correctAnswer,
      },
      answer
    )

    const isCorrect = sessionItem.question.questionType === 'MCQ'
      ? assessment.score === 10
      : sessionItem.question.questionType === 'SHORT_ANSWER'
        ? assessment.score === 10
        : null

    const userAnswer = await prisma.userAnswer.upsert({
      where: { sessionItemId },
      update: {
        answer,
        score: assessment.score || null,
        aiScore: assessment.score || null,
        aiFeedback: assessment.feedback || null,
        isCorrect: isCorrect ?? undefined,
        feedback: assessment.feedback || null,
      },
      create: {
        sessionItemId,
        userId: dbUser.id,
        answer,
        score: assessment.score || null,
        aiScore: assessment.score || null,
        aiFeedback: assessment.feedback || null,
        isCorrect: isCorrect ?? undefined,
        feedback: assessment.feedback || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: userAnswer.id,
        score: userAnswer.score,
        aiFeedback: userAnswer.aiFeedback,
        isCorrect: userAnswer.isCorrect,
      },
    })
  } catch (err: any) {
    console.error('Error answering:', err)
    return NextResponse.json({ success: false, error: 'Gagal menyimpan jawaban.' }, { status: 500 })
  }
}
