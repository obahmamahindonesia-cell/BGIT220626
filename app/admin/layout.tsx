'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, PenSquare, ClipboardList, Award, ArrowLeft, Upload, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Bank Soal (DB)', icon: PenSquare },
  { href: '/admin/questions/upload', label: 'Unggah Soal', icon: Upload },
  { href: '/admin/question-bank', label: 'Bank Soal (File)', icon: FileText },
  { href: '/admin/waitlist', label: 'Daftar Tunggu', icon: ClipboardList },
  { href: '/admin/certificates', label: 'Sertifikat', icon: Award },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <aside className="w-64 bg-[#0B3D91] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#D4AF37]">BIGT Admin</h1>
          <p className="text-xs text-white/50 mt-1">Konsol Manajemen</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link group ${
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/">
            <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/10 justify-start gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Situs
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
