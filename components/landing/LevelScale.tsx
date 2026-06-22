const LEVELS = [
  { code: 'A1', name: 'Pemula', desc: 'Memahami dan menggunakan ekspresi dasar sehari-hari.' },
  { code: 'A2', name: 'Dasar', desc: 'Berkomunikasi dalam situasi sederhana dan rutin.' },
  { code: 'B1', name: 'Madya', desc: 'Menangani situasi umum saat bepergian dan bekerja.' },
  { code: 'B2', name: 'Madya Atas', desc: 'Berinteraksi dengan lancar dan spontan dalam konteks profesional.' },
  { code: 'C1', name: 'Mahir', desc: 'Menggunakan bahasa secara fleksibel untuk tujuan sosial dan akademik.' },
  { code: 'C2', name: 'Sangat Mahir', desc: 'Memahami hampir semua hal dengan mudah dan mengekspresikan diri secara presisi.' },
]

export default function LevelScale() {
  return (
    <section id="level" className="py-20 px-6 bg-[#F8F6F1]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-3">
            Skala CEFR
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
            Level A1 hingga C2
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed max-w-2xl mx-auto">
            BIGT menggunakan skala CEFR (Common European Framework of Reference) yang dirancang untuk disejajarkan dengan TOEFL iBT, IELTS, dan HSK.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVELS.map((level) => (
            <div
              key={level.code}
              className="text-center p-5 rounded-xl border border-gray-200 bg-white hover:border-[#C8102E] transition-colors"
            >
              <div className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[#0B1F3A] mb-1">
                {level.code}
              </div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">
                {level.name}
              </div>
              <p className="text-[10px] text-[#6B7280] leading-relaxed hidden md:block">
                {level.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
