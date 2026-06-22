'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MCQQuestion from '@/components/test-engine/MCQQuestion'
import WritingQuestion from '@/components/test-engine/WritingQuestion'
import TestTimer from '@/components/test-engine/TestTimer'
import { toast } from 'sonner'
import { DIMENSION_LABELS, AnswerResponse } from '@/types'

export default function TestRunnerPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { questions, currentIndex, answers, setSession, setAnswer, nextQuestion, previousQuestion, finishTest, isFinished } = useTestStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (questions.length > 0) {
      setLoading(false)
      return
    }

    const loadSession = async () => {
      try {
        const res = await fetch('/api/test/start', { method: 'POST' })
        if (!res.ok) throw new Error('Gagal memuat test')
        const data = await res.json()
        setSession(data.sessionId, data.questions)
      } catch {
        toast.error('Gagal memuat test')
        router.push('/test')
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [sessionId, questions.length, setSession, router])

  const currentQuestion = questions[currentIndex]

  const handleSubmitAnswer = (answer: AnswerResponse) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, answer)
    }
  }

  const handleNext = async () => {
    if (!currentQuestion) return
    const answer = answers[currentQuestion.id]
    if (answer) {
      await fetch('/api/test/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionId: currentQuestion.id, response: answer }),
      })
    }

    if (currentIndex < questions.length - 1) {
      nextQuestion()
    }
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
      if (currentAnswer && currentQuestion) {
        await fetch('/api/test/submit-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, questionId: currentQuestion.id, response: currentAnswer }),
        })
      }

      const res = await fetch('/api/test/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) throw new Error('Gagal menyelesaikan test')

      finishTest()
      toast.success('Test selesai! Mengarahkan ke hasil...')
      router.push(`/test/${sessionId}/result`)
    } catch {
      toast.error('Gagal menyelesaikan test')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Memuat soal...</div>
  }

  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-64">Tidak ada soal</div>
  }

  const progress = ((currentIndex + 1) / questions.length) * 100
  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {DIMENSION_LABELS[currentQuestion.dimension as keyof typeof DIMENSION_LABELS]}
          </Badge>
          <span className="text-sm text-[#6B7280]">
            Soal {currentIndex + 1} dari {questions.length}
          </span>
        </div>
        <TestTimer timeRemaining={1800} />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[#C8102E] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentQuestion.type === 'MCQ' ? (
            <MCQQuestion
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={handleSubmitAnswer}
            />
          ) : (
            <WritingQuestion
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={handleSubmitAnswer}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentIndex === 0}
        >
          Sebelumnya
        </Button>
        {isLastQuestion ? (
          <Button
            onClick={handleFinish}
            disabled={submitting || isFinished}
            className="bg-[#C8102E] hover:bg-red-800 text-white"
          >
            {submitting ? 'Memproses...' : 'Selesai Test'}
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white">
            Jawaban Berikutnya
          </Button>
        )}
      </div>
    </div>
  )
}
