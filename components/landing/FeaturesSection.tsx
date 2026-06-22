const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Scoring',
    desc: 'Penilaian otomatis berbasis GPT-4o untuk writing dan speaking. Feedback granular dengan strengths dan areas for improvement.',
  },
  {
    icon: '🎯',
    title: 'Adaptive Testing',
    desc: 'Soal menyesuaikan level kemampuan peserta secara real-time. Lebih efisien, lebih akurat.',
  },
  {
    icon: '📊',
    title: 'Diagnostic Report',
    desc: 'Laporan detail per dimensi dengan can-do statements, rekomendasi belajar, dan equivalensi TOEFL/IELTS.',
  },
  {
    icon: '🏆',
    title: 'Sertifikat Digital',
    desc: 'Sertifikat digital dengan QR code untuk verifikasi publik. Dapat dibagikan dan divalidasi secara online.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-3">
            Teknologi BIGT
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] leading-tight">
            Didukung teknologi modern untuk asesmen yang akurat
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="flex gap-4 p-6 bg-white border border-gray-200 rounded-xl">
              <div className="text-2xl flex-shrink-0">{feat.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{feat.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
