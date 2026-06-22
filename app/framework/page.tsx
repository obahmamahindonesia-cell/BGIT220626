import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const CEFR_LEVELS = [
  {
    code: 'A1',
    name: 'Pemula',
    color: '#6B7280',
    descriptors: [
      'Memahami dan menggunakan ekspresi sehari-hari yang sangat dasar',
      'Memperkenalkan diri dan menjawab pertanyaan sederhana tentang identitas',
      'Berinteraksi secara sederhana jika lawan bicara berbicara lambat dan jelas',
    ],
  },
  {
    code: 'A2',
    name: 'Dasar',
    color: '#6B7280',
    descriptors: [
      'Memahami kalimat dan ekspresi yang berkaitan dengan kebutuhan segera',
      'Berkomunikasi dalam tugas rutin yang memerlukan pertukaran informasi sederhana',
      'Mendeskripsikan latar belakang, lingkungan sekitar, dan kebutuhan dasar',
    ],
  },
  {
    code: 'B1',
    name: 'Madya',
    color: '#378ADD',
    descriptors: [
      'Memahami poin utama dari teks yang jelas tentang hal-hal yang familiar',
      'Menghadapi situasi yang umum ditemui saat bepergian di wilayah berbahasa Indonesia',
      'Menghasilkan teks sederhana yang koheren tentang topik yang familiar atau menarik',
    ],
  },
  {
    code: 'B2',
    name: 'Madya Atas',
    color: '#378ADD',
    descriptors: [
      'Memahami gagasan utama dari teks kompleks, termasuk diskusi teknis dalam bidang spesialisasi',
      'Berinteraksi dengan tingkat kelancaran yang memungkinkan komunikasi reguler dengan penutur asli',
      'Menghasilkan teks yang jelas dan terperinci serta menjelaskan pandangan tentang suatu isu',
    ],
  },
  {
    code: 'C1',
    name: 'Mahir',
    color: '#C8102E',
    descriptors: [
      'Memahami berbagai teks panjang dan menantang, serta mengenali makna implisit',
      'Mengekspresikan gagasan secara lancar dan spontan tanpa banyak mencari ungkapan',
      'Menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial, akademik, dan profesional',
    ],
  },
  {
    code: 'C2',
    name: 'Sangat Mahir',
    color: '#C9A84C',
    descriptors: [
      'Memahami dengan mudah hampir semua yang didengar atau dibaca',
      'Meringkas informasi dari berbagai sumber tertulis dan lisan secara koheren',
      'Mengekspresikan diri secara spontan, sangat lancar, dan tepat — membedakan nuansa makna halus',
    ],
  },
]

const REGISTERS = [
  {
    name: 'Formal',
    desc: 'Bahasa resmi untuk konteks pemerintahan, hukum, dan upacara kenegaraan.',
    examples: 'Pidato kenegaraan, surat resmi, dokumen legal',
  },
  {
    name: 'Informal',
    desc: 'Bahasa percakapan sehari-hari yang luwes dan ekspresif.',
    examples: 'Percakapan santai, media sosial, pesan singkat',
  },
  {
    name: 'Akademik',
    desc: 'Bahasa ilmiah untuk konteks pendidikan tinggi dan publikasi penelitian.',
    examples: 'Jurnal ilmiah, presentasi akademik, esai argumentatif',
  },
  {
    name: 'Profesional',
    desc: 'Bahasa dunia kerja yang efisien, tepat, dan berorientasi hasil.',
    examples: 'Laporan bisnis, email korporat, negosiasi',
  },
]

const PRINCIPLES = [
  {
    title: 'Pendekatan Berorientasi Tindakan',
    desc: 'BGIT mengukur apa yang bisa dilakukan peserta dengan bahasa Indonesia — bukan sekadar apa yang mereka ketahui. Setiap tugas mencerminkan aktivitas komunikatif nyata.',
  },
  {
    title: 'Kompetensi Mediasi',
    desc: 'Kemampuan menjembatani komunikasi lintas bahasa, budaya, dan register. Peserta diuji dalam memfasilitasi pemahaman, memproses informasi, dan mengelola interaksi.',
  },
  {
    title: 'Tugas Terintegrasi',
    desc: 'Tugas-tugas BGIT menggabungkan beberapa keterampilan sekaligus — membaca, menyimak, menulis, dan berbicara — sebagaimana terjadi dalam komunikasi nyata.',
  },
  {
    title: 'Kompetensi Plurilingual',
    desc: 'Pengakuan bahwa pengguna bahasa memiliki repertoar linguistik yang kaya. BGIT mempertimbangkan kemampuan peserta dalam memanfaatkan seluruh sumber daya kebahasaan mereka.',
  },
]

export default function FrameworkPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            Kerangka Kerja
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Kerangka <span className="text-[#C9A84C]">AKSI</span>
          </h1>
          <p className="text-white/50 text-sm mb-2 tracking-wide">
            Asesmen Kecakapan dan Sertifikasi Indonesia
          </p>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Kerangka kerja komprehensif yang menyelaraskan asesmen kemahiran bahasa Indonesia dengan standar CEFR — mengukur kompetensi komunikatif secara holistik dan bermakna.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Prinsip Utama
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
            Pendekatan action-oriented
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-6"
              >
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{p.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F6F1]">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Penyelarasan CEFR
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
            Can-do descriptors untuk setiap level
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
            Setiap level BGIT dipetakan secara langsung ke CEFR dengan deskriptor can-do yang jelas — sehingga peserta, institusi, dan pemberi kerja memahami persis apa yang mampu dilakukan.
          </p>
          <div className="space-y-4">
            {CEFR_LEVELS.map((level) => (
              <div
                key={level.code}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${level.color}15` }}
                  >
                    <span
                      className="text-lg font-bold font-[family-name:var(--font-playfair)]"
                      style={{ color: level.color }}
                    >
                      {level.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#0B1F3A] mb-3">
                      {level.name}
                    </h3>
                    <ul className="space-y-1.5">
                      {level.descriptors.map((d, i) => (
                        <li key={i} className="flex gap-2 text-xs text-[#6B7280] leading-relaxed">
                          <span style={{ color: level.color }} className="mt-0.5 font-bold">—</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
            Register Bahasa
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
            Empat register, satu standar
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
            BGIT mengukur kemampuan peserta dalam menggunakan bahasa Indonesia di berbagai konteks — dari percakapan sehari-hari hingga komunikasi profesional tingkat tinggi.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {REGISTERS.map((r) => (
              <div
                key={r.name}
                className="bg-[#F8F6F1] border border-gray-200 rounded-xl p-6"
              >
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{r.name}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-3">{r.desc}</p>
                <div className="text-[10px] text-[#C9A84C] font-medium tracking-wider uppercase">
                  {r.examples}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1F3A] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">
            Lihat detail setiap level
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Pahami deskripsi lengkap dan contoh kemampuan untuk setiap level BGIT.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/levels">
              <Button className="bg-[#C8102E] hover:bg-red-800 text-white px-7 py-3 text-sm font-semibold">
                Lihat Level
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium">
                Produk Tes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
