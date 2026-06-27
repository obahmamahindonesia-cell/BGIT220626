import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  validateAudioMimeType,
  validateAudioFileSize,
  validateAudioDuration,
  uploadSpeakingAudio,
} from '@/lib/storage/bigt-audio-storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const VALID_RESPONSE_MODES = ['text', 'audio', 'text_audio']
const MAX_TEXT_LENGTH = 10000
const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

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

    // Check content type to parse form data (audio blob) vs JSON (text)
    const contentType = request.headers.get('content-type') || ''

    let body: any = {}
    let audioBuffer: Buffer | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body.sessionId = formData.get('sessionId')
      body.sessionItemId = formData.get('sessionItemId')
      body.responseMode = formData.get('responseMode')
      body.responseText = formData.get('responseText')

      const audioFile = formData.get('audio') as File | null
      if (audioFile) {
        body.audioFile = audioFile
        body.audioFileSize = audioFile.size
        body.audioMimeType = audioFile.type
      }

      body.audioDurationSec = formData.get('audioDurationSec')
        ? Number(formData.get('audioDurationSec'))
        : undefined

      body.skipBase64 = true
    } else {
      body = await request.json()
    }

    const {
      sessionId,
      sessionItemId,
      responseMode,
      responseText,
      audioUrl,      // legacy base64 string
      audioDurationSec,
      audioFile,     // File object from FormData
      audioFileSize, // number
      audioMimeType, // string
      skipBase64,    // boolean flag
    } = body

    if (!sessionId || !sessionItemId || !responseMode) {
      return NextResponse.json({ success: false, error: 'sessionId, sessionItemId, dan responseMode wajib diisi.' }, { status: 400 })
    }

    if (!VALID_RESPONSE_MODES.includes(responseMode)) {
      return NextResponse.json({ success: false, error: `responseMode harus text, audio, atau text_audio.` }, { status: 400 })
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

    const sessionItem = await prisma.testSessionItem.findUnique({
      where: { id: sessionItemId },
      include: { question: true },
    })
    if (!sessionItem) {
      return NextResponse.json({ success: false, error: 'Item sesi tidak ditemukan.' }, { status: 404 })
    }
    if (sessionItem.sessionId !== sessionId) {
      return NextResponse.json({ success: false, error: 'Item tidak terkait dengan sesi ini.' }, { status: 403 })
    }

    const snapshot = sessionItem.questionSnapshot as any
    const constraints = snapshot?.constraints || {}

    // Validate text response
    if (responseMode === 'text' || responseMode === 'text_audio') {
      if (!responseText || responseText.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'responseText wajib diisi untuk respons teks.' }, { status: 400 })
      }
      if (responseText.length > MAX_TEXT_LENGTH) {
        return NextResponse.json({ success: false, error: `Teks terlalu panjang (maks ${MAX_TEXT_LENGTH} karakter).` }, { status: 400 })
      }

      const wordCount = responseText.trim().split(/\s+/).length
      if (constraints.maxWords && wordCount > constraints.maxWords) {
        return NextResponse.json({ success: false, error: `Jawaban terlalu panjang (maks ${constraints.maxWords} kata, Anda ${wordCount}).` }, { status: 400 })
      }
      if (constraints.minWords && wordCount < constraints.minWords) {
        return NextResponse.json({ success: false, error: `Jawaban terlalu pendek (min ${constraints.minWords} kata, Anda ${wordCount}).` }, { status: 400 })
      }
    }

    // Validate and store audio response
    let audioStoragePath: string | null = null
    let uploadedFileSize: number | null = null
    let finalMimeType: string | null = null
    let finalAudioUrl: string | null = null
    let finalDuration: number | null = audioDurationSec || null

    if (responseMode === 'audio' || responseMode === 'text_audio') {
      // Determine mime type and source
      let mimeType = audioMimeType || ''
      let audioData: Buffer | null = audioBuffer

      if (audioFile) {
        // FormData upload — File object
        if (!validateAudioMimeType(audioFile.type)) {
          return NextResponse.json({ success: false, error: `Tipe file audio tidak didukung: ${audioFile.type}. Gunakan webm, mp4, mp3, atau wav.` }, { status: 400 })
        }
        const sizeCheck = validateAudioFileSize(audioFile.size)
        if (!sizeCheck.valid) {
          return NextResponse.json({ success: false, error: sizeCheck.error }, { status: 400 })
        }
        const durationCheck = validateAudioDuration(audioDurationSec || 0, constraints)
        if (!durationCheck.valid) {
          return NextResponse.json({ success: false, error: durationCheck.error }, { status: 400 })
        }

        mimeType = audioFile.type
        audioData = Buffer.from(await audioFile.arrayBuffer())
        finalMimeType = mimeType
        finalDuration = audioDurationSec || null
        uploadedFileSize = audioFile.size
      } else if (!skipBase64 && audioUrl && audioUrl.startsWith('data:')) {
        // Legacy base64 upload
        const mimeMatch = audioUrl.match(/^data:(audio\/\w+);/)
        mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm'
        if (!validateAudioMimeType(mimeType)) {
          return NextResponse.json({ success: false, error: `Tipe audio tidak didukung: ${mimeType}` }, { status: 400 })
        }

        const base64Data = audioUrl.split(',')[1]
        if (!base64Data) {
          return NextResponse.json({ success: false, error: 'Data audio tidak valid.' }, { status: 400 })
        }
        audioData = Buffer.from(base64Data, 'base64')

        const sizeCheck = validateAudioFileSize(audioData.length)
        if (!sizeCheck.valid) {
          return NextResponse.json({ success: false, error: sizeCheck.error }, { status: 400 })
        }
        const durationCheck = validateAudioDuration(audioDurationSec || 0, constraints)
        if (!durationCheck.valid) {
          return NextResponse.json({ success: false, error: durationCheck.error }, { status: 400 })
        }

        finalMimeType = mimeType
        finalDuration = audioDurationSec || null
        uploadedFileSize = audioData.length
      } else if (!audioUrl) {
        return NextResponse.json({ success: false, error: 'File audio wajib untuk respons audio.' }, { status: 400 })
      }

      // Upload to Supabase Storage if we have audio data
      if (audioData && audioData.length > 0) {
        const uploadResult = await uploadSpeakingAudio({
          attemptId: sessionItem.id,
          userId: dbUser.id,
          itemId: sessionItem.questionId,
          audioBlob: audioData,
          mimeType: mimeType,
          durationSec: finalDuration || 0,
        })

        if (!uploadResult.success) {
          return NextResponse.json({ success: false, error: uploadResult.error || 'Gagal mengunggah audio.' }, { status: 500 })
        }

        audioStoragePath = uploadResult.storagePath
        uploadedFileSize = uploadResult.fileSize

        // Store empty string — signed URL generated on demand for admin only
        finalAudioUrl = ''
      } else if (audioUrl && !audioUrl.startsWith('data:')) {
        // External URL provided (not base64) — store as-is (legacy)
        finalAudioUrl = audioUrl
        finalMimeType = mimeType || null
        finalDuration = audioDurationSec || null
      }
    }

    // Calculate word count server-side (for text responses)
    const wordCount = responseText ? responseText.trim().split(/\s+/).length : undefined

    // Upsert answer
    const upsertData: any = {
      answer: responseText ? { text: responseText } : finalAudioUrl ? { audioUrl: finalAudioUrl } : {},
      isCorrect: null,
      feedback: 'Menunggu penilaian.',
    }

    await prisma.userAnswer.upsert({
      where: { sessionItemId: sessionItem.id },
      update: {
        ...upsertData,
        responseText: responseText || null,
        responseAudioUrl: finalAudioUrl || null,
        responseAudioMimeType: finalMimeType,
        audioDurationSec: finalDuration,
        audioFileSize: uploadedFileSize,
        audioStoragePath: audioStoragePath,
        audioStorageProvider: audioStoragePath ? 'supabase' : null,
        wordCount: wordCount || null,
        responseStatus: 'submitted',
      },
      create: {
        sessionItemId: sessionItem.id,
        userId: dbUser.id,
        ...upsertData,
        responseText: responseText || null,
        responseAudioUrl: finalAudioUrl || null,
        responseAudioMimeType: finalMimeType,
        audioDurationSec: finalDuration,
        audioFileSize: uploadedFileSize,
        audioStoragePath: audioStoragePath,
        audioStorageProvider: audioStoragePath ? 'supabase' : null,
        wordCount: wordCount || null,
        responseStatus: 'submitted',
      },
    })

    // Return safe fields only — NO signed URL, NO storage path, NO rubric, NO answer
    return NextResponse.json({
      success: true,
      data: {
        status: 'submitted',
        wordCount: wordCount || null,
        audioDurationSec: finalDuration,
        message: responseMode === 'text' || responseMode === 'text_audio'
          ? 'Jawaban berhasil dikirim dan akan dinilai.'
          : 'Rekaman audio berhasil dikirim dan akan dinilai.',
      },
    })
  } catch (err: any) {
    console.error('Error submitting constructed response:', err)
    return NextResponse.json({ success: false, error: 'Gagal mengirim jawaban.' }, { status: 500 })
  }
}
