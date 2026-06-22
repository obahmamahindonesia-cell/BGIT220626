import { BarChart3, Sparkles } from 'lucide-react'

const LEVELS = [
  { code: 'A1', name: 'Pemula', desc: 'Memahami dan menggunakan ekspresi dasar sehari-hari.', color: 'bg-gray-200 text-gray-500' },
  { code: 'A2', name: 'Dasar', desc: 'Berkomunikasi dalam situasi sederhana dan rutin.', color: 'bg-blue-200 text-blue-700' },
  { code: 'B1', name: 'Madya', desc: 'Menangani situasi umum saat bepergian dan bekerja.', color: 'bg-blue-500 text-white' },
  { code: 'B2', name: 'Madya Atas', desc: 'Berinteraksi dengan lancar dan spontan dalam konteks profesional.', color: 'bg-green-500 text-white' },
  { code: 'C1', name: 'Mahir', desc: 'Menggunakan bahasa secara fleksibel untuk tujuan sosial dan akademik.', color: 'bg-[#E11D48] text-white' },
  { code: 'C2', name: 'Sangat Mahir', desc: 'Memahami hampir semua hal dengan mudah dan mengekspresikan diri secara presisi.', color: 'bg-[#D4AF37] text-white' },
]

export default function LevelScale() {
  return (
    <section id="level" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Skala CEFR
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            Level A1 hingga C2
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            BIGT menggunakan skala CEFR (Common European Framework of Reference) yang dirancang untuk 
            disejajarkan dengan TOEFL iBT, IELTS, dan HSK.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVELS.map((level) => (
            <div
              key={level.code}
              className="text-center p-5 rounded-2xl border border-gray-100 bg-white premium-shadow-md card-hover"
            >
              <div className={`w-10 h-10 rounded-xl ${level.color} flex items-center justify-center text-sm font-bold mx-auto mb-3`}>
                {level.code}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                {level.name}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed hidden md:block">
                {level.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
