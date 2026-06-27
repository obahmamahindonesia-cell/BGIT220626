import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
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
              select: { id: true, correctAnswer: true },
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

    const isComplete = session.status === 'COMPLETED' || session.status === 'SCORED' || session.status === 'SUBMITTED'

    const items = session.sessionItems
      .filter(item => {
        if (!item.questionSnapshot) {
          console.warn(`[test-session:get] item ${item.id} has no questionSnapshot, skipping`)
          return false
        }
        return true
      })
      .map(item => {
        const base: Record<string, unknown> = {
          id: item.id,
          order: item.order,
          dimension: item.dimension || null,
          level: item.level || null,
          difficulty: item.difficulty ?? 3,
          question: item.questionSnapshot,
          maxScore: item.maxScore ?? 10,
          stage: item.stage ?? 1,
          answer: item.answer
            ? {
                id: item.answer.id,
                answer: item.answer.answer ?? null,
                score: item.answer.score ?? null,
                aiScore: item.answer.aiScore ?? null,
                aiFeedback: item.answer.aiFeedback ?? null,
                isCorrect: item.answer.isCorrect ?? null,
                submittedAt: item.answer.submittedAt?.toISOString() ?? null,
                responseText: item.answer.responseText ?? null,
                responseAudioUrl: null,
                audioDurationSec: item.answer.audioDurationSec ?? null,
                wordCount: item.answer.wordCount ?? null,
                responseStatus: item.answer.responseStatus ?? 'submitted',
                feedback: item.answer.feedback ?? null,
                scoreText: null,
                scorePercentage: null,
              }
            : null,
        }

        if (base.answer && item.answer?.finalScoreJson) {
          const fjs = item.answer.finalScoreJson as Record<string, unknown>
          base.answer = {
            ...base.answer as Record<string, unknown>,
            scoreText: typeof fjs.band === 'string' ? fjs.band : null,
            scorePercentage: typeof fjs.percentage === 'number' ? fjs.percentage : null,
          }
        }

        // Only expose correctAnswer when test is complete
        if (isComplete) {
          const snapshot = (item.questionSnapshot as Record<string, unknown>) || {}
          base.question = {
            ...snapshot,
            correctAnswer: item.question?.correctAnswer ?? null,
            explanation: snapshot.explanation || null,
          }
        }

        return base
      })

    const meta = (session.metadata as Record<string, unknown>) || {}
    const durationMinutes = typeof meta.durationMinutes === 'number'
      ? meta.durationMinutes
      : Math.max(30, Math.round(session.questionCount * 1.5))

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        product: session.product ?? null,
        targetLevel: session.targetLevel ?? null,
        status: session.status,
        questionCount: session.questionCount,
        durationMinutes,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        durationSeconds: session.durationSeconds ?? null,
        totalScore: session.totalScore ?? null,
        cefrLevel: session.cefrLevel ?? null,
        metadata: meta,
        items,
      },
    })
  } catch (err: any) {
    console.error('[test-session:get] failed', {
      sessionId: params.id,
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
    })
    return NextResponse.json({
      success: false,
      error: 'Gagal memuat sesi tes.',
      code: 'TEST_SESSION_LOAD_FAILED',
    }, { status: 500 })
  }
}
