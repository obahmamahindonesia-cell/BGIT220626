'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Headphones, CheckCircle, Search, Eye, User, Clock, AlertCircle, ChevronDown, ChevronUp, Save, RotateCcw, ShieldAlert, ScanSearch, Shield } from 'lucide-react'
import type { PlagiarismCheckResult, AIDetectionResult, PlagiarismReport, OverallRisk, AIDetectionLabel } from '@/lib/plagiarism'
import { getRubric, type Rubric, type RubricDimension } from '@/lib/rubrics/bigt-constructed-rubrics'

interface ConstructedResponse {
  id: string
  sessionItemId: string
  sessionId: string
  userId: string
  userName: string
  product: string | null
  targetLevel: string | null
  responseText: string | null
  responseAudioUrl: string | null
  responseAudioMimeType: string | null
  audioDurationSec: number | null
  audioFileSize: number | null
  audioStoragePath: string | null
  audioStorageProvider: string | null
  hasAudio: boolean
  wordCount: number | null
  snapshot: any
  dimension: string | null
  level: string | null
  submittedAt: string
  responseStatus: string
  reviewerScoreJson: any
  finalScoreJson: any
  autoScoreJson: any
  internalNotes: string | null
  reviewedAt: string | null
  feedback: string | null
  score: number | null
  aiScore: number | null
  aiFeedback: string | null
  plagiarismReport: PlagiarismCheckResult | null
}

const RISK_MAP: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
  needs_review: 'bg-orange-100 text-orange-700 border-orange-200',
  not_applicable: 'bg-gray-100 text-gray-500 border-gray-200',
}

const LEVEL_MAP: Record<string, string> = {
  A1: 'bg-blue-100 text-blue-700',
  A2: 'bg-green-100 text-green-700',
}

const STATUS_MAP: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-orange-100 text-orange-700',
  reviewed: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
}

const MATCHED_RUBRICS: Record<string, string> = {
  WRITING: 'BIGT-RUBRIC-A1-WRITING',
  SPEAKING: 'BIGT-RUBRIC-A1-SPEAKING',
}

const STATUS_FILTERS = ['', 'submitted', 'under_review', 'reviewed', 'flagged']
const LEVEL_FILTERS = ['', 'A1', 'A2']
const SKILL_FILTERS = ['', 'WRITING', 'SPEAKING']
const EXAM_MODE_FILTERS = ['', 'live', 'trial_constructed', 'dev_full']

