'use client'

import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Sparkles } from 'lucide-react'

const LEVELS = [
  { code: 'A1', name: 'Pemula', color: '#64748B', description: 'Mampu menggunakan bahasa Indonesia dalam situasi yang sangat dasar dan terprediksi.', abilities: ['Memperkenalkan diri dan orang lain', 'Memahami dan menggunakan sapaan dasar', 'Mengisi formulir sederhana dengan data pribadi', 'Memahami tanda dan petunjuk visual yang sangat sederhana', 'Bertanya dan menjawab pertanyaan sederhana tentang topik familiar'] },
  { code: 'A2', name: 'Dasar', color: '#64748B', description: 'Mampu berkomunikasi dalam tugas-tugas rutin yang memerlukan pertukaran informasi sederhana dan langsung.', abilities: ['Memahami informasi dalam teks pendek dan sederhana', 'Melakukan transaksi dasar di toko, restoran, atau transportasi', 'Mendeskripsikan latar belakang dan lingkungan sekitar', 'Menulis pesan dan catatan singkat yang sederhana', 'Memahami pengumuman dan instruksi lisan yang jelas'] },
  { code: 'B1', name: 'Madya', color: '#0B1F3A', description: 'Mampu menangani sebagian besar situasi yang muncul saat menggunakan bahasa Indonesia dalam kehidupan sehari-hari.', abilities: ['Memahami poin utama dari berita, artikel, atau siaran yang jelas', 'Menulis teks sederhana yang koheren tentang topik yang diminati', 'Menceritakan pengalaman, peristiwa, harapan, dan ambisi', 'Memberikan alasan dan penjelasan singkat untuk pendapat', 'Berpartisipasi dalam percakapan tentang topik familiar tanpa persiapan'] },
  { code: 'B2', name: 'Madya Atas', color: '#123E7C', description: 'Mampu berinteraksi dengan kelancaran dan spontanitas yang memungkinkan komunikasi reguler dengan penutur asli.', abilities: ['Memahami gagasan utama dari teks kompleks dan diskusi teknis', 'Berpartisipasi aktif dalam diskusi tentang isu-isu terkini', 'Menulis esai atau laporan yang jelas dan terperinci', 'Memberikan presentasi yang terstruktur tentang topik yang kompleks', 'Memahami humor, idiom, dan ekspresi kultural yang umum'] },
  { code: 'C1', name: 'Mahir', color: '#D7193F', description: 'Mampu menggunakan bahasa Indonesia secara fleksibel dan efektif untuk tujuan sosial, akademik, dan profesional.', abilities: ['Memahami teks panjang dan menantang dengan makna implisit', 'Mengekspresikan gagasan secara lancar tanpa banyak mencari ungkapan', 'Menulis teks terstruktur tentang subjek kompleks dengan gaya yang sesuai', 'Menggunakan bahasa secara efektif dalam konteks profesional dan akademik', 'Memahami dan memproduksi teks dengan register yang berbeda'] },
  { code: 'C2', name: 'Sangat Mahir', color: '#C9A227', description: 'Mampu memahami dan menggunakan bahasa Indonesia dengan tingkat ketepatan dan kelancaran yang setara dengan penutur asli terdidik.', abilities: ['Memahami hampir semua yang didengar atau dibaca dengan mudah', 'Meringkas dan mensintesis informasi dari berbagai sumber secara koheren', 'Membedakan nuansa makna yang halus dalam situasi kompleks', 'Mengekspresikan diri secara spontan dengan presisi tinggi', 'Menghasilkan teks akademik, sastra, atau profesional tingkat tinggi'] },
]

export default function LevelsPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <BarChart3 className="w-3.5 h-3.5" /> Level Kemahiran
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">Enam level, satu <span className="text-[#C9A227]">standar global</span></h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">Setiap level BIGT dipetakan ke CEFR dengan deskriptor can-do yang jelas.</p>
        </div>
      </section>
      <section className="py-6 px-6 max-w-4xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map(level => (
            <div key={level.code} className="flex-1 text-center p-3 rounded-lg border border-[#E5EAF2] bg-white premium-shadow-sm">
              <div className="text-base font-bold font-[family-name:var(--font-playfair)]" style={{ color: level.color }}>{level.code}</div>
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">{level.name}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-4">
        {LEVELS.map(level => (
          <div key={level.code} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: level.color + '12' }}>
                <span className="text-xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: level.color }}>{level.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#0B1F3A] mb-1">{level.name}</h2>
                <p className="text-sm text-[#64748B] leading-relaxed mb-3">{level.description}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {level.abilities.map((ability, i) => (
                    <div key={i} className="flex gap-2 text-xs text-[#64748B] leading-relaxed">
                      <span style={{ color: level.color }} className="mt-0.5 font-bold shrink-0">—</span>{ability}
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
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">Temukan level Anda</h2>
          <p className="text-white/50 text-sm mb-8">Ikuti BIGT Placement Test untuk mengetahui posisi Anda dalam skala CEFR.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register"><Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold rounded-lg">Mulai Tes</Button></Link>
            <Link href="/products"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">Lihat Produk</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
