'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface QuestionItem {
  id: string
  code: string | null
  dimension: string
  subskill: string | null
  questionType: string
  level: string
  difficulty: number
  topic: string | null
  prompt: string | null
  status: string
  tags: string[]
  exposureCount: number
  createdAt: string
  options: { id: string; label: string | null; text: string; isCorrect: boolean; order: number }[]
  _count?: { sessionItems: number }
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  PILOT: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  RETIRED: 'bg-red-100 text-red-700',
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchQuestions()
  }, [page])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/questions?page=${page}&limit=${limit}`)
      const json = await res.json()
      if (json.success) {
        setQuestions(json.data)
        setTotal(json.pagination.total)
      }
    } catch (err) {
      console.error('Gagal mengambil soal:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menonaktifkan soal ini?')) return
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) fetchQuestions()
    } catch (err) {
      console.error('Gagal menonaktifkan soal:', err)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
        <p className="mt-4 text-gray-600">Memuat soal...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Bank Soal</h1>
          <p className="text-gray-600">Kelola soal asesmen BIGT</p>
        </div>
        <Link href="/admin/questions/new">
          <Button className="bg-[#C8102E] hover:bg-red-800 text-white">
            + Tambah Soal
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soal ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada soal. Buat soal pertama Anda untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {q.dimension}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.questionType}
                        </Badge>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-700'}`}>
                          {q.status}
                        </span>
                        {q.code && (
                          <span className="text-[10px] text-gray-400 font-mono">{q.code}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {q.prompt || 'Tidak ada prompt'}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{q.subskill || '—'}</span>
                        <span>Kesulitan: {q.difficulty}/15</span>
                        <span>Eksposur: {q.exposureCount}x</span>
                        {q._count && <span>Digunakan: {q._count.sessionItems}x</span>}
                      </div>
                      {q.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {q.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-[#C9A84C]/20 text-[#0B1F3A] px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/questions/${q.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                      >
                        Nonaktifkan
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
