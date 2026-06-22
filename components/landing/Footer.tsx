export default function Footer() {
  return (
    <footer className="bg-[#071528] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-[#C9A84C] font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">BGIT</div>
            <p className="text-white/40 text-sm leading-relaxed">
              Bahasa Global Indonesia Test. Standar Kemahiran Bahasa Indonesia untuk Dunia.
            </p>
          </div>
          <div>
            <h4 className="text-white/80 text-sm font-semibold mb-3">Platform</h4>
            <div className="space-y-2">
              <a href="/framework" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Framework</a>
              <a href="/levels" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Level A1-C2</a>
              <a href="/products" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Produk Test</a>
              <a href="/verify" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Verifikasi Sertifikat</a>
            </div>
          </div>
          <div>
            <h4 className="text-white/80 text-sm font-semibold mb-3">Institusi</h4>
            <div className="space-y-2">
              <a href="/partnership" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Kemitraan</a>
              <a href="/about" className="block text-white/40 hover:text-white/70 text-sm transition-colors">Tentang BGIT</a>
            </div>
          </div>
          <div>
            <h4 className="text-white/80 text-sm font-semibold mb-3">Legal</h4>
            <div className="space-y-2">
              <span className="block text-white/40 text-sm">Kebijakan Privasi</span>
              <span className="block text-white/40 text-sm">Syarat & Ketentuan</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">
            &copy; 2026 BGIT — Bahasa Global Indonesia Test. All rights reserved.
          </p>
          <span className="text-xs text-[#C9A84C]/50">
            bahasacerdas.site
          </span>
        </div>
      </div>
    </footer>
  )
}
