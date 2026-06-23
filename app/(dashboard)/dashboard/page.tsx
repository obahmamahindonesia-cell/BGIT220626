'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  BarChart3,
  GraduationCap,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  ChevronRight,
} from 'lucide-react'

const CEFR_LEVELS = [
  { code: 'A1', label: 'Pemula' },
  { code: 'A2', label: 'Dasar' },
  { code: 'B1', label: 'Madya' },
  { code: 'B2', label: 'Madya Atas' },
  { code: 'C1', label: 'Mahir' },
  { code: 'C2', label: 'Sangat Mahir' },
]

const DIMENSION_SCORES = {
  LISTENING: 72,
  READING: 65,
  SPEAKING: 58,
  WRITING: 70,
  MEDIATION: 60,
  INTEGRATED: 55,
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats] = useState({
    totalTests: 3,
    currentLevel: 'B1',
    certificates: 1,
    highestScore: 78,
    studyHours: 12,
  })

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) setUserName(user.user_metadata.name)
      else if (user?.email) setUserName(user.email.split('@')[0])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="h-72 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const currentLevelIndex = CEFR_LEVELS.findIndex(l => l.code === stats.currentLevel)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
            Selamat datang, {userName}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Lanjutkan perjalanan kemahiran Bahasa Indonesia Anda.</p>
        </div>
        <Link href="/test">
          <Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white shadow-lg shadow-[#D7193F]/20 rounded-xl h-10 px-5 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Mulai Tes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {[
          { icon: BarChart3, bg: 'bg-[#0B1F3A]/5', color: '#0B1F3A', value: stats.totalTests, label: 'Total Tes Selesai' },
          { icon: GraduationCap, bg: 'bg-[#C9A227]/10', color: '#C9A227', value: stats.currentLevel, label: 'Level Saat Ini' },
          { icon: Award, bg: 'bg-[#123E7C]/5', color: '#123E7C', value: stats.certificates, label: 'Sertifikat Dimiliki' },
          { icon: TrendingUp, bg: 'bg-[#D7193F]/5', color: '#D7193F', value: `${stats.highestScore}%`, label: 'Skor Tertinggi' },
          { icon: Clock, bg: 'bg-[#C9A227]/10', color: '#C9A227', value: `${stats.studyHours} jam`, label: 'Jam Belajar' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border border-[#E5EAF2] rounded-2xl shadow-sm">
              <CardContent className="p-6 flex flex-col min-h-[130px]">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-[#0B1F3A] tracking-tight">{stat.value}</p>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-5 px-6 pt-6">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Target className="w-4 h-4" />
                Perkembangan Kemahiran
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {CEFR_LEVELS.map((level, i) => {
                  const isCurrent = i === currentLevelIndex
                  const isCompleted = i < currentLevelIndex
                  const barColor = isCompleted ? '#0B1F3A' : isCurrent ? '#C9A227' : '#E5EAF2'
                  return (
                    <div key={level.code} className="flex items-center gap-3">
                      <span className={`w-8 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCompleted ? 'bg-[#0B1F3A] text-white' :
                        isCurrent ? 'bg-[#C9A227] text-white' :
                        'bg-gray-100 text-[#64748B]'
                      }`}>
                        {level.code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[#0B1F3A]">{level.label}</span>
                          {isCurrent && <Badge className="bg-[#C9A227]/10 text-[#C9A227] border-0 text-[10px] font-medium">Level Saat Ini</Badge>}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-700`}
                            style={{
                              width: isCompleted ? '100%' : isCurrent ? '60%' : '0%',
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl card-hover">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                  <BookOpen className="w-4 h-4" />
                  Lanjutkan Tes
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">Ada sesi tes yang belum selesai</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0B1F3A]">Tes Latihan</p>
                    <p className="text-xs text-[#64748B] mt-1">15 dari 25 soal terjawab</p>
                  </div>
                  <Link href="/test" className="flex-shrink-0">
                    <Button size="sm" className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg text-xs h-9 px-4">
                      Lanjutkan <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl card-hover">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                  <Sparkles className="w-4 h-4 text-[#C9A227]" />
                  Rekomendasi Tes
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">Berdasarkan level Anda saat ini</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0B1F3A]">BIGT Penempatan</p>
                    <p className="text-xs text-[#64748B] mt-1">45 menit — 25 soal</p>
                  </div>
                  <Link href="/test" className="flex-shrink-0">
                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-9 px-4 border-[#E5EAF2] text-[#0B1F3A] hover:bg-gray-50">
                      Coba <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-5 px-6 pt-6">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <BarChart3 className="w-4 h-4" />
                Skor per Dimensi
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">Kemahiran berdasarkan 6 dimensi</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-5">
                {Object.entries(DIMENSION_SCORES).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-[#64748B] capitalize">{key.toLowerCase()}</span>
                      <span className="font-semibold text-[#0B1F3A]">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#0B1F3A] to-[#C9A227] transition-all duration-500"
                        style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-4 px-6 pt-6">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Clock className="w-4 h-4" />
                Aktivitas Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                <div className="w-9 h-9 rounded-xl bg-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-[18px] h-[18px] text-[#0B1F3A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0B1F3A]">Tes Latihan</p>
                  <p className="text-xs text-[#64748B] mt-0.5">2 hari yang lalu</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
                <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-[18px] h-[18px] text-[#C9A227]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0B1F3A]">Sertifikat B1 Diterbitkan</p>
                  <p className="text-xs text-[#64748B] mt-0.5">1 minggu yang lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
