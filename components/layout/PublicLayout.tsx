'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import PageContainer from './PageContainer'
import SectionContainer from './SectionContainer'

interface PublicLayoutProps {
  children: React.ReactNode
  className?: string
  hero?: boolean
}

export default function PublicLayout({ children, className = '', hero }: PublicLayoutProps) {
  return (
    <main className={`min-h-screen bg-[#F7F9FC] ${className}`}>
      <Navbar />
      <div className={hero ? 'pt-20' : 'pt-20'}>
        {children}
      </div>
      <Footer />
    </main>
  )
}
