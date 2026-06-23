'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Lang, getTranslation } from './translations'

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'bigt_lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === 'en' || stored === 'id') setLangState(stored)
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'id' ? 'en' : 'id')
  }, [lang, setLang])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return getTranslation(key, lang, params)
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
