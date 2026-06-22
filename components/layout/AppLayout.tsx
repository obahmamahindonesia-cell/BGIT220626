'use client'

import { useState } from 'react'
import AppSidebar from './AppSidebar'
import AppTopbar from './AppTopbar'
import PageContainer from './PageContainer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 z-60 h-screen w-[280px] bg-gradient-to-b from-[#0B1F3A] to-[#123E7C]">
        <AppSidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-70 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-gradient-to-b from-[#0B1F3A] to-[#123E7C]">
            <AppSidebar mobile onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
        <AppTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  )
}
