'use client'

import { useTestStore } from '@/store/testStore'
import { Flag } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function QuestionRenderer() {
  const { t } = useI18n()
  const {
    questions,
    currentIndex,
    answers,
    setAnswer,
    toggleFlag,
    flaggedQuestions,
    saveStatus,
  } = useTestStore()

  const question = questions[currentIndex]
  if (!question) return null

  const answer = answers[question.id]
  const isFlagged = flaggedQuestions.has(question.id)
  const content = question.content || {}

  const renderSaveStatus = () => {
    if (saveStatus.state === 'idle') return null
    const colors: Record<string, string> = {
      saving: 'text-[#F59E0B]',
      saved: 'text-[#10B981]',
      error: 'text-red-400',
    }
    const icons: Record<string, string> = {
      saving: 'M12 4v4m0 0v4m0-4h4m-4 0H8',
      saved: 'M5 13l4 4L19 7',
      error: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    }
    return (
      <div className={`flex items-center gap-1.5 text-[10px] ${colors[saveStatus.state]} transition-opacity`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[saveStatus.state]} />
        </svg>
        {saveStatus.message}
      </div>
    )
  }

  const renderMCQ = () => (
    <div className="space-y-3">
      {content.options?.map((option, i) => {
        const label = option.label || OPTION_LABELS[i] || String(i + 1)
        const isSelected = answer?.selectedOption === label
        return (
          <button
            key={label}
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
              {option.text}
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

  const renderShortAnswer = () => (
    <div className="relative">
      <input
        type="text"
        value={answer?.text || ''}
        onChange={(e) => setAnswer(question.id, { text: e.target.value })}
        placeholder={t('testRunner.shortPlaceholder')}
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

  const renderEssay = () => (
    <textarea
      value={answer?.text || ''}
      onChange={(e) => setAnswer(question.id, { text: e.target.value })}
      placeholder={t('testRunner.essayPlaceholder')}
      className="w-full min-h-[240px] p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm leading-relaxed placeholder:text-white/20 resize-y focus:outline-none focus:border-[#10B981]/50 focus:bg-white/[0.05] transition-all"
    />
  )

  const renderSpeaking = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
      <p className="text-white/60 text-sm mb-4">{t('testRunner.recordResponse')}</p>
      <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#10B981]/90 transition-colors shadow-lg shadow-[#10B981]/20">
        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        {t('testRunner.startRecording')}
      </button>
    </div>
  )

  const renderPromptArea = () => (
    <div className="space-y-4">
      {content.stimulus?.type === 'AUDIO' && content.stimulus?.content && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] lg:hidden">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Audio Listening</span>
          </div>
          <audio controls src={content.stimulus.content} className="w-full h-9 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
            Browser tidak mendukung pemutar audio.
          </audio>
        </div>
      )}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-white/90 leading-relaxed">
          {content.prompt || t('testRunner.noQuestionText')}
        </h2>
        {content.instruction && (
          <p className="text-xs text-white/40 mt-2 italic">{content.instruction}</p>
        )}
        {question.skill && (
          <p className="text-xs text-white/30 mt-2">{question.skill}</p>
        )}
      </div>
    </div>
  )

  const renderQuestionArea = () => {
    const qType = content.questionType || question.type
    switch (qType) {
      case 'MCQ':
        return renderMCQ()
      case 'SHORT_ANSWER':
        return renderShortAnswer()
      case 'ESSAY':
        return renderEssay()
      case 'AUDIO_RESPONSE':
        return renderSpeaking()
      default:
        return renderMCQ()
    }
  }

  const hasStimulus = content.stimulus?.content || content.stimulus?.title

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            Soal {currentIndex + 1}
          </span>
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/40">{questions.length}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/30 font-medium ml-2">
            {question.points} poin
          </span>
          {question.level && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/30 font-medium">
              {question.level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {renderSaveStatus()}
          <button
            onClick={() => toggleFlag(question.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              isFlagged
                ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
            }`}
          >
            <Flag className={`w-3 h-3 ${isFlagged ? 'fill-[#F59E0B] text-[#F59E0B]' : ''}`} />
            {isFlagged ? t('testRunner.flagged') : 'Tandai Ragu-ragu'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {hasStimulus && (
            <div className="hidden lg:flex lg:w-[35%] border-r border-white/[0.06] bg-white/[0.02] flex-col">
              <div className="px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Stimulus</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {content.stimulus?.type === 'TEXT' && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{content.stimulus.content}</p>
                  </div>
                )}
                {content.stimulus?.type === 'AUDIO' && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#10B981]/[0.06] to-white/[0.02] border border-[#10B981]/[0.1]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/70">{content.stimulus.title || 'Audio'}</p>
                        <p className="text-[10px] text-white/30">Putar audio untuk mendengarkan</p>
                      </div>
                    </div>
                    <audio
                      controls
                      src={content.stimulus.content || ''}
                      className="w-full h-10 rounded-lg"
                      style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                    >
                      Browser tidak mendukung pemutar audio.
                    </audio>
                  </div>
                )}
                {content.stimulus?.type === 'IMAGE' && content.stimulus?.content && (
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.02] flex items-center justify-center border border-white/[0.06]">
                      <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`flex-1 min-w-0 ${hasStimulus ? '' : 'max-w-3xl mx-auto'}`}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {renderPromptArea()}
                <div>
                  {renderQuestionArea()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
