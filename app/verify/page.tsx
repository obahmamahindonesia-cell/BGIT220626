'use client'

import { useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface VerifyResult {
  found: boolean
  name?: string
  level?: string
  product?: string
  date?: string
  certificateId?: string
}

export default function VerifyPage() {
  const [certId, setCertId] = useState('')
  const [name, setName] = useState('')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = () => {
    if (!certId.trim() || !name.trim()) return
    setLoading(true)
    setTimeout(() => {
      if (certId.trim().toUpperCase() === 'BGIT-2026-001234' && name.trim().toLowerCase().includes('sari')) {
        setResult({
          found: true,
          name: 'Sari Dewi Anggraini',
          level: 'B2 — Madya Atas',
          product: 'BGIT Academic',
          date: '15 Mei 2026',
          certificateId: 'BGIT-2026-001234',
        })
      } else {
        setResult({ found: false })
      }
      setLoading(false)
    }, 1200)
  }

  return (
    <main>
      <Navbar />

      <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            Verifikasi Sertifikat
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Verifikasi <span className="text-[#C9A84C]">keaslian</span> sertifikat
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Pastikan sertifikat BGIT yang Anda terima adalah asli dan valid. Layanan verifikasi ini terbuka untuk umum.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B1F3A] mb-6">
              Masukkan data sertifikat
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                  ID Sertifikat
                </label>
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="Contoh: BGIT-2026-001234"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B1F3A] mb-1.5">
                  Nama Peserta
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap sesuai sertifikat"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-[#F8F6F1] text-[#0B1F3A] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-all"
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={!certId.trim() || !name.trim() || loading}
                className="w-full bg-[#C8102E] hover:bg-red-800 text-white py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi Sertifikat'}
              </Button>
            </div>

            {result && (
              <div className="mt-6">
                {result.found ? (
                  <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">&#10003;</span>
                      </div>
                      <span className="text-sm font-semibold text-green-800">Sertifikat Terverifikasi</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Nama</span>
                        <span className="text-[#0B1F3A] font-medium">{result.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Level</span>
                        <span className="text-[#0B1F3A] font-medium">{result.level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Produk</span>
                        <span className="text-[#0B1F3A] font-medium">{result.product}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Tanggal Terbit</span>
                        <span className="text-[#0B1F3A] font-medium">{result.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">ID Sertifikat</span>
                        <span className="text-[#0B1F3A] font-medium font-mono text-xs">{result.certificateId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-red-200 bg-red-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">&#10007;</span>
                      </div>
                      <span className="text-sm font-semibold text-red-800">Sertifikat Tidak Ditemukan</span>
                    </div>
                    <p className="text-xs text-red-600/80 leading-relaxed">
                      Data yang Anda masukkan tidak cocok dengan catatan kami. Pastikan ID sertifikat dan nama peserta sudah benar. Jika masalah berlanjut, hubungi peserta atau institusi penerbit.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#6B7280]">
              Demo: gunakan ID <span className="font-mono text-[#0B1F3A]">BGIT-2026-001234</span> dan nama <span className="text-[#0B1F3A]">Sari</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Sistem Verifikasi
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
            Dua cara verifikasi keaslian
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#0B1F3A] flex items-center justify-center mb-4">
                <span className="text-[#C9A84C] text-sm font-bold">QR</span>
              </div>
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">Verifikasi QR Code</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Setiap sertifikat BGIT dilengkapi QR code unik. Pindai dengan kamera ponsel untuk langsung mengakses halaman verifikasi dan melihat detail sertifikat secara instan.
              </p>
            </div>
            <div className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-[#0B1F3A] flex items-center justify-center mb-4">
                <span className="text-[#C9A84C] text-sm font-bold">ID</span>
              </div>
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">Verifikasi Manual</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Masukkan ID sertifikat dan nama peserta pada formulir di atas. Sistem akan mencocokkan data dengan basis data resmi BGIT dan menampilkan status verifikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#F8F6F1]">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Verifikasi Publik
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
            Transparansi untuk semua pihak
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Layanan verifikasi BGIT terbuka untuk umum tanpa perlu akun. Institusi pendidikan, pemberi kerja, dan pihak ketiga dapat memverifikasi keaslian sertifikat kapan saja. Data yang ditampilkan terbatas pada informasi yang diperlukan untuk verifikasi — menjaga privasi peserta sambil memastikan integritas sertifikat.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
