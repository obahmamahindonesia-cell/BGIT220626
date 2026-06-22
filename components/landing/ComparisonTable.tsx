import { Sparkles } from 'lucide-react'

const COMPARISONS = [
  { aspect: 'Level system', old: '7 predikat (251–800)', next: '6 level CEFR (A1–C2)' },
  { aspect: 'Diagnostik', old: 'Satu skor umum', next: 'Granular per skill + rekomendasi' },
  { aspect: 'Mediation', old: 'Tidak ada', next: 'Termasuk (CEFR 2018)', oldBad: true },
  { aspect: 'Integrated tasks', old: 'Tidak ada', next: 'Read, Write, Speak', oldBad: true },
  { aspect: 'AI scoring', old: 'Manual', next: 'NLP + adaptive testing', oldBad: true },
  { aspect: 'Waktu tes', old: '120 menit (fixed)', next: '45-60 menit (adaptive)' },
  { aspect: 'Kompatibilitas global', old: 'Proprietary', next: 'Setara TOEFL, IELTS, HSK' },
]

export default function ComparisonTable() {
  return (
    <section id="perbandingan" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Perbandingan
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] leading-tight">
            Setara standar internasional tertinggi
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 premium-shadow-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left py-4 px-5 text-muted-foreground font-medium text-xs">Dimensi</th>
                <th className="text-left py-4 px-5 text-muted-foreground font-medium text-xs">UKBI (2016)</th>
                <th className="text-left py-4 px-5 text-[#D4AF37] font-semibold text-xs">BIGT</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((row) => (
                <tr key={row.aspect} className="border-t border-gray-100 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5 text-muted-foreground text-xs font-medium">{row.aspect}</td>
                  <td className={`py-4 px-5 ${row.oldBad ? 'text-[#E11D48]' : 'text-muted-foreground'} text-xs`}>
                    {row.old}
                  </td>
                  <td className="py-4 px-5 text-[#0B3D91] font-medium text-xs">
                    {row.next}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
