'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTestStore } from '@/store/testStore'
import { ShieldCheck, Maximize2, Minimize2, Flag, Clock, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import Logo from '@/components/brand/Logo'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function TimerRing({ remaining, total }: { remaining: number; total: number }) {
  const size = 52
  const stroke = 3
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? remaining / total : 1
  const offset = circumference * (1 - progress)
  const isWarning = remaining < 300
  const isCritical = remaining < 60
  const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'

  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-linear"
      />
    </svg>
  )
}

export default function TestHeader() {
  const { t } = useI18n()
  const {
    sessionId,
    questions,
    currentIndex,
    timeRemaining,
    totalTime,
    isFullscreen,
    setFullscreen,
    finishTest,
    getAnsweredCount,
  } = useTestStore()

  const currentQuestion = questions[currentIndex]
  const answeredCount = getAnsweredCount()
  const totalCount = questions.length
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setFullscreen(false)
    }
  }, [setFullscreen])

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [setFullscreen])

  const isWarning = timeRemaining < 300 && timeRemaining >= 60
  const isCritical = timeRemaining < 60

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A1428]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="h-full max-w-screen-2xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Logo variant="mark" className="h-7 w-7 opacity-80" />
            </div>
          <div className="hidden md:block w-px h-6 bg-white/[0.08]" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-white/40">{t('testRunner.adaptiveTest')}</span>
            {currentQuestion && (
              <>
                <span className="text-white/20 mx-1">•</span>
                <span className="text-xs font-medium text-white/60">{currentQuestion.dimension}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/40 font-medium">{currentQuestion.level}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2">
              <TimerRing remaining={timeRemaining} total={totalTime} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[11px] font-bold tabular-nums ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/80'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              {isWarning && <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />}
              <span className={`text-[10px] font-medium ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/30'}`}>
                {isCritical ? t('testRunner.almostDone') : isWarning ? t('testRunner.minutes', { n: Math.ceil(timeRemaining / 60) }) : t('testRunner.remaining')}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white/80">{answeredCount}</span>
              <span className="text-xs text-white/30">/ {totalCount}</span>
            </div>
            <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-white/40" /> : <Maximize2 className="w-3.5 h-3.5 text-white/40" />}
            </button>

            <button
              onClick={() => {
                if (confirm(t('testRunner.confirmEndSession'))) {
                  finishTest()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400/70 hover:text-red-400 transition-colors text-xs font-medium"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('common.end')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
