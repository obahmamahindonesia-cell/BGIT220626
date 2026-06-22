import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const LEVELS = [
  {
    code: 'A1',
    name: 'Pemula',
    color: '#6B7280',
    description: 'Mampu menggunakan bahasa Indonesia dalam situasi yang sangat dasar dan terprediksi.',
    abilities: [
      'Memperkenalkan diri dan orang lain',
      'Memahami dan menggunakan sapaan dasar',
      'Mengisi formulir sederhana dengan data pribadi',
      'Memahami tanda dan petunjuk visual yang sangat sederhana',
      'Bertanya dan menjawab pertanyaan sederhana tentang topik familiar',
    ],
  },
  {
    code: 'A2',
    name: 'Dasar',
    color: '#6B7280',
    description: 'Mampu berkomunikasi dalam tugas-tugas rutin yang memerlukan pertukaran informasi sederhana dan langsung.',
    abilities: [
      'Memahami informasi dalam teks pendek dan sederhana',
      'Melakukan transaksi dasar di toko, restoran, atau transportasi',
      'Mendeskripsikan latar belakang dan lingkungan sekitar',
      'Menulis pesan dan catatan singkat yang sederhana',
      'Memahami pengumuman dan instruksi lisan yang jelas',
    ],
  },
  {
    code: 'B1',
    name: 'Madya',
    color: '#378ADD',
    description: 'Mampu menangani sebagian besar situasi yang muncul saat menggunakan bahasa Indonesia dalam kehidupan sehari-hari.',
    abilities: [
      'Memahami poin utama dari berita, artikel, atau siaran yang jelas',
      'Menulis teks sederhana yang koheren tentang topik yang diminati',
      'Menceritakan pengalaman, peristiwa, harapan, dan ambisi',
      'Memberikan alasan dan penjelasan singkat untuk pendapat',
      'Berpartisipasi dalam percakapan tentang topik familiar tanpa persiapan',
    ],
  },
  {
    code: 'B2',
    name: 'Madya Atas',
    color: '#378ADD',
    description: 'Mampu berinteraksi dengan kelancaran dan spontanitas yang memungkinkan komunikasi reguler dengan penutur asli.',
    abilities: [
      'Memahami gagasan utama dari teks kompleks dan diskusi teknis',
      'Berpartisipasi aktif dalam diskusi tentang isu-isu terkini',
      'Menulis esai atau laporan yang jelas dan terperinci',
      'Memberikan presentasi yang terstruktur tentang topik yang kompleks',
      'Memahami humor, idiom, dan ekspresi kultural yang umum',
    ],
  },
  {
    code: 'C1',
    name: 'Mahir',
    color: '#C8102E',
    description: 'Mampu menggunakan bahasa Indonesia secara fleksibel dan efektif untuk tujuan sosial, akademik, dan profesional.',
    abilities: [
      'Memahami teks panjang dan menantang dengan makna implisit',
      'Mengekspresikan gagasan secara lancar tanpa banyak mencari ungkapan',
      'Menulis teks terstruktur tentang subjek kompleks dengan gaya yang sesuai',
      'Menggunakan bahasa secara efektif dalam konteks profesional dan akademik',
      'Memahami dan memproduksi teks dengan register yang berbeda',
    ],
  },
  {
    code: 'C2',
    name: 'Sangat Mahir',
    color: '#C9A84C',
    description: 'Mampu memahami dan menggunakan bahasa Indonesia dengan tingkat ketepatan dan kelancaran yang setara dengan penutur asli terdidik.',
    abilities: [
      'Memahami hampir semua yang didengar atau dibaca dengan mudah',
      'Meringkas dan mensintesis informasi dari berbagai sumber secara koheren',
      'Membedakan nuansa makna yang halus dalam situasi kompleks',
      'Mengekspresikan diri secara spontan dengan presisi tinggi',
      'Menghasilkan teks akademik, sastra, atau profesional tingkat tinggi',
    ],
  },
]

export default function LevelsPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            Level Kemahiran
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Enam level, satu <span className="text-[#C9A84C]">standar global</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Setiap level BIGT dipetakan ke CEFR dengan deskriptor can-do yang jelas. Ketahui persis di mana kemampuan bahasa Indonesia Anda berdiri.
          </p>
        </div>
      </section>

      <section className="py-8 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 flex-wrap justify-center">
            {LEVELS.map((level) => (
              <div
                key={level.code}
                className="flex-1 min-w-[80px] text-center p-3 rounded-xl border border-gray-200"
              >
                <div
                  className="text-lg font-bold font-[family-name:var(--font-playfair)]"
                  style={{ color: level.color }}
                >
                  {level.code}
                </div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mt-0.5">
                  {level.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-4xl mx-auto space-y-6">
          {LEVELS.map((level) => (
            <div
              key={level.code}
              className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${level.color}12` }}
                >
                  <span
                    className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-playfair)]"
                    style={{ color: level.color }}
                  >
                    {level.code}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold text-[#0B1F3A] mb-1">
                    {level.name}
                  </h2>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                    {level.description}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {level.abilities.map((ability, i) => (
                      <div key={i} className="flex gap-2 text-xs text-[#6B7280] leading-relaxed">
                        <span style={{ color: level.color }} className="mt-0.5 font-bold shrink-0">—</span>
                        {ability}
                      </div>
                    ))}
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
            Temukan level Anda
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Ikuti BIGT Placement Test untuk mengetahui posisi Anda dalam skala CEFR.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register">
              <Button className="bg-[#C8102E] hover:bg-red-800 text-white px-7 py-3 text-sm font-semibold">
                Mulai Tes
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium">
                Lihat Produk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
