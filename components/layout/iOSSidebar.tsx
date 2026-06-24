'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  PenSquare,
  History,
  UserCircle,
  GraduationCap,
  LogOut,
  X,
  Award,
  Settings,
} from 'lucide-react'
import Logo from '@/components/brand/Logo'

const NAV_SECTIONS = [
  {
    label: 'UTAMA',
    items: [
      { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/test', label: 'Mulai Tes', icon: PenSquare },
    ],
  },
  {
    label: 'TES',
    items: [
      { href: '/test/history', label: 'Riwayat Tes', icon: History },
      { href: '/certificates', label: 'Sertifikat', icon: Award },
    ],
  },
  {
    label: 'AKUN',
    items: [
      { href: '/profile', label: 'Profil', icon: UserCircle },
      { href: '/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
]

const CEFR_LEVELS = [
  { code: 'A1', label: 'Pemula' },
  { code: 'A2', label: 'Dasar' },
  { code: 'B1', label: 'Madya' },
  { code: 'B2', label: 'Lanjut' },
  { code: 'C1', label: 'Mahir' },
  { code: 'C2', label: 'Sangat Mahir' },
]

interface AppSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function IosSidebar({ mobile, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userLevel] = useState('A1')

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) setUserName(user.user_metadata.name)
      else if (user?.email) setUserName(user.email.split('@')[0])
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const levelIndex = CEFR_LEVELS.findIndex(l => l.code === userLevel)
  const progressPercent = ((levelIndex + 1) / CEFR_LEVELS.length) * 100

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/test') return pathname === '/test' || pathname === '/test/start'
    if (href === '/test/history') return pathname.startsWith('/test/history')
    if (href === '/certificates') return pathname.startsWith('/certificates')
    if (href === '/profile') return pathname.startsWith('/profile')
    if (href === '/settings') return pathname.startsWith('/settings')
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0B1F3A] to-[#123E7C]">
      <div className="flex items-center justify-between px-5 h-[72px] border-b border-white/10 flex-shrink-0">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <Logo variant="full" invert className="h-7" />
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-white/10 text-white border-l-[3px] border-[#D7193F] rounded-l-none'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-[#C9A227]/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Level BIGT</p>
            <p className="text-sm font-semibold text-white truncate">
              {userLevel} {CEFR_LEVELS[levelIndex]?.label || ''}
            </p>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
          <div className="bg-[#C9A227] rounded-full h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mb-4">
          <span>A1</span>
          <span>C2</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 truncate max-w-[160px]">
            {userName || 'Pengguna'}
          </p>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
