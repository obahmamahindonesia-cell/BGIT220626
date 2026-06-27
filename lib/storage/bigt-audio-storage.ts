import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const BUCKET_NAME = 'bigt-speaking-responses'
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/mpeg', 'audio/wav']
const SIGNED_URL_EXPIRY = 3600 // 1 hour

function getStorageAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  ).storage
}

async function ensureBucket(): Promise<void> {
  const storage = getStorageAdmin()
  try {
    const { data: buckets } = await storage.listBuckets()
    const exists = buckets?.some(b => b.name === BUCKET_NAME)
    if (!exists) {
      await storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_AUDIO_SIZE,
        allowedMimeTypes: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'],
      })
    }
  } catch {
    // bucket might already exist
    try {
      await storage.updateBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_AUDIO_SIZE,
      })
    } catch {}
  }
}

export interface UploadAudioParams {
  attemptId: string
  userId: string
  itemId: string
  audioBlob: Buffer
  mimeType: string
  durationSec: number
}

export interface UploadAudioResult {
  success: boolean
  storagePath: string
  fileSize: number
  error?: string
}

/**
 * Sanitizes a path segment to prevent path traversal.
 * Removes slashes, dots, and special chars.
 */
function sanitizePathSeg(seg: string): string {
  return seg.replace(/[^a-zA-Z0-9_-]/g, '_')
}

/**
 * Validates audio MIME type against allowed list.
 */
export function validateAudioMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.some(allowed =>
    mimeType.toLowerCase().startsWith(allowed.replace(';codecs=opus', ''))
  )
}

/**
 * Validates audio file size.
 */
export function validateAudioFileSize(size: number): { valid: boolean; error?: string } {
  if (size <= 0) return { valid: false, error: 'File audio kosong.' }
  if (size > MAX_AUDIO_SIZE) {
    const maxMB = Math.round(MAX_AUDIO_SIZE / 1024 / 1024)
    return { valid: false, error: `Ukuran file terlalu besar (maks ${maxMB} MB).` }
  }
  return { valid: true }
}

/**
 * Validates audio duration against constraints from the question snapshot.
 */
export function validateAudioDuration(
  durationSec: number,
  constraints?: { minDurationSec?: number | null; maxDurationSec?: number | null }
): { valid: boolean; error?: string } {
  if (constraints?.minDurationSec && durationSec < constraints.minDurationSec) {
    return { valid: false, error: `Durasi terlalu pendek (min ${constraints.minDurationSec} detik).` }
  }
  if (constraints?.maxDurationSec && durationSec > constraints.maxDurationSec) {
    return { valid: false, error: `Durasi terlalu panjang (maks ${constraints.maxDurationSec} detik).` }
  }
  return { valid: true }
}

/**
 * Uploads speaking audio to Supabase Storage private bucket.
 * The bucket is private; access is via signed URLs only.
 */
export async function uploadSpeakingAudio(params: UploadAudioParams): Promise<UploadAudioResult> {
  const { attemptId, userId, audioBlob, mimeType, durationSec } = params

  await ensureBucket()

  const safeUserId = sanitizePathSeg(userId)
  const safeAttemptId = sanitizePathSeg(attemptId)
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('mpeg') ? 'mp3' : mimeType.includes('wav') ? 'wav' : 'webm'
  const storagePath = `${safeUserId}/${safeAttemptId}.${ext}`

  const storage = getStorageAdmin()

  const { error: uploadError } = await storage
    .from(BUCKET_NAME)
    .upload(storagePath, audioBlob, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    // If path already exists (retry), try with timestamp suffix
    if (uploadError.message?.includes('already exists')) {
      const timestampedPath = `${safeUserId}/${safeAttemptId}_${Date.now()}.${ext}`
      const { error: retryError } = await storage
        .from(BUCKET_NAME)
        .upload(timestampedPath, audioBlob, {
          contentType: mimeType,
          upsert: false,
        })
      if (retryError) {
        return { success: false, storagePath: '', fileSize: 0, error: `Gagal mengunggah audio: ${retryError.message}` }
      }
      return { success: true, storagePath: timestampedPath, fileSize: audioBlob.length }
    }

    return { success: false, storagePath: '', fileSize: 0, error: `Gagal mengunggah audio: ${uploadError.message}` }
  }

  return { success: true, storagePath, fileSize: audioBlob.length }
}

/**
 * Gets a signed URL for audio playback (admin only, short-lived).
 */
export async function getSpeakingAudioSignedUrl(
  storagePath: string,
  expiresInSec: number = SIGNED_URL_EXPIRY
): Promise<{ signedUrl: string; expiresInSec: number } | null> {
  try {
    const storage = getStorageAdmin()
    const { data, error } = await storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSec)

    if (error || !data) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return { signedUrl: data.signedUrl, expiresInSec }
  } catch (err) {
    console.error('Error creating signed URL:', err)
    return null
  }
}

/**
 * Deletes audio from storage.
 */
export async function deleteSpeakingAudio(storagePath: string): Promise<boolean> {
  try {
    const storage = getStorageAdmin()
    const { error } = await storage.from(BUCKET_NAME).remove([storagePath])
    if (error) {
      console.error('Error deleting audio:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Error deleting audio:', err)
    return false
  }
}

export { BUCKET_NAME, MAX_AUDIO_SIZE, ALLOWED_MIME_TYPES, SIGNED_URL_EXPIRY }
