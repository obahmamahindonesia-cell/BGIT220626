export default function ProblemSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-3">
          Mengapa BGIT Hadir
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-6 leading-tight">
          Kesenjangan dalam penilaian kemahiran Bahasa Indonesia
        </h2>
        <p className="text-[#6B7280] text-base leading-relaxed mb-8">
          Bahasa Indonesia adalah bahasa ke-8 terbesar di dunia dengan 300 juta penutur. Namun, sistem pengukuran kemahirannya belum memiliki standar yang dapat disejajarkan dengan TOEFL, IELTS, atau HSK secara internasional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8F6F1] rounded-xl p-6 border-l-4 border-[#C8102E]">
            <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">Tantangan Saat Ini</h3>
            <ul className="text-[#6B7280] text-sm leading-relaxed space-y-2">
              <li>Fokus pada kaidah grammar, bukan kemampuan komunikasi nyata</li>
              <li>Skor proprietary yang tidak bisa dibandingkan dengan standar global</li>
              <li>Tidak ada integrated tasks dan mediation</li>
              <li>Diagnostic report tidak granular</li>
              <li>Tidak ada adaptive testing</li>
            </ul>
          </div>
          <div className="bg-[#F8F6F1] rounded-xl p-6 border-l-4 border-[#C9A84C]">
            <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">Solusi BGIT</h3>
            <ul className="text-[#6B7280] text-sm leading-relaxed space-y-2">
              <li>6 dimensi asesmen berbasis CEFR 2018</li>
              <li>Level A1-C2 yang dapat disejajarkan dengan TOEFL, IELTS, HSK</li>
              <li>AI scoring dengan feedback granular per dimensi</li>
              <li>Adaptive testing untuk akurasi level</li>
              <li>Sertifikat digital dengan QR verification</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
