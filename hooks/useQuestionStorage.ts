'use client'

import { useState, useCallback } from 'react'

interface PracticeQuestion {
  id: string
  dimension: string
  cefrLevel: string
  title: string
  description: string | null
  pdfUrl: string | null
  storagePath: string | null
  difficulty: number
  tags: string[]
  isActive: boolean
  createdAt: string
}

interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export function useQuestionStorage() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadPdf = useCallback(async (formData: FormData): Promise<PracticeQuestion | null> => {
    setUploading(true)
    setUploadProgress(null)
    setError(null)

    try {
      const res = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
      })

      const text = await res.text()
      let json: any
      try { json = JSON.parse(text) } catch { throw new Error('Server mengembalikan respons yang tidak valid.') }

      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah.')
      return json.data as PracticeQuestion
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }, [])

  const getSignedUrl = useCallback(async (id: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/questions/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data.signedUrl
    } catch {
      return null
    }
  }, [])

  return { uploadPdf, getSignedUrl, uploading, uploadProgress, error }
}
