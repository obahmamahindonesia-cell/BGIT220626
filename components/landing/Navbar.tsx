'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/about', label: 'Tentang' },
    { href: '/framework', label: 'Framework' },
    { href: '/levels', label: 'Level' },
    { href: '/products', label: 'Produk' },
    { href: '/verify', label: 'Verifikasi' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg' : 'bg-[#0B1F3A]'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#C9A84C] font-[family-name:var(--font-playfair)] text-xl font-bold tracking-wide">BGIT</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#C8102E] hover:bg-red-800 text-white text-sm px-5">
              Gabung Waitlist
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0B1F3A] border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-white/70 hover:text-white text-sm py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link href="/login" className="block text-white/80 text-sm py-2" onClick={() => setMobileOpen(false)}>
              Masuk
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#C8102E] hover:bg-red-800 text-white text-sm">
                Gabung Waitlist
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
