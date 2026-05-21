import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpStagger, fadeUpChild } from '../../../hooks/useScrollAnimation'
import { useNavigate } from 'react-router-dom'
import styles from './BentoSection.module.css'

const bentoCards = [
  {
    icon: '✦',
    title: '100% Bespoke Itineraries.',
    desc: 'Every trip is crafted from a blank canvas. Your pace, your preferences, your style. We reject the one-size-fits-all approach to travel entirely.',
    cta: true,
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    icon: '◎',
    title: '24/7 Concierge Support.',
    desc: 'From your first query to your safe return, a dedicated concierge is available at all hours.',
    dark: true,
    span: '',
  },
  {
    icon: '◈',
    title: 'Absolute Transparency.',
    desc: 'No hidden fees, no surprises. Every expense itemised before you pay.',
    span: '',
  },
  {
    icon: '◇',
    title: 'Seamless Logistics.',
    desc: 'Flights, hotels, transfers — all coordinated in a single, elegant itinerary.',
    span: 'md:col-span-2',
  },
]

export default function BentoSection() {
  const { ref, controls } = useScrollAnimation()
  const navigate = useNavigate()

  return (
    <section className="py-14 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Section header */}
        <motion.div
          ref={ref} animate={controls} initial="hidden" variants={fadeUpStagger}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-14"
        >
          <div className="max-w-2xl">
            <motion.span variants={fadeUpChild} className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> The Philosophy
            </motion.span>
            <motion.h2 variants={fadeUpChild} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-dark leading-[1.1] tracking-tight">
              Artisans of <br className="hidden sm:block" />global travel.
            </motion.h2>
          </div>
          <motion.p variants={fadeUpChild} className="text-gray-500 text-base md:text-lg font-light max-w-sm md:text-right leading-relaxed">
            We replace algorithms with experts. Every detail is immaculate, from inspiration to your safe return.
          </motion.p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 md:auto-rows-[260px]">
          {bentoCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.33, 1, 0.68, 1] }}
              className={`
                ${card.span}
                ${card.dark ? 'bg-dark text-white' : 'bg-white'}
                rounded-2xl p-7 md:p-8
                border ${card.dark ? 'border-white/10' : 'border-gray-200'}
                shadow-glass bento-hover
                flex flex-col overflow-hidden relative group
                ${card.span?.includes('row-span-2') ? 'justify-between' : 'justify-start'}
              `}
            >
              {!card.dark && (
                <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[60px] -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-1000 pointer-events-none" />
              )}

              <div className="relative z-10">
                <div className={`w-12 h-12 ${card.dark ? 'bg-white/10 text-white' : 'bg-dark text-white'} rounded-xl flex items-center justify-center text-lg mb-4 shadow-sm`}>
                  {card.icon}
                </div>
                <h3 className={`text-xl md:text-2xl font-serif font-bold ${card.dark ? 'text-white' : 'text-dark'} mb-2.5 leading-snug`}>
                  {card.title}
                </h3>
                <p className={`${card.dark ? 'text-white/70' : 'text-gray-500'} text-sm md:text-base leading-relaxed font-light`}>
                  {card.desc}
                </p>
              </div>

              {card.cta && (
                <div className="relative z-10 mt-6">
                  <button
                    onClick={() => navigate('/packages')}
                    className="inline-flex items-center gap-2 text-brand font-bold hover:gap-3.5 transition-all uppercase tracking-[0.18em] text-xs"
                  >
                    Explore Curations
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