export default function ConstructedReviewPage() {
  const [responses, setResponses] = useState<ConstructedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [unreviewedOnly, setUnreviewedOnly] = useState(false)
  const [examModeFilter, setExamModeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<ConstructedResponse | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Scoring
  const [dimensionScores, setDimensionScores] = useState<Record<string, number>>({})
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [reviewStatus, setReviewStatus] = useState('reviewed')
  const [plagiarismChecking, setPlagiarismChecking] = useState(false)
  const [plagiarismError, setPlagiarismError] = useState('')
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismCheckResult | null>(null)

  const fetchResponses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (levelFilter) params.set('level', levelFilter)
      if (skillFilter) params.set('dimension', skillFilter)
      if (examModeFilter) params.set('examMode', examModeFilter)
      const res = await fetch(`/api/admin/constructed?${params}`)
      const json = await res.json()
      let data = json.data || []
      if (unreviewedOnly) {
        data = data.filter((r: ConstructedResponse) => r.responseStatus === 'submitted' || r.responseStatus === 'under_review')
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        data = data.filter((r: ConstructedResponse) =>
          r.userName?.toLowerCase().includes(q) ||
          r.responseText?.toLowerCase().includes(q)
        )
      }
      setResponses(data)
    } catch {
      setResponses([])
    }
    setLoading(false)
  }, [statusFilter, levelFilter, skillFilter, unreviewedOnly, examModeFilter, searchQuery])

  useEffect(() => { fetchResponses() }, [fetchResponses])

  const handleSelect = (r: ConstructedResponse) => {
    setSelected(r)
    setPlagiarismResult(null)
    setPlagiarismError('')
    const snapshot = r.snapshot || {}
    const rubricRef = snapshot.rubricRef || MATCHED_RUBRICS[r.dimension || ''] || 'BIGT-RUBRIC-A1-WRITING'
    const rubric = getRubric(rubricRef)

    // Pre-fill scores from existing review
    if (r.reviewerScoreJson?.dimensions) {
      const prefill: Record<string, number> = {}
      for (const d of r.reviewerScoreJson.dimensions) {
        prefill[d.id] = d.score
      }
      setDimensionScores(prefill)
    } else if (rubric) {
      const init: Record<string, number> = {}
      for (const d of rubric.dimensions) {
        init[d.id] = 0
      }
      setDimensionScores(init)
    } else {
      setDimensionScores({})
    }

    setReviewFeedback(r.feedback || '')
    setInternalNotes(r.internalNotes || '')
  }

  const handleScoreChange = (dimId: string, value: number) => {
    setDimensionScores(prev => ({ ...prev, [dimId]: value }))
  }

  const handleSaveReview = async () => {
    if (!selected) return
    setSaving(true)
    setSaveMsg('')

    const snapshot = selected.snapshot || {}
    const rubricRef = snapshot.rubricRef || MATCHED_RUBRICS[selected.dimension || ''] || 'BIGT-RUBRIC-A1-WRITING'

    // Validate all dimensions have scores
    const rubric = getRubric(rubricRef)
    let allScored = true
    if (rubric) {
      for (const d of rubric.dimensions) {
        if (!dimensionScores[d.id] && dimensionScores[d.id] !== 0) {
          allScored = false
          break
        }
      }
    }

    if (!allScored) {
      setSaveMsg('Semua dimensi harus dinilai.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/constructed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          reviewerScoreJson: { dimensions: rubric?.dimensions.map(d => ({
            id: d.id,
            name: d.name,
            nameId: d.nameId,
            score: dimensionScores[d.id] || 0,
            maxScore: 5,
          })) || [] },
          feedback: reviewFeedback,
          internalNotes,
          responseStatus: reviewStatus,
        }),
      })

      if (!res.ok) throw new Error('Gagal menyimpan')

      setSaveMsg('Penilaian berhasil disimpan.')
      fetchResponses()
    } catch {
      setSaveMsg('Gagal menyimpan penilaian.')
    }
    setSaving(false)
  }

  const handleFlag = async (id: string) => {
    try {
      await fetch('/api/admin/constructed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, responseStatus: 'flagged' }),
      })
      fetchResponses()
    } catch {}
  }

  const getSkillIcon = (dim: string | null) => {
    if (dim === 'WRITING' || dim === 'SPEAKING') return FileText
    return Headphones
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">Review Jawaban Menulis & Berbicara</h1>
        <p className="text-gray-600 text-sm">Nilai dan beri feedback pada jawaban constructed response peserta.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#0B3D91] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === '' ? 'Semua' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex gap-1 items-center">
          <span className="text-[10px] text-gray-400 mr-1">Level:</span>
          {LEVEL_FILTERS.map(l => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                levelFilter === l
                  ? 'bg-[#0B3D91] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {l === '' ? 'Semua' : l}
            </button>
          ))}
        </div>

        {/* Skill filter */}
        <div className="flex gap-1 items-center">
          <span className="text-[10px] text-gray-400 mr-1">Skill:</span>
          {SKILL_FILTERS.map(k => (
            <button
              key={k}
              onClick={() => setSkillFilter(k)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                skillFilter === k
                  ? 'bg-[#0B3D91] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {k === '' ? 'Semua' : k.charAt(0) + k.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Unreviewed toggle */}
        <button
          onClick={() => setUnreviewedOnly(!unreviewedOnly)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            unreviewedOnly
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {unreviewedOnly ? 'Hanya Belum Dinilai' : 'Tampilkan Semua'}
        </button>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari peserta atau teks..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#0B3D91] bg-white"
          />
        </div>

        {/* Exam Mode filter */}
        <select
          value={examModeFilter}
          onChange={e => setExamModeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0B3D91]"
        >
          <option value="">Semua Mode</option>
          <option value="live">Live</option>
          <option value="trial_constructed">Uji Coba</option>
          <option value="dev_full">Dev Full</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B3D91]"></div>
          <p className="mt-3 text-gray-500 text-sm">Memuat respons...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada respons constructed response.</p>
          <p className="text-gray-400 text-sm mt-1">Tunggu peserta mengirim jawaban menulis atau berbicara.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-3">
            {responses.map(r => {
              const Icon = getSkillIcon(r.dimension)
              const snapshot = r.snapshot || {}
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
                    selected?.id === r.id ? 'ring-2 ring-[#0B3D91]' : ''
                  }`}
                >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-[#0B1F3A]">{r.userName}</span>
                        {r.dimension && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${LEVEL_MAP[r.level || ''] || 'bg-gray-100 text-gray-600'}`}>
                            {r.level || snapshot?.level || ''}
                          </span>
                        )}
                        {r.product && (r.product === 'TRIAL_A1' || r.product === 'TRIAL_A2' || r.product === 'DEV_FULL') && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700">
                            {r.product === 'DEV_FULL' ? 'Dev' : 'Trial'}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[r.responseStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {r.responseStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{snapshot?.prompt || 'Tidak ada prompt'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.submittedAt).toLocaleDateString('id-ID')}
                      </span>
                      {r.wordCount && <span>{r.wordCount} kata</span>}
                      {r.audioDurationSec && <span>{r.audioDurationSec}s</span>}
                      {r.reviewedAt && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" />Dinilai</span>}
                    </div>
                </div>
              )
            })}
          </div>

          {/* Detail + Scoring */}
          {selected && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-[#0B1F3A]">Review Response</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFlag(selected.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Flag
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[selected.responseStatus]}`}>
                      {selected.responseStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {selected.userName}
                  <span className="text-gray-300">|</span>
                  {selected.dimension || selected.snapshot?.skill || 'Unknown'}
                  <span className="text-gray-300">|</span>
                  {selected.level || selected.snapshot?.level || ''}
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Prompt */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prompt</h3>
                  <p className="text-sm text-[#0B1F3A]">{selected.snapshot?.prompt || 'Tidak ada prompt'}</p>
                  {selected.snapshot?.instructionForCandidate && (
                    <p className="text-xs text-gray-500 italic mt-1">{selected.snapshot.instructionForCandidate}</p>
                  )}
                </div>

                {/* Constraints */}
                {selected.snapshot?.constraints && (
                  <div className="flex gap-3 text-xs text-gray-500">
                    {selected.snapshot.constraints.minWords && <span>Min {selected.snapshot.constraints.minWords} kata</span>}
                    {selected.snapshot.constraints.maxWords && <span>Max {selected.snapshot.constraints.maxWords} kata</span>}
                    {selected.snapshot.constraints.maxDurationSec && <span>Max {selected.snapshot.constraints.maxDurationSec} detik</span>}
                  </div>
                )}

                {/* Response Text */}
                {selected.responseText && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Jawaban Peserta</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-[#0B1F3A] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selected.responseText}
                    </div>
                    {selected.wordCount && (
                      <p className="text-xs text-gray-400 mt-1">{selected.wordCount} kata</p>
                    )}
                  </div>
                )}

                {/* Audio Playback — uses signed URL via admin endpoint */}
                {(selected as any).hasAudio && (
                  <AudioPlayer responseId={selected.id} audioDurationSec={selected.audioDurationSec} />
                )}

                {/* Transcript (admin only — from snapshot) */}
                {selected.snapshot?.adminOnly?.transcript && (
                  <div>
                    <h3 className="text-xs font-medium text-orange-500 uppercase tracking-wider mb-1">Transcript Stimulus (Admin Only)</h3>
                    <p className="text-xs text-gray-600 italic p-2 bg-orange-50 rounded">{selected.snapshot.adminOnly.transcript}</p>
                  </div>
                )}

                {/* Sample Response (admin only) */}
                {selected.snapshot?.adminOnly?.sampleResponse && (
                  <div>
                    <button
                      onClick={() => setExpanded(expanded === 'sample' ? null : 'sample')}
                      className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-700"
                    >
                      {expanded === 'sample' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Lihat Contoh Jawaban (Admin Only)
                    </button>
                    {expanded === 'sample' && (
                      <div className="mt-2 p-3 bg-orange-50 rounded text-xs text-gray-600 whitespace-pre-wrap">
                        {selected.snapshot.adminOnly.sampleResponse}
                      </div>
                    )}
                  </div>
                )}

                {/* Scoring Notes (admin only) */}
                {selected.snapshot?.adminOnly?.scoringNotes && (
                  <div>
                    <button
                      onClick={() => setExpanded(expanded === 'notes' ? null : 'notes')}
                      className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-700"
                    >
                      {expanded === 'notes' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Lihat Catatan Penilaian (Admin Only)
                    </button>
                    {expanded === 'notes' && (
                      <div className="mt-2 p-3 bg-orange-50 rounded text-xs text-gray-600 whitespace-pre-wrap">
                        {selected.snapshot.adminOnly.scoringNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Rubric-based Scoring */}
                {selected.dimension && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Penilaian per Dimensi</h3>
                    {(() => {
                      const snapshot = selected.snapshot || {}
                      const rubricRef = snapshot.rubricRef || MATCHED_RUBRICS[selected.dimension || ''] || 'BIGT-RUBRIC-A1-WRITING'
                      const rubric = getRubric(rubricRef)
                      if (!rubric) return <p className="text-xs text-red-500">Rubrik {rubricRef} tidak ditemukan.</p>

                      return (
                        <div className="space-y-3">
                          {rubric.dimensions.map(dim => (
                            <div key={dim.id}>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-[#0B1F3A]">{dim.nameId}</label>
                                <span className="text-xs text-gray-400">
                                  {dimensionScores[dim.id] || 0} / 5
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mb-1">{dim.description}</p>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3, 4, 5].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => handleScoreChange(dim.id, v)}
                                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                                      (dimensionScores[dim.id] || 0) === v
                                        ? 'bg-[#0B3D91] text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {dim.levels[dimensionScores[dim.id] || 0]?.label || ''}
                              </p>
                            </div>
                          ))}

                          {/* Score Summary + Band Preview */}
                          {(() => {
                            const total = Object.values(dimensionScores).reduce((a, b) => a + b, 0)
                            const maxPossible = rubric.dimensions.length * 5
                            const pct = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0

                            const getBand = (p: number) => {
                              if (p >= 80) return { label: 'Kuat', color: 'text-green-600 bg-green-50 border-green-200' }
                              if (p >= 60) return { label: 'Cukup', color: 'text-blue-600 bg-blue-50 border-blue-200' }
                              if (p >= 40) return { label: 'Hampir Cukup', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
                              return { label: 'Di Bawah', color: 'text-red-600 bg-red-50 border-red-200' }
                            }
                            const band = getBand(pct)

                            return (
                              <div className="pt-2 border-t border-gray-100 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-[#0B1F3A]">Total</span>
                                  <span className="font-semibold text-[#0B3D91]">{total} / {maxPossible} ({pct}%)</span>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-medium ${band.color}`}>
                                  <span>Preview Band: {band.label}</span>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* AI Score (if exists) */}
                {selected.aiScore !== null && selected.aiScore !== undefined && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Skor AI (Draft)</h3>
                    <p className="text-sm text-[#0B1F3A]">{selected.aiScore}</p>
                    {selected.aiFeedback && (
                      <p className="text-xs text-gray-600 mt-1">{selected.aiFeedback}</p>
                    )}
                  </div>
                )}

                {/* Feedback untuk Peserta */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-[#10B981]" />
                    <h3 className="text-xs font-medium text-[#10B981]">Feedback untuk Peserta</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">Teks ini akan terlihat oleh peserta setelah penilaian selesai.</p>
                  <textarea
                    value={reviewFeedback}
                    onChange={e => setReviewFeedback(e.target.value)}
                    placeholder="Tulis feedback yang membangun untuk peserta. Contoh: 'Kosakata sudah baik. Coba gunakan kalimat yang lebih bervariasi.'"
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-y min-h-[80px] focus:outline-none focus:border-[#0B3D91]"
                  />
                  {reviewFeedback && (
                    <p className="text-[10px] text-gray-400 mt-1">{reviewFeedback.length} karakter</p>
                  )}
                </div>

                {/* Internal Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-3 h-3 text-orange-400" />
                    <h3 className="text-xs font-medium text-orange-500">Catatan Internal Reviewer</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">Catatan internal tidak akan terlihat oleh peserta.</p>
                  <textarea
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    placeholder="Catatan untuk admin lain — tidak terlihat peserta."
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-y min-h-[60px] focus:outline-none focus:border-[#0B3D91]"
                  />
                </div>

                {/* Plagiarism & AI Detection */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="p-2 bg-blue-50 rounded border border-blue-100 mb-3">
                    <p className="text-[10px] text-blue-700 flex items-start gap-1">
                      <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      Pemeriksaan ini hanya alat bantu review. Keputusan akhir tetap melalui penilaian reviewer. Hasil deteksi AI/plagiarisme bukan vonis otomatis.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Deteksi Plagiarisme & AI
                    </h3>
                    <button
                      onClick={async () => {
                        if (!selected || plagiarismChecking) return
                        setPlagiarismChecking(true)
                        setPlagiarismError('')
                        setPlagiarismResult(null)
                        try {
                          const res = await fetch('/api/admin/constructed/run-plagiarism-check', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ responseId: selected.id }),
                          })
                          const json = await res.json()
                          if (json.success && json.plagiarismReport) {
                            setPlagiarismResult(json.plagiarismReport)
                          } else if (json.message) {
                            setPlagiarismError(json.message)
                          } else {
                            setPlagiarismError(json.error || 'Pemeriksaan belum bisa dijalankan.')
                          }
                        } catch {
                          setPlagiarismError('Pemeriksaan gagal dijalankan. Coba lagi.')
                        }
                        setPlagiarismChecking(false)
                      }}
                      disabled={plagiarismChecking}
                      className="flex items-center gap-1 text-xs font-medium text-[#0B3D91] hover:text-[#0B3D91]/70 disabled:opacity-50"
                    >
                      {plagiarismChecking ? (
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-[#0B3D91]" />
                      ) : (
                        <ScanSearch className="w-3 h-3" />
                      )}
                      {plagiarismChecking ? 'Memeriksa...' : 'Jalankan Pemeriksaan'}
                    </button>
                  </div>

                  {plagiarismError && (
                    <p className="text-xs text-red-500 mb-2">{plagiarismError}</p>
                  )}

                  {/* Existing report from DB */}
                  {!plagiarismResult && selected.plagiarismReport && (
                    <PlagiarismReportView report={selected.plagiarismReport} />
                  )}

                  {/* Fresh report */}
                  {plagiarismResult && <PlagiarismReportView report={plagiarismResult} />}
                </div>
              </div>

              {/* Blocker warnings */}
              {selected && (selected.responseStatus === 'flagged' || selected.responseStatus === 'needs_second_review' || selected.responseStatus === 'rejected') && (
                <div className="px-4 pt-2">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      {selected.responseStatus === 'flagged' && (
                        <p className="text-amber-800">Perlu pemeriksaan — <strong>status ditandai</strong>. Pastikan sudah diperiksa sebelum finalisasi.</p>
                      )}
                      {selected.responseStatus === 'needs_second_review' && (
                        <p className="text-amber-800"><strong>Butuh review kedua</strong>. Status ini harus diselesaikan sebelum response dapat difinalisasi.</p>
                      )}
                      {selected.responseStatus === 'rejected' && (
                        <p className="text-amber-800"><strong>Tidak dapat dinilai</strong>. Response ini sudah ditolak dan tidak dapat diubah.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="p-4 border-t border-gray-200">
                {saveMsg && (
                  <p className={`text-xs mb-2 ${saveMsg.includes('berhasil') ? 'text-green-600' : 'text-red-500'}`}>
                    {saveMsg}
                  </p>
                )}
                <div className="flex gap-2 items-center">
                  <select
                    value={reviewStatus}
                    onChange={e => setReviewStatus(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0B3D91]"
                  >
                    <option value="reviewed">Siap difinalisasi</option>
                    <option value="needs_second_review">Butuh review kedua</option>
                    <option value="flagged">Perlu pemeriksaan</option>
                    <option value="rejected">Tidak dapat dinilai</option>
                  </select>
                  <button
                    onClick={handleSaveReview}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0B3D91] text-white rounded-lg hover:bg-[#0B3D91]/90 text-sm disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan Penilaian
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AIDetectionBadge({ aiDetection }: { aiDetection: AIDetectionResult }) {
  const getColor = () => {
    if (aiDetection.label === 'likely_ai') return 'bg-red-100 text-red-700 border-red-200'
    if (aiDetection.label === 'needs_review') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (aiDetection.label === 'uncertain') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (aiDetection.label === 'likely_human') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (aiDetection.label === 'human') return 'bg-green-100 text-green-700 border-green-200'
    if (aiDetection.label === 'insufficient_text') return 'bg-gray-100 text-gray-500 border-gray-200'
    if (aiDetection.label === 'not_applicable') return 'bg-gray-100 text-gray-400 border-gray-200'
    return 'bg-gray-100 text-gray-500'
  }

  const getLabel = () => {
    const map: Record<string, string> = {
      likely_ai: 'Kemungkinan AI',
      needs_review: 'Perlu Review',
      uncertain: 'Tidak Yakin',
      likely_human: 'Kemungkinan Manusia',
      human: 'Tulisan Manusia',
      insufficient_text: 'Teks Terlalu Pendek',
      not_applicable: 'Tidak Berlaku',
    }
    return map[aiDetection.label] || aiDetection.label
  }

  if (aiDetection.label === 'insufficient_text' || aiDetection.label === 'not_applicable') {
    return (
      <div className={`p-3 rounded-lg border ${getColor()}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{getLabel()}</span>
        </div>
        {aiDetection.reasoning && (
          <p className="text-[10px] opacity-75 mt-1">{aiDetection.reasoning}</p>
        )}
      </div>
    )
  }

  const isShortOrNa = (aiDetection.label as string) === 'insufficient_text' || (aiDetection.label as string) === 'not_applicable'

  return (
    <div className={`p-3 rounded-lg border ${getColor()}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold">{getLabel()}</span>
        {!isShortOrNa && (
          <span className="text-xs font-mono">{aiDetection.score}/100</span>
        )}
      </div>
      {aiDetection.reasoning && (
        <p className="text-[10px] opacity-75 mt-0.5">{aiDetection.reasoning}</p>
      )}
      {!isShortOrNa && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] opacity-75">
          <span>Keragaman kosakata: {aiDetection.details.vocabularyDiversity}/100</span>
          <span>Variasi kalimat: {aiDetection.details.sentenceLengthVariance}/100</span>
          <span>Pengulangan: {aiDetection.details.repetitionScore}/100</span>
          <span>Alur alami: {aiDetection.details.naturalFlowScore}/100</span>
        </div>
      )}
    </div>
  )
}

function PlagiarismReportView({ report }: { report: PlagiarismCheckResult }) {
  const hasAiDetection = !!report.aiDetection
  const hasPlagiarism = !!report.plagiarism
  const showAnything = hasAiDetection || hasPlagiarism

  if (!showAnything) {
    return <p className="text-xs text-gray-400">Belum ada data pemeriksaan.</p>
  }

  return (
    <div className="space-y-3">
      {/* Overall Risk Badge */}
      {report.overallRisk && report.overallRisk !== 'low' && (
        <div className={`p-2 rounded border text-xs font-medium ${RISK_MAP[report.overallRisk] || 'bg-gray-100 text-gray-500'}`}>
          {report.overallRisk === 'high' && '⚠ Risiko Tinggi — Perlu review manual segera'}
          {report.overallRisk === 'needs_review' && '⚑ Perlu Review — Beberapa indikator perlu diperiksa'}
          {report.overallRisk === 'medium' && '○ Risiko Sedang — Disarankan review manual'}
          {report.overallRisk === 'not_applicable' && '— Tidak berlaku untuk respons ini'}
        </div>
      )}

      {hasAiDetection && <AIDetectionBadge aiDetection={report.aiDetection!} />}

      {hasPlagiarism && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-600">Plagiarisme</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              report.plagiarism!.overallRisk === 'high'
                ? 'bg-red-100 text-red-700'
                : report.plagiarism!.overallRisk === 'medium' || report.plagiarism!.overallRisk === 'needs_review'
                ? 'bg-orange-100 text-orange-700'
                : report.plagiarism!.overallRisk === 'low'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {report.plagiarism!.overallRisk === 'not_applicable' ? 'N/A' : `${report.plagiarism!.overallScore}/100`}
            </span>
          </div>

          {report.plagiarism!.overallRisk !== 'not_applicable' && (
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-2">
              <span>Cross-plagiarisme: {report.plagiarism!.crossPlagiarismScore}/100</span>
              <span>Dibandingkan: {report.plagiarism!.checkedResponsesCount} jawaban</span>
            </div>
          )}

          {report.plagiarism!.matches.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-[10px] font-medium text-gray-600">Kecocokan ditemukan:</p>
              {report.plagiarism!.matches.slice(0, 5).map((m, i) => (
                <div key={i} className="p-2 bg-white rounded border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-700">
                      Jawaban #{i + 1}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      m.similarity > 50 ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {m.similarity}% mirip
                    </span>
                  </div>
                  {m.matchingPassages.map((p, j) => (
                    <p key={j} className="text-[10px] text-gray-500 italic truncate">"{p}"</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {report.plagiarism!.matches.length === 0 && report.plagiarism!.overallRisk !== 'not_applicable' && (
            <p className="text-[10px] text-green-600">Tidak ditemukan kecocokan dengan jawaban lain.</p>
          )}

          {report.plagiarism!.overallRisk === 'not_applicable' && (
            <p className="text-[10px] text-gray-500">Tidak ada jawaban pembanding yang relevan.</p>
          )}
        </div>
      )}

      {/* Reviewer warning */}
      <p className="text-[10px] text-gray-400 italic">
        Pemeriksaan ini hanya alat bantu review. Keputusan akhir tetap melalui penilaian reviewer. Hasil deteksi AI/plagiarisme bukan vonis otomatis.
      </p>
    </div>
  )
}

function AudioPlayer({ responseId, audioDurationSec }: { responseId: string; audioDurationSec: number | null }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/admin/constructed/audio-url?responseId=${encodeURIComponent(responseId)}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return
        if (json.success && json.data?.signedUrl) {
          setSignedUrl(json.data.signedUrl)
        } else {
          setError('Audio tidak tersedia.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat audio.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [responseId])

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rekaman Suara</h3>
      {loading && <p className="text-xs text-gray-400">Memuat audio...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {signedUrl && (
        <>
          <audio controls src={signedUrl} className="w-full h-9 rounded-lg" />
          {audioDurationSec && <p className="text-xs text-gray-400 mt-1">{audioDurationSec} detik</p>}
        </>
      )}
    </div>
  )
}
