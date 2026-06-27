import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { runFullPlagiarismCheck, savePlagiarismResult } from '@/lib/plagiarism'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  try {
    const { responseId } = await request.json()
    if (!responseId || typeof responseId !== 'string') {
      return NextResponse.json({ success: false, error: 'responseId wajib diisi.' }, { status: 400 })
    }

    // Validate response exists and belongs to a constructed item
    const answer = await prisma.userAnswer.findUnique({
      where: { id: responseId },
      include: {
        sessionItem: {
          select: {
            questionSnapshot: true,
            dimension: true,
            level: true,
          },
        },
      },
    })

    if (!answer) {
      return NextResponse.json({ success: false, error: 'Jawaban tidak ditemukan.' }, { status: 404 })
    }

    // Only run on constructed response items (Writing/Speaking)
    const dimension = answer.sessionItem?.dimension || ''
    const isConstructed = ['WRITING', 'SPEAKING', 'INTEGRATED', 'MEDIATION'].includes(dimension)
    if (!isConstructed) {
      return NextResponse.json({ success: false, error: 'Pemeriksaan hanya untuk jawaban constructed response (menulis/bicara).' }, { status: 400 })
    }

    if (!answer.responseText || answer.responseText.trim().length < 5) {
      return NextResponse.json({
        success: true,
        message: 'Teks terlalu pendek untuk dianalisis.',
        plagiarismReport: null,
      })
    }

    const snapshot = answer.sessionItem.questionSnapshot as any
    const prompt = snapshot?.prompt || snapshot?.instructionForCandidate || null
    const level = answer.sessionItem.level || snapshot?.level || null
    const taskType = snapshot?.taskType || ''
    const isFormCompletion = taskType === 'form_completion' || taskType === 'guided_writing'

    // Check for speaking-only responses (no text)
    const responseMode = snapshot?.responseMode || ''
    if (responseMode === 'audio' && !answer.responseText) {
      return NextResponse.json({
        success: true,
        message: 'Deteksi teks AI tidak berlaku untuk respons audio tanpa transkrip.',
        plagiarismReport: {
          version: '1.0',
          checkedAt: new Date().toISOString(),
          aiDetection: null,
          plagiarism: null,
          overallRisk: 'not_applicable',
          message: 'Respons audio tanpa transkrip.',
        },
      })
    }

    const wordCount = answer.responseText.trim().split(/\s+/).length

    const result = await runFullPlagiarismCheck(responseId, answer.responseText, {
      prompt,
      level,
      wordCount,
      isFormCompletion,
    })

    await savePlagiarismResult(responseId, result, admin.email || admin.id)

    // Return safe fields — no raw prompt, no API key, no internal AI prompt
    return NextResponse.json({
      success: true,
      plagiarismReport: {
        version: result.version,
        checkedAt: result.checkedAt,
        aiDetection: result.aiDetection,
        plagiarism: result.plagiarism,
        overallRisk: result.overallRisk,
        message: result.message,
      },
      message: result.message,
    })
  } catch (err: any) {
    console.error('Plagiarism check error:', err)
    if (err.status === 429 || (err.error?.type === 'rate_limit_error')) {
      return NextResponse.json({ success: false, error: 'Pemeriksaan belum bisa dijalankan karena batas permintaan. Coba lagi nanti.' }, { status: 429 })
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      return NextResponse.json({ success: false, error: 'Pemeriksaan gagal karena koneksi timeout. Coba lagi.' }, { status: 504 })
    }
    return NextResponse.json({ success: false, error: 'Pemeriksaan gagal dijalankan. Coba lagi.' }, { status: 500 })
  }
}
