'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) setUserName(user.user_metadata.name)
      else if (user?.email) setUserName(user.email.split('@')[0])
      if (user?.user_metadata?.avatar_url) setUserAvatar(user.user_metadata.avatar_url)
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
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
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E5EAF2]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-[#1C1C1E]" />
          </button>
          <div className="flex items-center gap-2">
            <Logo variant="mark" className="h-6 w-6 lg:hidden" />
            {getBreadcrumb() && (
              <>
                <span className="text-sm text-[#C7C7CC] hidden lg:block">/</span>
                <span className="text-sm text-[#8E8E93] hidden lg:block">{getBreadcrumb()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Bell className="w-5 h-5 text-[#8E8E93]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3B30]" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-semibold">
                  {initial}
                </div>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-[#8E8E93] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-[#1C1C1E] truncate">{userName || 'Pengguna'}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1C1C1E] hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-[#8E8E93]" />
                  Profil
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1C1C1E] hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#8E8E93]" />
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
