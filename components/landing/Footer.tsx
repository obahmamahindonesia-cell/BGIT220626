'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-[#0B1F3A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo_BIGT.png" alt="BIGT Logo" width={200} height={64} className="h-10 w-auto brightness-0 invert opacity-90" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{t('footer.description')}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">{t('footer.platform')}</h3>
            <ul className="space-y-2">
              <li><Link href="/framework" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.frameworkAksi')}</Link></li>
              <li><Link href="/levels" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.cefrLevel')}</Link></li>
              <li><Link href="/products" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.testProducts')}</Link></li>
              <li><Link href="/verify" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.certVerify')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/50 hover:text-white text-sm transition-colors">{t('footer.aboutBigt')}</Link></li>
              <li><Link href="/partnership" className="text-white/50 hover:text-white text-sm transition-colors">{t('nav.partnership')}</Link></li>
              <li><Link href="/waitlist" className="text-white/50 hover:text-white text-sm transition-colors">{t('nav.joinWaitlist')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li className="text-white/50 text-sm">info@bahasacerdas.site</li>
              <li className="text-white/50 text-sm">Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
