import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getSpeakingAudioSignedUrl } from '@/lib/storage/bigt-audio-storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const responseId = searchParams.get('responseId')

  if (!responseId) {
    return NextResponse.json({ success: false, error: 'responseId wajib diisi.' }, { status: 400 })
  }

  try {
    const userAnswer = await prisma.userAnswer.findUnique({
      where: { id: responseId },
      select: {
        id: true,
        audioStoragePath: true,
        responseAudioUrl: true,
        responseAudioMimeType: true,
        audioDurationSec: true,
      },
    })

    if (!userAnswer) {
      return NextResponse.json({ success: false, error: 'Jawaban tidak ditemukan.' }, { status: 404 })
    }

    // Prefer storage path for signed URL
    if (userAnswer.audioStoragePath) {
      const result = await getSpeakingAudioSignedUrl(userAnswer.audioStoragePath)
      if (!result) {
        return NextResponse.json({ success: false, error: 'Gagal membuat URL audio.' }, { status: 500 })
      }
      return NextResponse.json({
        success: true,
        data: {
          signedUrl: result.signedUrl,
          expiresInSec: result.expiresInSec,
          mimeType: userAnswer.responseAudioMimeType,
          durationSec: userAnswer.audioDurationSec,
        },
      })
    }

    // Fallback: if stored as direct URL (legacy), return as-is (no signed URL)
    if (userAnswer.responseAudioUrl) {
      return NextResponse.json({
        success: true,
        data: {
          signedUrl: userAnswer.responseAudioUrl,
          expiresInSec: null,
          mimeType: userAnswer.responseAudioMimeType,
          durationSec: userAnswer.audioDurationSec,
          note: 'Legacy audio (not storage-backed)',
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Tidak ada audio untuk jawaban ini.' }, { status: 404 })
  } catch (err: any) {
    console.error('Error getting audio URL:', err)
    return NextResponse.json({ success: false, error: 'Gagal mendapatkan URL audio.' }, { status: 500 })
  }
}
