'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, Headphones, BookOpen, Mic, PenSquare, RefreshCw, 
  Puzzle, Award, Clock, CheckCircle2, XCircle, AlertCircle, 
  Home, RotateCcw, FileText, Loader2, Shield, Eye, UserCheck 
} from 'lucide-react'

interface ItemAnswer {
  id: string
  answer: any
  score: number | null
  aiScore: number | null
  isCorrect: boolean | null
  // Constructed response fields
  responseText: string | null
  responseAudioUrl: string | null
  audioDurationSec: number | null
  wordCount: number | null
  responseStatus: string | null
  feedback: string | null
  scoreText: string | null
  scorePercentage: number | null
}

interface SessionItem {
  id: string
  order: number
  dimension: string
  level: string
  difficulty: number
  question: any
  maxScore: number
  answer: ItemAnswer | null
  responseStatus?: string
}

interface SessionData {
  id: string
  product: string
  status: string
  totalScore: number | null
  cefrLevel: string | null
  questionCount: number
  startedAt: string
  completedAt: string | null
  durationSeconds: number | null
  metadata?: Record<string, any>
  items: SessionItem[]
}

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const radius = size === 'lg' ? 72 : 40
  const stroke = size === 'lg' ? 8 : 5
  const r = radius - stroke / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(score, 100) / 100)

  const getColor = (s: number) => {
    if (s >= 90) return '#10B981'
    if (s >= 75) return '#34D399'
    if (s >= 60) return '#F59E0B'
    if (s >= 45) return '#F97316'
    return '#EF4444'
  }

  return (
    <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
      <circle cx={radius} cy={radius} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={radius} cy={radius} r={r}
        fill="none" stroke={getColor(score)} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

const DIMENSION_META: Record<string, { name: string; icon: any; color: string }> = {
  LISTENING: { name: 'Menyimak', icon: Headphones, color: '#378ADD' },
  READING: { name: 'Membaca', icon: BookOpen, color: '#10B981' },
  SPEAKING: { name: 'Berbicara', icon: Mic, color: '#F59E0B' },
  WRITING: { name: 'Menulis', icon: PenSquare, color: '#8B5CF6' },
  MEDIATION: { name: 'Mediasi', icon: RefreshCw, color: '#EC4899' },
  INTEGRATED: { name: 'Terintegrasi', icon: Puzzle, color: '#06B6D4' },
}

const CONSTRUCTED_DIMENSIONS = ['WRITING', 'SPEAKING', 'INTEGRATED', 'MEDIATION']

export default function TestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResults()
  }, [sessionId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/test/session/${sessionId}`)
      if (!res.ok) throw new Error('Gagal memuat hasil')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Gagal memuat hasil')
      setSession(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateDimScores = () => {
    if (!session) return {}
    const dims: Record<string, number[]> = {}
    for (const item of session.items) {
      // Skip constructed dimensions (Writing/Speaking) — not auto-scored, not part of exam total
      if (CONSTRUCTED_DIMENSIONS.includes(item.dimension)) continue
      if (item.answer && item.answer.score !== null) {
        if (!dims[item.dimension]) dims[item.dimension] = []
        dims[item.dimension].push(item.answer.score)
      }
    }
    const result: Record<string, { total: number; count: number; avg: number; percent: number }> = {}
    for (const [dim, scores] of Object.entries(dims)) {
      const total = scores.reduce((a, b) => a + b, 0)
      const maxPossible = scores.length * 10
      result[dim] = {
        total,
        count: scores.length,
        avg: scores.length > 0 ? total / scores.length : 0,
        percent: maxPossible > 0 ? (total / maxPossible) * 100 : 0,
      }
    }
    return result
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#D7193F] animate-spin mx-auto" />
          <p className="text-sm text-[#64748B]">Memuat hasil tes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1E]">Gagal Memuat Hasil</h2>
          <p className="text-sm text-[#8E8E93]">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={fetchResults} className="rounded-xl">
              Coba Lagi
            </Button>
            <Button onClick={() => router.push('/test/history')} className="rounded-xl bg-[#D7193F] hover:bg-[#D7193F]/90 text-white">
              Riwayat Tes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1E]">Hasil Tidak Ditemukan</h2>
          <p className="text-sm text-[#8E8E93]">Sesi tes tidak ditemukan atau belum tersedia.</p>
          <Button onClick={() => router.push('/test/history')} className="rounded-xl bg-[#D7193F] hover:bg-[#D7193F]/90 text-white">
            Lihat Riwayat Tes
          </Button>
        </div>
      </div>
    )
  }

  const totalScore = session.totalScore ?? 0
  const cefrLevel = session.cefrLevel || ''
  const dimScores = calculateDimScores()
  const answeredCount = session.items.filter(i => i.answer?.score != null).length
  const totalItems = session.items.length
  const duration = session.durationSeconds
  const productLabel: Record<string, string> = {
    ACADEMIC: 'BIGT Akademik',
    PROFESSIONAL: 'BIGT Profesional',
    PLACEMENT: 'BIGT Penempatan',
    PRACTICE: 'BIGT Latihan',
    TRIAL_A1: 'Trial A1 Full Skills',
    TRIAL_A2: 'Trial A2 Full Skills',
    DEV_FULL: 'Dev Full Test',
  }
  const productName = productLabel[session.product || ''] || session.product || 'Tes'
  const hasPendingReview = session.items.some(
    i => i.answer && (
      // Constructed response waiting for manual review
      (i.answer.responseStatus && ['submitted', 'under_review', 'draft'].includes(i.answer.responseStatus)) ||
      // Legacy: scored but isCorrect null (manual scoring items)
      (i.answer.isCorrect === null && i.answer.score === 0)
    )
  )

  const isTrial = session.product === 'TRIAL_A1' || session.product === 'TRIAL_A2' || session.product === 'DEV_FULL'
  const trialLabel = isTrial
    ? session.product === 'DEV_FULL' ? 'Dev Full Test' : `Trial ${session.product?.replace('TRIAL_', '')} Full Skills`
    : ''

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-[#D7193F]/10 text-[#D7193F] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <BarChart3 className="w-3.5 h-3.5" />
          Hasil Tes BIGT
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-2">
          Hasil Assessment Anda
        </h1>
        <p className="text-[#64748B]">{productName}</p>
        {session.completedAt && (
          <p className="text-[#64748B] text-sm mt-1">
            {new Date(session.completedAt).toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      {isTrial && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Mode Uji Coba — {trialLabel}</p>
            <p className="text-xs text-blue-700 mt-1">
              Hasil Writing dan Speaking belum dinilai dan perlu di-review manual oleh admin.
              Skor uji coba ini <strong>tidak memengaruhi</strong> skor akhir atau level CEFR Anda.
            </p>
          </div>
        </div>
      )}

      {hasPendingReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Menunggu Penilaian</p>
            <p className="text-xs text-amber-700 mt-1">
              {session.items.some(i => i.answer?.responseStatus)
                ? 'Jawaban Menulis/Bicara Anda sudah terkirim dan sedang menunggu penilaian oleh pengajar.'
                : 'Beberapa soal memerlukan penilaian manual oleh pengajar.'}
              Hasil akhir akan diperbarui setelah penilaian selesai.
            </p>
          </div>
        </div>
      )}

      <Card className="border border-[#E5EAF2] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="relative">
              <ScoreGauge score={totalScore} size="lg" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{Math.round(totalScore)}%</span>
              </div>
            </div>
            {cefrLevel && (
              <div className="text-left">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Level CEFR</p>
                <div className="bg-[#C9A227] text-white text-xl font-bold px-4 py-1.5 rounded-lg inline-block">
                  {cefrLevel}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="border border-[#E5EAF2] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
            <BarChart3 className="w-4 h-4 text-[#D7193F]" />
            Ringkasan Sesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Terjawab</p>
              <p className="text-lg font-bold text-[#0B1F3A]">{answeredCount}/{totalItems}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Durasi</p>
              <p className="text-lg font-bold text-[#0B1F3A]">
                {duration ? `${Math.floor(duration / 60)} menit` : '-'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Produk</p>
              <p className="text-sm font-bold text-[#0B1F3A]">{productName}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Level CEFR</p>
              <p className="text-lg font-bold text-[#0B1F3A]">{cefrLevel || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(dimScores).length > 0 && (
        <Card className="border border-[#E5EAF2] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
              <BarChart3 className="w-4 h-4 text-[#D7193F]" />
              Skor per Dimensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dimScores).map(([dim, data]) => {
                const meta = DIMENSION_META[dim]
                if (!meta) return null
                const Icon = meta.icon
                return (
                  <div key={dim} className="p-5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.color + '15' }}>
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F3A]">{meta.name}</p>
                        <p className="text-[10px] text-[#64748B]">{data.count} soal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ScoreGauge score={data.percent} size="sm" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#0B1F3A]">{Math.round(data.avg * 10) / 10}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${data.percent}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-1">{Math.round(data.percent)}%</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-[#E5EAF2] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
            <CheckCircle2 className="w-4 h-4 text-[#D7193F]" />
            Detail Jawaban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {session.items.map((item) => {
              const isAnswered = item.answer !== null
              const isCorrect = item.answer?.isCorrect
              const isConstructed = CONSTRUCTED_DIMENSIONS.includes(item.dimension)
              const respStatus = item.answer?.responseStatus

              const renderScoreBadge = () => {
                if (!isAnswered) {
                  return <span className="text-[10px] text-[#64748B]">-</span>
                }

                // Constructed response status
                if (isConstructed) {
                  if (respStatus === 'reviewed' && item.answer?.scoreText) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.answer.scoreText}
                        </span>
                        {item.answer.scorePercentage != null && (
                          <span className="text-[10px] text-[#64748B]">
                            ({Math.round(item.answer.scorePercentage)}%)
                          </span>
                        )}
                        {item.answer.feedback && (
                          <span className="text-[10px] text-[#64748B] ml-1 italic">
                            &quot;{item.answer.feedback}&quot;
                          </span>
                        )}
                      </div>
                    )
                  }
                  if (respStatus === 'under_review') {
                    return (
                      <span className="flex items-center gap-1 text-[10px] text-[#F59E0B]">
                        <Eye className="w-3.5 h-3.5" />
                        Sedang Dinilai
                      </span>
                    )
                  }
                  if (respStatus === 'submitted' || respStatus === 'draft') {
                    return (
                      <span className="flex items-center gap-1 text-[10px] text-[#F59E0B]">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu Penilaian
                      </span>
                    )
                  }
                  if (respStatus === 'needs_second_review') {
                    return (
                      <span className="flex items-center gap-1 text-[10px] text-[#F59E0B]">
                        <UserCheck className="w-3.5 h-3.5" />
                        Diperiksa Kembali
                      </span>
                    )
                  }
                  if (respStatus === 'flagged') {
                    return (
                      <span className="flex items-center gap-1 text-[10px] text-[#F59E0B]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Diperiksa Lebih Lanjut
                      </span>
                    )
                  }
                  if (respStatus === 'rejected') {
                    return (
                      <span className="flex items-center gap-1 text-[10px] text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Tidak Dapat Dinilai
                      </span>
                    )
                  }
                }

                // Standard MCQ / short answer
                if (isCorrect === true) {
                  return (
                    <span className="flex items-center gap-1 text-[10px] text-[#10B981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.answer?.score ?? 0} poin
                    </span>
                  )
                }
                if (isCorrect === false) {
                  return (
                    <span className="flex items-center gap-1 text-[10px] text-red-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {item.answer?.score ?? 0} poin
                    </span>
                  )
                }
                // Legacy pending
                return (
                  <span className="flex items-center gap-1 text-[10px] text-[#F59E0B]">
                    <Clock className="w-3.5 h-3.5" />
                    Review
                  </span>
                )
              }

              return (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#64748B] w-6">#{item.order}</span>
                    <span className="text-xs text-[#64748B]">{item.dimension}</span>
                    <span className="text-[10px] text-[#64748B] bg-white px-1.5 py-0.5 rounded">{item.level}</span>
                    {isConstructed && item.answer?.wordCount != null && (
                      <span className="text-[10px] text-[#64748B]">{item.answer.wordCount} kata</span>
                    )}
                    {isConstructed && item.answer?.audioDurationSec != null && (
                      <span className="text-[10px] text-[#64748B]">{item.answer.audioDurationSec}dtk</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderScoreBadge()}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/test/history')}
          className="border-[#E5EAF2] rounded-xl"
        >
          <FileText className="w-4 h-4 mr-2" />
          Lihat Riwayat Tes
        </Button>
        <Button
          onClick={() => router.push('/test/start')}
          className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-xl shadow-lg shadow-[#D7193F]/20"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Ambil Tes Lagi
        </Button>
      </div>
    </div>
  )
}
