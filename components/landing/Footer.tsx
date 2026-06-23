import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#C9A227]" />
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">BIGT</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">Bahasa Indonesia Global Test. Standar Kemahiran Bahasa Indonesia untuk Dunia.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/framework" className="text-white/50 hover:text-white text-sm transition-colors">Framework AKSI</Link></li>
              <li><Link href="/levels" className="text-white/50 hover:text-white text-sm transition-colors">Level CEFR</Link></li>
              <li><Link href="/products" className="text-white/50 hover:text-white text-sm transition-colors">Produk Test</Link></li>
              <li><Link href="/verify" className="text-white/50 hover:text-white text-sm transition-colors">Verifikasi Sertifikat</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">Perusahaan</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/50 hover:text-white text-sm transition-colors">Tentang BIGT</Link></li>
              <li><Link href="/partnership" className="text-white/50 hover:text-white text-sm transition-colors">Kemitraan</Link></li>
              <li><Link href="/waitlist" className="text-white/50 hover:text-white text-sm transition-colors">Waitlist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#C9A227]">Kontak</h3>
            <ul className="space-y-2">
              <li className="text-white/50 text-sm">info@bahasacerdas.site</li>
              <li className="text-white/50 text-sm">Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">&copy; 2026 BIGT — Bahasa Indonesia Global Test. Hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
