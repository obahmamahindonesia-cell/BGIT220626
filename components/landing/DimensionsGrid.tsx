import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Sparkles } from 'lucide-react'

const DIMENSIONS = [
  {
    icon: Headphones,
    title: 'Menyimak',
    desc: 'Pemahaman inferensial, nuansa makna, dan variasi aksen regional',
    isNew: false,
    color: '#378ADD',
  },
  {
    icon: BookOpen,
    title: 'Membaca',
    desc: 'Analisis kritis, multi-genre, identifikasi logical fallacies',
    isNew: false,
    color: '#10B981',
  },
  {
    icon: Mic,
    title: 'Berbicara',
    desc: 'Fluency, lexical range, pragmatic competence, dan interaksi',
    isNew: false,
    color: '#F59E0B',
  },
  {
    icon: PenSquare,
    title: 'Menulis',
    desc: 'Argumentatif, akademik, kreatif dalam berbagai register',
    isNew: false,
    color: '#8B5CF6',
  },
  {
    icon: RefreshCw,
    title: 'Mediasi',
    desc: 'Menjembatani lintas bahasa, budaya, dan register komunikasi',
    isNew: true,
    color: '#EC4899',
  },
  {
    icon: Puzzle,
    title: 'Tugas Terintegrasi',
    desc: 'Baca, dengar, tulis, dan presentasi dalam satu ekosistem tugas',
    isNew: true,
    color: '#06B6D4',
  },
]

export default function DimensionsGrid() {
  return (
    <section id="dimensi" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            6 Dimensi Asesmen
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] leading-tight">
            Pengukuran komprehensif berbasis CEFR 2018
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIMENSIONS.map((dim) => {
            const Icon = dim.icon
            return (
              <div
                key={dim.title}
                className="relative bg-white border border-gray-100 rounded-2xl p-6 premium-shadow-md card-hover"
              >
                {dim.isNew && (
                  <span className="absolute top-4 right-4 bg-[#D4AF37] text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                    Baru
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ backgroundColor: dim.color + '15' }}>
                  <Icon className="w-5 h-5" style={{ color: dim.color }} />
                </div>
                <h3 className="text-sm font-semibold text-[#0B3D91] mb-1.5">{dim.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{dim.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
