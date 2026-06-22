import { Sparkles, Crosshair, BarChart3, Award } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Scoring',
    desc: 'Penilaian otomatis berbasis GPT-4o untuk writing dan speaking. Feedback granular dengan strengths dan areas for improvement.',
    color: '#0B3D91',
    bg: 'bg-[#0B3D91]/5',
  },
  {
    icon: Crosshair,
    title: 'Adaptive Testing',
    desc: 'Soal menyesuaikan level kemampuan peserta secara real-time. Lebih efisien, lebih akurat.',
    color: '#E11D48',
    bg: 'bg-[#E11D48]/5',
  },
  {
    icon: BarChart3,
    title: 'Diagnostic Report',
    desc: 'Laporan detail per dimensi dengan can-do statements, rekomendasi belajar, dan equivalensi TOEFL/IELTS.',
    color: '#D4AF37',
    bg: 'bg-[#D4AF37]/10',
  },
  {
    icon: Award,
    title: 'Sertifikat Digital',
    desc: 'Sertifikat digital dengan QR code untuk verifikasi publik. Dapat dibagikan dan divalidasi secara online.',
    color: '#0B3D91',
    bg: 'bg-[#0B3D91]/5',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Teknologi BIGT
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] leading-tight">
            Didukung teknologi modern untuk asesmen yang akurat
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div key={feat.title} className="flex gap-5 p-6 bg-white border border-gray-100 rounded-2xl premium-shadow-md card-hover">
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0B3D91] mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
