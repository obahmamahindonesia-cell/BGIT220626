'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import TestFooter from '@/components/test/TestFooter'
import { createClient } from '@/lib/supabase/client'
import TestHeader from '@/components/test/TestHeader'
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'

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

function InitError({ message, onRetry, statusCode }: { message: string; onRetry: () => void; statusCode?: number }) {
  const isNotFound = statusCode === 404
  const isForbidden = statusCode === 403
  const hint = isNotFound
    ? 'Sesi tes tidak ditemukan.'
    : isForbidden
      ? 'Kamu tidak memiliki akses ke sesi ini.'
      : 'Coba refresh atau mulai tes baru.'
  const btnText = isNotFound || isForbidden ? 'Mulai Tes Baru' : 'Muat Ulang'
  const btnAction = isNotFound || isForbidden ? () => window.location.href = '/test/start' : onRetry

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex items-center justify-center">
      <div className="text-center space-y-5 max-w-sm mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <p className="text-white/70 text-sm">{message}</p>
          <p className="text-white/30 text-xs">{hint}</p>
        </div>
        <button
          onClick={btnAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#10B981]/90 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          {btnText}
        </button>
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>()

  const initSession = useCallback(async () => {
    if (initRef.current) return
    initRef.current = true
    setLoadError(null)
    setErrorStatusCode(undefined)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/test/session/${sessionId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorStatusCode(res.status)
        throw new Error(body.error || `Gagal memuat sesi (${res.status})`)
      }
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Gagal memuat sesi')
      const data = json.data

      if (!data.items || data.items.length === 0) {
        throw new Error('Sesi ini tidak memiliki soal. Mulai tes baru.')
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
            instructionForCandidate: snapshot.instructionForCandidate || '',
            options: snapshot.options || [],
            questionType: snapshot.questionType,
            stimulus: snapshot.stimulus || null,
            subskill: snapshot.subskill,
            topic: snapshot.topic,
            tags: snapshot.tags,
            constraints: snapshot.constraints || null,
            responseMode: snapshot.responseMode || null,
            constructedStimulus: snapshot.constructedStimulus || null,
          },
        }
      })

      setSession(sessionId, mappedQuestions, data.durationMinutes || 30)

      // Restore previous answers from DB (page refresh)
      // DB stores answer as JSON: MCQs →{ selected: "B" }, ESSAY →{ text: "..." }, AUDIO_RESPONSE →{}
      const restoredAnswers: Record<string, any> = {}
      for (const item of data.items) {
        if (item.answer && item.answer.answer) {
          const snapshot = item.question || {}
          const qType = snapshot.questionType || 'MCQ'
          if (qType === 'MCQ') {
            const selected = item.answer.answer.selected
            if (selected) {
              restoredAnswers[item.id] = { selectedOption: selected }
            }
          } else if (qType === 'AUDIO_RESPONSE') {
            // Audio URL intentionally nulled for security — cannot restore
            restoredAnswers[item.id] = {}
          } else {
            const text = item.answer.answer.text
            if (text) {
              restoredAnswers[item.id] = { text }
            }
          }
        }
      }
      if (Object.keys(restoredAnswers).length > 0) {
        useTestStore.setState({ answers: restoredAnswers })
      }
    } catch (err: any) {
      useTestStore.setState({ questions: [] })
      setLoadError(err.message || 'Terjadi kesalahan saat memuat soal.')
      initRef.current = false
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

            const responseMode = q.content?.responseMode

            if (responseMode === 'audio' || responseMode === 'text_audio' || (responseMode === 'text' && answer.text)) {
              if (answer._audioBlob) {
                const formData = new FormData()
                formData.append('sessionId', sessionId)
                formData.append('sessionItemId', q.id)
                formData.append('responseMode', responseMode || 'text')
                formData.append('responseText', answer.text || '')
                formData.append('audio', answer._audioBlob, 'recording.webm')
                formData.append('audioDurationSec', String(answer.audioDuration || 0))
                return fetch('/api/test/constructed/submit', { method: 'POST', body: formData }).catch(() => {})
              }
              return fetch('/api/test/constructed/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  sessionItemId: q.id,
                  responseMode: responseMode || 'text',
                  responseText: answer.text || null,
                  audioUrl: answer.audioUrl || null,
                  audioDurationSec: answer.audioDuration || null,
                }),
              }).catch(() => {})
            }

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

  if (loadError) {
    return <InitError message={loadError} onRetry={() => { initRef.current = false; initSession() }} statusCode={errorStatusCode} />
  }

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
