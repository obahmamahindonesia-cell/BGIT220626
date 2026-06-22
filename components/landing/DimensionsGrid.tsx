const DIMENSIONS = [
  {
    icon: '👂',
    title: 'Menyimak',
    desc: 'Inferential understanding, nuansa, aksen regional',
    isNew: false,
  },
  {
    icon: '📖',
    title: 'Membaca',
    desc: 'Analisis kritis, multi-genre, logical fallacies',
    isNew: false,
  },
  {
    icon: '🎤',
    title: 'Berbicara',
    desc: 'Fluency, lexical range, pragmatic competence',
    isNew: false,
  },
  {
    icon: '✍️',
    title: 'Menulis',
    desc: 'Argumentatif, akademik, kreatif — multi-genre',
    isNew: false,
  },
  {
    icon: '🔄',
    title: 'Mediation',
    desc: 'Menjembatani lintas bahasa, budaya, register',
    isNew: true,
  },
  {
    icon: '🧩',
    title: 'Integrated Tasks',
    desc: 'Baca → dengar → tulis → presentasi dalam satu ekosistem',
    isNew: true,
  },
]

export default function DimensionsGrid() {
  return (
    <section id="dimensi" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
          6 Dimensi Penilaian
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
          Lebih dari sekadar grammar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.title}
              className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {dim.isNew && (
                <span className="absolute top-3 right-3 bg-[#C9A84C] text-[#0B1F3A] text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                  Baru
                </span>
              )}
              <div className="text-2xl mb-3">{dim.icon}</div>
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-1">{dim.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
