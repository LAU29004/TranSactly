
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import Features from '@/components/Features'
import AppShowcase from '@/components/AppShowcase'
import Testimonials from '@/components/Testimonials'
import Workflow from '@/components/Workflow'
import CTA from '@/components/CTA'


export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0F0D]">
      <Hero />
      <StatsBar />
      <Features />
      <AppShowcase />
      <Testimonials />
      <Workflow />
      <CTA />
    </main>
  )
}
