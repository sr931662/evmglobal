import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import PricingWidget from '../../components/packageDetails/PricingWidget/PricingWidget'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './PackageDetails.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800'

export default function PackageDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const heroRef    = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY        = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const [pkg,     setPkg]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!id) { navigate('/packages', { replace: true }); return }
    setLoading(true)
    api.getPackage(id)
      .then(setPkg)
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !pkg) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <p className="text-gray-500 font-bold text-xl">{error || 'Package not found.'}</p>
      <button onClick={() => navigate('/packages')} className="bg-brand text-white px-8 py-3 rounded-full font-bold">
        Back to Packages
      </button>
    </div>
  )

  const destinations = Array.isArray(pkg.destinations) ? pkg.destinations : []
  const highlights   = Array.isArray(pkg.highlights)   ? pkg.highlights   : []
  const inclusions   = Array.isArray(pkg.inclusions)   ? pkg.inclusions   : highlights
  const exclusions   = Array.isArray(pkg.exclusions) && pkg.exclusions.length
    ? pkg.exclusions
    : ['Visa fees & processing', 'City taxes (payable at hotel)', 'Personal expenses & shopping', 'Tips & gratuities']
  const itinerary    = Array.isArray(pkg.itinerary)    ? pkg.itinerary    : []
  const heroImage    = pkg.image || FALLBACK_IMAGE

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[75vh] min-h-[600px] w-full overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-full" style={{ y: bgY }}>
          <img
            src={heroImage}
            alt={pkg.title}
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
              <span className="bg-brand text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-glow">{pkg.category}</span>
              <span className="text-white/90 text-sm font-bold flex items-center gap-3">⏱ {pkg.nights} Nights / {pkg.nights + 1} Days</span>
              {destinations.length > 0 && (
                <>
                  <span className="text-white/40 hidden sm:block">|</span>
                  <span className="text-white/90 text-sm font-bold flex items-center gap-3">📍 {destinations.join(' • ')}</span>
                </>
              )}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22,1,0.36,1] }}
              className="text-6xl md:text-8xl font-serif font-bold text-white mb-4 leading-tight max-w-5xl tracking-tight"
            >
              {pkg.title}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[95rem] mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="flex flex-col lg:flex-row gap-16 relative items-start">
          {/* Left */}
          <div className="w-full lg:w-[65%] xl:w-[70%]">

            {/* Description */}
            {pkg.description && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 shadow-glass mb-12"
              >
                <h3 className="text-3xl font-serif font-bold text-dark mb-6 tracking-tight">About This Journey</h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">{pkg.description}</p>
              </motion.div>
            )}

            {/* Inclusions & Exclusions */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 shadow-glass mt-12"
              >
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-dark mb-12 tracking-tight">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {inclusions.length > 0 && (
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
                  )}
                  {exclusions.length > 0 && (
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
                  )}
                </div>
              </motion.div>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 shadow-glass mt-12"
              >
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-dark mb-12 tracking-tight">Day-by-Day Itinerary</h3>
                <div className="space-y-6">
                  {itinerary.map((day) => (
                    <details key={day.day} className="group border border-gray-100 rounded-[2rem] overflow-hidden" open={day.day === 1}>
                      <summary className="flex items-center gap-5 px-8 py-6 cursor-pointer select-none bg-gray-50/60 hover:bg-gray-50 transition-colors list-none">
                        <span className="w-10 h-10 bg-dark text-white rounded-2xl text-sm font-black flex items-center justify-center shrink-0">
                          {day.day}
                        </span>
                        <span className="font-bold text-dark text-lg flex-1">{day.title || `Day ${day.day}`}</span>
                        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      {Array.isArray(day.activities) && day.activities.length > 0 && (
                        <div className="px-8 py-6 space-y-4 border-t border-gray-100">
                          {day.activities.map((act, ai) => (
                            <div key={ai} className="flex items-start gap-4">
                              <span className="text-xl shrink-0 mt-0.5">{act.icon || '📍'}</span>
                              <div className="flex-1">
                                {act.time && <span className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mr-3">{act.time}</span>}
                                <span className="text-gray-700 font-medium text-base">{act.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Pricing Widget + Inquiry CTA */}
          <div className="w-full lg:w-[35%] xl:w-[30%] space-y-6">
            <PricingWidget pkg={pkg} />

            {/* Inline inquiry CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-dark rounded-[2.5rem] p-8 text-white text-center"
            >
              <span className="text-3xl mb-4 block">✉️</span>
              <h4 className="font-serif font-bold text-xl mb-2">Send an Inquiry</h4>
              <p className="text-gray-400 text-sm font-light mb-6 leading-relaxed">
                Get a personalised quote for this package within 24 hours.
              </p>
              <Link
                to={`/contact?package=${encodeURIComponent(pkg.title)}`}
                className="block w-full bg-brand text-white py-4 rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shadow-glow text-center mb-3"
              >
                Inquire About This Package
              </Link>
              <button
                onClick={() => openWhatsApp(pkg.title)}
                className="block w-full bg-white/10 border border-white/20 text-white py-3.5 rounded-full font-bold text-sm hover:bg-white/20 transition-colors text-center"
              >
                Chat on WhatsApp
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
