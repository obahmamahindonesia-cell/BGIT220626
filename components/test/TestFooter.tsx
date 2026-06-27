'use client'

import { useState } from 'react'
import { useTestStore } from '@/store/testStore'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, AlertTriangle, X, Loader2, Flag } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function TestFooter() {
  const router = useRouter()
  const { t } = useI18n()
  const {
    sessionId,
    questions,
    currentIndex,
    timeRemaining,
    saveStatus,
    previousQuestion,
    nextQuestion,
    finishTest,
    getAnsweredCount,
  } = useTestStore()

  const [showEndModal, setShowEndModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const answeredCount = getAnsweredCount()
  const totalCount = questions.length

  const handleEndTest = async () => {
    setSubmitting(true)
    try {
      const state = useTestStore.getState()
      const activeSessionId = state.sessionId
      if (!activeSessionId) return

      // Flush all pending auto-saves by saving unanswered questions
      const savePromises = state.questions.map(q => {
        const answer = state.answers[q.id]
        if (!answer) return Promise.resolve()

        const responseMode = q.content?.responseMode

        // Constructed response → dedicated endpoint
        if (responseMode === 'audio' || responseMode === 'text_audio' || (responseMode === 'text' && answer.text)) {
          if (answer._audioBlob) {
            const formData = new FormData()
            formData.append('sessionId', activeSessionId)
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
              sessionId: activeSessionId,
              sessionItemId: q.id,
              responseMode: responseMode || 'text',
              responseText: answer.text || null,
              audioUrl: answer.audioUrl || null,
              audioDurationSec: answer.audioDuration || null,
            }),
          }).catch(() => {})
        }

        // Standard MCQ / short answer
        return fetch(`/api/test/session/${activeSessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionItemId: q.id,
            answer: answer.selectedOption || answer.text || '',
          }),
        }).catch(() => {})
      })
      await Promise.all(savePromises)

      const durationSeconds = state.durationMinutes * 60 - state.timeRemaining

      const res = await fetch(`/api/test/session/${activeSessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds }),
      })

      if (!res.ok) throw new Error('Failed to complete test')

      finishTest()
      router.push(`/test/${activeSessionId}/results`)
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
              <span className="flex items-center gap-1.5 text-[10px] text-[#F59E0B]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan Jawaban
              </span>
            )}
            {saveStatus.state === 'saved' && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Jawaban Tersimpan
              </span>
            )}
            {saveStatus.state === 'error' && (
              <span className="flex items-center gap-1.5 text-[10px] text-red-400">
                <AlertTriangle className="w-3 h-3" />
                Gagal Menyimpan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Selesaikan Tes</span>
            </button>

            {isLast ? (
              <button
                onClick={() => setShowEndModal(true)}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flag className="w-3.5 h-3.5" />
                Selesaikan Tes
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all"
              >
                Berikutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
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
                  <h3 className="text-sm font-semibold text-white/90">Selesaikan Tes</h3>
                  <p className="text-[11px] text-white/40">Apakah Anda yakin ingin mengakhiri sesi tes ini?</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Soal Terjawab</span>
                  <span className="text-white/80 font-medium">{answeredCount} / {totalCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Sisa Waktu</span>
                  <span className="text-white/80 font-medium">{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} m</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all"
                    style={{ width: `${(answeredCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              {answeredCount < totalCount && (
                <p className="text-[11px] text-[#F59E0B] mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  {totalCount - answeredCount} soal belum terjawab
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
                      Memproses...
                    </span>
                  ) : (
                    'Ya, Selesaikan Tes'
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
