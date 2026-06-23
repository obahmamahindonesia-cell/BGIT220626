'use client'

import { useTestStore } from '@/store/testStore'
import { Flag } from 'lucide-react'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E']

export default function QuestionPanel() {
  const {
    questions,
    currentIndex,
    answers,
    setAnswer,
    toggleFlag,
    flaggedQuestions,
  } = useTestStore()

  const question = questions[currentIndex]
  if (!question) return null

  const answer = answers[question.id]
  const isFlagged = flaggedQuestions.has(question.id)
  const content = question.content || {}

  const renderMCQ = () => (
    <div className="space-y-3">
      {content.options?.map((option: string, i: number) => {
        const label = OPTION_LABELS[i] || String(i + 1)
        const isSelected = answer?.selectedOption === label
        return (
          <button
            key={i}
            onClick={() => setAnswer(question.id, { selectedOption: label })}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              isSelected
                ? 'border-[#10B981] bg-[#10B981]/[0.08] shadow-[0_0_20px_-4px_rgba(16,185,129,0.15)]'
                : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
              isSelected ? 'bg-[#10B981] text-white' : 'bg-white/[0.06] text-white/40'
            }`}>
              {label}
            </div>
            <span className={`text-sm leading-relaxed pt-1.5 ${isSelected ? 'text-white/90' : 'text-white/60'}`}>
              {option}
            </span>
            {isSelected && (
              <div className="ml-auto flex-shrink-0 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )

  const renderEssay = () => (
    <textarea
      value={answer?.text || ''}
      onChange={(e) => setAnswer(question.id, { text: e.target.value })}
      placeholder="Tulis jawaban Anda di sini..."
      className="w-full min-h-[240px] p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm leading-relaxed placeholder:text-white/20 resize-y focus:outline-none focus:border-[#10B981]/50 focus:bg-white/[0.05] transition-all"
    />
  )

  const renderShortAnswer = () => (
    <div className="relative">
      <input
        type="text"
        value={answer?.text || ''}
        onChange={(e) => setAnswer(question.id, { text: e.target.value })}
        placeholder="Ketik jawaban singkat Anda..."
        className="w-full py-4 px-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#10B981]/50 focus:bg-white/[0.05] transition-all"
      />
      {answer?.text && answer.text.length > 0 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Soal {currentIndex + 1}</span>
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/40">{questions.length}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/30 font-medium ml-2">
            {question.points} poin
          </span>
        </div>
        <button
          onClick={() => toggleFlag(question.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
            isFlagged
              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
          }`}
        >
          <Flag className={`w-3 h-3 ${isFlagged ? 'fill-[#F59E0B]' : ''}`} />
          {isFlagged ? 'Ditandai' : 'Tandai'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-white/90 leading-relaxed">
            {content.prompt || 'Teks soal tidak tersedia'}
          </h2>
          {question.skill && (
            <p className="text-xs text-white/30 mt-2">{question.skill}</p>
          )}
        </div>

        <div>
          {question.type === 'MCQ' && renderMCQ()}
          {question.type === 'ESSAY' && renderEssay()}
          {(question.type === 'SHORT_ANSWER' || question.type === 'SHORT_ANSWER') && renderShortAnswer()}
          {question.type === 'AUDIO_RESPONSE' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <p className="text-white/60 text-sm mb-4">Rekam respons lisan Anda</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#10B981]/90 transition-colors shadow-lg shadow-[#10B981]/20">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                Mulai Rekam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
