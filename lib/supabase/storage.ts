import { createClient } from '@supabase/supabase-js'

const BUCKET = 'questions'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function uploadQuestionPdf(
  file: File | Buffer,
  fileName: string,
  contentType?: string,
) {
  const supabase = getAdminClient()
  const path = `question-pdfs/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: contentType || 'application/pdf',
      upsert: true,
    })

  if (error) throw new Error(`Gagal mengunggah PDF: ${error.message}`)
  return { path: data.path, fullPath: data.fullPath }
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn = 3600,
) {
  const supabase = getAdminClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error) throw new Error(`Gagal membuat tautan: ${error.message}`)
  return data.signedUrl
}

export async function deleteQuestionPdf(storagePath: string) {
  const supabase = getAdminClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) throw new Error(`Gagal menghapus PDF: ${error.message}`)
}

export async function listQuestionPdfs() {
  const supabase = getAdminClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('question-pdfs')

  if (error) throw new Error(`Gagal mengambil daftar: ${error.message}`)
  return data
}
