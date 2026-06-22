const DIMENSIONS = [
  {
    icon: '👂',
    title: 'Menyimak',
    desc: 'Pemahaman inferensial, nuansa makna, dan variasi aksen regional',
    isNew: false,
  },
  {
    icon: '📖',
    title: 'Membaca',
    desc: 'Analisis kritis, multi-genre, identifikasi logical fallacies',
    isNew: false,
  },
  {
    icon: '🎤',
    title: 'Berbicara',
    desc: 'Fluency, lexical range, pragmatic competence, dan interaksi',
    isNew: false,
  },
  {
    icon: '✍️',
    title: 'Menulis',
    desc: 'Argumentatif, akademik, kreatif dalam berbagai register',
    isNew: false,
  },
  {
    icon: '🔄',
    title: 'Mediasi',
    desc: 'Menjembatani lintas bahasa, budaya, dan register komunikasi',
    isNew: true,
  },
  {
    icon: '🧩',
    title: 'Tugas Terintegrasi',
    desc: 'Baca, dengar, tulis, dan presentasi dalam satu ekosistem tugas',
    isNew: true,
  },
]

export default function DimensionsGrid() {
  return (
    <section id="dimensi" className="py-20 px-6 bg-[#F8F6F1]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-3">
            6 Dimensi Asesmen
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] leading-tight">
            Pengukuran komprehensif berbasis CEFR 2018
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.title}
              className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {dim.isNew && (
                <span className="absolute top-4 right-4 bg-[#C9A84C] text-[#0B1F3A] text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                  Baru
                </span>
              )}
              <div className="text-2xl mb-3">{dim.icon}</div>
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{dim.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
