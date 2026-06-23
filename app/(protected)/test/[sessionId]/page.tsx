'use client'

import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import TestHeader from '@/components/test/TestHeader'
import StimulusPanel from '@/components/test/StimulusPanel'
import QuestionPanel from '@/components/test/QuestionPanel'
import QuestionNavigator from '@/components/test/QuestionNavigator'
import TestFooter from '@/components/test/TestFooter'
import { createClient } from '@/lib/supabase/client'
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
        <a href="/test" className="text-[10px] text-[#10B981] hover:text-[#34D399] font-medium transition-colors">
          Kembali ke Pusat Tes
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
    answers,
    sessionId: storedSessionId,
  } = useTestStore()

  const initSession = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/test/sessions/${sessionId}`)
      if (!res.ok) throw new Error('Session not found')
      const data = await res.json()

      if (!data.questions || data.questions.length === 0) {
        return
      }

      if (data.session.status !== 'IN_PROGRESS') {
        router.push(`/test/${sessionId}/results`)
        return
      }

      setSession(sessionId, data.questions)
    } catch {
      useTestStore.setState({ questions: [] })
    }
  }, [sessionId, setSession, router])

  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      const remaining = useTestStore.getState().timeRemaining
      if (remaining <= 1) {
        clearInterval(interval)
        finishTest()
        return
      }
      setTimeRemaining(remaining - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, setTimeRemaining, finishTest])

  const autoSave = useCallback(async () => {
    const state = useTestStore.getState()
    if (!state.sessionId || state.questions.length === 0) return

    for (const q of state.questions) {
      const answer = state.answers[q.id]
      if (answer) {
        try {
          await fetch('/api/test/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: state.sessionId, questionId: q.id, answer }),
          })
        } catch { }
      }
    }
  }, [])

  useEffect(() => {
    if (questions.length === 0) return
    const interval = setInterval(autoSave, 15000)
    return () => clearInterval(interval)
  }, [questions.length, autoSave])

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
    <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] overflow-hidden">
      <TestHeader />

      <div className="fixed top-16 bottom-16 left-0 right-0 flex">
        {/* Left: Stimulus Panel */}
        <div className="hidden lg:flex lg:w-[35%] border-r border-white/[0.06] bg-white/[0.02]">
          <StimulusPanel />
        </div>

        {/* Center: Question Panel */}
        <div className="flex-1 min-w-0 lg:border-r border-white/[0.06]">
          <QuestionPanel />
        </div>

        {/* Right: Navigator */}
        <div className="hidden xl:flex xl:w-[20%]">
          <QuestionNavigator />
        </div>
      </div>

      <TestFooter />
    </div>
  )
}
