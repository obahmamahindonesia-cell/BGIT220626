import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TEAM = [
  {
    role: 'Linguistik & Pedagogi',
    desc: 'Tim ahli linguistik terapan dengan pengalaman dalam pengembangan kurikulum bahasa Indonesia untuk penutur asing.',
  },
  {
    role: 'Teknologi AI & NLP',
    desc: 'Insinyur machine learning dan natural language processing yang membangun sistem penilaian adaptif dan otomatis.',
  },
  {
    role: 'Psikometri & Asesmen',
    desc: 'Spesialis pengukuran pendidikan yang memastikan validitas, reliabilitas, dan keadilan setiap instrumen tes.',
  },
  {
    role: 'Desain Pengalaman Pengguna',
    desc: 'Perancang antarmuka yang memastikan pengalaman tes yang intuitif, aksesibel, dan minim hambatan teknis.',
  },
]

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-gradient-to-br from-[#0B3D91] via-[#0B3D91] to-[#1e4a8f] text-white pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Tentang BIGT
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Standar Kemahiran Bahasa Indonesia
            <span className="text-[#D4AF37]"> untuk Dunia.</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            BIGT (Bahasa Indonesia Global Test) adalah asesmen kemahiran bahasa Indonesia modern yang dirancang untuk memenuhi kebutuhan global — setara dengan standar internasional, didukung teknologi AI, dan berorientasi pada kemampuan nyata.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Mengapa BIGT
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-6 leading-tight">
            Kesenjangan yang perlu diisi
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              Bahasa Indonesia adalah salah satu bahasa dengan penutur terbanyak di dunia. Namun, hingga kini belum ada standar asesmen kemahiran yang diakui secara internasional — setara dengan TOEFL untuk bahasa Inggris, DELF untuk bahasa Prancis, atau HSK untuk bahasa Mandarin.
            </p>
            <p>
              Tes-tes yang ada saat ini cenderung bersifat satu dimensi, berfokus pada pengetahuan gramatikal, dan tidak mengukur kemampuan komunikatif secara utuh. BIGT hadir untuk menjawab tantangan ini.
            </p>
            <p>
              Dengan kerangka kerja yang selaras dengan CEFR (Common European Framework of Reference), BIGT mengukur enam dimensi kemahiran — termasuk mediasi dan tugas terintegrasi — sehingga hasilnya dapat dibandingkan langsung dengan standar global.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
                Visi
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-semibold text-[#0B3D91] mb-4 leading-tight">
                Bahasa Indonesia yang diakui dunia
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Menjadi standar referensi global untuk asesmen kemahiran bahasa Indonesia — digunakan oleh institusi pendidikan, pemerintah, dan organisasi internasional di seluruh dunia.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
                Misi
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-semibold text-[#0B3D91] mb-4 leading-tight">
                Asesmen yang adil, valid, dan bermakna
              </h3>
              <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-[#D4AF37] font-bold mt-0.5">—</span>
                  Mengembangkan instrumen tes yang mengukur kemampuan komunikatif nyata, bukan sekadar hafalan.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D4AF37] font-bold mt-0.5">—</span>
                  Memanfaatkan teknologi AI untuk penilaian yang adaptif, konsisten, dan dapat diskalakan.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D4AF37] font-bold mt-0.5">—</span>
                  Menyediakan sertifikasi yang diakui dan dapat diverifikasi secara publik.
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D4AF37] font-bold mt-0.5">—</span>
                  Membangun ekosistem pembelajaran dan asesmen bahasa Indonesia yang berkelanjutan.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            Tim & Keahlian
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-8 leading-tight">
            Dibangun oleh para ahli
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TEAM.map((member) => (
              <div key={member.role} className="bg-white border border-gray-100 rounded-2xl p-6 premium-shadow-md card-hover">
                <div className="w-10 h-10 rounded-xl bg-[#0B3D91] flex items-center justify-center mb-4">
                  <span className="text-[#D4AF37] text-sm font-bold">{member.role.charAt(0)}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#0B3D91] mb-2">{member.role}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#0B3D91] to-[#1a4a8a] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">
            Siap mengukur kemampuan bahasa Indonesiamu?
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Bergabunglah dengan ribuan peserta yang telah mempercayai BIGT sebagai standar kemahiran mereka.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register">
              <Button className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-7 py-3 text-sm font-semibold rounded-xl">
                Mulai Sekarang
              </Button>
            </Link>
            <Link href="/framework">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-xl">
                Pelajari Kerangka Kerja
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
