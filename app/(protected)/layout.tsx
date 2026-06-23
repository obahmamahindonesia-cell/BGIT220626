'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import IosNavbar from '@/components/layout/iOSNavbar'
import IosSidebar from '@/components/layout/iOSSidebar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setAuthenticated(true)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isFullScreen =
    pathname.startsWith('/onboarding') ||
    (pathname.startsWith('/test/') && pathname !== '/test' && pathname !== '/test/start')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
          <p className="text-sm text-[#8E8E93]">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="hidden lg:flex fixed left-0 top-0 z-60 h-screen">
        <IosSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-70 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[260px] h-full shadow-xl">
            <IosSidebar
              collapsed={false}
              onToggle={() => {}}
              mobile
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <IosNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8 max-w-[1200px] mx-auto w-full">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
