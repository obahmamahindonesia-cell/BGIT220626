'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  PenSquare,
  UserCircle,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/test', label: 'Mulai Tes', icon: PenSquare },
  { href: '/profile', label: 'Profil', icon: UserCircle },
]

const CEFR_LEVELS = [
  { code: 'A1', label: 'Pemula' },
  { code: 'A2', label: 'Dasar' },
  { code: 'B1', label: 'Madya' },
  { code: 'B2', label: 'Madya Atas' },
  { code: 'C1', label: 'Mahir' },
  { code: 'C2', label: 'Sangat Mahir' },
]

interface AppSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function AppSidebar({ mobile, onClose }: AppSidebarProps) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white"
          onClick={onClose}
        >
          BIGT
        </Link>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-link group ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-[#C9A227]/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Level BIGT
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {userLevel} {CEFR_LEVELS[levelIndex]?.label}
            </p>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
          <div
            className="bg-[#C9A227] rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>A1</span>
          <span>C2</span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 truncate max-w-[160px]">
            {userName || 'Pengguna'}
          </p>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
