import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ItineraryAccordion from '../../components/packageDetails/ItineraryAccordion/ItineraryAccordion'
import PricingWidget from '../../components/packageDetails/PricingWidget/PricingWidget'
import { inclusions, exclusions } from '../../data/packages'
import styles from './PackageDetails.module.css'

const tabs = ['The Itinerary', 'Inclusions', 'Accommodations']

export default function PackageDetails() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-full" style={{ y: bgY }}>
          <img
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=2800"
            alt="Paris"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-dark/40 to-dark/50" />

        <div className="absolute bottom-16 w-full z-10">
          <div className="max-w-[95rem] mx-auto px-6 sm:px-8 lg:px-12">
            <button
              onClick={() => navigate('/packages')}
              className="text-white flex items-center gap-4 text-base font-bold mb-12 glass px-8 py-4 rounded-full w-fit group hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
              Back to Curations
            </button>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }} className="flex flex-wrap gap-5 items-center mb-8">
              <span className="bg-brand text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-glow">Honeymoon</span>
              <span className="text-white/90 text-sm font-bold flex items-center gap-3">⏱ 6 Nights / 7 Days</span>
              <span className="text-white/40 hidden sm:block">|</span>
              <span className="text-white/90 text-sm font-bold flex items-center gap-3">📍 Paris, France • Zurich, Switzerland</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22,1,0.36,1] }}
              className="text-6xl md:text-8xl font-serif font-bold text-white mb-4 leading-tight max-w-5xl tracking-tight"
            >
              Romantic European Escapade
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[95rem] mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="flex flex-col lg:flex-row gap-16 relative items-start">
          {/* Left */}
          <div className="w-full lg:w-[65%] xl:w-[70%]">
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-4 no-scrollbar mb-16 sticky top-[90px] z-30 bg-gray-50/95 backdrop-blur-2xl py-6 border-b border-gray-200/50 -mx-6 px-6 sm:mx-0 sm:px-0">
              {tabs.map((tab, i) => (
                <button key={tab} className={`px-10 py-4 rounded-full text-base font-bold whitespace-nowrap transition-colors shadow-sm ${i === 0 ? 'bg-dark text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:text-dark'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <ItineraryAccordion />

            {/* Inclusions / Exclusions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
              className="mt-20 bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 shadow-glass"
            >
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-dark mb-12 tracking-tight">What's Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="bg-green-50/30 rounded-[2.5rem] p-10 border border-green-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-bl-[100px] pointer-events-none" />
                  <h4 className="font-bold text-green-700 mb-8 flex items-center gap-4 text-2xl">✅ Inclusions</h4>
                  <ul className="space-y-6">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-700 font-medium text-lg">
                        <span className="text-green-500 mt-1.5">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50/30 rounded-[2.5rem] p-10 border border-red-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-bl-[100px] pointer-events-none" />
                  <h4 className="font-bold text-brand mb-8 flex items-center gap-4 text-2xl">❌ Exclusions</h4>
                  <ul className="space-y-6">
                    {exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-700 font-medium text-lg">
                        <span className="text-brand mt-1.5 text-xl">✕</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Pricing Widget */}
          <div className="w-full lg:w-[35%] xl:w-[30%]">
            <PricingWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
