'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

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
  { code: 'LISTENING', name: 'Menyimak', icon: '👂', color: '#378ADD' },
  { code: 'READING', name: 'Membaca', icon: '📖', color: '#10B981' },
  { code: 'SPEAKING', name: 'Berbicara', icon: '🎤', color: '#F59E0B' },
  { code: 'WRITING', name: 'Menulis', icon: '✍️', color: '#8B5CF6' },
  { code: 'MEDIATION', name: 'Mediasi', icon: '🔄', color: '#EC4899' },
  { code: 'INTEGRATED', name: 'Tugas Terintegrasi', icon: '🧩', color: '#06B6D4' },
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
      const data = await res.json()
      setResult(data.result)
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!result) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
          <p className="text-gray-600">Results not found</p>
        </div>
        <Footer />
      </>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F6F1] pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-4">
                Test Results
              </h1>
              <p className="text-lg text-gray-600">
                Your diagnostic report and recommendations
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-block px-8 py-4 bg-[#C8102E] rounded-xl mb-4">
                    <div className="text-5xl font-bold text-white mb-2">{result.overallLevel}</div>
                    <div className="text-white/80 text-sm">CEFR Level</div>
                  </div>
                  <div className="text-3xl font-bold text-[#0B1F3A]">
                    {result.overallScore.toFixed(1)}%
                  </div>
                  <p className="text-gray-600 mt-2">Overall Score</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {DIMENSIONS.map(dim => {
                const scoreKey = `${dim.code.toLowerCase()}Score` as keyof TestResult
                const score = result[scoreKey] as number

                return (
                  <Card key={dim.code}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{dim.icon}</span>
                        <div>
                          <div className="font-semibold text-[#0B1F3A]">{dim.name}</div>
                          <div className="text-xs text-gray-500">{dim.code}</div>
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${score}%`,
                            backgroundColor: dim.color,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-4 bg-[#F8F6F1] rounded-lg">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0">
                            {rec.dimension}
                          </Badge>
                          <div>
                            <div className="font-semibold text-[#0B1F3A] mb-1">
                              Score: {rec.score.toFixed(1)}%
                            </div>
                            <p className="text-sm text-gray-600">{rec.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Test completed on {new Date(result.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
