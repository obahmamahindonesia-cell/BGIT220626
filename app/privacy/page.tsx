'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

export default function PrivacyPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <PageMeta title={t('footer.privacy')} />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A] mb-8">
          {t('footer.privacy')}
        </h1>
        <div className="prose prose-sm max-w-none text-[#64748B] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">1. Informasi yang Dikumpulkan</h2>
            <p className="leading-relaxed">
              Kami mengumpulkan informasi yang Anda berikan saat pendaftaran, termasuk nama, email, usia, dan data hasil tes.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">2. Penggunaan Informasi</h2>
            <p className="leading-relaxed">
              Informasi Anda digunakan untuk menyediakan layanan tes, menganalisis hasil, dan meningkatkan kualitas platform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">3. Perlindungan Data</h2>
            <p className="leading-relaxed">
              Kami menggunakan enkripsi dan protokol keamanan standar industri untuk melindungi data Anda.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">4. Hak Anda</h2>
            <p className="leading-relaxed">
              Anda berhak mengakses, mengoreksi, atau menghapus data pribadi Anda kapan saja melalui pengaturan akun.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
