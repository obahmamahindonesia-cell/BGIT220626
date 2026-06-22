'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Settings, Sparkles, Sliders } from 'lucide-react'

const DIMENSIONS = [
  { code: 'LISTENING', name: 'Menyimak', icon: Headphones, color: '#378ADD' },
  { code: 'READING', name: 'Membaca', icon: BookOpen, color: '#10B981' },
  { code: 'SPEAKING', name: 'Berbicara', icon: Mic, color: '#F59E0B' },
  { code: 'WRITING', name: 'Menulis', icon: PenSquare, color: '#8B5CF6' },
  { code: 'MEDIATION', name: 'Mediasi', icon: RefreshCw, color: '#EC4899' },
  { code: 'INTEGRATED', name: 'Tugas Terintegrasi', icon: Puzzle, color: '#06B6D4' },
]

const LEVELS = [
  { code: 'A1', name: 'Pemula' },
  { code: 'A2', name: 'Dasar' },
  { code: 'B1', name: 'Madya' },
  { code: 'B2', name: 'Madya Atas' },
  { code: 'C1', name: 'Mahir' },
  { code: 'C2', name: 'Sangat Mahir' },
]

export default function TestStartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [questionCount, setQuestionCount] = useState(20)

  const toggleDimension = (code: string) => {
    setSelectedDimensions(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    )
  }

  const handleStartTest = async () => {
    if (selectedDimensions.length === 0) {
      alert('Pilih minimal satu dimensi')
      return
    }

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
      console.error('Error starting test:', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Konfigurasi Tes
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#0B3D91] mb-2">
                Practice Test
              </h1>
              <p className="text-muted-foreground">
                Sesuaikan preferensi tes dan mulai latihan
              </p>
            </div>

            <Card className="border-0 premium-shadow-md rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B3D91]" />
                  Pilih Dimensi
                </CardTitle>
                <CardDescription className="text-xs">Pilih satu atau lebih dimensi yang ingin diuji</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIMENSIONS.map(dim => {
                    const Icon = dim.icon
                    const isSelected = selectedDimensions.includes(dim.code)
                    return (
                      <button
                        key={dim.code}
                        onClick={() => toggleDimension(dim.code)}
                        className={`p-5 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-[#0B3D91] bg-[#0B3D91]/5'
                            : 'border-gray-100 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2`}
                          style={{ backgroundColor: isSelected ? dim.color + '20' : '#F8FAFC' }}>
                          <Icon className="w-5 h-5" style={{ color: dim.color }} />
                        </div>
                        <div className={`text-xs font-semibold ${isSelected ? 'text-[#0B3D91]' : 'text-muted-foreground'}`}>
                          {dim.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 premium-shadow-md rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#0B3D91]" />
                  Pilih Level (Opsional)
                </CardTitle>
                <CardDescription className="text-xs">Kosongkan untuk menyertakan semua level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {LEVELS.map(level => (
                    <button
                      key={level.code}
                      onClick={() => setSelectedLevel(selectedLevel === level.code ? '' : level.code)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedLevel === level.code
                          ? 'border-[#0B3D91] bg-[#0B3D91]/5'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`text-base font-bold ${selectedLevel === level.code ? 'text-[#0B3D91]' : 'text-muted-foreground'}`}>
                        {level.code}
                      </div>
                      <div className={`text-[10px] ${selectedLevel === level.code ? 'text-[#0B3D91]' : 'text-muted-foreground'}`}>
                        {level.name}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 premium-shadow-md rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B3D91]" />
                  Jumlah Soal
                </CardTitle>
                <CardDescription className="text-xs">Sesuaikan panjang tes</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full accent-[#0B3D91]"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>5 soal</span>
                  <span className="font-semibold text-[#0B3D91]">{questionCount} soal</span>
                  <span>50 soal</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleStartTest}
                disabled={loading || selectedDimensions.length === 0}
                className="flex-1 bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white py-6 text-lg rounded-xl"
              >
                {loading ? 'Memulai Tes...' : 'Mulai Practice Test'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
