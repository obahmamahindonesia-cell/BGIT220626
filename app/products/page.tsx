import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const PRODUCTS = [
  {
    name: 'BGIT Academic',
    tag: 'Akademik',
    description: 'Asesmen komprehensif untuk keperluan akademik — masuk universitas, beasiswa, dan penyetaraan ijazah. Mengukur kemampuan bahasa Indonesia dalam konteks akademik tingkat tinggi.',
    audience: 'Calon mahasiswa, pelamar beasiswa, peneliti asing',
    duration: '3 jam 30 menit',
    useCases: [
      'Pendaftaran universitas di Indonesia',
      'Syarat beasiswa pemerintah dan swasta',
      'Penyetaraan kualifikasi akademik',
      'Evaluasi kesiapan studi berbahasa Indonesia',
    ],
    level: 'B1 — C2',
  },
  {
    name: 'BGIT Professional',
    tag: 'Profesional',
    description: 'Asesmen kemahiran bahasa Indonesia untuk dunia kerja. Dirancang untuk mengukur kemampuan komunikatif dalam konteks bisnis, korporat, dan profesional.',
    audience: 'Profesional asing, ekspatriat, pekerja migran',
    duration: '2 jam 45 menit',
    useCases: [
      'Rekrutmen dan seleksi karyawan',
      'Sertifikasi kompetensi profesional',
      'Evaluasi kesiapan kerja di Indonesia',
      'Promosi dan penempatan jabatan',
    ],
    level: 'A2 — C1',
  },
  {
    name: 'BGIT Placement Test',
    tag: 'Penempatan',
    description: 'Tes singkat dan adaptif untuk menentukan level kemahiran bahasa Indonesia secara cepat. Ideal untuk penempatan kelas atau evaluasi awal.',
    audience: 'Lembaga kursus, universitas, pusat bahasa',
    duration: '60 menit',
    useCases: [
      'Penempatan kelas bahasa Indonesia',
      'Evaluasi awal peserta program',
      'Screening cepat untuk institusi',
      'Pemetaan kemampuan peserta secara massal',
    ],
    level: 'A1 — C2',
  },
  {
    name: 'BGIT Young Learners',
    tag: 'Anak & Remaja',
    description: 'Asesmen yang dirancang khusus untuk peserta usia 8-15 tahun. Menggunakan pendekatan yang sesuai usia dengan materi yang menarik dan interaktif.',
    audience: 'Siswa sekolah dasar dan menengah',
    duration: '1 jam 30 menit',
    useCases: [
      'Evaluasi kemampuan bahasa Indonesia siswa internasional',
      'Penempatan di sekolah berbahasa Indonesia',
      'Monitoring perkembangan kemahiran bahasa',
      'Sertifikasi untuk portofolio akademik',
    ],
    level: 'A1 — B2',
  },
  {
    name: 'BGIT Practice Test',
    tag: 'Latihan',
    description: 'Simulasi tes BGIT untuk persiapan dan familiarisasi. Memberikan gambaran akurat tentang format, tingkat kesulitan, dan pengalaman tes sesungguhnya.',
    audience: 'Semua calon peserta BGIT',
    duration: '2 jam',
    useCases: [
      'Persiapan sebelum tes resmi',
      'Familiarisasi dengan format dan tipe soal',
      'Identifikasi area yang perlu ditingkatkan',
      'Evaluasi mandiri secara berkala',
    ],
    level: 'A1 — C2',
  },
]

export default function ProductsPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            Produk Tes
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Tes yang tepat untuk <span className="text-[#C9A84C]">setiap kebutuhan</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Lima produk BGIT dirancang untuk berbagai konteks — dari keperluan akademik hingga profesional, untuk semua usia dan tingkat kemahiran.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-4xl mx-auto space-y-6">
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-lg md:text-xl font-semibold text-[#0B1F3A]">
                      {product.name}
                    </h2>
                    <span className="bg-[#C9A84C]/15 text-[#C9A84C] text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                      {product.tag}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                    {product.useCases.map((uc, i) => (
                      <div key={i} className="flex gap-2 text-xs text-[#6B7280] leading-relaxed">
                        <span className="text-[#C8102E] mt-0.5 font-bold shrink-0">—</span>
                        {uc}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:w-48 shrink-0 space-y-3">
                  <div className="bg-[#F8F6F1] rounded-lg p-3">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Target Peserta</div>
                    <div className="text-xs text-[#0B1F3A] font-medium">{product.audience}</div>
                  </div>
                  <div className="bg-[#F8F6F1] rounded-lg p-3">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Durasi</div>
                    <div className="text-xs text-[#0B1F3A] font-medium">{product.duration}</div>
                  </div>
                  <div className="bg-[#F8F6F1] rounded-lg p-3">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Cakupan Level</div>
                    <div className="text-xs text-[#0B1F3A] font-medium">{product.level}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0B1F3A] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">
            Siap memulai?
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Pilih produk yang sesuai kebutuhan Anda dan mulai perjalanan sertifikasi bahasa Indonesia.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register">
              <Button className="bg-[#C8102E] hover:bg-red-800 text-white px-7 py-3 text-sm font-semibold">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/partnership">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium">
                Kemitraan Institusi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
