'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

const DIMENSIONS = [
  { code: 'LISTENING', name: 'Menyimak', icon: '👂' },
  { code: 'READING', name: 'Membaca', icon: '📖' },
  { code: 'SPEAKING', name: 'Berbicara', icon: '🎤' },
  { code: 'WRITING', name: 'Menulis', icon: '✍️' },
  { code: 'MEDIATION', name: 'Mediasi', icon: '🔄' },
  { code: 'INTEGRATED', name: 'Tugas Terintegrasi', icon: '🧩' },
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
      prev.includes(code)
        ? prev.filter(d => d !== code)
        : [...prev, code]
    )
  }

  const handleStartTest = async () => {
    if (selectedDimensions.length === 0) {
      alert('Please select at least one dimension')
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
        throw new Error(data.error || 'Failed to start test')
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
      <div className="min-h-screen bg-[#F8F6F1] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-4">
                Practice Test
              </h1>
              <p className="text-lg text-gray-600">
                Configure your test preferences and start practicing
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIMENSIONS.map(dim => (
                    <button
                      key={dim.code}
                      onClick={() => toggleDimension(dim.code)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDimensions.includes(dim.code)
                          ? 'border-[#C8102E] bg-[#C8102E]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{dim.icon}</div>
                      <div className="text-sm font-semibold text-[#0B1F3A]">{dim.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Level (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {LEVELS.map(level => (
                    <button
                      key={level.code}
                      onClick={() => setSelectedLevel(selectedLevel === level.code ? '' : level.code)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedLevel === level.code
                          ? 'border-[#C8102E] bg-[#C8102E]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-bold text-[#0B1F3A]">{level.code}</div>
                      <div className="text-xs text-gray-600">{level.name}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to include all levels
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Number of Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>5 questions</span>
                  <span className="font-semibold text-[#0B1F3A]">{questionCount} questions</span>
                  <span>50 questions</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleStartTest}
                disabled={loading || selectedDimensions.length === 0}
                className="flex-1 bg-[#C8102E] hover:bg-red-800 text-white py-6 text-lg"
              >
                {loading ? 'Starting Test...' : 'Start Practice Test'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
