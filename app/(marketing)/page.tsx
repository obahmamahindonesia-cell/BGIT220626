import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import DimensionsGrid from '@/components/landing/DimensionsGrid'
import ComparisonTable from '@/components/landing/ComparisonTable'
import LevelScale from '@/components/landing/LevelScale'
import WaitlistForm from '@/components/landing/WaitlistForm'
import Footer from '@/components/landing/Footer'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <DimensionsGrid />
      <ComparisonTable />
      <LevelScale />
      <WaitlistForm />
      <Footer />
    </main>
  )
}
