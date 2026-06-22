'use client'

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
