'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Question {
  id: string
  dimension: string
  skill: string
  type: string
  level: string
  difficulty: number
  points: number
  content: any
}

export default function TestRunnerPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/test/sessions/${sessionId}`)
      const data = await res.json()
      setQuestions(data.questions)
    } catch (err) {
      console.error('Error fetching session:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentIndex]

  const handleAnswer = (answer: any) => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }))
  }

  const handleNext = async () => {
    if (!currentQuestion) return

    const answer = answers[currentQuestion.id]
    if (!answer) {
      alert('Please provide an answer before continuing')
      return
    }

    try {
      await fetch('/api/test/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer,
        }),
      })

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        handleComplete()
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)

    try {
      const res = await fetch('/api/test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) throw new Error('Failed to complete test')

      router.push(`/test/${sessionId}/results`)
    } catch (err) {
      console.error('Error completing test:', err)
      alert('Failed to complete test')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No questions available</p>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Badge variant="outline">
                {currentQuestion.dimension} - {currentQuestion.level}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#C8102E] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#0B1F3A] mb-4">
                  {currentQuestion.content?.prompt || 'No prompt available'}
                </h2>
              </div>

              {currentQuestion.type === 'MCQ' && currentQuestion.content?.options && (
                <div className="space-y-3">
                  {currentQuestion.content.options.map((option: string, i: number) => {
                    const optionLetter = String.fromCharCode(65 + i)
                    const isSelected = answers[currentQuestion.id]?.selectedOption === optionLetter

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer({ selectedOption: optionLetter })}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-[#C8102E] bg-[#C8102E]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-semibold mr-3">{optionLetter}.</span>
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQuestion.type === 'ESSAY' && (
                <textarea
                  value={answers[currentQuestion.id]?.text || ''}
                  onChange={(e) => handleAnswer({ text: e.target.value })}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border rounded-lg min-h-[200px] resize-y"
                />
              )}

              {currentQuestion.type === 'SHORT_ANSWER' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id]?.text || ''}
                  onChange={(e) => handleAnswer({ text: e.target.value })}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border rounded-lg"
                />
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 bg-[#C8102E] hover:bg-red-800 text-white"
            >
              {submitting
                ? 'Completing...'
                : currentIndex === questions.length - 1
                ? 'Complete Test'
                : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
