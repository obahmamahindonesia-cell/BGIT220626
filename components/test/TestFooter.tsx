'use client'

import { useState } from 'react'
import { useTestStore } from '@/store/testStore'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Save, AlertTriangle, X, Loader2, Flag } from 'lucide-react'

export default function TestFooter() {
  const router = useRouter()
  const {
    sessionId,
    questions,
    currentIndex,
    timeRemaining,
    saveStatus,
    setSaveStatus,
    previousQuestion,
    nextQuestion,
    finishTest,
    getAnsweredCount,
  } = useTestStore()

  const [showEndModal, setShowEndModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion ? useTestStore.getState().answers[currentQuestion.id] : null
  const hasAnswer = !!currentAnswer

  const handleSaveAndNext = async () => {
    if (submitting || !sessionId || !currentQuestion) return

    if (isLast) {
      setShowEndModal(true)
      return
    }

    setSaveStatus({ state: 'saving', message: 'Menyimpan...' })

    const answer = useTestStore.getState().answers[currentQuestion.id]
    if (answer) {
      try {
        const res = await fetch('/api/test/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            answer,
          }),
        })
        if (!res.ok) throw new Error('Failed to save')
        setSaveStatus({ state: 'saved', message: 'Tersimpan' })
        setTimeout(() => setSaveStatus({ state: 'idle', message: '' }), 2000)
      } catch {
        setSaveStatus({ state: 'error', message: 'Gagal menyimpan' })
        setTimeout(() => setSaveStatus({ state: 'idle', message: '' }), 3000)
      }
    }

    nextQuestion()
  }

  const handleEndTest = async () => {
    setSubmitting(true)
    try {
      const unanswered = questions.filter(q => !useTestStore.getState().answers[q.id])
      for (const q of unanswered) {
        const answer = useTestStore.getState().answers[q.id]
        if (answer) {
          await fetch('/api/test/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, questionId: q.id, answer }),
          })
        }
      }

      const res = await fetch('/api/test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) throw new Error('Failed to complete test')

      finishTest()
      router.push(`/test/${sessionId}/results`)
    } catch {
      alert('Gagal menyelesaikan tes. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
      setShowEndModal(false)
    }
  }

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#0A1428]/90 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="h-full max-w-screen-2xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={previousQuestion}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-white/60 text-xs font-medium transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus.state === 'saving' && (
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan...
              </span>
            )}
            {saveStatus.state === 'saved' && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                <Save className="w-3 h-3" />
                Tersimpan
              </span>
            )}
            {saveStatus.state === 'error' && (
              <span className="flex items-center gap-1.5 text-[10px] text-red-400">
                <AlertTriangle className="w-3 h-3" />
                Gagal menyimpan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Akhiri Sesi</span>
            </button>

            <button
              onClick={handleSaveAndNext}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLast ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Kumpulkan
                </>
              ) : (
                <>
                  Simpan & Lanjut
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {showEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0D1B34] to-[#0A1428] border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Akhiri Sesi Tes?</h3>
                  <p className="text-[11px] text-white/40">Semua jawaban akan dikumpulkan dan dinilai.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Soal terjawab</span>
                  <span className="text-white/80 font-medium">{getAnsweredCount()} / {questions.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Waktu tersisa</span>
                  <span className="text-white/80 font-medium">{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} m</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all"
                    style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {getAnsweredCount() < questions.length && (
                <p className="text-[11px] text-[#F59E0B] mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  {questions.length - getAnsweredCount()} soal belum terjawab
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60 text-xs font-medium transition-all"
                >
                  <X className="w-3.5 h-3.5 inline mr-1.5" />
                  Kembali
                </button>
                <button
                  onClick={handleEndTest}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mengumpulkan...
                    </span>
                  ) : (
                    'Ya, Akhiri Sesi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
