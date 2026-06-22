'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CEFR_LABELS } from '@/types'

export default function ResultPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [result, setResult] = useState<{
    overallLevel: string
    overallScore: number
    toefEquivalent?: number
    ieltsEquivalent?: number
    listeningScore: number
    readingScore: number
    speakingScore: number
    writingScore: number
    mediationScore: number
    integratedScore: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await fetch(`/api/test/result?sessionId=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setResult(data.result)
        }
      } catch {
        console.error('Failed to load result')
      } finally {
        setLoading(false)
      }
    }
    loadResult()
  }, [sessionId])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Memuat hasil...</div>
  }

  if (!result) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-[#0B1F3A] mb-2">Hasil belum tersedia</h2>
        <p className="text-[#6B7280] text-sm mb-6">Test masih dalam proses penilaian.</p>
        <Link href="/dashboard">
          <Button className="bg-[#C8102E] hover:bg-red-800 text-white">Kembali ke Dashboard</Button>
        </Link>
      </div>
    )
  }

  const levelLabel = CEFR_LABELS[result.overallLevel as keyof typeof CEFR_LABELS]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A] mb-2">
          Hasil Test Anda
        </h1>
        <p className="text-[#6B7280]">Berikut adalah diagnostic report lengkap dari test Anda.</p>
      </div>

      <Card className="bg-gradient-to-r from-[#0B1F3A] to-[#1a3a5c] text-white border-0">
        <CardContent className="py-10 text-center">
          <div className="inline-block mb-4">
            <Badge className="bg-[#C9A84C] text-[#0B1F3A] text-3xl px-8 py-4 font-bold">
              {result.overallLevel}
            </Badge>
          </div>
          <h2 className="text-xl font-semibold mb-1">{levelLabel}</h2>
          <p className="text-white/60 text-sm mb-4">Skor Overall: {result.overallScore.toFixed(1)}%</p>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-white/40 text-xs">TOEFL iBT</div>
              <div className="font-semibold">{result.toefEquivalent || '-'}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs">IELTS</div>
              <div className="font-semibold">{result.ieltsEquivalent ? result.ieltsEquivalent.toFixed(1) : '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#0B1F3A] mb-4">Skor Per Dimensi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Menyimak', score: result.listeningScore },
            { label: 'Membaca', score: result.readingScore },
            { label: 'Berbicara', score: result.speakingScore },
            { label: 'Menulis', score: result.writingScore },
            { label: 'Mediasi', score: result.mediationScore },
            { label: 'Terintegrasi', score: result.integratedScore },
          ].map((dim) => (
            <Card key={dim.label}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#0B1F3A]">{dim.label}</span>
                  <span className="text-sm font-bold text-[#C8102E]">{dim.score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#C8102E] h-2 rounded-full transition-all"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/test">
          <Button className="bg-[#C8102E] hover:bg-red-800 text-white">Coba Lagi</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
