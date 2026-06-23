'use client'

import { Sparkles, Crosshair, BarChart3, Award } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const FEATURES = [
  {
    icon: Sparkles,
    titleKey: 'aiScoring',
    descKey: 'aiScoringDesc',
    color: '#0B3D91',
    bg: 'bg-[#0B3D91]/5',
  },
  {
    icon: Crosshair,
    titleKey: 'adaptiveTesting',
    descKey: 'adaptiveTestingDesc',
    color: '#E11D48',
    bg: 'bg-[#E11D48]/5',
  },
  {
    icon: BarChart3,
    titleKey: 'diagnosticReport',
    descKey: 'diagnosticReportDesc',
    color: '#D4AF37',
    bg: 'bg-[#D4AF37]/10',
  },
  {
    icon: Award,
    titleKey: 'digitalCert',
    descKey: 'digitalCertDesc',
    color: '#0B3D91',
    bg: 'bg-[#0B3D91]/5',
  },
]

export default function FeaturesSection() {
  const { t } = useI18n()
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.featuresBadge')}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] leading-tight">
            {t('landing.featuresTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div key={feat.titleKey} className="flex gap-5 p-6 bg-white border border-gray-100 rounded-2xl premium-shadow-md card-hover">
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0B3D91] mb-1.5">{t(`landing.features.${feat.titleKey}`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`landing.features.${feat.descKey}`)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
