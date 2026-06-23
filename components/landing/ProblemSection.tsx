'use client'

import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function ProblemSection() {
  const { t } = useI18n()
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.problemBadge')}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            {t('landing.problemTitle')}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            {t('landing.problemDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-red-100 premium-shadow-md">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B3D91] mb-3">{t('landing.problemTitle2')}</h3>
            <ul className="text-muted-foreground text-xs leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                {t('landing.problemList.0')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                {t('landing.problemList.1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                {t('landing.problemList.2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                {t('landing.problemList.3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                {t('landing.problemList.4')}
              </li>
            </ul>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-amber-100 premium-shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B3D91] mb-3">{t('landing.problemSolution')}</h3>
            <ul className="text-muted-foreground text-xs leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                {t('landing.solutionList.0')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                {t('landing.solutionList.1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                {t('landing.solutionList.2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                {t('landing.solutionList.3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                {t('landing.solutionList.4')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
