const LEVELS = [
  { code: 'A1', name: 'Pemula', active: false },
  { code: 'A2', name: 'Dasar', active: false },
  { code: 'B1', name: 'Menengah', active: true },
  { code: 'B2', name: 'Menengah Atas', active: true },
  { code: 'C1', name: 'Mahir', active: false },
  { code: 'C2', name: 'Sangat Mahir', active: false },
]

export default function LevelScale() {
  return (
    <section id="level" className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
          Skala Level
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
          Tahu persis di mana posisimu
        </h2>
        <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
          Hasil UKBI-Next bisa langsung dibandingkan dengan TOEFL iBT, IELTS, dan HSK — tidak ada lagi skor yang &quot;mengambang&quot; tanpa referensi global.
        </p>
        <div className="flex gap-3 flex-wrap">
          {LEVELS.map((level) => (
            <div
              key={level.code}
              className={`flex-1 min-w-[80px] text-center p-4 rounded-xl border transition-all ${
                level.active
                  ? 'border-[#C8102E] border-2 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`text-xl font-bold font-[family-name:var(--font-playfair)] ${level.active ? 'text-[#C8102E]' : 'text-[#0B1F3A]'}`}>
                {level.code}
              </div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mt-1">
                {level.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
