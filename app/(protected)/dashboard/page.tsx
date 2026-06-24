'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3, GraduationCap, Award, TrendingUp, Clock,
  ArrowRight, Sparkles, BookOpen, Target, ChevronRight,
  Play, RotateCcw, FileText, Layers, ShieldCheck,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const DIMENSIONS_META: Record<string, { label: string; color: string }> = {
  LISTENING: { label: 'Menyimak', color: '#34C759' },
  READING: { label: 'Membaca', color: '#007AFF' },
  SPEAKING: { label: 'Berbicara', color: '#FF9500' },
  WRITING: { label: 'Menulis', color: '#AF52DE' },
  MEDIATION: { label: 'Mediasi', color: '#FF2D55' },
  INTEGRATED: { label: 'Terintegrasi', color: '#5AC8FA' },
}

const CEFR_META = [
  { code: 'A1', label: 'Pemula', color: '#8E8E93' },
  { code: 'A2', label: 'Dasar', color: '#C7C7CC' },
  { code: 'B1', label: 'Madya', color: '#34C759' },
  { code: 'B2', label: 'Madya Atas', color: '#007AFF' },
  { code: 'C1', label: 'Mahir', color: '#AF52DE' },
  { code: 'C2', label: 'Sangat Mahir', color: '#FF9500' },
]

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#8E8E93]">Memuat data akun...</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-[#E5E5EA]" />
        <div className="space-y-2">
          <div className="h-5 w-64 rounded-lg bg-[#E5E5EA]" />
          <div className="h-4 w-40 rounded-lg bg-[#E5E5EA]" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#E5E5EA]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-[#E5E5EA]" />
        <div className="h-80 rounded-2xl bg-[#E5E5EA]" />
      </div>
    </div>
  )
}

interface DimensionScore {
  dimension: string
  key: string
  score: number
}

interface TestItem {
  id: string
  date: string
  dimensions: string[]
  score: number | null
  level: string | null
  status: string
}

interface HistoryPoint {
  date: string
  score: number | null
}

interface DashboardData {
  user: { name: string; email: string }
  currentLevel: string | null
  overallScore: number | null
  ieltsEquivalent: number | null
  totalTestsCompleted: number
  totalCertificates: number
  highestScore: number
  studyHours: number
  dimensionScores: DimensionScore[]
  scoreHistory: HistoryPoint[]
  recentTests: TestItem[]
  weakestDimension: { dimension: string; key: string; score: number; level: string } | null
  latestCertificate: { id: string; certificateId: string; overallLevel: string; overallScore: number; issuedAt: string } | null
  pendingSessionCount: number
  pendingSessionId: string | null
  pendingSessionAnswers: number
}

function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 8)
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#34C759' : score >= 60 ? '#FF9500' : score >= 40 ? '#FF9500' : '#FF3B30'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 8}
        fill="none" stroke="#E5E5EA"
        strokeWidth="6"
      />
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 8}
        fill="none" stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

