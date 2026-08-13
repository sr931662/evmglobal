import HeroSection from '../../components/home/HeroSection/HeroSection'
import TrustBadges from '../../components/home/TrustBadges/TrustBadges'
import PopularHolidays from '../../components/home/PopularHolidays/PopularHolidays'
import DestinationsFeatured from '../../components/home/DestinationsFeatured/DestinationsFeatured'
import HolidayStyles from '../../components/home/HolidayStyles/HolidayStyles'
import EMVDifference from '../../components/home/EMVDifference/EMVDifference'
import ProcessSection from '../../components/home/ProcessSection/ProcessSection'
import GallerySection from '../../components/home/GallerySection/GallerySection'
import TrustStats from '../../components/home/TrustStats/TrustStats'
import TestimonialsSection from '../../components/home/TestimonialsSection/TestimonialsSection'
import ReviewsCredibility from '../../components/home/ReviewsCredibility/ReviewsCredibility'
import MoreThanHolidays from '../../components/home/MoreThanHolidays/MoreThanHolidays'
import PartnersMarquee from '../../components/home/PartnersMarquee/PartnersMarquee'
import BlogSection from '../../components/home/BlogSection/BlogSection'
import FAQSection from '../../components/home/FAQSection/FAQSection'
import LeadForm from '../../components/home/LeadForm/LeadForm'
import HomeCTA from '../../components/home/HomeCTA/HomeCTA'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Home() {
  usePageMeta(
    'Ease My Vacations | Best Holiday Packages & Travel Company in India',
    'Book affordable domestic and international holiday packages with Ease My Vacations. Explore customized vacations, honeymoon tours, family holidays, group trips, adventure travel, and exclusive travel deals across India and worldwide.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}` : '',
      type: 'website'
    }
  )
  return (
    <main>
      {/* 01 — Hero: headline, tagline, holiday planner entry point */}
      <HeroSection />
      {/* 02 — Trust / USP strip */}
      <TrustBadges />
      {/* 03 — Popular holidays, with pricing and inclusions */}
      <PopularHolidays />
      {/* 04 — Destinations */}
      <DestinationsFeatured />
      {/* 05 — Holiday styles */}
      <HolidayStyles />
      {/* 06 — The Ease My Vacations difference */}
      <EMVDifference />
      {/* 07 — How it works */}
      <ProcessSection />
      {/* 08 — Real customer experiences */}
      <GallerySection />
      {/* 09 — Trust metrics, testimonials and review credibility */}
      <TrustStats />
      <TestimonialsSection />
      <ReviewsCredibility />
      {/* 10 — Services beyond holidays */}
      <MoreThanHolidays />
      <PartnersMarquee />
      {/* 11 — Travel inspiration */}
      <BlogSection />
      {/* 12 — FAQ */}
      <FAQSection />
      {/* 13 — Final CTA: inline enquiry, then the closing conversion block */}
      <LeadForm />
      <HomeCTA />
    </main>
  )
}
