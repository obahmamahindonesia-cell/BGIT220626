'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Sparkles } from 'lucide-react'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

const LEVEL_KEYS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function LevelsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <PageMeta title="Level BIGT A1–C2" description="Kenali level kemahiran BIGT dari A1 Pemula hingga C2 Sangat Mahir, lengkap dengan deskripsi kemampuan nyata." />
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <BarChart3 className="w-3.5 h-3.5" /> {t('levels.heroBadge')}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">{t('levels.heroTitle')}</h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{t('levels.heroDesc')}</p>
        </div>
      </section>
      <section className="py-6 px-6 max-w-4xl mx-auto">
        <div className="flex gap-2">
          {LEVEL_KEYS.map((code, i) => (
            <div key={code} className="flex-1 text-center p-3 rounded-lg border border-[#E5EAF2] bg-white premium-shadow-sm">
              <div className="text-base font-bold font-[family-name:var(--font-playfair)]">{code}</div>
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">{t('levels.items.' + i + '.name')}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-4">
        {LEVEL_KEYS.map((code, levelIndex) => (
          <div key={code} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#0B1F3A]/10">
                <span className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[#0B1F3A]">{code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#0B1F3A] mb-1">{t('levels.items.' + levelIndex + '.name')}</h2>
                <p className="text-sm text-[#64748B] leading-relaxed mb-3">{t('levels.items.' + levelIndex + '.desc')}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[0, 1, 2, 3, 4].map(abilityIndex => (
                    <div key={abilityIndex} className="flex gap-2 text-xs text-[#64748B] leading-relaxed">
                      <span className="mt-0.5 font-bold shrink-0 text-[#64748B]">—</span>{t('levels.items.' + levelIndex + '.abilities.' + abilityIndex)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">{t('levels.ctaTitle')}</h2>
          <p className="text-white/50 text-sm mb-8">{t('levels.ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register"><Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold rounded-lg">{t('levels.ctaTest')}</Button></Link>
            <Link href="/products"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">{t('levels.ctaProducts')}</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
