'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

interface PublicLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function PublicLayout({ children, className = '' }: PublicLayoutProps) {
  return (
    <main className={`min-h-screen bg-[#F7F9FC] ${className}`}>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </main>
  )
}
