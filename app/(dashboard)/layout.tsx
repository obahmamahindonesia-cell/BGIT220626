'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  PenSquare,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userLevel] = useState('A1')

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
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

  const sidebarContent = (
    <>
      <div className={`flex items-center justify-between px-4 h-16 border-b border-white/10 ${collapsed ? 'justify-center px-0' : ''}`}>
        <Link href="/dashboard" className={`font-[family-name:var(--font-playfair)] font-bold text-white ${collapsed ? 'text-lg' : 'text-xl'}`}>
          {collapsed ? 'B' : 'BIGT'}
        </Link>
        <button
          onClick={() => { setCollapsed(!collapsed); setMobileOpen(false) }}
          className="hidden lg:flex w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 items-center justify-center transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/50" /> : <ChevronLeft className="w-4 h-4 text-white/50" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link group ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`px-4 py-4 border-t border-white/10 ${collapsed ? 'flex flex-col items-center px-2' : ''}`}>
        {collapsed ? (
          <>
            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <GraduationCap className="w-4 h-4 text-[#C9A227]/70" />
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <div className="bg-[#C9A227] rounded-full h-1 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#C9A227]/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Level BIGT</p>
                <p className="text-sm font-semibold text-white truncate">{userLevel} {CEFR_LEVELS[levelIndex]?.label}</p>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
              <div className="bg-[#C9A227] rounded-full h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>A1</span>
              <span>C2</span>
            </div>
          </>
        )}
      </div>

      <div className={`px-4 py-3 border-t border-white/10 ${collapsed ? 'flex justify-center px-2' : ''}`}>
        {collapsed ? (
          <button onClick={handleLogout} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{userName || 'Pengguna'}</p>
            <button onClick={handleLogout} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      <aside className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-60'
      } bg-gradient-to-b from-[#0B1F3A] to-[#123E7C]`}>
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-gradient-to-b from-[#0B1F3A] to-[#123E7C] flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
              <Link href="/dashboard" className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">BIGT</Link>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`sidebar-link group ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
          <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <Menu className="w-5 h-5 text-[#0B1F3A]" />
          </button>
          <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#0B1F3A]">BIGT</span>
          <div className="w-9 h-9" />
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
