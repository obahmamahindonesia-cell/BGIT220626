'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users, Activity, CheckCircle2, AlertTriangle, Shield, BookOpen,
  FlaskConical, MessageSquareText, BarChart3, ExternalLink, Search,
  XCircle, Clock, UserPlus, FileText, Gauge, ClipboardList,
  ChevronDown, ChevronUp, Filter,
} from 'lucide-react'

interface OwnerData {
  overview: {
    totalUsers: number; totalTestTakers: number; newUsersToday: number;
    newUsers7d: number; newUsers30d: number; totalSessions: number;
    completedSessions: number; abandonedSessions: number; completionRate: number;
    totalResults: number; averageScore: number | null; pendingReview: number;
  }
  registrations: {
    latestUsers: Array<{
      id: string; name: string | null; email: string | null; role: string;
      createdAt: string; totalSessions: number; completedSessions: number;
      lastActivityAt: string | null;
    }>
  }
  tests: {
    totalSessions: number; completedSessions: number; abandonedSessions: number;
    inProgressSessions: number; completionRate: number;
    byLevel: Record<string, number>; byProduct: Record<string, number>;
    byStatus: Record<string, number>;
    recentSessions: Array<{
      id: string; userName: string | null; userEmail: string | null;
      level: string | null; product: string | null; examMode: string | null;
      status: string; score: number | null; cefrLevel: string | null;
      startedAt: string | null; completedAt: string | null;
    }>
  }
  results: {
    totalResults: number; averageScore: number | null; passRate: number | null;
    levelDistribution: Record<string, number>;
    recentResults: Array<{
      id: string; userName: string | null; userEmail: string | null;
      score: number | null; cefrLevel: string | null; createdAt: string;
    }>
  }
  constructed: {
    totalResponses: number; pendingReview: number; underReview: number;
    reviewed: number; flagged: number; rejected: number;
    needsSecondReview: number; writingCount: number; speakingCount: number;
  }
  risk: { low: number; medium: number; high: number; needsReview: number; insufficientText: number; notApplicable: number }
  trial: {
    totalTrialSessions: number; a1TrialSessions: number; a2TrialSessions: number;
    devFullSessions: number; completedTrialSessions: number; latestTrialAt: string | null;
  }
  questionBank: {
    total: number; reading: number; listening: number; writing: number;
    speaking: number; integrated: number; mediation: number;
    validatorStatus: string; auditStatus: string;
  }
  ownerAlerts: Array<{
    severity: 'critical' | 'warning' | 'info'; title: string; message: string;
    actionLabel?: string; actionHref?: string;
  }>
}

type TabKey = 'registrations' | 'tests' | 'results' | 'review' | 'trial' | 'qbank' | 'risk'

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'registrations', label: 'Pendaftar', icon: UserPlus },
  { key: 'tests', label: 'Aktivitas Tes', icon: Activity },
  { key: 'results', label: 'Hasil', icon: BarChart3 },
  { key: 'review', label: 'Review Menulis/Bicara', icon: MessageSquareText },
  { key: 'trial', label: 'Mode Uji Coba', icon: FlaskConical },
  { key: 'qbank', label: 'Bank Soal', icon: BookOpen },
  { key: 'risk', label: 'Risiko', icon: Shield },
]

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  CONFIGURED: { label: 'Configured', color: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-amber-100 text-amber-700' },
  SCORED: { label: 'Scored', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-600' },
}

const EXAM_MODE_BADGE: Record<string, { label: string; color: string }> = {
  live: { label: 'Live', color: 'bg-green-100 text-green-700' },
  trial_constructed: { label: 'Trial', color: 'bg-purple-100 text-purple-700' },
  dev_full: { label: 'Dev Full', color: 'bg-amber-100 text-amber-700' },
}

function AlertIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
  if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
  return <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
}

function Badge({ value, ok, warn }: { value: number; ok: boolean; warn?: boolean }) {
  if (ok) return <span className="text-green-600 font-bold">{value}</span>
  if (warn) return <span className="text-amber-600 font-bold">{value}</span>
  return <span className="text-red-600 font-bold">{value}</span>
}

