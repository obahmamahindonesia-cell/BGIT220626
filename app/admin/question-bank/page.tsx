'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Headphones, Search, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'

interface SetMeta {
  setId: string
  cefr: string
  skill: string
  title: string
  status: string
  itemsCount: number
}

const CEFRS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const SKILLS = ['reading', 'listening', 'writing', 'speaking', 'integrated']

const SKILL_ICONS: Record<string, typeof FileText> = {
  reading: FileText,
  listening: Headphones,
}

export default function QuestionBankAdminPage() {
  const [sets, setSets] = useState<SetMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [cefrFilter, setCefrFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [previewSet, setPreviewSet] = useState<any>(null)
  const [validateResult, setValidateResult] = useState<{ ok: boolean; message: string } | null>(null)

  const fetchSets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/question-bank')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setSets(json.data || [])
    } catch {
      setSets([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSets() }, [fetchSets])

  const filtered = sets.filter(s => {
    if (cefrFilter && s.cefr !== cefrFilter) return false
    if (skillFilter && s.skill !== skillFilter) return false
    return true
  })

  const totalQuestions = filtered.reduce((sum, s) => sum + s.itemsCount, 0)

  const handlePreview = async (setId: string) => {
    try {
      const res = await fetch(`/api/admin/question-bank?setId=${setId}`)
      const json = await res.json()
      setPreviewSet(json.data)
    } catch {
      setPreviewSet(null)
    }
  }

  const handleValidate = async () => {
    setValidateResult(null)
    try {
      const res = await fetch('/api/admin/question-bank/validate', { method: 'POST' })
      const json = await res.json()
      setValidateResult({ ok: res.ok, message: json.message || (res.ok ? 'Semua valid!' : 'Ditemukan error') })
    } catch {
      setValidateResult({ ok: false, message: 'Gagal menjalankan validasi.' })
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-yellow-600 bg-yellow-50'
      case 'review': return 'text-blue-600 bg-blue-50'
      case 'retired': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">Bank Soal (File)</h1>
          <p className="text-gray-600 text-sm">Kelola set soal dari folder /data/question-bank/</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleValidate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#C8102E]/90 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Validasi
          </button>
          <button
            onClick={fetchSets}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Muat Ulang
          </button>
        </div>
      </div>

      {validateResult && (
        <div className={`mb-6 p-4 rounded-lg ${validateResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {validateResult.ok ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">{validateResult.message}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-400" />
          <select
            value={cefrFilter}
            onChange={e => setCefrFilter(e.target.value)}
            className="text-sm border-none outline-none bg-transparent pr-6"
          >
            <option value="">Semua Level</option>
            {CEFRS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-400" />
          <select
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            className="text-sm border-none outline-none bg-transparent pr-6"
          >
            <option value="">Semua Skill</option>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="text-sm text-gray-500 self-center ml-auto">
          {filtered.length} set · {totalQuestions} soal
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8102E]"></div>
          <p className="mt-3 text-gray-500 text-sm">Memuat bank soal...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada set soal ditemukan.</p>
          <p className="text-gray-400 text-sm mt-1">Tambahkan file JSON ke folder /data/question-bank/</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Set ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CEFR</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Skill</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(set => {
                const Icon = SKILL_ICONS[set.skill] || FileText
                return (
                  <tr key={set.setId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-[#0B1F3A]">{set.setId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-[#0B1F3A] text-white rounded">{set.cefr}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{set.skill}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{set.title}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">{set.itemsCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(set.status)}`}>
                        {set.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePreview(set.setId)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewSet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto" onClick={() => setPreviewSet(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">{previewSet.setId}</h2>
                <p className="text-sm text-gray-500">{previewSet.title}</p>
              </div>
              <button onClick={() => setPreviewSet(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {previewSet.skill === 'reading' && previewSet.passages?.map((p: any, pi: number) => (
                <div key={pi} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">{p.passageId}</div>
                  <h3 className="font-semibold text-[#0B1F3A] mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{p.text}</p>
                  <div className="space-y-3">
                    {p.items?.map((item: any, ii: number) => (
                      <div key={ii} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-mono text-gray-400 mb-1">{item.questionId}</div>
                        <p className="text-sm font-medium mb-2">{item.prompt}</p>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          {item.options?.map((opt: any, oi: number) => (
                            <div key={oi} className={`text-xs px-2 py-1 rounded ${opt.key === item.answer ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-200'}`}>
                              {opt.key}. {opt.text}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-green-700 italic">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {previewSet.skill === 'listening' && previewSet.items?.map((item: any, ii: number) => {
                const audioStatus: string = item.audioStatus || 'unknown'
                const badgeMap: Record<string, string> = {
                  generated: 'bg-green-100 text-green-700',
                  placeholder: 'bg-yellow-100 text-yellow-700',
                  present: 'bg-blue-100 text-blue-700',
                  missing: 'bg-red-100 text-red-700',
                }
                const audioStatusBadge = badgeMap[audioStatus] || 'bg-gray-100 text-gray-700'
                const audioBase = previewSet.audioBasePath || '/audio/listening/'
                return (
                <div key={ii} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-400">{item.questionId}</div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${audioStatusBadge}`}>
                      {audioStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                    <Headphones className="w-3.5 h-3.5" />
                    {item.audioFile} · {item.durationSeconds}s · {item.speed} · {item.speaker}
                  </div>
                  {audioStatus !== 'missing' && (
                    <audio
                      controls
                      className="w-full mb-2 h-8"
                      preload="none"
                    >
                      <source src={audioBase + item.audioFile} type="audio/mpeg" />
                    </audio>
                  )}
                  <p className="text-sm font-medium mb-2">{item.prompt}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {item.options?.map((opt: any, oi: number) => (
                      <div key={oi} className={`text-xs px-2 py-1 rounded ${opt.key === item.answer ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-200'}`}>
                        {opt.key}. {opt.text}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 italic mt-1">Transcript: {item.transcript}</p>
                  <p className="text-xs text-green-700 italic">{item.explanation}</p>
                </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
