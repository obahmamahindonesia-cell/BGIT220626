import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Mengapa BIGT Hadir
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            Kesenjangan dalam penilaian kemahiran Bahasa Indonesia
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            Bahasa Indonesia adalah bahasa ke-8 terbesar di dunia dengan 300 juta penutur. Namun, 
            sistem pengukuran kemahirannya belum memiliki standar yang dapat disejajarkan dengan TOEFL, 
            IELTS, atau HSK secara internasional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-red-100 premium-shadow-md">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B3D91] mb-3">Tantangan Saat Ini</h3>
            <ul className="text-muted-foreground text-xs leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                Fokus pada kaidah grammar, bukan kemampuan komunikasi nyata
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                Skor proprietary yang tidak bisa dibandingkan dengan standar global
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                Tidak ada integrated tasks dan mediation
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                Diagnostic report tidak granular
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1.5 flex-shrink-0" />
                Tidak ada adaptive testing
              </li>
            </ul>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-amber-100 premium-shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B3D91] mb-3">Solusi BIGT</h3>
            <ul className="text-muted-foreground text-xs leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                6 dimensi asesmen berbasis CEFR 2018
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                Level A1-C2 yang dapat disejajarkan dengan TOEFL, IELTS, HSK
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                AI scoring dengan feedback granular per dimensi
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                Adaptive testing untuk akurasi level
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                Sertifikat digital dengan QR verification
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
