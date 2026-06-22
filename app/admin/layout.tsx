'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/questions', label: 'Item Bank', icon: '📝' },
  { href: '/admin/waitlist', label: 'Waitlist', icon: '📋' },
  { href: '/admin/certificates', label: 'Certificates', icon: '🏆' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex">
      <aside className="w-64 bg-[#0B1F3A] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-playfair text-xl font-bold text-[#C9A84C]">BIGT Admin</h1>
          <p className="text-xs text-white/60 mt-1">Management Console</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#C8102E] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/">
            <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
              ← Back to Site
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
