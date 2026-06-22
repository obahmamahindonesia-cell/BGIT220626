'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Settings, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

const DIMENSIONS = [
  { code: 'LISTENING', name: 'Menyimak', icon: Headphones, color: '#0B1F3A' },
  { code: 'READING', name: 'Membaca', icon: BookOpen, color: '#123E7C' },
  { code: 'SPEAKING', name: 'Berbicara', icon: Mic, color: '#C9A227' },
  { code: 'WRITING', name: 'Menulis', icon: PenSquare, color: '#D7193F' },
  { code: 'MEDIATION', name: 'Mediasi', icon: RefreshCw, color: '#64748B' },
  { code: 'INTEGRATED', name: 'Tugas Terintegrasi', icon: Puzzle, color: '#64748B' },
]

const LEVELS = [
  { code: 'A1', name: 'Pemula' },
  { code: 'A2', name: 'Dasar' },
  { code: 'B1', name: 'Madya' },
  { code: 'B2', name: 'Madya Atas' },
  { code: 'C1', name: 'Mahir' },
  { code: 'C2', name: 'Sangat Mahir' },
]

const STEPS = [
  { id: 1, label: 'Dimensi' },
  { id: 2, label: 'Level' },
  { id: 3, label: 'Soal' },
  { id: 4, label: 'Mulai' },
]

const PRODUCTS: Record<string, { name: string; desc: string }> = {
  academic: { name: 'BIGT Academic', desc: 'Asesmen komprehensif untuk keperluan akademik' },
  professional: { name: 'BIGT Professional', desc: 'Asesmen untuk dunia kerja dan profesional' },
  placement: { name: 'BIGT Placement', desc: 'Tes adaptif untuk penempatan level' },
  practice: { name: 'BIGT Practice', desc: 'Latihan mandiri dengan feedback instan' },
}

function TestStartForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product') || 'practice'
  const product = PRODUCTS[productId] || PRODUCTS.practice

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [questionCount, setQuestionCount] = useState(20)

  const toggleDimension = (code: string) => {
    setSelectedDimensions(prev => prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code])
  }

  const canProceed = () => {
    if (step === 1) return selectedDimensions.length > 0
    return true
  }

  const handleStartTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: selectedDimensions,
          level: selectedLevel || undefined,
          questionCount,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal memulai tes')
      }
      const data = await res.json()
      router.push(`/test/${data.session.id}`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          Konfigurasi Tes
        </h1>
        <p className="text-[#64748B] text-sm mt-1">{product.name} — {product.desc}</p>
      </div>

      <div className="hidden sm:flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              step >= s.id ? 'bg-[#0B1F3A] text-white shadow-sm' : 'bg-gray-100 text-[#64748B]'
            }`}>
              {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 flex items-center justify-center text-[11px] font-bold">{s.id}</span>}
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${step > s.id ? 'bg-[#0B1F3A]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="flex sm:hidden items-center justify-center gap-3">
        {STEPS.map((s) => (
          <div key={s.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step === s.id ? 'bg-[#0B1F3A] text-white' : step > s.id ? 'bg-[#0B1F3A]/10 text-[#0B1F3A]' : 'bg-gray-100 text-[#64748B]'
          }`}>
            {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0B1F3A] flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pilih Dimensi
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Pilih satu atau lebih dimensi yang ingin diuji</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIMENSIONS.map(dim => {
                const Icon = dim.icon
                const isSelected = selectedDimensions.includes(dim.code)
                return (
                  <button key={dim.code} onClick={() => toggleDimension(dim.code)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected ? 'border-[#0B1F3A] bg-[#0B1F3A]/5' : 'border-[#E5EAF2] hover:border-gray-300 bg-white'
                    }`}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                      style={{ backgroundColor: isSelected ? dim.color + '15' : '#F7F9FC' }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: dim.color }} />
                    </div>
                    <div className={`text-xs font-medium ${isSelected ? 'text-[#0B1F3A]' : 'text-[#64748B]'}`}>{dim.name}</div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0B1F3A] flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pilih Level
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Kosongkan untuk menyertakan semua level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {LEVELS.map(level => (
                <button key={level.code}
                  onClick={() => setSelectedLevel(selectedLevel === level.code ? '' : level.code)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selectedLevel === level.code
                      ? 'border-[#0B1F3A] bg-[#0B1F3A]/5'
                      : 'border-[#E5EAF2] hover:border-gray-300 bg-white'
                  }`}>
                  <div className={`text-sm font-bold ${selectedLevel === level.code ? 'text-[#0B1F3A]' : 'text-[#64748B]'}`}>{level.code}</div>
                  <div className={`text-[10px] ${selectedLevel === level.code ? 'text-[#0B1F3A]' : 'text-[#64748B]'}`}>{level.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0B1F3A] flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Jumlah Soal
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Sesuaikan panjang tes</CardDescription>
          </CardHeader>
          <CardContent>
            <input type="range" min="5" max="50" step="5" value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full accent-[#0B1F3A]" />
            <div className="flex justify-between text-xs text-[#64748B] mt-2">
              <span>5 soal</span>
              <span className="font-semibold text-[#0B1F3A]">{questionCount} soal</span>
              <span>50 soal</span>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0B1F3A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              Ringkasan Tes
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Pastikan konfigurasi Anda sudah benar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-1">Produk</p>
                <p className="text-sm font-semibold text-[#0B1F3A]">{product.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-1">Dimensi</p>
                <p className="text-sm font-semibold text-[#0B1F3A]">{selectedDimensions.length} dipilih</p>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-1">Level</p>
                <p className="text-sm font-semibold text-[#0B1F3A]">{selectedLevel || 'Semua level'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 sticky bottom-0 sm:static pt-4 sm:pt-0 pb-2 sm:pb-0 bg-[#F7F9FC] sm:bg-transparent">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}
            className="border-[#E5EAF2] text-[#0B1F3A] rounded-lg h-11 px-6 text-sm flex-1 sm:flex-none">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        ) : <div className="hidden sm:block" />}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}
            className="flex-1 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-lg h-11 text-sm">
            Lanjut <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleStartTest} disabled={loading}
            className="flex-1 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg h-11 text-sm shadow-lg shadow-[#D7193F]/20">
            {loading ? 'Memulai Tes...' : 'Mulai Tes Sekarang'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function TestStartPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#64748B] text-sm">Memuat...</div>}>
      <TestStartForm />
    </Suspense>
  )
}
