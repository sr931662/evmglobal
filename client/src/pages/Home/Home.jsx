import HeroSection from '../../components/home/HeroSection/HeroSection'
import PartnersMarquee from '../../components/home/PartnersMarquee/PartnersMarquee'
import BentoSection from '../../components/home/BentoSection/BentoSection'
import DestinationsFeatured from '../../components/home/DestinationsFeatured/DestinationsFeatured'
import ProcessSection from '../../components/home/ProcessSection/ProcessSection'
import InquirySection from '../../components/home/InquirySection/InquirySection'
import HomeCTA from '../../components/home/HomeCTA/HomeCTA'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <PartnersMarquee />
      <BentoSection />
      <DestinationsFeatured />
      <ProcessSection />
      <InquirySection />
      <HomeCTA />
    </main>
  )
}
