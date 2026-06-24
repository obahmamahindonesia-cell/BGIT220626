'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Award, Sparkles, Home, RotateCcw } from 'lucide-react'

interface SessionResult {
  id: string
  product: string
  status: string
  totalScore: number
  cefrLevel: string
  completedAt: string
  startedAt: string
  durationSeconds: number
  items: any[]
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
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [sessionId])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/test/session/${sessionId}`)
      if (!res.ok) throw new Error('Failed to fetch results')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch results')
      setSession(json.data)
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto py-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Hasil tes tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/test')}>
          Kembali ke Tes
        </Button>
      </div>
    )
  }

  const totalScore = session.totalScore || 0
  const cefrLevel = session.cefrLevel || ''

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <BarChart3 className="w-3.5 h-3.5" />
          Hasil Tes BIGT
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-2">
          Hasil Assessment Anda
        </h1>
        {session.completedAt && (
          <p className="text-[#64748B]">
            {new Date(session.completedAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      <Card className="border border-[#E5EAF2] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] px-8 py-10 text-center">
          {cefrLevel && (
            <Badge className="bg-[#C9A227] text-white border-0 text-lg px-6 py-2 mb-3">
              {cefrLevel}
            </Badge>
          )}
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
            Skor Keseluruhan: {Math.round(totalScore)}%
          </h2>
        </div>
      </Card>

      <Card className="border border-[#E5EAF2] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
            <BarChart3 className="w-4 h-4 text-[#123E7C]" />
            Ringkasan Sesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-xs text-[#64748B]">Soal Dijawab</p>
              <p className="text-lg font-bold text-[#0B1F3A]">{session.items?.filter(i => i.answer).length || 0}/{session.items?.length || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-xs text-[#64748B]">Durasi</p>
              <p className="text-lg font-bold text-[#0B1F3A]">{session.durationSeconds ? `${Math.floor(session.durationSeconds / 60)} menit` : '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2]">
              <p className="text-xs text-[#64748B]">Produk</p>
              <p className="text-lg font-bold text-[#0B1F3A]">{session.product || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/test')} className="border-[#E5EAF2]">
          <Home className="w-4 h-4 mr-2" /> Kembali ke Tes
        </Button>
        <Button onClick={() => router.push('/test/start')} className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white">
          <RotateCcw className="w-4 h-4 mr-2" /> Tes Baru
        </Button>
      </div>
    </div>
  )
}
