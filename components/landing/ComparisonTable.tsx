const COMPARISONS = [
  { aspect: 'Level system', old: '7 predikat (251–800)', next: '6 level CEFR (A1–C2)' },
  { aspect: 'Diagnostik', old: 'Satu skor umum', next: 'Granular per skill + rekomendasi' },
  { aspect: 'Mediation', old: 'Tidak ada', next: 'Termasuk (CEFR 2018)', oldBad: true },
  { aspect: 'Integrated tasks', old: 'Tidak ada', next: 'Read → Write → Speak', oldBad: true },
  { aspect: 'AI scoring', old: 'Manual', next: 'NLP + adaptive testing', oldBad: true },
  { aspect: 'Waktu tes', old: '120 menit (fixed)', next: '45–60 menit (adaptive)' },
  { aspect: 'Kompatibilitas global', old: 'Proprietary', next: 'Setara TOEFL, IELTS, HSK' },
]

export default function ComparisonTable() {
  return (
    <section id="perbandingan" className="py-16 px-6 bg-[#F8F6F1]">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-2">
          Perbandingan
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8 leading-tight">
          Setara standar internasional tertinggi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Dimensi</th>
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">UKBI (2016)</th>
                <th className="text-left py-3 px-4 text-[#C9A84C] font-semibold">UKBI-Next</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((row) => (
                <tr key={row.aspect} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-[#6B7280] text-xs">{row.aspect}</td>
                  <td className={`py-3 px-4 ${row.oldBad ? 'text-red-500' : 'text-[#0B1F3A]'}`}>
                    {row.oldBad && <span className="mr-1">✕</span>}
                    {row.old}
                  </td>
                  <td className="py-3 px-4 text-[#0B1F3A] font-medium bg-[#C9A84C]/8 rounded">
                    <span className="text-green-600 mr-1">✓</span>
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
