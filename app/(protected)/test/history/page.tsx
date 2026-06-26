'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ClipboardCheck, ArrowRight, RotateCcw, Play, FileText, Loader2, AlertCircle } from 'lucide-react'

type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'SCORED' | 'COMPLETED' | 'FAILED'

interface DimensionScore {
  name: string
  score: number
}

interface SessionItem {
  id: string
  product: string
  status: SessionStatus
  totalQuestions: number
  answeredQuestions: number
  score: number | null
  level: string | null
  dimensions: DimensionScore[]
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
}

interface Summary {
  total: number
  completed: number
  inProgress: number
  highestScore: number | null
}

interface ApiResponse {
  success: boolean
  sessions: SessionItem[]
  summary: Summary
  error?: string
}

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Semua',
  IN_PROGRESS: 'Sedang Berjalan',
  COMPLETED: 'Selesai',
  SUBMITTED: 'Terkirim',
  SCORED: 'Dinilai',
  FAILED: 'Dibatalkan',
}

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20',
  COMPLETED: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20',
  SUBMITTED: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
  SCORED: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20',
  FAILED: 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20',
}

async function parseJsonSafe(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Server mengembalikan respons yang tidak valid.')
  }
}

export default function TestHistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, completed: 0, inProgress: 0, highestScore: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/test/history?${params.toString()}`, { cache: 'no-store' })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      if (res.status === 500) {
        setError('Gagal memuat riwayat tes. Silakan coba lagi.')
        setLoading(false)
        return
      }
      const data = (await parseJsonSafe(res)) as ApiResponse | null
      if (!data || !data.success) {
        setError(data?.error || 'Gagal memuat riwayat tes.')
        setLoading(false)
        return
      }
      setSessions(data.sessions)
      setSummary(data.summary)
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data.')
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const filtered = sessions.filter((s) => {
    if (search) {
      const q = search.toLowerCase()
      const product = s.product.toLowerCase()
      const level = (s.level || '').toLowerCase()
      if (!product.includes(q) && !level.includes(q)) return false
    }
    return true
  })

  const handleAction = (session: SessionItem) => {
    if (session.status === 'IN_PROGRESS') {
      router.push(`/test/${session.id}`)
    } else if (session.status === 'COMPLETED' || session.status === 'SCORED') {
      router.push(`/test/${session.id}/results`)
    } else {
      router.push('/test')
    }
  }

  const getActionLabel = (status: SessionStatus) => {
    switch (status) {
      case 'IN_PROGRESS': return 'Lanjutkan'
      case 'COMPLETED':
      case 'SCORED': return 'Lihat Hasil'
      default: return 'Ulangi Tes'
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1E]">Riwayat Tes</h1>
            <p className="text-sm text-[#8E8E93] mt-1">Memuat data...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E5EA] animate-pulse">
              <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-8">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Riwayat Tes</h1>
          <p className="text-sm text-[#8E8E93] mt-1">Lihat sesi tes yang pernah Anda mulai, lanjutkan, atau selesaikan.</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={fetchHistory} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC]">
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Riwayat Tes</h1>
          <p className="text-sm text-[#8E8E93] mt-1">Lihat sesi tes yang pernah Anda mulai, lanjutkan, atau selesaikan.</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <div className="w-16 h-16 bg-[#F2F2F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-[#8E8E93]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">Belum ada riwayat tes</h3>
          <p className="text-sm text-[#8E8E93] mb-6 max-w-sm mx-auto">
            Mulai tes pertama Anda untuk mengetahui level kemahiran Bahasa Indonesia Anda.
          </p>
          <Button onClick={() => router.push('/test')} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] shadow-lg shadow-[#007AFF]/20">
            <Play className="w-4 h-4 mr-2" /> Mulai Tes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Riwayat Tes</h1>
        <p className="text-sm text-[#8E8E93] mt-1">Lihat sesi tes yang pernah Anda mulai, lanjutkan, atau selesaikan.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <p className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-1">Total Tes</p>
          <p className="text-3xl font-bold text-[#1C1C1E]">{summary.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <p className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-1">Selesai</p>
          <p className="text-3xl font-bold text-[#34C759]">{summary.completed}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <p className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-1">Sedang Berjalan</p>
          <p className="text-3xl font-bold text-[#FF9500]">{summary.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5EA]">
          <p className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-1">Skor Tertinggi</p>
          <p className="text-3xl font-bold text-[#007AFF]">{summary.highestScore ?? '-'}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                filter === f
                  ? 'bg-[#007AFF] text-white border-[#007AFF]'
                  : 'bg-white text-[#8E8E93] border-[#E5E5EA] hover:border-[#007AFF] hover:text-[#007AFF]'
              }`}
            >
              {STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <Input
            placeholder="Cari produk atau level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[#E5E5EA] text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-[#F2F2F7] text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
          <div>Produk</div>
          <div>Level</div>
          <div>Soal</div>
          <div>Status</div>
          <div>Skor</div>
          <div>Tanggal</div>
          <div />
        </div>
        <div className="divide-y divide-[#E5E5EA]">
          {filtered.map((session) => (
            <div
              key={session.id}
              className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-4 px-6 py-4 items-center hover:bg-[#F2F2F7]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#007AFF] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1C1C1E] md:hidden mr-1">Produk: </span>
                <span className="text-sm text-[#1C1C1E]">{session.product}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-[#1C1C1E] md:hidden mr-1">Level: </span>
                <span className="text-sm text-[#1C1C1E]">{session.level || '-'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-[#1C1C1E] md:hidden mr-1">Soal: </span>
                <span className="text-sm text-[#1C1C1E]">{session.answeredQuestions}/{session.totalQuestions}</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${STATUS_COLORS[session.status] || STATUS_COLORS.FAILED}`}>
                  {STATUS_LABELS[session.status] || session.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-[#1C1C1E] md:hidden mr-1">Skor: </span>
                <span className={`text-sm font-semibold ${session.score != null ? 'text-[#1C1C1E]' : 'text-[#8E8E93]'}`}>
                  {session.score != null ? session.score : '-'}
                </span>
              </div>
              <div className="text-sm text-[#8E8E93]">
                <span className="md:hidden font-medium mr-1">Tanggal: </span>
                {formatDate(session.startedAt)}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleAction(session)}
                  className={`rounded-xl h-9 text-xs px-4 ${
                    session.status === 'IN_PROGRESS'
                      ? 'bg-[#007AFF] hover:bg-[#0066CC]'
                      : session.status === 'COMPLETED' || session.status === 'SCORED'
                      ? 'bg-[#34C759] hover:bg-[#2E9F4C]'
                      : 'bg-[#FF9500] hover:bg-[#E68A00]'
                  }`}
                >
                  {session.status === 'IN_PROGRESS' ? (
                    <><ArrowRight className="w-3.5 h-3.5 mr-1" /> {getActionLabel(session.status)}</>
                  ) : (
                    <>{getActionLabel(session.status)}</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
