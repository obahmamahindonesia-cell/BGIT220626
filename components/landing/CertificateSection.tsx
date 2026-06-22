export default function CertificateSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-[#C8102E] mb-3">
              Sertifikasi Digital
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4 leading-tight">
              Sertifikat digital dengan verifikasi QR
            </h2>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
              Setiap peserta BGIT menerima sertifikat digital yang dapat diverifikasi secara publik melalui QR code atau Certificate ID. Institusi dan pemberi kerja dapat memvalidasi keaslian sertifikat kapan saja.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                <span className="text-[#C8102E] font-bold">✓</span>
                QR code untuk verifikasi instan
              </li>
              <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                <span className="text-[#C8102E] font-bold">✓</span>
                Certificate ID unik per peserta
              </li>
              <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                <span className="text-[#C8102E] font-bold">✓</span>
                Verifikasi publik tanpa login
              </li>
              <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                <span className="text-[#C8102E] font-bold">✓</span>
                Dapat dibagikan ke LinkedIn dan platform lain
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#1a3a5c] rounded-xl p-8 text-center">
            <div className="bg-white/10 rounded-lg p-6 mb-4">
              <div className="text-[#C9A84C] font-[family-name:var(--font-playfair)] text-lg font-bold mb-2">BGIT</div>
              <div className="text-white/80 text-sm mb-1">Certificate of Proficiency</div>
              <div className="text-white/60 text-xs mb-4">Bahasa Global Indonesia Test</div>
              <div className="bg-[#C9A84C] text-[#0B1F3A] text-3xl font-bold py-3 rounded-lg mb-3">B2</div>
              <div className="text-white/60 text-xs">Madya Atas</div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-xs">QR</div>
              <span className="text-white/60 text-xs">Scan untuk verifikasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
