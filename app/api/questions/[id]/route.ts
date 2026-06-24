import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSignedUrl } from '@/lib/supabase/storage'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const question = await prisma.practiceQuestion.findUnique({
      where: { id: params.id },
    })

    if (!question) {
      return NextResponse.json({ success: false, error: 'Soal tidak ditemukan.' }, { status: 404 })
    }

    if (!question.isActive) {
      return NextResponse.json({ success: false, error: 'Soal tidak tersedia.' }, { status: 404 })
    }

    if (!question.storagePath) {
      return NextResponse.json({ success: false, error: 'PDF tidak tersedia.' }, { status: 404 })
    }

    const signedUrl = await getSignedUrl(question.storagePath, 3600)

    return NextResponse.json({
      success: true,
      data: {
        ...question,
        signedUrl,
      },
    })
  } catch (err: any) {
    console.error('Error fetching question:', err)
    return NextResponse.json({
      success: false,
      error: 'Gagal memuat soal.',
    }, { status: 500 })
  }
}
