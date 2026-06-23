'use client'

import PageMeta from '@/components/PageMeta'
import JsonLd from '@/components/JsonLd'
import PublicLayout from '@/components/layout/PublicLayout'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import DimensionsGrid from '@/components/landing/DimensionsGrid'
import FeaturesSection from '@/components/landing/FeaturesSection'
import LevelScale from '@/components/landing/LevelScale'
import CertificateSection from '@/components/landing/CertificateSection'
import WaitlistForm from '@/components/landing/WaitlistForm'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <PublicLayout>
      <PageMeta title="BIGT — Standar Kemahiran Bahasa Indonesia untuk Dunia" description="BIGT adalah Bahasa Indonesia Global Test, sistem asesmen kemahiran Bahasa Indonesia modern berbasis kecerdasan buatan, Kerangka AKSI, dan standar global." />
      <JsonLd />
      <Hero />
      <ProblemSection />
      <DimensionsGrid />
      <FeaturesSection />
      <LevelScale />
      <CertificateSection />
      <WaitlistForm />
    </PublicLayout>
  )
}
