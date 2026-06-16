import HeroSection from '../../components/home/HeroSection/HeroSection'
import PartnersMarquee from '../../components/home/PartnersMarquee/PartnersMarquee'
import BentoSection from '../../components/home/BentoSection/BentoSection'
import DestinationsFeatured from '../../components/home/DestinationsFeatured/DestinationsFeatured'
import ProcessSection from '../../components/home/ProcessSection/ProcessSection'
import BlogSection from '../../components/home/BlogSection/BlogSection'
import InquirySection from '../../components/home/InquirySection/InquirySection'
import HomeCTA from '../../components/home/HomeCTA/HomeCTA'
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
      <BentoSection />
      <DestinationsFeatured />
      <ProcessSection />
      <BlogSection />
      <InquirySection />
      <HomeCTA />
    </main>
  )
}
