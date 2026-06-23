'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

const PRODUCT_INDICES = [0, 1, 2, 3, 4]

export default function ProductsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <PageMeta title="Produk Tes BIGT" description="Pilih produk tes BIGT untuk kebutuhan akademik, profesional, penempatan, dan latihan kemahiran Bahasa Indonesia." />
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {t('products.heroBadge')}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">{t('products.heroTitle')}</h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{t('products.heroDesc')}</p>
        </div>
      </section>
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-4">
        {PRODUCT_INDICES.map(i => (
          <div key={i} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 card-hover">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-base font-semibold text-[#0B1F3A]">{t('products.items.' + i + '.name')}</h2>
                  <span className="bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">{t('products.items.' + i + '.tag')}</span>
                </div>
                <p className="text-sm text-[#64748B] leading-relaxed mb-3">{t('products.items.' + i + '.desc')}</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-3">
                  {[0, 1, 2, 3].map(j => (
                    <div key={j} className="flex gap-2 text-xs text-[#64748B]"><span className="text-[#D7193F] mt-0.5 font-bold shrink-0">—</span>{t('products.items.' + i + '.useCases.' + j)}</div>
                  ))}
                </div>
              </div>
              <div className="md:w-44 shrink-0 space-y-2">
                <div className="bg-[#F7F9FC] rounded-lg p-3"><div className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-0.5">{t('products.labelTarget')}</div><div className="text-xs text-[#0B1F3A] font-medium">{t('products.items.' + i + '.audience')}</div></div>
                <div className="bg-[#F7F9FC] rounded-lg p-3"><div className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-0.5">{t('products.labelDuration')}</div><div className="text-xs text-[#0B1F3A] font-medium">{t('products.items.' + i + '.duration')}</div></div>
                <div className="bg-[#F7F9FC] rounded-lg p-3"><div className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium mb-0.5">{t('products.labelLevel')}</div><div className="text-xs text-[#0B1F3A] font-medium">{t('products.items.' + i + '.level')}</div></div>
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">{t('products.ctaTitle')}</h2>
          <p className="text-white/50 text-sm mb-8">{t('products.ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register"><Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold rounded-lg">{t('products.ctaRegister')}</Button></Link>
            <Link href="/partnership"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">{t('products.ctaPartnership')}</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
