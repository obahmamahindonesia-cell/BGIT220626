'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg' : 'bg-[#0B1F3A]'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#C9A84C] font-[family-name:var(--font-playfair)] text-xl font-bold">UKBI-Next</span>
          <span className="text-white/40 text-sm">by BahasaCerdas</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#dimensi" className="text-white/70 hover:text-white text-sm transition-colors">6 Dimensi</a>
          <a href="#perbandingan" className="text-white/70 hover:text-white text-sm transition-colors">Perbandingan</a>
          <a href="#level" className="text-white/70 hover:text-white text-sm transition-colors">Level CEFR</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#C8102E] hover:bg-red-800 text-white text-sm px-5">
              Mulai Test Gratis
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
