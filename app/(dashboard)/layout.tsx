'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  PenSquare,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
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
  const [userLevel, setUserLevel] = useState('A1')

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

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <aside className={`relative bg-[#0B3D91] text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center justify-between p-5 border-b border-white/10 ${collapsed ? 'flex-col gap-3' : ''}`}>
          <Link href="/" className={`font-[family-name:var(--font-playfair)] font-bold text-[#D4AF37] ${collapsed ? 'text-lg' : 'text-xl'}`}>
            {collapsed ? 'B' : 'BIGT'}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link group ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/50'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={`p-4 border-t border-white/10 space-y-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {collapsed ? (
            <>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-[#D4AF37] rounded-full h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Level BIGT</p>
                  <p className="text-sm font-semibold text-white">{userLevel} {CEFR_LEVELS[levelIndex]?.label}</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-[#D4AF37] rounded-full h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/40">
                <span>A1</span>
                <span>C2</span>
              </div>
            </>
          )}
        </div>

        <div className={`p-4 border-t border-white/10 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? (
            <button onClick={handleLogout} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center mx-auto transition-colors">
              <LogOut className="w-4 h-4 text-white/50" />
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50 truncate max-w-[140px]">{userName}</p>
              <button onClick={handleLogout} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <LogOut className="w-4 h-4 text-white/50" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
