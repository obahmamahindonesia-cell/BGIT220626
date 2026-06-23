'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  PenSquare,
  History,
  BookOpen,
  UserCircle,
  GraduationCap,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import LanguageToggle from '@/components/LanguageToggle'

interface iOSSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobile?: boolean
  onClose?: () => void
}

const NAV_SECTIONS = [
  {
    label: 'nav.dashboard',
    items: [
      { href: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
      { href: '/test', label: 'nav.takeTest', icon: PenSquare },
    ],
  },
  {
    label: 'nav.testHistory',
    items: [
      { href: '/test/history', label: 'nav.testHistory', icon: History },
      { href: '/practice', label: 'Practice', icon: BookOpen },
    ],
  },
  {
    label: 'nav.profile',
    items: [
      { href: '/profile', label: 'nav.profile', icon: UserCircle },
    ],
  },
]

const CEFR_LEVELS = [
  { code: 'A1', label: 'landing.levels.A1' },
  { code: 'A2', label: 'landing.levels.A2' },
  { code: 'B1', label: 'landing.levels.B1' },
  { code: 'B2', label: 'landing.levels.B2' },
  { code: 'C1', label: 'landing.levels.C1' },
  { code: 'C2', label: 'landing.levels.C2' },
]

export default function IosSidebar({ collapsed, onToggle, mobile, onClose }: iOSSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
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
    return pathname.startsWith(href)
  }

  return (
    <div className={`flex flex-col h-full bg-white transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      <div className={`flex items-center border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center h-16' : 'justify-between px-4 h-16'}`}>
        {!collapsed && (
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <Image src="/icon_BIGT.png" alt="BIGT" width={32} height={32} className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-semibold text-[#1C1C1E] tracking-tight">BIGT</span>
          </Link>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors ${collapsed ? 'mt-3' : ''}`}
          >
            <ChevronLeft className={`w-4 h-4 text-[#8E8E93] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-[#8E8E93]">
                {t(section.label)}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl transition-all ${
                      collapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-2.5'
                    } ${
                      active
                        ? 'bg-[#007AFF]/10 text-[#007AFF]'
                        : 'text-[#8E8E93] hover:bg-gray-50 hover:text-[#1C1C1E]'
                    }`}
                    title={collapsed ? t(item.label) : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#007AFF]' : ''}`} />
                    {!collapsed && <span className="text-sm font-medium">{t(item.label)}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-gray-100 flex-shrink-0 ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3`}>
          {!collapsed && (
            <>
              <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#007AFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8E8E93]">
                  {t('userProfile.levelBigt')}
                </p>
                <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                  {userLevel} {t(CEFR_LEVELS[levelIndex].label)}
                </p>
              </div>
            </>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div className="bg-[#007AFF] rounded-full h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#8E8E93] mb-3">
              <span>A1</span>
              <span>C2</span>
            </div>
          </>
        )}
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          {!collapsed && (
            <>
              <p className="text-xs text-[#8E8E93] truncate max-w-[140px]">
                {userName || t('userProfile.defaultName')}
              </p>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <button
                  onClick={handleLogout}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4 text-[#8E8E93] hover:text-red-500" />
                </button>
              </div>
            </>
          )}
          {collapsed && (
            <>
              <div className="flex flex-col items-center gap-3">
                <LanguageToggle />
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4 text-[#8E8E93]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
