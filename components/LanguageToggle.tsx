'use client'

import { useI18n } from '@/lib/i18n/context'

export default function LanguageToggle() {
  const { lang, toggleLang } = useI18n()

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-100 hover:bg-gray-200 text-gray-600"
      title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
    >
      <span className={lang === 'id' ? 'font-bold text-gray-900' : 'text-gray-400'}>ID</span>
      <span className="text-gray-300">/</span>
      <span className={lang === 'en' ? 'font-bold text-gray-900' : 'text-gray-400'}>EN</span>
    </button>
  )
}
