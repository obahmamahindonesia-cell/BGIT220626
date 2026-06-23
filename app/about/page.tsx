'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

const TEAM = [
  { roleKey: 'about.team.0.role', descKey: 'about.team.0.desc' },
  { roleKey: 'about.team.1.role', descKey: 'about.team.1.desc' },
  { roleKey: 'about.team.2.role', descKey: 'about.team.2.desc' },
  { roleKey: 'about.team.3.role', descKey: 'about.team.3.desc' },
]

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <PageMeta title="Tentang BIGT" description="Pelajari visi BIGT dalam membangun standar kemahiran Bahasa Indonesia untuk dunia melalui asesmen modern, adaptif, dan berbasis kompetensi nyata." />
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('about.heroBadge')}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t('about.heroTitlePart1')}<span className="text-[#C9A227]"> {t('about.heroTitlePart2')}</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('about.heroDesc')}
          </p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {t('about.whyBadge')}
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-6 leading-tight">{t('about.whyTitle')}</h2>
        <div className="space-y-4 text-[#64748B] text-sm leading-relaxed">
          <p>{t('about.whyParagraphs.0')}</p>
          <p>{t('about.whyParagraphs.1')}</p>
          <p>{t('about.whyParagraphs.2')}</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">{t('about.visiBadge')}</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-semibold text-[#0B1F3A] mb-4">{t('about.visiTitle')}</h3>
            <p className="text-[#64748B] text-sm leading-relaxed">{t('about.visiDesc')}</p>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">{t('about.misiBadge')}</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-semibold text-[#0B1F3A] mb-4">{t('about.misiTitle')}</h3>
            <ul className="space-y-3 text-[#64748B] text-sm leading-relaxed">
              <li className="flex gap-3"><span className="text-[#C9A227] font-bold mt-0.5">—</span>{t('about.misiList.0')}</li>
              <li className="flex gap-3"><span className="text-[#C9A227] font-bold mt-0.5">—</span>{t('about.misiList.1')}</li>
              <li className="flex gap-3"><span className="text-[#C9A227] font-bold mt-0.5">—</span>{t('about.misiList.2')}</li>
              <li className="flex gap-3"><span className="text-[#C9A227] font-bold mt-0.5">—</span>{t('about.misiList.3')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">{t('about.teamBadge')}</div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8">{t('about.teamTitle')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TEAM.map((member) => (
            <div key={member.roleKey} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 card-hover">
              <div className="w-10 h-10 rounded-lg bg-[#0B1F3A] flex items-center justify-center mb-4">
                <span className="text-[#C9A227] text-sm font-bold">{t(member.roleKey).charAt(0)}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{t(member.roleKey)}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{t(member.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">{t('about.ctaTitle')}</h2>
          <p className="text-white/50 text-sm mb-8">{t('about.ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register"><Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold rounded-lg">{t('about.ctaStart')}</Button></Link>
            <Link href="/framework"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">{t('about.ctaFramework')}</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
