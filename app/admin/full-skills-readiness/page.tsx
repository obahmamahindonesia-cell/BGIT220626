'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertTriangle, Activity, Shield, BookOpen, Volume2, Gauge, ExternalLink } from 'lucide-react'

interface ReadinessData {
  bank: any
  trials: any
  reviews: any
  risk: any
  audio: any
  safety: { items: Array<{ key: string; label: string; ok: boolean }>; allPass: boolean }
  readiness: {
    level: 'blocked' | 'needs_work' | 'pilot_ready' | 'live_ready_candidate'
    score: number
    blockers: string[]
    recommendations: string[]
  }
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  blocked: { label: 'Terblokir', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  needs_work: { label: 'Butuh Perbaikan', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  pilot_ready: { label: 'Siap Pilot', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  live_ready_candidate: { label: 'Siap Live', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
}

export default function FullSkillsReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/full-skills-readiness')
      .then(r => r.json())
      .then(j => {
        if (j.success) setData(j.data)
        else setError(j.error || 'Gagal memuat data.')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat data.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3D91]" />
        <p className="mt-4 text-gray-500 text-sm">Memuat readiness dashboard...</p>
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-red-500 text-sm">{error || 'Tidak ada data.'}</p>
  }

  const { readiness, bank, trials, reviews, risk, audio, safety } = data
  const lvl = LEVEL_CONFIG[readiness.level] || LEVEL_CONFIG.needs_work

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">Kesiapan Full Skills</h1>
          <p className="text-gray-500 text-sm">Dashboard untuk menilai kesiapan Writing/Speaking sebelum pilot terbatas.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border ${lvl.bg}`}>
          <span className={`text-sm font-bold ${lvl.color}`}>{lvl.label}</span>
        </div>
      </div>

      {/* Readiness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Skor Kesiapan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0B1F3A]">{readiness.score}/100</p>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${readiness.score}%`,
                  backgroundColor: readiness.score >= 70 ? '#10B981' : readiness.score >= 40 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bank Soal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0B1F3A]">{bank.total}</p>
            <p className="text-xs text-gray-400 mt-1">Total item</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Trial Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0B1F3A]">{trials.total}</p>
            <p className="text-xs text-gray-400 mt-1">{trials.completed} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Review Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0B1F3A]">{reviews.completionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{reviews.reviewed} reviewed dari {reviews.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Soal */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Bank Soal</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-lg font-bold text-blue-700">{bank.reading}</p>
              <p className="text-xs text-blue-600">Reading</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-lg font-bold text-purple-700">{bank.listening}</p>
              <p className="text-xs text-purple-600">Listening</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${bank.writing >= 40 ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="text-lg font-bold text-amber-700">{bank.writing}</p>
              <p className="text-xs text-amber-600">Writing</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${bank.speaking >= 40 ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="text-lg font-bold text-amber-700">{bank.speaking}</p>
              <p className="text-xs text-amber-600">Speaking</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-lg font-bold text-gray-500">{bank.integrated}</p>
              <p className="text-xs text-gray-500">Integrated</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-lg font-bold text-gray-500">{bank.mediation}</p>
              <p className="text-xs text-gray-500">Mediation</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center col-span-2 sm:col-span-1">
              <p className="text-lg font-bold text-gray-700">{bank.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Threshold: Writing ≥40, Speaking ≥40. Saat ini: Writing {bank.writing >= 40 ? '✅' : '⚠️'}, Speaking {bank.speaking >= 40 ? '✅' : '⚠️'}.
          </div>
        </CardContent>
      </Card>

      {/* Trial Metrics */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Trial Sessions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center"><p className="text-lg font-bold">{trials.total}</p><p className="text-xs text-gray-500">Total</p></div>
            <div className="text-center"><p className="text-lg font-bold">{trials.a1Trials}</p><p className="text-xs text-gray-500">A1</p></div>
            <div className="text-center"><p className="text-lg font-bold">{trials.a2Trials}</p><p className="text-xs text-gray-500">A2</p></div>
            <div className="text-center"><p className="text-lg font-bold">{trials.devFull}</p><p className="text-xs text-gray-500">Dev Full</p></div>
            <div className="text-center"><p className="text-lg font-bold">{trials.completed}</p><p className="text-xs text-gray-500">Completed</p></div>
          </div>
          {trials.lastTrialDate && (
            <p className="text-xs text-gray-400 mt-2">Trial terakhir: {new Date(trials.lastTrialDate).toLocaleDateString('id-ID')}</p>
          )}
          <div className="mt-3">
            <a href="/admin/trial" className="text-xs text-[#0B3D91] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />Buat Trial Baru
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Review Metrics */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Review Constructed Response</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded"><p className="font-bold">{reviews.total}</p><p className="text-xs text-gray-500">Total</p></div>
            <div className="text-center p-2 bg-amber-50 rounded"><p className="font-bold text-amber-700">{reviews.pending}</p><p className="text-xs text-amber-600">Pending</p></div>
            <div className="text-center p-2 bg-blue-50 rounded"><p className="font-bold text-blue-700">{reviews.underReview}</p><p className="text-xs text-blue-600">Review</p></div>
            <div className="text-center p-2 bg-green-50 rounded"><p className="font-bold text-green-700">{reviews.reviewed}</p><p className="text-xs text-green-600">Reviewed</p></div>
            <div className="text-center p-2 bg-orange-50 rounded"><p className="font-bold text-orange-700">{reviews.needsSecondReview}</p><p className="text-xs text-orange-600">2nd Review</p></div>
            <div className="text-center p-2 bg-red-50 rounded"><p className="font-bold text-red-700">{reviews.flagged}</p><p className="text-xs text-red-600">Flagged</p></div>
            <div className="text-center p-2 bg-gray-100 rounded"><p className="font-bold text-gray-600">{reviews.rejected}</p><p className="text-xs text-gray-500">Rejected</p></div>
          </div>
          {reviews.avgReviewHours != null && (
            <p className="text-xs text-gray-400 mt-2">Rata-rata waktu review: {reviews.avgReviewHours} jam</p>
          )}
          <div className="mt-3">
            <a href="/admin/constructed-review" className="text-xs text-[#0B3D91] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />Buka Review Page
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Anti-Cheating / Risk Signals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center p-2 bg-green-50 rounded"><p className="font-bold text-green-700">{risk.low}</p><p className="text-xs text-green-600">Low Risk</p></div>
            <div className="text-center p-2 bg-amber-50 rounded"><p className="font-bold text-amber-700">{risk.medium}</p><p className="text-xs text-amber-600">Medium</p></div>
            <div className="text-center p-2 bg-red-50 rounded"><p className="font-bold text-red-700">{risk.high}</p><p className="text-xs text-red-600">High Risk</p></div>
            <div className="text-center p-2 bg-orange-50 rounded"><p className="font-bold text-orange-700">{risk.needsReview}</p><p className="text-xs text-orange-600">Needs Review</p></div>
            <div className="text-center p-2 bg-gray-50 rounded"><p className="font-bold text-gray-500">{risk.insufficientText}</p><p className="text-xs text-gray-500">Insufficient</p></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">{risk.message}</p>
        </CardContent>
      </Card>

      {/* Audio Readiness */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Volume2 className="w-4 h-4" /> Audio Speaking</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center"><p className="text-lg font-bold">{audio.total}</p><p className="text-xs text-gray-500">Total Responses</p></div>
            <div className="text-center"><p className="text-lg font-bold text-green-700">{audio.withAudio}</p><p className="text-xs text-gray-500">Dengan Audio</p></div>
            <div className="text-center"><p className="text-lg font-bold">{audio.missingAudio > 0 ? <span className="text-red-600">{audio.missingAudio}</span> : '0'}</p><p className="text-xs text-gray-500">Audio Hilang</p></div>
            <div className="text-center"><p className="text-lg font-bold">{audio.averageDurationSec}s</p><p className="text-xs text-gray-500">Rata-rata Durasi</p></div>
          </div>
          <p className={`text-xs mt-2 ${audio.storageReady ? 'text-green-600' : 'text-amber-600'}`}>
            {audio.note}
          </p>
        </CardContent>
      </Card>

      {/* Safety Checklist */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="w-4 h-4" /> System Safety Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {safety.items.map((item: any) => (
              <div key={item.key} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={item.ok ? 'text-gray-700' : 'text-red-600'}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockers */}
      {readiness.blockers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Current Blockers</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readiness.blockers.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {readiness.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Recommended Next Actions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readiness.recommendations.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#0B1F3A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D91] mt-2 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
