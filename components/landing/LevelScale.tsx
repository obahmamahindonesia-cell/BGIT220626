'use client'

import { BarChart3, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function LevelScale() {
  const { t } = useI18n()
  return (
    <section id="level" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            {t('landing.levelBadge')}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            {t('landing.levelTitle')}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            {t('landing.levelDesc')}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVELS.map((code) => (
            <div
              key={code}
              className="text-center p-5 rounded-2xl border border-gray-100 bg-white premium-shadow-md card-hover"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-3 text-[#0B3D91] bg-[#0B3D91]/10">
                {code}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                {t(`landing.levels.${code}`)}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed hidden md:block">
                {t(`landing.levels.${code}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
