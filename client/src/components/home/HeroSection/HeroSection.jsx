import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './HeroSection.module.css'

const wordVariants = {
  hidden: { y: '110%' },
  visible: i => ({
    y: 0,
    transition: { duration: 1, delay: 1.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
}

function PingDot() {
  return (
    <span className={styles.pingWrap}>
      <motion.span
        className={styles.pingRing}
        animate={{ scale: [1, 2], opacity: [0.75, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <span className={styles.pingDot} />
    </span>
  )
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

const ARROW = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

export default function HeroSection() {
  const navigate  = useNavigate()
  const heroRef   = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <section ref={heroRef} className={styles.section}>
      {/* Background */}
      <div className={styles.bgWrap}>
        <motion.img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=2800"
          alt="Luxury Travel"
          className={styles.bgImg}
          style={{ y: bgY }}
        />
      </div>
      <div className={`${styles.vignette} hero-vignette`} />

      {/* Content */}
      <div className={styles.content}>

        {/* Headline */}
        <h1 className={styles.headline}>
          <SplitTitle text="Crafting Your" />
          {' '}
          <SplitTitle text="Perfect" />
          {' '}
          <span className={styles.accentWrap}>
            <span className={styles.splitParent}>
              <motion.span
                className={styles.splitChild}
                style={{ color: '#FFD6D6', fontStyle: 'italic', fontWeight: 400, padding: '0 4px' }}
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
          className={styles.subtitle}
        >
          Bespoke international holidays curated entirely around your pace and preferences.
        </motion.p>

        {/* Quiz CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.55, ease: [0.33, 1, 0.68, 1] }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
          className={`${styles.quizBtn} glass-dark`}
        >
          <PingDot />
          <span>Plan My Perfect Trip</span>
          <svg className={styles.quizArrow} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.button>

        {/* Mobile search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className={styles.searchMobile}
        >
          <div className={styles.searchMobileCard}>
            <div className={styles.searchMobileRow}>
              <div className={styles.searchMobileField}>
                <span className={styles.searchFieldLabel}>Destination</span>
                <input type="text" placeholder="Where to?" className={styles.searchFieldInput} />
              </div>
              <button onClick={() => navigate('/packages')} className={styles.searchMobileGo}>
                {ARROW}
              </button>
            </div>
            <button onClick={() => navigate('/packages')} className={styles.searchMobileExplore}>
              Explore Journeys →
            </button>
          </div>
        </motion.div>

        {/* Desktop search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className={styles.searchDesktop}
        >
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>Destination</label>
            <input type="text" placeholder="Where to?" className={styles.searchInput} />
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>Duration</label>
            <select className={styles.searchSelect}>
              <option value="">Any length</option>
              <option value="3-5">3 – 5 Days</option>
              <option value="6-9">6 – 9 Days</option>
              <option value="10+">10+ Days</option>
            </select>
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>Travelers</label>
            <select className={styles.searchSelect}>
              <option value="">Who's going?</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>
          <button onClick={() => navigate('/packages')} className={styles.searchGoBtn}>
            {ARROW}
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className={styles.scrollIndicator}
      >
        <span className={styles.scrollLabel}>Discover</span>
        <div className={styles.scrollLine}>
          <motion.div
            style={{ width: '100%', height: '100%', background: '#fff', position: 'absolute', top: 0 }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
