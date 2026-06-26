'use client'

import { useEffect, useState } from 'react'
import { FileText, Headphones, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface BlueprintMeta {
  id: string
  name: string
  description: string
  totalItems: number
  estimatedDurationMinutes: number
}

interface RunResult {
  run: number
  totalItems: number
  sections: Array<{ skill: string; count: number }>
  setUsage: Array<[string, number]>
  maxFromOneSet: number
  subskillDistribution: Record<string, number>
  difficultyDistribution: Record<string, number>
  audioOk: boolean
  audioMissing: number
  hasAnswerLeak: boolean
  hasDuplicate: boolean
  warnings: string[]
}

export default function TestBlueprintsAdminPage() {
  const [blueprints, setBlueprints] = useState<BlueprintMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [runResults, setRunResults] = useState<RunResult[] | null>(null)
  const [runningBp, setRunningBp] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/test-blueprints')
      .then(r => r.json())
      .then(j => setBlueprints(j.data || []))
      .catch(() => setBlueprints([]))
      .finally(() => setLoading(false))
  }, [])

  const runDryRun = async (blueprintId: string) => {
    setRunningBp(blueprintId)
    setRunResults(null)
    try {
      const res = await fetch('/api/admin/test-blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId, runs: 5 }),
      })
      const json = await res.json()
      setRunResults(json.data?.results || [])
    } catch {
      setRunResults([])
    }
    setRunningBp(null)
  }

  const aggregate = (results: RunResult[]) => {
    if (results.length === 0) return null
    const avgItems = results.reduce((s, r) => s + r.totalItems, 0) / results.length
    const allAudioOk = results.every(r => r.audioOk)
    const allNoLeak = results.every(r => !r.hasAnswerLeak)
    const allNoDup = results.every(r => !r.hasDuplicate)
    const allWarnings = results.flatMap(r => r.warnings)
    const uniqueWarnings = [...new Set(allWarnings)]
    return { avgItems, allAudioOk, allNoLeak, allNoDup, uniqueWarnings }
  }

  const agg = runResults ? aggregate(runResults) : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">Blueprint Tes A1/A2</h1>
        <p className="text-gray-600 text-sm">Preview dan dry-run blueprint untuk BIGT</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat blueprint...</p>
      ) : (
        <div className="grid gap-6">
          {blueprints.map(bp => (
            <div key={bp.id} className="border border-gray-200 rounded-xl bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0B1F3A]">{bp.name}</h2>
                  <p className="text-sm text-gray-500">{bp.description}</p>
                </div>
                <button
                  onClick={() => runDryRun(bp.id)}
                  disabled={runningBp === bp.id}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#C8102E]/90 disabled:opacity-50 text-sm"
                >
                  <Play className="w-4 h-4" />
                  {runningBp === bp.id ? 'Menjalankan...' : 'Dry-Run (5x)'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Total Item</div>
                  <div className="text-xl font-bold">{bp.totalItems}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Estimasi Durasi</div>
                  <div className="text-xl font-bold">{bp.estimatedDurationMinutes} menit</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">ID</div>
                  <div className="text-sm font-mono text-gray-700 truncate">{bp.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {runResults && (
        <div className="mt-8 border border-gray-200 rounded-xl bg-white p-6">
          <h2 className="text-lg font-bold text-[#0B1F3A] mb-4">Hasil Dry-Run</h2>

          {agg && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Rata-rata Item</div>
                <div className="text-xl font-bold">{agg.avgItems.toFixed(0)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Audio</div>
                <div className={`text-xl font-bold flex items-center gap-1 ${agg.allAudioOk ? 'text-green-600' : 'text-red-600'}`}>
                  {agg.allAudioOk ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {agg.allAudioOk ? 'OK' : 'MISSING'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Answer Leak</div>
                <div className={`text-xl font-bold ${agg.allNoLeak ? 'text-green-600' : 'text-red-600'}`}>
                  {agg.allNoLeak ? 'AMAN' : 'BOCOR'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500">Duplikasi</div>
                <div className={`text-xl font-bold ${agg.allNoDup ? 'text-green-600' : 'text-red-600'}`}>
                  {agg.allNoDup ? 'TIDAK ADA' : 'ADA'}
                </div>
              </div>
            </div>
          )}

          {agg && agg.uniqueWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings ({agg.uniqueWarnings.length})
              </div>
              <ul className="text-sm text-yellow-600 space-y-1">
                {agg.uniqueWarnings.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {runResults.map(r => (
              <div key={r.run} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">Run #{r.run}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span>{r.totalItems} item</span>
                    <span className={r.audioOk ? 'text-green-600' : 'text-red-600'}>
                      Audio: {r.audioOk ? 'OK' : `${r.audioMissing} missing`}
                    </span>
                    <span className={!r.hasAnswerLeak ? 'text-green-600' : 'text-red-600'}>
                      Leak: {r.hasAnswerLeak ? 'YA' : 'TIDAK'}
                    </span>
                    <span className={!r.hasDuplicate ? 'text-green-600' : 'text-red-600'}>
                      Dup: {r.hasDuplicate ? 'YA' : 'TIDAK'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Difficulty:</span>
                    <div className="mt-1">
                      {Object.entries(r.difficultyDistribution).map(([k, v]) => (
                        <span key={k} className="inline-block mr-3">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Set penggunaan:</span>
                    <div className="mt-1 truncate">
                      {r.setUsage.slice(0, 4).map(([s, c]) => (
                        <span key={s} className="inline-block mr-3">{s.split('-').slice(-2).join('')}:{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Maks per set:</span>
                    <span className="ml-1 font-medium">{r.maxFromOneSet}</span>
                  </div>
                </div>

                {r.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-600">
                    {r.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
