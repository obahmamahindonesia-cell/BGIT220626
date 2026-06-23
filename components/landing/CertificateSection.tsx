'use client'

import { ShieldCheck, QrCode, Award, ExternalLink, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function CertificateSection() {
  const { t } = useI18n()
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t('landing.certBadge')}
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
              {t('landing.certTitle')}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t('landing.certDesc')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5 text-green-600" />
                </div>
                {t('landing.certFeatures.0')}
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                </div>
                {t('landing.certFeatures.1')}
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-green-600" />
                </div>
                {t('landing.certFeatures.2')}
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                  <ExternalLink className="w-3.5 h-3.5 text-green-600" />
                </div>
                {t('landing.certFeatures.3')}
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#0B3D91] to-[#1a4a8a] rounded-2xl p-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4">
              <div className="text-[#D4AF37] font-[family-name:var(--font-playfair)] text-lg font-bold mb-2">BIGT</div>
              <div className="text-white/80 text-sm mb-1">Certificate of Proficiency</div>
              <div className="text-white/50 text-xs mb-4">Bahasa Indonesia Global Test</div>
              <div className="bg-[#D4AF37] text-[#0B3D91] text-3xl font-bold py-3 px-8 rounded-lg mb-3 inline-block">B2</div>
              <div className="text-white/60 text-xs">{t('landing.certPreviewLevel')}</div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <QrCode className="w-5 h-5 text-white/60" />
              <span className="text-white/50 text-xs">{t('landing.certPreviewScan')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
