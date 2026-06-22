'use client'

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const BENEFITS = [
  {
    title: 'Branding Bersama',
    desc: 'Sertifikat dan laporan dengan co-branding institusi Anda alongside BGIT — meningkatkan kredibilitas dan pengakuan.',
  },
  {
    title: 'Dashboard Institusi',
    desc: 'Akses dashboard khusus untuk memantau hasil peserta, analisis statistik, dan laporan agregat secara real-time.',
  },
  {
    title: 'Harga Institusional',
    desc: 'Skema harga khusus untuk volume besar dengan fleksibilitas pembayaran dan penjadwalan tes massal.',
  },
  {
    title: 'Dukungan Teknis Prioritas',
    desc: 'Tim dukungan khusus untuk partner institusi — termasuk bantuan setup, troubleshooting, dan pelatihan staf.',
  },
  {
    title: 'Kustomisasi Asesmen',
    desc: 'Kemampuan untuk menyesuaikan konteks soal dan register sesuai kebutuhan spesifik institusi Anda.',
  },
  {
    title: 'Integrasi API',
    desc: 'API terdokumentasi untuk integrasi langsung dengan sistem manajemen akademik atau HR Anda.',
  },
]

const INTEGRATIONS = [
  {
    name: 'LMS Integration',
    desc: 'Integrasikan BGIT dengan Learning Management System Anda melalui API standar (LTI, REST).',
  },
  {
    name: 'SSO & Authentication',
    desc: 'Single Sign-On dengan sistem autentikasi institusi — SAML, OAuth 2.0, atau LDAP.',
  },
  {
    name: 'Data Sync',
    desc: 'Sinkronisasi data peserta dan hasil tes secara otomatis dengan database institusi.',
  },
  {
    name: 'Webhook & Callbacks',
    desc: 'Notifikasi real-time saat tes selesai, sertifikat terbit, atau event penting lainnya.',
  },
]

const TARGET_INSTITUTIONS = [
  {
    name: 'Universitas',
    desc: 'Asesmen masuk, penempatan kelas bahasa, dan syarat kelulusan.',
  },
  {
    name: 'Pusat Bahasa',
    desc: 'Evaluasi dan sertifikasi peserta program bahasa Indonesia.',
  },
  {
    name: 'Pemerintah',
    desc: 'Standarisasi kompetensi bahasa untuk pegawai negeri dan diplomat.',
  },
  {
    name: 'Korporasi',
    desc: 'Evaluasi kemampuan bahasa karyawan asing dan rekrutmen.',
  },
]

export default function PartnershipPage() {
  const [formData, setFormData] = useState({
    institution: '',
    contactName: '',
    email: '',
    type: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      <Navbar />

      <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            Kemitraan
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Bermitra dengan <span className="text-[#C9A84C]">BGIT</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Integrasikan standar asesmen bahasa Indonesia terbaik ke dalam ekosistem institusi Anda. Bangun kredibilitas bersama BGIT.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Institusi Target
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
            Untuk siapa kemitraan ini
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARGET_INSTITUTIONS.map((inst) => (
              <div
                key={inst.name}
                className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-5 text-center"
              >
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{inst.name}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{inst.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Manfaat Kemitraan
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
            Mengapa bermitra dengan BGIT
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{b.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Integrasi Teknis
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
            Opsi integrasi
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {INTEGRATIONS.map((int) => (
              <div
                key={int.name}
                className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-6"
              >
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{int.name}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2 text-center">
            Hubungi Kami
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight text-center">
            Mulai percakapan
          </h2>

          {submitted ? (
            <div className="bg-white border-2 border-green-200 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl font-bold">&#10003;</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0B1F3A] mb-2">Terima kasih</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Tim kemitraan BGIT akan menghubungi Anda dalam 2 hari kerja. Kami menantikan kolaborasi bersama institusi Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                    Nama Institusi
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Nama universitas, perusahaan, atau organisasi"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                      Nama Kontak
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Nama lengkap"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@institusi.ac.id"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                    Tipe Institusi
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                  >
                    <option value="">Pilih tipe institusi</option>
                    <option value="universitas">Universitas</option>
                    <option value="pusat-bahasa">Pusat Bahasa</option>
                    <option value="pemerintah">Pemerintah</option>
                    <option value="korporasi">Korporasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                    Pesan
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ceritakan kebutuhan asesmen institusi Anda..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#C8102E] hover:bg-red-800 text-white py-3 text-sm font-semibold"
                >
                  Kirim Permintaan Kemitraan
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
