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
  { code: 'A1', label: 'Pemula', color: 'bg-gray-300' },
  { code: 'A2', label: 'Dasar', color: 'bg-blue-300' },
  { code: 'B1', label: 'Madya', color: 'bg-blue-500' },
  { code: 'B2', label: 'Madya Atas', color: 'bg-green-500' },
  { code: 'C1', label: 'Mahir', color: 'bg-red-500' },
  { code: 'C2', label: 'Sangat Mahir', color: 'bg-amber-500' },
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
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  const currentLevelIndex = CEFR_LEVELS.findIndex(l => l.code === stats.currentLevel)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B3D91]">
            Selamat datang, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">Lanjutkan perjalanan kemahiran Bahasa Indonesia Anda.</p>
        </div>
        <Link href="/test">
          <Button className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white shadow-lg shadow-[#E11D48]/20 rounded-xl h-11 px-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Mulai Tes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="premium-shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B3D91]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#0B3D91]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B3D91]">{stats.totalTests}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Tes Selesai</p>
          </CardContent>
        </Card>

        <Card className="premium-shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B3D91]">{stats.currentLevel}</p>
            <p className="text-xs text-muted-foreground mt-1">Level Saat Ini</p>
          </CardContent>
        </Card>

        <Card className="premium-shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B3D91]">{stats.certificates}</p>
            <p className="text-xs text-muted-foreground mt-1">Sertifikat Dimiliki</p>
          </CardContent>
        </Card>

        <Card className="premium-shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#E11D48]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B3D91]">{stats.highestScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Skor Tertinggi</p>
          </CardContent>
        </Card>

        <Card className="premium-shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B3D91]">{stats.studyHours} jam</p>
            <p className="text-xs text-muted-foreground mt-1">Jam Belajar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 premium-shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0B3D91]" />
                Perkembangan Kemahiran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {CEFR_LEVELS.map((level, i) => (
                  <div key={level.code} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg ${level.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {level.code}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#0B3D91]">{level.label}</span>
                        {i === currentLevelIndex && <Badge className="bg-[#D4AF37] text-white border-0 text-[10px]">Level Saat Ini</Badge>}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${i <= currentLevelIndex ? level.color.replace('bg-', 'bg-') : 'bg-gray-100'}`}
                          style={{
                            width: i < currentLevelIndex ? '100%' : i === currentLevelIndex ? '60%' : '0%',
                            opacity: i <= currentLevelIndex ? 1 : 0.3,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 premium-shadow-md rounded-2xl card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0B3D91]" />
                  Lanjutkan Tes
                </CardTitle>
                <CardDescription className="text-xs">Ada sesi tes yang belum selesai</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0B3D91]">Practice Test</p>
                    <p className="text-xs text-muted-foreground">15 dari 25 soal terjawab</p>
                  </div>
                  <Link href="/test">
                    <Button size="sm" className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white rounded-xl">
                      Lanjutkan <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 premium-shadow-md rounded-2xl card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  Rekomendasi Tes
                </CardTitle>
                <CardDescription className="text-xs">Berdasarkan level Anda saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0B3D91]">BIGT Placement</p>
                    <p className="text-xs text-muted-foreground">45 menit • 25 soal</p>
                  </div>
                  <Link href="/test">
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Coba <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0B3D91]" />
                Skor per Dimensi
              </CardTitle>
              <CardDescription className="text-xs">Kemahiran berdasarkan 6 dimensi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(DIMENSION_SCORES).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground capitalize">{key.toLowerCase()}</span>
                      <span className="font-medium text-[#0B3D91]">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#0B3D91] to-[#D4AF37] transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0B3D91]" />
                Aktivitas Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC]">
                <div className="w-8 h-8 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-[#0B3D91]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0B3D91]">Practice Test</p>
                  <p className="text-[10px] text-muted-foreground">2 hari yang lalu</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC]">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0B3D91]">Sertifikat B1 Diterbitkan</p>
                  <p className="text-[10px] text-muted-foreground">1 minggu yang lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
