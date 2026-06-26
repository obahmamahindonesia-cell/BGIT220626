'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, User, ChevronDown, Menu, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LanguageToggle from '@/components/LanguageToggle'
import Logo from '@/components/brand/Logo'

interface IosNavbarProps {
  onMenuClick: () => void
}

export default function IosNavbar({ onMenuClick }: IosNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        const json = await res.json()
        if (json.success && json.data) {
          setUserName(json.data.name || json.data.email?.split('@')[0] || 'Pengguna')
          setUserAvatar(json.data.avatarUrl || '')
        }
      } catch {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) setUserName(user.email.split('@')[0])
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = userName ? userName.charAt(0).toUpperCase() : 'U'

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Dasbor'
    if (pathname === '/test') return 'Tes'
    if (pathname === '/test/start') return 'Mulai Tes'
    if (pathname.startsWith('/test/history')) return 'Riwayat Tes'
    if (pathname.startsWith('/test/') && pathname !== '/test' && pathname !== '/test/start') {
      if (pathname.includes('/results')) return 'Hasil Tes'
      return 'Tes'
    }
    if (pathname === '/profile') return 'Profil'
    return ''
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-bigt-surface/90 backdrop-blur-md border-b border-bigt-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-bigt-text" />
          </button>
          <div className="flex items-center gap-2">
            <Logo variant="mark" className="h-6 w-6 lg:hidden" />
            {getBreadcrumb() && (
              <>
                <span className="text-sm text-bigt-muted hidden lg:block">/</span>
                <span className="text-sm text-bigt-muted hidden lg:block">{getBreadcrumb()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <Bell className="w-5 h-5 text-bigt-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3B30]" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-bigt-surface rounded-2xl shadow-lg border border-bigt-border py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 pb-2 border-b border-bigt-border">
                  <p className="text-sm font-semibold text-bigt-text">Notifikasi</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <Bell className="w-8 h-8 text-bigt-muted mx-auto mb-2" />
                  <p className="text-sm text-bigt-muted">Belum ada notifikasi</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-semibold">
                  {initial}
                </div>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-bigt-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-bigt-surface rounded-2xl shadow-lg border border-bigt-border py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 border-b border-bigt-border">
                  <p className="text-sm font-medium text-bigt-text truncate">{userName || 'Pengguna'}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-bigt-text hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 text-bigt-muted" />
                  Profil
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-bigt-text hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-bigt-muted" />
                  Pengaturan
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
