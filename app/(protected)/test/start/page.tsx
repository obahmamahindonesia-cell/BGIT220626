'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BookOpen, Headphones, Clock, ArrowRight,
  Sparkles, Loader2, AlertCircle, BarChart3,
} from 'lucide-react'

interface BlueprintCard {
  id: string
  label: string
  description: string
  includes: string[]
  duration: string
  totalItems: number
  disabled: boolean
  disabledLabel?: string
  color: string
}

const BLUEPRINT_CARDS: BlueprintCard[] = [
  {
    id: 'A1_LEVEL_EXAM',
    label: 'A1 Pemula',
    description: 'Menguji pemahaman dasar dalam situasi sehari-hari.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±45 menit',
    totalItems: 60,
    disabled: false,
    color: '#0B1F3A',
  },
  {
    id: 'A2_LEVEL_EXAM',
    label: 'A2 Dasar',
    description: 'Menguji pemahaman situasi sehari-hari, jadwal, layanan, dan percakapan pendek.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±50 menit',
    totalItems: 60,
    disabled: false,
    color: '#123E7C',
  },
  {
    id: 'A1_A2_PLACEMENT',
    label: 'Tes Penempatan A1–A2',
    description: 'Menentukan level awal pengguna secara otomatis.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±50 menit',
    totalItems: 60,
    disabled: false,
    color: '#C9A227',
  },
  {
    id: 'QUICK_PLACEMENT',
    label: 'Tes Cepat',
    description: 'Tes cepat untuk gambaran awal level.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±25 menit',
    totalItems: 30,
    disabled: false,
    color: '#D7193F',
  },
  {
    id: 'B1_LEVEL_EXAM',
    label: 'B1 Madya',
    description: 'Menguji pemahaman teks dan percakapan yang lebih kompleks.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±55 menit',
    totalItems: 60,
    disabled: true,
    disabledLabel: 'Segera hadir',
    color: '#64748B',
  },
  {
    id: 'B2_LEVEL_EXAM',
    label: 'B2 Madya Atas',
    description: 'Menguji kemampuan memahami ide pokok teks kompleks.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±60 menit',
    totalItems: 60,
    disabled: true,
    disabledLabel: 'Segera hadir',
    color: '#64748B',
  },
  {
    id: 'C1_LEVEL_EXAM',
    label: 'C1 Mahir',
    description: 'Menguji pemahaman teks panjang dan kompleks dengan baik.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±70 menit',
    totalItems: 60,
    disabled: true,
    disabledLabel: 'Segera hadir',
    color: '#64748B',
  },
  {
    id: 'C2_LEVEL_EXAM',
    label: 'C2 Sangat Mahir',
    description: 'Menguji kemampuan memahami hampir semua bentuk bahasa.',
    includes: ['Membaca', 'Menyimak'],
    duration: '±80 menit',
    totalItems: 60,
    disabled: true,
    disabledLabel: 'Segera hadir',
    color: '#64748B',
  },
]

export default function LevelExamStartPage() {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStart = async (card: BlueprintCard) => {
    if (card.disabled) return
    setLoadingId(card.id)
    try {
      const res = await fetch('/api/test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId: card.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memulai tes.')
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
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          Pilih Ujian BIGT
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Pilih level ujian yang ingin Anda ikuti. Sistem akan otomatis menyusun soal sesuai blueprint resmi BIGT.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {BLUEPRINT_CARDS.map((card) => (
          <Card
            key={card.id}
            className={`border rounded-2xl shadow-sm flex flex-col transition-all ${
              card.disabled
                ? 'border-[#E5EAF2] opacity-60'
                : 'border-[#E5EAF2] cursor-pointer hover:shadow-md hover:border-[#C9A227]/30 card-hover'
            }`}
            onClick={() => handleStart(card)}
          >
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  {card.id === 'QUICK_PLACEMENT' ? (
                    <Sparkles className="w-[22px] h-[22px]" style={{ color: card.color }} />
                  ) : card.id === 'A1_A2_PLACEMENT' ? (
                    <BarChart3 className="w-[22px] h-[22px]" style={{ color: card.color }} />
                  ) : (
                    <BookOpen className="w-[22px] h-[22px]" style={{ color: card.color }} />
                  )}
                </div>
                {card.disabled && (
                  <Badge variant="secondary" className="text-[10px] bg-gray-100 text-[#64748B] border-0">
                    {card.disabledLabel}
                  </Badge>
                )}
              </div>
              <CardTitle className={`text-sm font-semibold ${card.disabled ? 'text-[#64748B]' : 'text-[#0B1F3A]'}`}>
                {card.label}
              </CardTitle>
              <p className={`text-xs leading-relaxed mt-1.5 ${card.disabled ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
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
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{card.includes.join(' + ')}</span>
                </div>
              </div>
              {card.disabled ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full rounded-xl text-xs h-10 border-[#E5EAF2] text-[#94A3B8] mt-auto"
                >
                  {card.disabledLabel}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full rounded-xl text-xs h-10 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white mt-auto font-medium"
                  onClick={() => handleStart(card)}
                  disabled={loadingId === card.id}
                >
                  {loadingId === card.id ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Menyiapkan...</>
                  ) : (
                    <>{card.id === 'QUICK_PLACEMENT' ? 'Mulai Tes Cepat' : 'Mulai Ujian'} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-[#E5EAF2] rounded-2xl bg-[#F7F9FC]">
        <CardContent className="px-6 py-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#64748B] leading-relaxed">
              <p className="font-medium text-[#0B1F3A] mb-1">Informasi Ujian</p>
              <p>Ujian ini otomatis mencakup <strong>Reading</strong> dan <strong>Listening</strong>. Writing dan Speaking akan ditambahkan pada versi berikutnya. Anda tidak perlu memilih skill atau jumlah soal — sistem akan menyusunnya secara otomatis.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
