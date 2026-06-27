'use client'

import { useState, useEffect, useRef } from 'react'
import { useTestStore } from '@/store/testStore'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  questionId: string
  prompt: string
  instruction: string
  constraints?: {
    minWords?: number
    maxWords?: number
  }
  stimulus?: {
    type: string
    text?: string
    imageUrl?: string
    audioUrl?: string
  } | null
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function ConstructedWriting({ questionId, prompt, instruction, constraints, stimulus }: Props) {
  const { answers, setAnswer, saveStatus } = useTestStore()
  const answer = answers[questionId]
  const text = answer?.text || ''
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const maxRatio = constraints?.maxWords ? wordCount / constraints.maxWords : 0
  const isOverLimit = !!constraints?.maxWords && wordCount > constraints.maxWords
  const isUnderMin = text.trim().length > 0 && !!constraints?.minWords && wordCount < constraints.minWords

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(questionId, { text: e.target.value })
  }

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500'
    if (maxRatio > 0.85) return 'bg-yellow-400'
    return 'bg-[#10B981]'
  }

  return (
    <div className="space-y-5">
      {/* Stimulus */}
      {stimulus?.text && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{stimulus.text}</p>
        </div>
      )}
      {stimulus?.imageUrl && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <img src={stimulus.imageUrl} alt="Stimulus gambar" className="w-full max-h-64 object-contain rounded-lg" />
        </div>
      )}
      {stimulus?.audioUrl && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <audio controls src={stimulus.audioUrl} className="w-full h-9 rounded-lg" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
            Browser tidak mendukung pemutar audio.
          </audio>
        </div>
      )}

      {/* Prompt */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-white/90 leading-relaxed">{prompt}</h2>
        {instruction && (
          <p className="text-xs text-white/40 mt-2 italic">{instruction}</p>
        )}
      </div>

      {/* Constraints hint */}
      {constraints && (
        <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
          {constraints.minWords && <span>Minimal {constraints.minWords} kata</span>}
          {constraints.maxWords && <span>Maksimal {constraints.maxWords} kata</span>}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Tulis jawabanmu di bawah ini. Gunakan kalimat sederhana."
          className={`w-full min-h-[280px] p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm leading-relaxed placeholder:text-white/20 resize-y focus:outline-none transition-all
            ${isFocused ? 'border-[#10B981]/50 bg-white/[0.05]' : ''}
            ${isOverLimit ? '!border-red-500/50' : ''}`}
        />

        {/* Word counter bar */}
        {constraints?.maxWords && (
          <div className="absolute bottom-12 left-3 right-3">
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(maxRatio * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Word count + save status */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus.state === 'saving' && (
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan
              </span>
            )}
            {saveStatus.state === 'saved' && (
              <span className="flex items-center gap-1 text-[#10B981]">
                <CheckCircle2 className="w-3 h-3" />
                Tersimpan
              </span>
            )}
            {saveStatus.state === 'error' && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-3 h-3" />
                Gagal Simpan
              </span>
            )}
          </div>
          <div className={`text-xs ${isOverLimit ? 'text-red-400 font-medium' : 'text-white/40'}`}>
            {wordCount} kata
            {constraints?.maxWords && <span> / {constraints.maxWords}</span>}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {isOverLimit && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">
            Jawaban terlalu panjang. Maksimal {constraints!.maxWords} kata. Kurangi hingga {constraints!.maxWords} kata atau kurang.
          </p>
        </div>
      )}

      {isUnderMin && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Jawaban masih terlalu pendek. Minimal {constraints!.minWords} kata agar dapat dinilai dengan baik.
          </p>
        </div>
      )}

      {/* Submitted confirmation - shown via saveStatus */}
      {saveStatus.state === 'saved' && text.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <p className="text-xs text-[#10B981]">Jawaban tersimpan secara otomatis.</p>
        </div>
      )}
    </div>
  )
}
