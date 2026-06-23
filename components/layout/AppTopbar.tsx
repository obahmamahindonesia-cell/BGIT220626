'use client'

import { Menu } from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'

interface AppTopbarProps {
  onMenuClick: () => void
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-[#0B1F3A]" />
      </button>
      <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#0B1F3A]">BIGT</span>
      <LanguageToggle />
    </header>
  )
}