function RadialProgress({ label, value, color, size = 80 }: { label: string; value: number; color: string; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 6)
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6}
          fill="none" stroke="#E5E5EA"
          strokeWidth="4"
        />
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6}
          fill="none" stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-[#1C1C1E]">{value}%</p>
        <p className="text-[9px] text-[#8E8E93]">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useI18n()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch('/api/dashboard/stats', { signal: controller.signal })
      clearTimeout(timeoutId)

      const text = await res.text()
      let json: any
      try { json = JSON.parse(text) } catch { throw new Error('Server mengembalikan respons yang tidak valid.') }

      if (json.needsOnboarding) {
        window.location.href = '/onboarding'
        return
      }

      setData(json)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setLoadError('Gagal memuat dasbor. Silakan coba lagi.')
      } else {
        setLoadError(err.message || 'Gagal memuat dasbor.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      fetchData()
    })
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[#FF3B30] text-sm">{loadError}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold shadow-lg shadow-[#007AFF]/25 hover:shadow-[#007AFF]/40 transition-all"
        >
          Coba Lagi
        </button>
        <a href="/login" className="text-xs text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
          Kembali ke Login
        </a>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const d = data
  const dimScores = d.dimensionScores
  const radarData = dimScores.length > 0 ? dimScores.map(ds => ({
    dimension: ds.dimension,
    score: ds.score,
    fullMark: 100,
  })) : [
    { dimension: 'Menyimak', score: 0, fullMark: 100 },
    { dimension: 'Membaca', score: 0, fullMark: 100 },
    { dimension: 'Berbicara', score: 0, fullMark: 100 },
    { dimension: 'Menulis', score: 0, fullMark: 100 },
    { dimension: 'Mediasi', score: 0, fullMark: 100 },
    { dimension: 'Terintegrasi', score: 0, fullMark: 100 },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#007AFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF9500]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl font-bold text-[#1C1C1E]">
                {t('dashboard.welcome', { name: d.user.name })}
              </h1>
              <span className="text-2xl md:text-3xl">👋</span>
            </div>
            <p className="text-[#8E8E93] text-sm md:text-base max-w-xl">
              {t('dashboard.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/test/start">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold shadow-lg shadow-[#007AFF]/25 hover:shadow-[#007AFF]/40 hover:translate-y-[-1px] active:translate-y-0 transition-all duration-200">
                  <Play className="w-4 h-4" />
                  {t('dashboard.newTest')}
                </button>
              </Link>
              {d.pendingSessionId && (
                <Link href={`/test/${d.pendingSessionId}`}>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2F2F7] text-[#1C1C1E] text-sm font-medium border border-[#E5E5EA] hover:bg-[#E5E5EA] transition-all duration-200">
                    <RotateCcw className="w-4 h-4" />
                    {t('dashboard.resumeTest')}
                  </button>
                </Link>
              )}
            </div>
          </div>

          {d.overallScore !== null && (
            <div className="flex-shrink-0 flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA]">
              <div className="relative">
                <ScoreGauge score={d.overallScore} size={120} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-[#1C1C1E]">{d.overallScore}</p>
                    <p className="text-[10px] text-[#8E8E93] -mt-0.5">/ 100</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={classNames(
                    'text-sm font-bold px-2.5 py-0.5 rounded-lg',
                    d.currentLevel === 'C1' || d.currentLevel === 'C2'
                      ? 'bg-[#FF9500]/15 text-[#FF9500]'
                      : d.currentLevel === 'B1' || d.currentLevel === 'B2'
                      ? 'bg-[#34C759]/15 text-[#34C759]'
                      : 'bg-[#F2F2F7] text-[#8E8E93]'
                  )}>
                    {d.currentLevel}
                  </span>
                  <span className="text-sm text-[#C7C7CC]">|</span>
                  <span className="text-xs text-[#8E8E93]">
                    {CEFR_META.find(c => c.code === d.currentLevel)?.label || t('common.notYet')}
                  </span>
                </div>
                {d.ieltsEquivalent && (
                  <p className="text-xs text-[#8E8E93]">
                  {t('dashboard.ieltsEq', { ielts: d.ieltsEquivalent, toefl: Math.round((d.overallScore / 100) * 120) })}
                </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { icon: BarChart3, value: d.totalTestsCompleted, label: t('dashboard.stats.totalTests'), sub: t('dashboard.stats.totalTestsSub') },
          { icon: Award, value: d.highestScore ? `${d.highestScore}%` : '—', label: t('dashboard.stats.highestScore'), sub: t('dashboard.stats.highestScoreSub') },
          { icon: GraduationCap, value: d.totalCertificates, label: t('dashboard.stats.certs'), sub: d.totalCertificates ? t('dashboard.stats.certsSubIssued') : t('dashboard.stats.certsSubNone') },
          { icon: Clock, value: `${d.studyHours} jam`, label: t('dashboard.stats.studyHours'), sub: t('dashboard.stats.studyHoursSub') },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="group relative p-4 md:p-5 rounded-2xl bg-white border border-[#E5E5EA] hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-[#F2F2F7] flex items-center justify-center mb-3 group-hover:bg-[#007AFF]/10 transition-colors">
                  <Icon className="w-[18px] h-[18px] text-[#8E8E93] group-hover:text-[#007AFF] transition-colors" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[#1C1C1E] tracking-tight">{stat.value}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Radar Chart */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.scorePerDim')}</h2>
            </div>
            <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">CEFR</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#E5E5EA" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#8E8E93', fontSize: 10 }}
                axisLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#C7C7CC', fontSize: 9 }}
                axisLine={false}
              />
              <Radar dataKey="score" stroke="#007AFF" fill="#007AFF" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weakest Dimension / Stats */}
        <div className="space-y-4">
          {d.weakestDimension && (
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#FF9500]/[0.06] to-[#FF9500]/[0.02] border border-[#FF9500]/[0.15]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#FF9500]/15 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-[#FF9500]" />
                </div>
                <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.focusArea')}</h2>
              </div>
              <p className="text-xs text-[#8E8E93] mb-1">{t('dashboard.weakestDim')}</p>
              <p className="text-lg font-bold text-[#1C1C1E] mb-0.5">{d.weakestDimension.dimension}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-[#FF9500]">{d.weakestDimension.score}%</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] font-medium">
                  {t('dashboard.level', { level: d.weakestDimension.level })}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5E5EA] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF9500] to-[#FF9500]"
                  style={{ width: `${d.weakestDimension.score}%` }}
                />
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5E5EA]">
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  {t('dashboard.focusText', { dim: d.weakestDimension.dimension })}
                </p>
              </div>
            </div>
          )}

          {/* Quick access radial scores */}
          {dimScores.length > 0 && (
            <div className="p-5 md:p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
              <h2 className="text-sm font-semibold text-[#1C1C1E] mb-4">{t('dashboard.dimSummary')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {dimScores.slice(0, 6).map((ds) => (
                  <RadialProgress
                    key={ds.key}
                    label={ds.dimension.split(' ')[0]}
                    value={ds.score}
                    color={DIMENSIONS_META[ds.key]?.color || '#007AFF'}
                    size={72}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score History + Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score History Line Chart */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#007AFF]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.scoreProgress')}</h2>
            </div>
          </div>

          {d.scoreHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={d.scoreHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#C7C7CC', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#C7C7CC', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#007AFF"
                  strokeWidth={2}
                  dot={{ fill: '#007AFF', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#007AFF', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : d.scoreHistory.length === 1 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-[#8E8E93] text-sm">{t('dashboard.firstRecorded')}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-[#C7C7CC] mx-auto mb-2" />
                <p className="text-[#8E8E93] text-sm">{t('dashboard.noData')}</p>
                <Link href="/test/start">
                  <button className="mt-3 text-xs text-[#007AFF] hover:text-[#0062CC] transition-colors font-medium">
                    {t('dashboard.startTest')}
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Dimension Summary */}
          {d.scoreHistory.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#E5E5EA]">
              {dimScores.map((ds) => (
                <div key={ds.key} className="text-center p-2">
                  <p className="text-lg font-bold text-[#1C1C1E]">{ds.score}%</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5 truncate">{ds.dimension}</p>
                  <div className="w-full h-1 rounded-full bg-[#E5E5EA] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${ds.score}%`, backgroundColor: DIMENSIONS_META[ds.key]?.color || '#007AFF' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tests */}
        <div className="p-5 md:p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#AF52DE]/10 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#AF52DE]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.recentTests')}</h2>
            </div>
            {d.recentTests.length > 0 && (
              <Link href="/test" className="text-[10px] text-[#007AFF] hover:text-[#0062CC] font-medium transition-colors">
                {t('dashboard.viewAll')}
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {d.recentTests.map((test) => (
              <Link key={test.id} href={`/test/${test.id}/results`} className="block p-3.5 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] hover:bg-[#E5E5EA] transition-all duration-200 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={classNames(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
                        test.status === 'COMPLETED'
                          ? 'bg-[#34C759]/10 text-[#34C759]'
                          : test.status === 'IN_PROGRESS'
                          ? 'bg-[#FF9500]/10 text-[#FF9500]'
                          : 'bg-[#F2F2F7] text-[#8E8E93]'
                      )}>
                        {test.status === 'COMPLETED' ? t('common.done') : test.status === 'IN_PROGRESS' ? t('common.inProgress') : test.status}
                      </span>
                      {test.level && (
                        <span className="text-[10px] text-[#8E8E93]">{test.level}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#8E8E93]">{test.date}</p>
                    {test.score !== null && (
                      <p className="text-sm font-bold text-[#1C1C1E] mt-1.5">
                        {t('dashboard.scoreLabel')} <span className={classNames(
                          test.score >= 80 ? 'text-[#34C759]' : test.score >= 60 ? 'text-[#FF9500]' : 'text-[#FF3B30]'
                        )}>{test.score}%</span>
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC] group-hover:text-[#8E8E93] transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
            {d.recentTests.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-[#C7C7CC] mx-auto mb-2" />
                <p className="text-[#8E8E93] text-sm">{t('dashboard.noTestsYet')}</p>
                <Link href="/test/start">
                  <button className="mt-3 text-xs text-[#007AFF] hover:text-[#0062CC] font-medium transition-colors">
                    {t('dashboard.startFirst')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Preview */}
        {d.latestCertificate ? (
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#FF9500]/[0.04] to-white border border-[#FF9500]/[0.15] shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#FF9500]/15 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-[#FF9500]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.latestCert')}</h2>
            </div>

            <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#F2F2F7] to-white border border-[#E5E5EA] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9500]/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E5E5EA]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34C759] to-[#28A745] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1C1C1E]">BIGT</p>
                    <p className="text-[9px] text-[#8E8E93]">{t('dashboard.certDesc')}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-[#1C1C1E] mb-0.5">{t('dashboard.level', { level: d.latestCertificate.overallLevel })}</p>
                <p className="text-xs text-[#8E8E93] mb-1">{t('dashboard.overallScore', { score: d.latestCertificate.overallScore })}</p>
                <p className="text-[10px] text-[#8E8E93]">
                  {t('dashboard.issued', { date: new Date(d.latestCertificate.issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) })}
                </p>
                <div className="mt-3 pt-3 border-t border-[#E5E5EA]">
                  <Link href={`/certificate/${d.latestCertificate.certificateId}`}>
                    <button className="w-full text-xs font-medium text-[#FF9500] hover:text-[#FF9500] transition-colors">
                      {t('dashboard.viewCert')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : d.totalTestsCompleted > 0 ? (
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#F2F2F7] flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-[#8E8E93]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.certTitle')}</h2>
            </div>
            <p className="text-[#8E8E93] text-sm">
              {t('dashboard.certCta')}
            </p>
            <div className="mt-4 p-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-[10px] text-[#8E8E93]">{t('dashboard.certQr')}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Recommendations */}
        <div className={`${d.latestCertificate ? '' : 'lg:col-span-2'}`}>
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#007AFF]/[0.03] to-white border border-[#E5E5EA] shadow-sm h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1C1C1E]">{t('dashboard.recommendations')}</h2>
            </div>

            {d.weakestDimension ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
                      <Target className="w-3 h-3 text-[#007AFF]" />
                    </div>
                    <p className="text-xs font-semibold text-[#1C1C1E]">{t('dashboard.focusOn', { dim: d.weakestDimension.dimension })}</p>
                  </div>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    {t('dashboard.recDimText')}
                  </p>
                  <Link href="/test/start">
                    <button className="mt-3 text-[11px] font-medium text-[#007AFF] hover:text-[#0062CC] transition-colors">
                      {t('dashboard.startFocus')}
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#E5E5EA]">
                    <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">{t('dashboard.quickTest')}</p>
                    <p className="text-xs text-[#8E8E93]">{t('dashboard.quickTestSub')}</p>
                    <Link href="/test/start">
                      <button className="mt-2 text-[10px] font-medium text-[#007AFF]">{t('common.next')}</button>
                    </Link>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E5E5EA]">
                    <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">{t('dashboard.fullTest')}</p>
                    <p className="text-xs text-[#8E8E93]">{t('dashboard.fullTestSub')}</p>
                    <Link href="/test/start">
                      <button className="mt-2 text-[10px] font-medium text-[#007AFF]">{t('common.next')}</button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="w-8 h-8 text-[#C7C7CC] mx-auto mb-2" />
                <p className="text-[#8E8E93] text-sm">{t('dashboard.noRecs')}</p>
                <Link href="/test/start">
                  <button className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold shadow-lg shadow-[#007AFF]/20 hover:shadow-[#007AFF]/30 transition-all duration-200">
                    <Play className="w-3 h-3" />
                    {t('dashboard.startTest')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-6 border-t border-[#E5E5EA] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] text-[#8E8E93]">
          {t('dashboard.footerLine')}
        </p>
        <Link href="/about" className="text-[10px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
          {t('nav.about')}
        </Link>
      </div>
    </div>
  )
}
