'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import Logo from '@/components/brand/Logo'

const LEVELS = [
  { code: 'A1', color: '#64748B', label: 'Pemula' },
  { code: 'A2', color: '#64748B', label: 'Dasar' },
  { code: 'B1', color: '#0B1F3A', label: 'Madya' },
  { code: 'B2', color: '#123E7C', label: 'Madya Atas' },
  { code: 'C1', color: '#D7193F', label: 'Mahir' },
  { code: 'C2', color: '#C9A227', label: 'Sangat Mahir' },
]

export default function Hero() {
  const { t } = useI18n()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(prev => (prev + 1) % (LEVELS.length + 1)), 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white pt-28 pb-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 left-10 w-72 h-72 border border-white/20 rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex justify-center">
          <Logo variant="full" invert className="h-28 md:h-36" priority />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          {t('landing.badge')}
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 whitespace-pre-line">
          {t('landing.heroTitle')}<span className="text-[#C9A227]">.</span>
        </h1>

        <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('landing.heroDesc')}
        </p>

        <div className="flex items-center justify-center gap-2 max-w-lg mx-auto mb-8">
          {LEVELS.map((level, i) => (
            <div key={level.code} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full transition-all duration-300"
                style={{ background: level.color, opacity: i <= activeStep ? 1 : 0.2 }} />
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${i <= activeStep ? 'text-white/90' : 'text-white/30'}`}>
                {level.code}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register">
            <Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold shadow-lg shadow-[#D7193F]/25 rounded-lg">
              {t('landing.heroCta')}
            </Button>
          </Link>
          <Link href="/framework">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">
              {t('landing.heroFramework')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
