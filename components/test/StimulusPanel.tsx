'use client'

import { useTestStore } from '@/store/testStore'
import { Headphones, BookOpen, FileText, Image } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function StimulusPanel() {
  const { t } = useI18n()
  const question = useTestStore((s) => s.questions[s.currentIndex])

  if (!question) return null

  const content = question.content
  const dimension = question.dimension
  const hasAudio = content?.audioUrl
  const hasImage = content?.imageUrl
  const hasPassage = content?.passage

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
          {dimension === 'LISTENING' || dimension === 'SPEAKING' ? (
            <Headphones className="w-3 h-3 text-white/50" />
          ) : dimension === 'READING' ? (
            <BookOpen className="w-3 h-3 text-white/50" />
          ) : (
            <FileText className="w-3 h-3 text-white/50" />
          )}
        </div>
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{t('testRunner.stimulus')}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {hasPassage && (
          <div className="prose prose-sm prose-invert max-w-none">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{content.passage}</p>
            </div>
          </div>
        )}

        {hasAudio && (
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#10B981]/[0.06] to-white/[0.02] border border-[#10B981]/[0.1]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70">{t('testRunner.audioStimulus')}</p>
                <p className="text-[10px] text-white/30">{t('testRunner.audioHint')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <button className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center hover:bg-[#10B981]/90 transition-colors flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
              </button>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="w-0 h-full rounded-full bg-[#10B981] transition-all" />
                </div>
              </div>
              <span className="text-[10px] text-white/30 tabular-nums">0:00 / 0:45</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-white/[0.06]"
                  style={{
                    height: `${Math.max(4, Math.sin(i * 1.2) * 12 + 14)}px`,
                    opacity: 0.3 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {hasImage && (
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-white/30" />
              <span className="text-[10px] text-white/30">{t('testRunner.image')}</span>
            </div>
            <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.02] flex items-center justify-center border border-white/[0.06]">
              <Image className="w-10 h-10 text-white/10" />
            </div>
          </div>
        )}

        {!hasPassage && !hasAudio && !hasImage && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/20 text-sm">{t('testRunner.noStimulus')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
