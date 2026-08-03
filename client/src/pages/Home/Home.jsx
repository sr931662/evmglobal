import HeroSection from '../../components/home/HeroSection/HeroSection'
import PartnersMarquee from '../../components/home/PartnersMarquee/PartnersMarquee'
import TrustBadges from '../../components/home/TrustBadges/TrustBadges'
import TrendingDestinations from '../../components/home/TrendingDestinations/TrendingDestinations'
import RegionPackages from '../../components/home/RegionPackages/RegionPackages'
import ProcessSection from '../../components/home/ProcessSection/ProcessSection'
import GallerySection from '../../components/home/GallerySection/GallerySection'
import BlogSection from '../../components/home/BlogSection/BlogSection'
import TestimonialsSection from '../../components/home/TestimonialsSection/TestimonialsSection'
import FAQSection from '../../components/home/FAQSection/FAQSection'
import LeadForm from '../../components/home/LeadForm/LeadForm'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Home() {
  usePageMeta(
    'Ease My Vacations (EMV) | Best Holiday Packages & Travel Company in India',
    'Book affordable domestic and international holiday packages with Ease My Vacations (EMV). Explore customized vacations, honeymoon tours, family holidays, group trips, adventure travel, and exclusive travel deals across India and worldwide.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}` : '',
      type: 'website'
    }
  )
  return (
    <main>
      <HeroSection />
      <PartnersMarquee />
      <TrustBadges />
      <TrendingDestinations />
      <RegionPackages />
      <ProcessSection />
      <GallerySection />
      <BlogSection />
      <TestimonialsSection />
      <FAQSection />
      <LeadForm />
    </main>
  )
}
