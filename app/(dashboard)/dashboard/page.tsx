'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3, GraduationCap, Award, TrendingUp, Clock,
  ArrowRight, Sparkles, BookOpen, Target, ChevronRight,
  Play, RotateCcw, FileText, Layers, ShieldCheck,
  Menu, Bell, HelpCircle,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const DIMENSIONS_META: Record<string, { label: string; color: string }> = {
  LISTENING: { label: 'Menyimak', color: '#10B981' },
  READING: { label: 'Membaca', color: '#3B82F6' },
  SPEAKING: { label: 'Berbicara', color: '#F59E0B' },
  WRITING: { label: 'Menulis', color: '#8B5CF6' },
  MEDIATION: { label: 'Mediasi', color: '#EC4899' },
  INTEGRATED: { label: 'Terintegrasi', color: '#14B8A6' },
}

const CEFR_META = [
  { code: 'A1', label: 'Pemula', color: '#6B7280' },
  { code: 'A2', label: 'Dasar', color: '#9CA3AF' },
  { code: 'B1', label: 'Madya', color: '#10B981' },
  { code: 'B2', label: 'Madya Atas', color: '#3B82F6' },
  { code: 'C1', label: 'Mahir', color: '#8B5CF6' },
  { code: 'C2', label: 'Sangat Mahir', color: '#F59E0B' },
]

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-64 rounded-lg bg-gray-200" />
          <div className="h-4 w-40 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-gray-200" />
        <div className="h-80 rounded-2xl bg-gray-200" />
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
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={size / 2 - 8}
        fill="none" stroke="#E5EAF2"
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
          fill="none" stroke="#E5EAF2"
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
        <p className="text-[10px] font-semibold text-gray-700">{value}%</p>
        <p className="text-[9px] text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function TopNavbar({ userName, onMenuClick }: { userName: string; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-16 bg-white border-b border-gray-200">
      <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
        <Menu className="w-4 h-4 text-gray-500" />
      </button>

      <div className="hidden lg:flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-400">Dashboard</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981]" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <HelpCircle className="w-4 h-4 text-gray-500" />
        </button>
        <span className="hidden sm:block text-sm text-gray-300 mx-1">|</span>
        <div className="flex items-center gap-2.5 ml-1 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-[#10B981]/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ onClose, active }: { onClose?: () => void; active?: string }) {
  const items = [
    { href: '/dashboard', label: 'Dasbor', icon: BarChart3 },
    { href: '/test', label: 'Mulai Tes', icon: Play },
    { href: '/test', label: 'Riwayat Tes', icon: RotateCcw },
    { href: '/profile', label: 'Profil', icon: FileText },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-gray-200 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-gray-900">BIGT</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={classNames(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                active === item.label
                  ? 'bg-[#10B981]/10 text-[#10B981] border-l-2 border-[#10B981]'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Standar Kemahiran Bahasa Indonesia</div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const json = await res.json()
          if (json.needsOnboarding) {
            window.location.href = '/onboarding'
            return
          }
          setData(json)
        }
      } catch { } finally {
        setLoading(false)
      }
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = '/login'
      else fetchData()
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <TopNavbar userName="" onMenuClick={() => setMobileSidebar(true)} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <p className="text-gray-500">Gagal memuat data dashboard</p>
      </div>
    )
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
    <div className="min-h-screen bg-[#F7F9FC]">
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <aside className="relative w-72 h-full">
            <Sidebar onClose={() => setMobileSidebar(false)} />
          </aside>
        </div>
      )}

      <TopNavbar userName={d.user.name} onMenuClick={() => setMobileSidebar(true)} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Welcome Section */}
        <div className="relative mb-10 p-6 md:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  Selamat datang kembali, {d.user.name}
                </h1>
                <span className="text-2xl md:text-3xl">👋</span>
              </div>
              <p className="text-gray-500 text-sm md:text-base max-w-xl">
                Lanjutkan perjalanan kemahiran Bahasa Indonesia Anda menuju level berikutnya.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/test/start">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10B981]/25 hover:shadow-[#10B981]/40 hover:translate-y-[-1px] active:translate-y-0 transition-all duration-200">
                    <Play className="w-4 h-4" />
                    Mulai Tes Baru
                  </button>
                </Link>
                {d.pendingSessionId && (
                  <Link href={`/test/${d.pendingSessionId}`}>
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-all duration-200">
                      <RotateCcw className="w-4 h-4" />
                      Lanjutkan Tes
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {d.overallScore !== null && (
              <div className="flex-shrink-0 flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="relative">
                  <ScoreGauge score={d.overallScore} size={120} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{d.overallScore}</p>
                      <p className="text-[10px] text-gray-400 -mt-0.5">/ 100</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={classNames(
                      'text-sm font-bold px-2.5 py-0.5 rounded-lg',
                      d.currentLevel === 'C1' || d.currentLevel === 'C2'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        : d.currentLevel === 'B1' || d.currentLevel === 'B2'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {d.currentLevel}
                    </span>
                    <span className="text-sm text-gray-300">|</span>
                    <span className="text-xs text-gray-400">
                      {CEFR_META.find(c => c.code === d.currentLevel)?.label || 'Belum Ada'}
                    </span>
                  </div>
                  {d.ieltsEquivalent && (
                    <p className="text-xs text-gray-400">
                    Setara IELTS {d.ieltsEquivalent} · TOEFL iBT {Math.round((d.overallScore / 100) * 120)}
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
            { icon: BarChart3, value: d.totalTestsCompleted, label: 'Total Tes', sub: 'tes selesai dikerjakan' },
            { icon: Award, value: d.highestScore ? `${d.highestScore}%` : '—', label: 'Skor Tertinggi', sub: 'dari seluruh tes' },
            { icon: GraduationCap, value: d.totalCertificates, label: 'Sertifikat', sub: d.totalCertificates ? 'telah diterbitkan' : 'belum ada' },
            { icon: Clock, value: `${d.studyHours} jam`, label: 'Waktu Belajar', sub: 'total durasi tes' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="group relative p-4 md:p-5 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#10B981]/10 transition-colors">
                    <Icon className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#10B981] transition-colors" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Radar Chart */}
          <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Skor per Dimensi</h2>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">CEFR</span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#E5EAF2" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  axisLine={false}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 9 }}
                  axisLine={false}
                />
                <Radar dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weakest Dimension / Stats */}
          <div className="space-y-4">
            {d.weakestDimension && (
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#F59E0B]/[0.06] to-[#F59E0B]/[0.02] border border-[#F59E0B]/[0.15]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-700">Fokus Pengembangan</h2>
                </div>
                <p className="text-xs text-gray-500 mb-1">Dimensi terlemah Anda:</p>
                <p className="text-lg font-bold text-gray-900 mb-0.5">{d.weakestDimension.dimension}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-[#F59E0B]">{d.weakestDimension.score}%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] font-medium">
                    Level {d.weakestDimension.level}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706]"
                    style={{ width: `${d.weakestDimension.score}%` }}
                  />
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Fokus peningkatan pada dimensi <strong className="text-gray-700">{d.weakestDimension.dimension}</strong>.
                    Targetkan level <strong className="text-[#10B981]">B2</strong> dengan latihan rutin dan materi pendukung.
                  </p>
                </div>
              </div>
            )}

            {/* Quick access radial scores */}
            {dimScores.length > 0 && (
              <div className="p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Dimensi</h2>
                <div className="grid grid-cols-3 gap-3">
                  {dimScores.slice(0, 6).map((ds) => (
                    <RadialProgress
                      key={ds.key}
                      label={ds.dimension.split(' ')[0]}
                      value={ds.score}
                      color={DIMENSIONS_META[ds.key]?.color || '#10B981'}
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
          <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Perkembangan Skor</h2>
              </div>
            </div>

            {d.scoreHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={d.scoreHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#94A3B8', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
                    activeDot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : d.scoreHistory.length === 1 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-400 text-sm">Tes pertama Anda sudah tercatat. Ikuti tes berikutnya untuk melihat grafik perkembangan.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Belum ada data. Selesaikan tes untuk melihat perkembangan skor.</p>
                  <Link href="/test/start">
                    <button className="mt-3 text-xs text-[#10B981] hover:text-[#059669] transition-colors font-medium">
                      Mulai Tes Sekarang →
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Dimension Summary */}
            {d.scoreHistory.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-5 pt-5 border-t border-gray-200">
                {dimScores.map((ds) => (
                  <div key={ds.key} className="text-center p-2">
                    <p className="text-lg font-bold text-gray-900">{ds.score}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{ds.dimension}</p>
                    <div className="w-full h-1 rounded-full bg-gray-200 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${ds.score}%`, backgroundColor: DIMENSIONS_META[ds.key]?.color || '#10B981' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tests */}
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Tes Terakhir</h2>
              </div>
              {d.recentTests.length > 0 && (
                <Link href="/test" className="text-[10px] text-[#10B981] hover:text-[#059669] font-medium transition-colors">
                  Lihat Semua
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {d.recentTests.map((test) => (
                <Link key={test.id} href={`/test/${test.id}/results`} className="block p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={classNames(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
                          test.status === 'COMPLETED'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : test.status === 'IN_PROGRESS'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'bg-gray-100 text-gray-500'
                        )}>
                          {test.status === 'COMPLETED' ? 'Selesai' : test.status === 'IN_PROGRESS' ? 'Berjalan' : test.status}
                        </span>
                        {test.level && (
                          <span className="text-[10px] text-gray-400">{test.level}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{test.date}</p>
                      {test.score !== null && (
                        <p className="text-sm font-bold text-gray-700 mt-1.5">
                          Skor: <span className={classNames(
                            test.score >= 80 ? 'text-[#10B981]' : test.score >= 60 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                          )}>{test.score}%</span>
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
              {d.recentTests.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Belum ada tes yang terselesaikan.</p>
                  <Link href="/test/start">
                    <button className="mt-3 text-xs text-[#10B981] hover:text-[#059669] font-medium transition-colors">
                      Mulai Tes Pertama →
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
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#F59E0B]/[0.04] to-white border border-[#F59E0B]/[0.15] shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Sertifikat Terakhir</h2>
              </div>

              <div className="relative p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">BIGT</p>
                      <p className="text-[9px] text-gray-400">Sertifikat Kemahiran</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-0.5">Level {d.latestCertificate.overallLevel}</p>
                  <p className="text-xs text-gray-500 mb-1">{d.latestCertificate.overallScore}% — Skor Keseluruhan</p>
                  <p className="text-[10px] text-gray-400">
                    Diterbitkan {new Date(d.latestCertificate.issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Link href={`/certificate/${d.latestCertificate.certificateId}`}>
                      <button className="w-full text-xs font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors">
                        Lihat Sertifikat →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : d.totalTestsCompleted > 0 ? (
            <div className="p-5 md:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Sertifikat</h2>
              </div>
              <p className="text-gray-500 text-sm">
                Raih skor di atas 60% untuk mendapatkan sertifikat BIGT yang terverifikasi.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] text-gray-500">Verifikasi QR — Standar Internasional</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Recommendations */}
          <div className={`${d.latestCertificate ? '' : 'lg:col-span-2'}`}>
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#10B981]/[0.03] to-white border border-gray-200 shadow-sm h-full">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <h2 className="text-sm font-semibold text-gray-700">Rekomendasi Langkah Selanjutnya</h2>
              </div>

              {d.weakestDimension ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                        <Target className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Fokus pada {d.weakestDimension.dimension}</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Dimensi dengan skor terendah Anda. Targetkan peningkatan ke level{' '}
                      <span className="text-[#10B981] font-medium">B2</span> melalui latihan
                      rutin dan materi pendukung yang tersedia.
                    </p>
                    <Link href="/test/start">
                      <button className="mt-3 text-[11px] font-medium text-[#10B981] hover:text-[#059669] transition-colors">
                        Mulai Latihan Fokus →
                      </button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white border border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tes Cepat</p>
                      <p className="text-xs text-gray-400">10 soal · 15 menit</p>
                      <Link href="/test/start">
                        <button className="mt-2 text-[10px] font-medium text-[#10B981]">Mulai →</button>
                      </Link>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tes Lengkap</p>
                      <p className="text-xs text-gray-400">30 soal · 60 menit</p>
                      <Link href="/test/start">
                        <button className="mt-2 text-[10px] font-medium text-[#10B981]">Mulai →</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Mulai tes pertama Anda untuk mendapatkan rekomendasi yang dipersonalisasi.</p>
                  <Link href="/test/start">
                    <button className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 transition-all duration-200">
                      <Play className="w-3 h-3" />
                      Mulai Tes
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-gray-400">
            BIGT — Bahasa Indonesia Global Test · Standar Kemahiran Bahasa Indonesia untuk Dunia
          </p>
          <Link href="/about" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
            Tentang BIGT
          </Link>
        </div>
      </div>
    </div>
  )
}
