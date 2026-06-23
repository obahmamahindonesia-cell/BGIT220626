'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import LanguageToggle from '@/components/LanguageToggle'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/framework', label: t('nav.framework') },
    { href: '/levels', label: t('nav.levels') },
    { href: '/products', label: t('nav.products') },
    { href: '/verify', label: t('nav.verify') },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-xl ${scrolled ? 'shadow-sm border-b border-[#E5EAF2]' : 'border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo_BIGT.png" alt="BIGT Logo" width={120} height={40} className="h-9 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-[#0B1F3A]/70 hover:text-[#D7193F] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-sm rounded-lg text-[#0B1F3A]/80 hover:text-[#0B1F3A] hover:bg-[#0B1F3A]/10">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white text-sm px-5 rounded-lg">
              {t('nav.joinWaitlist')}
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-[#0B1F3A]/80"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white backdrop-blur-xl border-t border-[#E5EAF2] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="block text-[#0B1F3A]/70 hover:text-[#0B1F3A] text-sm py-2 font-medium"
              onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <Link href="/login" className="block text-[#0B1F3A]/80 text-sm py-2 font-medium" onClick={() => setMobileOpen(false)}>{t('nav.login')}</Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#D7193F] hover:bg-[#D7193F]/90 text-white text-sm rounded-lg">{t('nav.joinWaitlist')}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
