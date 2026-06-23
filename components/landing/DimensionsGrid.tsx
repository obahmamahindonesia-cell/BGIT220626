'use client'

import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const DIMENSIONS = [
  {
    icon: Headphones,
    titleKey: 'LISTENING',
    isNew: false,
    color: '#378ADD',
  },
  {
    icon: BookOpen,
    titleKey: 'READING',
    isNew: false,
    color: '#10B981',
  },
  {
    icon: Mic,
    titleKey: 'SPEAKING',
    isNew: false,
    color: '#F59E0B',
  },
  {
    icon: PenSquare,
    titleKey: 'WRITING',
    isNew: false,
    color: '#8B5CF6',
  },
  {
    icon: RefreshCw,
    titleKey: 'MEDIATION',
    isNew: true,
    color: '#EC4899',
  },
  {
    icon: Puzzle,
    titleKey: 'INTEGRATED',
    isNew: true,
    color: '#06B6D4',
  },
]

export default function DimensionsGrid() {
  const { t } = useI18n()
  return (
    <section id="dimensi" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.dimensionsBadge')}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] leading-tight">
            {t('landing.dimensionsTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIMENSIONS.map((dim) => {
            const Icon = dim.icon
            return (
              <div
                key={dim.titleKey}
                className="relative bg-white border border-gray-100 rounded-2xl p-6 premium-shadow-md card-hover"
              >
                {dim.isNew && (
                  <span className="absolute top-4 right-4 bg-[#D4AF37] text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                    {t('landing.dimensionsNew')}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ backgroundColor: dim.color + '15' }}>
                  <Icon className="w-5 h-5" style={{ color: dim.color }} />
                </div>
                <h3 className="text-sm font-semibold text-[#0B3D91] mb-1.5">{t(`landing.dimensions.${dim.titleKey}`)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(`landing.dimensionDescs.${dim.titleKey}`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