export default function BIGTOwnerPage() {
  const [data, setData] = useState<OwnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('registrations')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/admin/bigt-owner')
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

  const filteredUsers = useMemo(() => {
    if (!data || !searchQuery) return data?.registrations.latestUsers || []
    const q = searchQuery.toLowerCase()
    return data.registrations.latestUsers.filter(u =>
      (u.name?.toLowerCase() || '').includes(q) ||
      (u.email?.toLowerCase() || '').includes(q)
    )
  }, [data, searchQuery])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3D91]" />
        <p className="mt-4 text-gray-500 text-sm">Memuat Owner Control Center...</p>
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-red-500 text-sm">{error || 'Tidak ada data.'}</p>
  }

  const { overview, registrations, tests, results, constructed, risk, trial, questionBank, ownerAlerts } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">BIGT Owner Control Center</h1>
        <p className="text-gray-500 text-sm">Pusat monitoring seluruh aktivitas BIGT — pendaftar, tes, hasil, review, dan kesehatan sistem.</p>
      </div>

      {/* Owner Alerts */}
      {ownerAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Yang Harus Diperhatikan Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ownerAlerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.severity === 'critical' ? 'bg-red-50' :
                  alert.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                  <AlertIcon severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      alert.severity === 'critical' ? 'text-red-800' :
                      alert.severity === 'warning' ? 'text-amber-800' : 'text-blue-800'
                    }`}>{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                  </div>
                  {alert.actionLabel && alert.actionHref && (
                    <a href={alert.actionHref} className="text-xs text-[#0B3D91] hover:underline flex items-center gap-1 flex-shrink-0">
                      {alert.actionLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" />Total Pendaftar</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3A]">{overview.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="text-blue-600">+{overview.newUsers7d}</span> dalam 7 hari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4" />Sesi Tes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3A]">{overview.totalSessions}</p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="text-green-600">{overview.completedSessions}</span> selesai{' '}
              <span className={`${overview.abandonedSessions > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                / {overview.abandonedSessions} abandoned
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Rata-rata Skor</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${overview.averageScore != null ? (overview.averageScore >= 60 ? 'text-green-600' : overview.averageScore >= 45 ? 'text-amber-600' : 'text-red-600') : 'text-gray-400'}`}>
              {overview.averageScore != null ? overview.averageScore : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{overview.totalResults} hasil tes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><MessageSquareText className="w-4 h-4" />Pending Review</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${overview.pendingReview > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {overview.pendingReview}
            </p>
            <p className="text-xs text-gray-400 mt-1">Writing/Speaking</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate & Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Completion Rate</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${overview.completionRate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
              {overview.completionRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><UserPlus className="w-4 h-4" />Hari Ini</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3A]">{overview.newUsersToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><FlaskConical className="w-4 h-4" />Trial</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{trial.totalTrialSessions}</p>
            <p className="text-xs text-gray-400 mt-1">{trial.completedTrialSessions} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-2"><BookOpen className="w-4 h-4" />Bank Soal</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0B1F3A]">{questionBank.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap border-b border-gray-200">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#0B3D91] border-b-2 border-[#0B3D91] bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  />
                </div>
                <span className="text-xs text-gray-400">{registrations.latestUsers.length} pendaftar terbaru</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                      <th className="pb-2 pr-3">Nama</th>
                      <th className="pb-2 pr-3">Email</th>
                      <th className="pb-2 pr-3">Role</th>
                      <th className="pb-2 pr-3">Tanggal Daftar</th>
                      <th className="pb-2 pr-3 text-center">Sesi</th>
                      <th className="pb-2 pr-3 text-center">Selesai</th>
                      <th className="pb-2 pr-3">Terakhir Aktif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-3 font-medium">{u.name || '—'}</td>
                        <td className="py-3 pr-3 text-gray-500">{u.email || '—'}</td>
                        <td className="py-3 pr-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>{u.role}</span>
                        </td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="py-3 pr-3 text-center">{u.totalSessions}</td>
                        <td className="py-3 pr-3 text-center">{u.completedSessions}</td>
                        <td className="py-3 pr-3 text-xs text-gray-400">
                          {u.lastActivityAt ? new Date(u.lastActivityAt).toLocaleDateString('id-ID') : '—'}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Tidak ada data pendaftar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-[#0B1F3A]">{tests.totalSessions}</p><p className="text-xs text-gray-500">Total</p></div>
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-lg font-bold text-green-700">{tests.completedSessions}</p><p className="text-xs text-gray-500">Completed</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700">{tests.inProgressSessions}</p><p className="text-xs text-gray-500">In Progress</p></div>
                <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-lg font-bold text-red-700">{tests.abandonedSessions}</p><p className="text-xs text-gray-500">Abandoned</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">By Level</p>
                  <div className="space-y-1">
                    {Object.entries(tests.byLevel).length === 0 && <p className="text-xs text-gray-400">Belum ada data.</p>}
                    {Object.entries(tests.byLevel).sort().map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span className="text-gray-600">{k}</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">By Product</p>
                  <div className="space-y-1">
                    {Object.entries(tests.byProduct).length === 0 && <p className="text-xs text-gray-400">Belum ada data.</p>}
                    {Object.entries(tests.byProduct).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span className="text-gray-600">{k}</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">By Status</p>
                  <div className="space-y-1">
                    {Object.entries(tests.byStatus).length === 0 && <p className="text-xs text-gray-400">Belum ada data.</p>}
                    {Object.entries(tests.byStatus).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span className="text-gray-600">{(STATUS_BADGE[k]?.label || k)}</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Sesi Terbaru</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-gray-500 uppercase">
                        <th className="pb-2 pr-3">User</th>
                        <th className="pb-2 pr-3">Level</th>
                        <th className="pb-2 pr-3">Tipe</th>
                        <th className="pb-2 pr-3">Status</th>
                        <th className="pb-2 pr-3 text-right">Skor</th>
                        <th className="pb-2 pr-3">Mulai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.recentSessions.slice(0, 15).map(s => {
                        const stBadge = STATUS_BADGE[s.status] || { label: s.status, color: 'bg-gray-100 text-gray-600' }
                        const emBadge = s.examMode ? (EXAM_MODE_BADGE[s.examMode] || null) : null
                        return (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 pr-3">
                              <p className="font-medium">{s.userName || '—'}</p>
                              {s.userEmail && <p className="text-xs text-gray-400">{s.userEmail}</p>}
                            </td>
                            <td className="py-2 pr-3 text-xs">{s.level || '—'}</td>
                            <td className="py-2 pr-3">
                              <div className="flex flex-wrap gap-1">
                                {emBadge ? (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${emBadge.color}`}>{emBadge.label}</span>
                                ) : (
                                  <span className="text-xs text-gray-500">{s.product || 'Live'}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 pr-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${stBadge.color}`}>{stBadge.label}</span>
                            </td>
                            <td className="py-2 pr-3 text-right">
                              {s.score != null ? <span className="font-bold">{s.score}</span> : '—'}
                              {s.cefrLevel && <span className="text-xs text-gray-400 ml-1">({s.cefrLevel})</span>}
                            </td>
                            <td className="py-2 pr-3 text-xs text-gray-400">
                              {s.startedAt ? new Date(s.startedAt).toLocaleDateString('id-ID') : '—'}
                            </td>
                          </tr>
                        )
                      })}
                      {tests.recentSessions.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada sesi tes.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold">{results.totalResults}</p><p className="text-xs text-gray-500">Total Hasil</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-lg"><p className={`text-lg font-bold ${results.averageScore != null ? (results.averageScore >= 60 ? 'text-green-600' : 'text-amber-600') : 'text-gray-400'}`}>{results.averageScore != null ? results.averageScore : '—'}</p><p className="text-xs text-gray-500">Rata-rata Skor</p></div>
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-lg font-bold text-green-700">{results.passRate != null ? `${results.passRate}%` : '—'}</p><p className="text-xs text-gray-500">Pass Rate</p></div>
                <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-lg font-bold">{Object.keys(results.levelDistribution).length > 0 ? Object.entries(results.levelDistribution).sort().map(([k, v]) => `${k}:${v}`).join(', ') : '—'}</p><p className="text-xs text-gray-500">Distribusi CEFR</p></div>
              </div>

              {Object.keys(results.levelDistribution).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Distribusi Level CEFR</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                      const count = results.levelDistribution[level] || 0
                      const total = results.totalResults || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-[#0B1F3A]">{count}</p>
                          <p className="text-xs text-gray-500">{level}</p>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                            <div className="h-full rounded-full bg-[#0B3D91]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Hasil Terbaru</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-gray-500 uppercase">
                        <th className="pb-2 pr-3">User</th>
                        <th className="pb-2 pr-3">Email</th>
                        <th className="pb-2 pr-3 text-right">Skor</th>
                        <th className="pb-2 pr-3">CEFR</th>
                        <th className="pb-2 pr-3">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.recentResults.map(r => (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 pr-3 font-medium">{r.userName || '—'}</td>
                          <td className="py-2 pr-3 text-gray-500 text-xs">{r.userEmail || '—'}</td>
                          <td className="py-2 pr-3 text-right font-bold">{r.score != null ? r.score : '—'}</td>
                          <td className="py-2 pr-3">
                            {r.cefrLevel ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{r.cefrLevel}</span>
                            ) : '—'}
                          </td>
                          <td className="py-2 pr-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {results.recentResults.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada hasil tes.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold">{constructed.totalResponses}</p><p className="text-xs text-gray-500">Total</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><Badge value={constructed.pendingReview} ok={constructed.pendingReview === 0} warn={constructed.pendingReview > 0 && constructed.pendingReview <= 5} /><p className="text-xs text-amber-600">Pending</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700">{constructed.underReview}</p><p className="text-xs text-blue-600">Review</p></div>
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-lg font-bold text-green-700">{constructed.reviewed}</p><p className="text-xs text-green-600">Reviewed</p></div>
                <div className="text-center p-3 bg-orange-50 rounded-lg"><p className="text-lg font-bold text-orange-700">{constructed.needsSecondReview}</p><p className="text-xs text-orange-600">2nd Review</p></div>
                <div className="text-center p-3 bg-red-50 rounded-lg"><Badge value={constructed.flagged} ok={constructed.flagged === 0} /><p className="text-xs text-red-600">Flagged</p></div>
                <div className="text-center p-3 bg-gray-100 rounded-lg"><p className="text-lg font-bold text-gray-600">{constructed.rejected}</p><p className="text-xs text-gray-500">Rejected</p></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-lg font-bold text-purple-700">{constructed.writingCount}</p><p className="text-xs text-purple-600">Writing</p></div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg"><p className="text-lg font-bold text-indigo-700">{constructed.speakingCount}</p><p className="text-xs text-indigo-600">Speaking</p></div>
              </div>
              <div className="flex gap-3">
                <a href="/admin/constructed-review" className="inline-flex items-center gap-2 text-sm text-white bg-[#0B3D91] px-4 py-2 rounded-lg hover:bg-[#0B3D91]/90 transition-colors">
                  <MessageSquareText className="w-4 h-4" />
                  Buka Review Writing/Speaking
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'trial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold">{trial.totalTrialSessions}</p><p className="text-xs text-gray-500">Total</p></div>
                <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700">{trial.a1TrialSessions}</p><p className="text-xs text-blue-600">A1</p></div>
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-lg font-bold text-green-700">{trial.a2TrialSessions}</p><p className="text-xs text-green-600">A2</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-700">{trial.devFullSessions}</p><p className="text-xs text-amber-600">Dev Full</p></div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-700">{trial.completedTrialSessions}</p><p className="text-xs text-emerald-600">Completed</p></div>
              </div>
              {trial.latestTrialAt && (
                <p className="text-xs text-gray-400">Trial terakhir: {new Date(trial.latestTrialAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              )}
              <div className="flex gap-3">
                <a href="/admin/trial" className="inline-flex items-center gap-2 text-sm text-white bg-[#0B3D91] px-4 py-2 rounded-lg hover:bg-[#0B3D91]/90 transition-colors">
                  <FlaskConical className="w-4 h-4" />
                  Buka Uji Coba
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'qbank' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700">{questionBank.reading}</p><p className="text-xs text-blue-600">Reading</p></div>
                <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-lg font-bold text-purple-700">{questionBank.listening}</p><p className="text-xs text-purple-600">Listening</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-700">{questionBank.writing}</p><p className="text-xs text-amber-600">Writing</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-700">{questionBank.speaking}</p><p className="text-xs text-amber-600">Speaking</p></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-500">{questionBank.integrated}</p><p className="text-xs text-gray-500">Integrated</p></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-500">{questionBank.mediation}</p><p className="text-xs text-gray-500">Mediation</p></div>
                <div className="text-center p-3 bg-gray-100 rounded-lg"><p className="text-lg font-bold">{questionBank.total}</p><p className="text-xs text-gray-500">Total</p></div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Validator:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${questionBank.validatorStatus === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {questionBank.validatorStatus === 'pass' ? '✅ Pass' : questionBank.validatorStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Audit:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${questionBank.auditStatus === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {questionBank.auditStatus === 'pass' ? '✅ Pass' : questionBank.auditStatus}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Lihat detail validator dan audit di{' '}
                <a href="/admin/full-skills-readiness" className="text-[#0B3D91] hover:underline">Kesiapan Full Skills</a> atau{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">docs/BIGT_PHASE_18_QA.md</code>
              </p>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-lg font-bold text-green-700">{risk.low}</p><p className="text-xs text-green-600">Low Risk</p></div>
                <div className="text-center p-3 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-700">{risk.medium}</p><p className="text-xs text-amber-600">Medium</p></div>
                <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-lg font-bold text-red-700">{risk.high}</p><p className="text-xs text-red-600">High Risk</p></div>
                <div className="text-center p-3 bg-orange-50 rounded-lg"><p className="text-lg font-bold text-orange-700">{risk.needsReview}</p><p className="text-xs text-orange-600">Needs Review</p></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-500">{risk.insufficientText}</p><p className="text-xs text-gray-500">Insufficient</p></div>
                <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-500">{risk.notApplicable}</p><p className="text-xs text-gray-500">N/A</p></div>
              </div>
              <p className="text-xs text-gray-400 italic">Risk signal adalah alat bantu reviewer, bukan keputusan final.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
