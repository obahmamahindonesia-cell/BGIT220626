'use client'

import { useTestStore } from '@/store/testStore'
import { CheckCircle2, Circle, Flag, ChevronRight } from 'lucide-react'

export default function QuestionNavigator() {
  const {
    questions,
    currentIndex,
    goToQuestion,
    isQuestionAnswered,
    isQuestionFlagged,
  } = useTestStore()

  const answeredCount = questions.filter((_, i) => isQuestionAnswered(questions[i].id)).length
  const flaggedCount = questions.filter((_, i) => isQuestionFlagged(questions[i].id)).length

  return (
    <div className="h-full flex flex-col bg-white/[0.02]">
      <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Navigasi Soal</h3>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[10px] text-white/30">{answeredCount} terjawab</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] text-white/30">{flaggedCount} ditandai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <span className="text-[10px] text-white/30">{questions.length - answeredCount} sisa</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex
            const answered = isQuestionAnswered(q.id)
            const flagged = isQuestionFlagged(q.id)

            let bg = ''
            let border = ''
            if (isCurrent) {
              bg = 'bg-[#10B981]/15'
              border = 'border-[#10B981]'
            } else if (answered && flagged) {
              bg = 'bg-[#F59E0B]/15'
              border = 'border-[#F59E0B]'
            } else if (answered) {
              bg = 'bg-[#10B981]/10'
              border = 'border-[#10B981]/30'
            } else if (flagged) {
              bg = 'bg-[#F59E0B]/10'
              border = 'border-[#F59E0B]/30'
            } else {
              bg = 'bg-white/[0.04]'
              border = 'border-white/[0.06]'
            }

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={`relative flex items-center justify-center w-full aspect-square rounded-lg text-xs font-medium border transition-all duration-200 ${
                  isCurrent
                    ? 'border-[#10B981] bg-[#10B981]/15 text-white shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]'
                    : `${bg} ${border} ${
                        answered ? 'text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
                      }`
                }`}
              >
                {i + 1}
                {answered && !isCurrent && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-[#10B981]" />
                )}
                {flagged && !answered && !isCurrent && (
                  <Flag className="absolute -top-1 -right-1 w-2.5 h-2.5 text-[#F59E0B]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0 space-y-2">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] transition-colors text-xs"
        >
          <span className="text-white/40">Hanya yang ditandai</span>
          <ChevronRight className="w-3 h-3 text-white/20" />
        </button>
      </div>
    </div>
  )
}
