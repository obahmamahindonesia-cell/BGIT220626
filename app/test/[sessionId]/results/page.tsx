'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { BarChart3, Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Award, Sparkles } from 'lucide-react'

interface TestResult {
  id: string
  overallLevel: string
  overallScore: number
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  mediationScore: number
  integratedScore: number
  recommendations: any[]
  createdAt: string
}

const DIMENSIONS = [
  { code: 'LISTENING', name: 'Menyimak', icon: Headphones, color: '#378ADD' },
  { code: 'READING', name: 'Membaca', icon: BookOpen, color: '#10B981' },
  { code: 'SPEAKING', name: 'Berbicara', icon: Mic, color: '#F59E0B' },
  { code: 'WRITING', name: 'Menulis', icon: PenSquare, color: '#8B5CF6' },
  { code: 'MEDIATION', name: 'Mediasi', icon: RefreshCw, color: '#EC4899' },
  { code: 'INTEGRATED', name: 'Tugas Terintegrasi', icon: Puzzle, color: '#06B6D4' },
]

export default function TestResultsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [sessionId])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/test/results/${sessionId}`)
      if (!res.ok) throw new Error('Failed to fetch results')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="pt-24 pb-16 px-6 text-center">
          <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Hasil tes tidak ditemukan.</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Hasil Tes BIGT
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#0B3D91] mb-2">
              Hasil Assessment Anda
            </h1>
            <p className="text-muted-foreground">
              {new Date(result.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card className="border-0 premium-shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0B3D91] to-[#1a4a8a] px-8 py-10 text-center">
              <Badge className="bg-[#D4AF37] text-white border-0 text-lg px-6 py-2 mb-3">
                {result.overallLevel}
              </Badge>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
                Skor Keseluruhan: {result.overallScore.toFixed(1)}%
              </h2>
            </div>
          </Card>

          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0B3D91]" />
                Skor per Dimensi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIMENSIONS.map((dim) => {
                  const Icon = dim.icon
                  const scoreKey = dim.code.toLowerCase() + 'Score' as keyof typeof result
                  const score = result[scoreKey as keyof TestResult] as number

                  return (
                    <div key={dim.code} className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-gray-100">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: dim.color + '15' }}>
                        <Icon className="w-5 h-5" style={{ color: dim.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0B3D91]">{dim.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: dim.color }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#0B3D91]">{score}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="border-0 premium-shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  Rekomendasi Belajar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.recommendations.map((rec: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC]">
                      <div className="w-6 h-6 rounded-full bg-[#0B3D91]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[#0B3D91]">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{typeof rec === 'string' ? rec : rec.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
