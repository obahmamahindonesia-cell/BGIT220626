'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BookOpen, Headphones, Mic, PenSquare, Clock, ArrowRight,
  Loader2, AlertTriangle, Shield, Sparkles, BarChart3, Puzzle, RefreshCw,
} from 'lucide-react'

interface TrialCard {
  id: string
  label: string
  description: string
  level: string
  mode: 'trial_constructed' | 'dev_full'
  skills: string[]
  duration: string
  totalItems: number
  color: string
}

const TRIAL_CARDS: TrialCard[] = [
  {
    id: 'TRIAL_A1',
    label: 'Trial A1 Full Skills',
    description: 'Tes uji coba A1 dengan Reading, Listening, Writing, dan Speaking. Jawaban Writing/Speaking harus di-review manual.',
    level: 'A1',
    mode: 'trial_constructed',
    skills: ['Membaca', 'Menyimak', 'Menulis', 'Berbicara'],
    duration: '±45 menit',
    totalItems: 14,
    color: '#0B1F3A',
  },
  {
    id: 'TRIAL_A2',
    label: 'Trial A2 Full Skills',
    description: 'Tes uji coba A2 dengan Reading, Listening, Writing, dan Speaking. Jawaban Writing/Speaking harus di-review manual.',
    level: 'A2',
    mode: 'trial_constructed',
    skills: ['Membaca', 'Menyimak', 'Menulis', 'Berbicara'],
    duration: '±50 menit',
    totalItems: 14,
    color: '#123E7C',
  },
  {
    id: 'DEV_FULL',
    label: 'Dev Full Test',
    description: 'Tes pengembangan lengkap. Semua skill termasuk Integrated dan Mediasi. Hanya untuk dev/admin internal.',
    level: 'A1',
    mode: 'dev_full',
    skills: ['Membaca', 'Menyimak', 'Menulis', 'Berbicara', 'Terintegrasi', 'Mediasi'],
    duration: '±60 menit',
    totalItems: 12,
    color: '#64748B',
  },
]

const SKILL_ICONS: Record<string, any> = {
  Membaca: BookOpen,
  Menyimak: Headphones,
  Menulis: PenSquare,
  Berbicara: Mic,
  Terintegrasi: Puzzle,
  Mediasi: RefreshCw,
}

export default function AdminTrialPage() {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStart = async (card: TrialCard) => {
    setLoadingId(card.id)
    try {
      const res = await fetch('/api/test/start/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: card.level, mode: card.mode }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memulai trial.')
      }
      if (data.data.warnings?.length > 0) {
        toast.warning(data.data.warnings.join(', '))
      }
      router.push(`/test/${data.data.sessionId}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Mode Uji Coba Internal</h1>
          <p className="text-sm text-[#64748B]">
            Hanya untuk admin/founder. Writing dan Speaking belum dinilai otomatis — review manual di halaman Review Menulis/Bicara.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1">Peringatan</p>
          <p>
            Hasil tes mode uji coba <strong>tidak memengaruhi</strong> skor akhir atau level CEFR peserta.
            Jawaban Writing dan Speaking harus di-review secara manual di halaman{' '}
            <a href="/admin/constructed-review" className="underline font-medium">Review Menulis/Bicara</a>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TRIAL_CARDS.map((card) => {
          const Icon = BarChart3
          return (
            <Card
              key={card.id}
              className="border border-[#E5EAF2] rounded-2xl shadow-sm flex flex-col transition-all hover:shadow-md hover:border-[#C9A227]/30"
            >
              <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: card.color + '15' }}
                  >
                    {card.id === 'DEV_FULL' ? (
                      <Sparkles className="w-[22px] h-[22px]" style={{ color: card.color }} />
                    ) : (
                      <BarChart3 className="w-[22px] h-[22px]" style={{ color: card.color }} />
                    )}
                  </div>
                  <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0">
                    {card.mode === 'dev_full' ? 'Dev Only' : 'Internal'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold text-[#0B1F3A]">
                  {card.label}
                </CardTitle>
                <p className="text-xs leading-relaxed mt-1.5 text-[#64748B]">
                  {card.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1 px-6 pb-6">
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{card.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{card.totalItems} soal</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {card.skills.map((skill) => {
                      const SkillIcon = SKILL_ICONS[skill] || BookOpen
                      return (
                        <Badge key={skill} variant="secondary" className="text-[10px] bg-gray-100 text-[#64748B] border-0 flex items-center gap-1">
                          <SkillIcon className="w-3 h-3" />
                          {skill}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-xl text-xs h-10 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white mt-auto font-medium"
                  onClick={() => handleStart(card)}
                  disabled={loadingId !== null}
                >
                  {loadingId === card.id ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyiapkan...</>
                  ) : (
                    <>Mulai {card.mode === 'dev_full' ? 'Dev Test' : 'Trial'} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
