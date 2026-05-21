import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './HeroSection.module.css'

const wordVariants = {
  hidden: { y: '110%' },
  visible: i => ({ y: 0, transition: { duration: 1, delay: 1.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
}

function SplitTitle({ text }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className={styles.splitParent}>
            <motion.span className={styles.splitChild} variants={wordVariants} custom={i} initial="hidden" animate="visible">
              {word}
            </motion.span>
          </span>
        </span>
      ))}
    </>
  )
}

export default function HeroSection() {
  const navigate = useNavigate()
  const bgRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `scale(1.15) translateY(${window.scrollY * 0.15}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-dark">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          ref={bgRef}
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=2800"
          alt="Luxury Travel"
          className="w-full h-full object-cover opacity-80"
          style={{ transform: 'scale(1.15)', willChange: 'transform' }}
        />
      </div>
      <div className="absolute inset-0 hero-vignette" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center text-center mt-6 md:mt-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="inline-flex items-center gap-2.5 py-2 px-5 rounded-full glass-dark text-white text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-5 md:mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          Premium Concierge
        </motion.div>

        {/* Headline */}
        <h1
          className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[136px] font-serif text-white font-bold leading-[1.0] mb-5 md:mb-8 tracking-tight"
          style={{ textShadow: '0 4px 32px rgba(0,0,0,0.5)' }}
        >
          <SplitTitle text="Crafting Your" />
          {' '}
          <SplitTitle text="Perfect" />
          {' '}
          <span className={styles.accentWrap}>
            <span className={styles.splitParent}>
              <motion.span
                className={`${styles.splitChild} italic font-normal px-1`}
                style={{ color: '#FFD6D6' }}
                variants={wordVariants}
                custom={4}
                initial="hidden"
                animate="visible"
              >
                Escape.
              </motion.span>
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.33, 1, 0.68, 1] }}
          className="text-base sm:text-lg md:text-2xl text-white mb-7 md:mb-12 font-light max-w-xs sm:max-w-lg md:max-w-3xl leading-relaxed px-2 sm:px-0"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}
        >
          Bespoke international holidays curated entirely around your pace and preferences.
        </motion.p>

        {/* ── MOBILE search bar: compact single-row pill ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-sm md:hidden"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-float border border-white/60 overflow-hidden">
            <div className="flex items-center px-5 py-3.5 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">Destination</p>
                <input
                  type="text"
                  placeholder="Where to?"
                  className="w-full outline-none text-dark font-bold text-base bg-transparent placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => navigate('/packages')}
                className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center text-white shrink-0 shadow-glow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => navigate('/packages')}
              className="w-full bg-brand text-white py-3.5 font-bold text-sm tracking-wide"
            >
              Explore Journeys →
            </button>
          </div>
        </motion.div>

        {/* ── DESKTOP search bar: full multi-field pill ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="hidden md:flex w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-full p-2.5 shadow-float flex-row gap-2 relative z-20 border border-white/60"
        >
          <div className="flex-1 bg-white/80 hover:bg-white transition-colors duration-500 rounded-full p-4 px-8 flex flex-col cursor-pointer group">
            <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1 group-hover:text-brand transition-colors">Destination</label>
            <input type="text" placeholder="Where to?" className="w-full outline-none text-dark font-bold text-lg bg-transparent placeholder-gray-500" />
          </div>
          <div className="w-px bg-gray-300/60 my-4" />
          <div className="flex-1 bg-white/80 hover:bg-white transition-colors duration-500 rounded-full p-4 px-8 flex flex-col cursor-pointer group">
            <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1 group-hover:text-brand transition-colors">Duration</label>
            <select className="w-full outline-none text-dark font-bold text-lg bg-transparent cursor-pointer appearance-none">
              <option value="">Any length</option>
              <option value="3-5">3 – 5 Days</option>
              <option value="6-9">6 – 9 Days</option>
              <option value="10+">10+ Days</option>
            </select>
          </div>
          <div className="w-px bg-gray-300/60 my-4" />
          <div className="flex-1 bg-white/80 hover:bg-white transition-colors duration-500 rounded-full p-4 px-8 flex flex-col cursor-pointer group">
            <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1 group-hover:text-brand transition-colors">Travelers</label>
            <select className="w-full outline-none text-dark font-bold text-lg bg-transparent cursor-pointer appearance-none">
              <option value="">Who's going?</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/packages')}
            className="bg-brand text-white w-20 rounded-full font-bold hover:bg-brand-hover transition-all duration-300 flex items-center justify-center group shadow-glow"
          >
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/80"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-3">Discover</span>
        <div className="w-[1px] h-10 bg-white/50 relative overflow-hidden">
          <div className="w-full h-full bg-white absolute top-0 -translate-y-full animate-slideDown" />
        </div>
      </motion.div>
    </section>
  )
}
