'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PenSquare, History, UserCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/test', label: 'nav.takeTest', icon: PenSquare },
  { href: '/test/history', label: 'nav.testHistory', icon: History },
  { href: '/profile', label: 'nav.profile', icon: UserCircle },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-all ${
                active ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-[#007AFF]/20' : ''}`} />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {t(item.label)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
