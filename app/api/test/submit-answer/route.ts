import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scoreMCQ } from '@/lib/scoring/mcq-scorer'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, questionId, response } = await request.json()

    if (!sessionId || !questionId || !response) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })

    if (!testSession || testSession.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Session tidak valid' }, { status: 400 })
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 })
    }

    let rawScore: number | null = null
    if (question.type === 'MCQ') {
      rawScore = scoreMCQ(question.content as unknown as Parameters<typeof scoreMCQ>[0], response as unknown as Parameters<typeof scoreMCQ>[1])
    }

    const existingAnswer = await prisma.answer.findFirst({
      where: { sessionId, questionId },
    })

    if (existingAnswer) {
      await prisma.answer.update({
        where: { id: existingAnswer.id },
        data: { response, rawScore },
      })
    } else {
      await prisma.answer.create({
        data: {
          sessionId,
          questionId,
          response,
          rawScore,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
