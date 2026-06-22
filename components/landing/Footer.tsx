import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#0B3D91] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white p-3 rounded-lg inline-block mb-4">
              <Image
                src="/icon_BIGT.png"
                alt="BIGT Icon"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Bahasa Indonesia Global Test. Standar Kemahiran Bahasa Indonesia untuk Dunia.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#F59E0B]">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/framework" className="text-white/70 hover:text-white text-sm transition-colors">
                  Framework AKSI
                </Link>
              </li>
              <li>
                <Link href="/levels" className="text-white/70 hover:text-white text-sm transition-colors">
                  Level CEFR
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-white text-sm transition-colors">
                  Produk Test
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-white/70 hover:text-white text-sm transition-colors">
                  Verifikasi Sertifikat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#F59E0B]">Perusahaan</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white text-sm transition-colors">
                  Tentang BIGT
                </Link>
              </li>
              <li>
                <Link href="/partnership" className="text-white/70 hover:text-white text-sm transition-colors">
                  Kemitraan
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="text-white/70 hover:text-white text-sm transition-colors">
                  Waitlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#F59E0B]">Kontak</h3>
            <ul className="space-y-2">
              <li className="text-white/70 text-sm">
                info@bahasacerdas.site
              </li>
              <li className="text-white/70 text-sm">
                Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            &copy; 2026 BIGT — Bahasa Indonesia Global Test. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
