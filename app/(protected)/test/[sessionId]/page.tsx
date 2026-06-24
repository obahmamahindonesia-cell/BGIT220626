'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import TestFooter from '@/components/test/TestFooter'
import { createClient } from '@/lib/supabase/client'
import TestHeader from '@/components/test/TestHeader'
import { ShieldCheck } from 'lucide-react'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-lg shadow-[#10B981]/20 mx-auto animate-pulse">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-48 bg-white/[0.06] rounded-lg mx-auto animate-pulse" />
          <div className="h-3 w-32 bg-white/[0.04] rounded-lg mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/40 text-sm">Soal tidak tersedia untuk sesi ini.</p>
        <a href="/test/start" className="text-[10px] text-[#10B981] hover:text-[#34D399] font-medium transition-colors">
          Kembali ke Pengaturan Tes
        </a>
      </div>
    </div>
  )
}

export default function TestRunnerPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const {
    questions,
    setSession,
    timeRemaining,
    setTimeRemaining,
    finishTest,
    sessionId: storedSessionId,
    isFinished,
    durationMinutes,
  } = useTestStore()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const initRef = useRef(false)

  const initSession = useCallback(async () => {
    if (initRef.current) return
    initRef.current = true

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/test/session/${sessionId}`)
      if (!res.ok) throw new Error('Session not found')
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Session not found')
      const data = json.data

      if (!data.items || data.items.length === 0) {
        return
      }

      if (data.status !== 'IN_PROGRESS') {
        router.push(`/test/${sessionId}/results`)
        return
      }

      const mappedQuestions = data.items.map((item: any) => {
        const snapshot = item.question || {}
        return {
          id: item.id,
          sessionItemId: item.id,
          dimension: item.dimension || '',
          skill: snapshot.subskill || snapshot.questionType || '',
          type: snapshot.questionType || 'MCQ',
          level: item.level || '',
          difficulty: item.difficulty || 3,
          points: item.maxScore || 10,
          content: {
            prompt: snapshot.prompt || '',
            instruction: snapshot.instruction || '',
            options: snapshot.options || [],
            questionType: snapshot.questionType,
            stimulus: snapshot.stimulus || null,
            subskill: snapshot.subskill,
            topic: snapshot.topic,
            tags: snapshot.tags,
          },
        }
      })

      setSession(sessionId, mappedQuestions, data.durationMinutes || 30)

      // Restore previous answers from DB (page refresh)
      const restoredAnswers: Record<string, any> = {}
      for (const item of data.items) {
        if (item.answer) {
          const snapshot = item.question || {}
          const qType = snapshot.questionType || 'MCQ'
          if (qType === 'MCQ') {
            restoredAnswers[item.id] = { selectedOption: item.answer.answer }
          } else if (qType === 'AUDIO_RESPONSE') {
            restoredAnswers[item.id] = { audioUrl: item.answer.answer }
          } else {
            restoredAnswers[item.id] = { text: item.answer.answer }
          }
        }
      }
      if (Object.keys(restoredAnswers).length > 0) {
        useTestStore.setState({ answers: restoredAnswers })
      }
    } catch {
      useTestStore.setState({ questions: [] })
    }
  }, [sessionId, setSession, router])

  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (timeRemaining <= 0 || isFinished) return

    timerRef.current = setInterval(async () => {
      const state = useTestStore.getState()
      const remaining = state.timeRemaining
      if (remaining <= 1) {
        clearInterval(timerRef.current!)
        // Auto-submit on expiry
        try {
          const savePromises = state.questions.map(q => {
            const answer = state.answers[q.id]
            if (!answer) return Promise.resolve()
            return fetch(`/api/test/session/${sessionId}/answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionItemId: q.id,
                answer: answer.selectedOption || answer.text || '',
              }),
            }).catch(() => {})
          })
          await Promise.all(savePromises)

          const durationSeconds = state.durationMinutes * 60 - remaining
          await fetch(`/api/test/session/${sessionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ durationSeconds }),
          })
        } catch {}
        finishTest()
        router.push(`/test/${sessionId}/results`)
        return
      }
      useTestStore.getState().setTimeRemaining(remaining - 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeRemaining, isFinished, finishTest, router, sessionId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        useTestStore.getState().previousQuestion()
      } else if (e.key === 'ArrowRight') {
        useTestStore.getState().nextQuestion()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (storedSessionId !== sessionId && questions.length === 0) {
    return <LoadingSkeleton />
  }

  if (questions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex flex-col">
      <TestHeader />
      <div className="flex-1 pt-16 pb-16 overflow-hidden">
        <QuestionRenderer />
      </div>
      <TestFooter />
    </div>
  )
}
