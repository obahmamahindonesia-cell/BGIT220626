'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

export default function TermsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <PageMeta title={t('footer.terms')} />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A] mb-8">
          {t('footer.terms')}
        </h1>
        <div className="prose prose-sm max-w-none text-[#64748B] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">1. Ketentuan Umum</h2>
            <p className="leading-relaxed">
              Dengan menggunakan layanan BIGT (Bahasa Indonesia Global Test), Anda menyetujui syarat dan ketentuan berikut. Jika tidak setuju, jangan gunakan layanan kami.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">2. Akun Pengguna</h2>
            <p className="leading-relaxed">
              Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi. Segala aktivitas yang terjadi dalam akun Anda adalah tanggung jawab Anda.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">3. Hasil Tes</h2>
            <p className="leading-relaxed">
              Hasil tes bersifat indikatif dan tidak mengikat secara hukum. BIGT berhak meninjau dan memvalidasi hasil tes secara berkala.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#0B1F3A] mb-3">4. Perubahan Layanan</h2>
            <p className="leading-relaxed">
              BIGT dapat mengubah atau menghentikan layanan kapan saja dengan pemberitahuan sebelumnya.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
