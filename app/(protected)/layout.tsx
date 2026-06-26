'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

import IosSidebar from '@/components/layout/iOSSidebar'
import IosNavbar from '@/components/layout/iOSNavbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        window.location.href = '/login'
        return
      }
      setAuthenticated(true)
      setLoading(false)
    }
    checkAuth()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isFullScreen =
    pathname.startsWith('/onboarding') ||
    (pathname.startsWith('/test/') && pathname !== '/test' && pathname !== '/test/start' && !pathname.startsWith('/test/history') && pathname.split('/').length === 3)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bigt-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
          <p className="text-sm text-bigt-muted">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-bigt-bg text-bigt-text">
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[280px]">
        <IosSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[280px] h-full shadow-xl">
            <IosSidebar mobile onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen lg:pl-[280px]">
        <IosNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
