import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCorrectAnswer, getExplanation } from '@/lib/question-bank/loadQuestionBank'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { sessionId, questionId, answer } = body

    if (!sessionId || !questionId || answer === undefined) {
      return NextResponse.json({ success: false, error: 'sessionId, questionId, dan answer wajib diisi.' }, { status: 400 })
    }

    const session = await prisma.testSession.findUnique({ where: { id: sessionId } })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Sesi tidak ditemukan.' }, { status: 404 })
    }
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Sesi bukan milik Anda.' }, { status: 403 })
    }
    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: false, error: 'Sesi sudah selesai.' }, { status: 400 })
    }

    const correctAnswer = getCorrectAnswer(questionId)
    if (!correctAnswer) {
      return NextResponse.json({ success: false, error: `Soal "${questionId}" tidak ditemukan di bank soal.` }, { status: 404 })
    }

    const isCorrect = answer === correctAnswer

    // Use questionId (which is the item code) to find the sessionItem
    // sessionItemId is preferred but we use questionId for backward compat
    const sessionItem = await prisma.testSessionItem.findFirst({
      where: { sessionId, question: { code: questionId } },
    })

    if (sessionItem) {
      await prisma.userAnswer.upsert({
        where: { sessionItemId: sessionItem.id },
        update: {
          answer: { selected: answer },
          score: isCorrect ? 10 : 0,
          isCorrect,
          feedback: isCorrect ? 'Benar.' : 'Jawaban kurang tepat.',
        },
        create: {
          sessionItemId: sessionItem.id,
          userId: dbUser.id,
          answer: { selected: answer },
          score: isCorrect ? 10 : 0,
          isCorrect,
          feedback: isCorrect ? 'Benar.' : 'Jawaban kurang tepat.',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: isCorrect ? undefined : correctAnswer,
        explanation: isCorrect ? undefined : getExplanation(questionId),
        score: isCorrect ? 10 : 0,
      },
    })
  } catch (err: any) {
    console.error('Error submitting answer:', err)
    return NextResponse.json({ success: false, error: 'Gagal menyimpan jawaban.' }, { status: 500 })
  }
}
