import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
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

const TYPED_PLACEHOLDERS = [
  'Thailand',
  'Andaman',
  'Kashmir',
  'Vietnam',
  'Dubai',
  'Bali',
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Cycles the search placeholder with a type-in / type-out effect.
function useTypedPlaceholder(phrases, active = true) {
  const [text, setText] = useState(() => (prefersReducedMotion() ? phrases[0] : ''))

  useEffect(() => {
    if (!active || prefersReducedMotion()) return

    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timer

    const tick = () => {
      const phrase = phrases[phraseIndex]
      charIndex += deleting ? -1 : 1
      setText(phrase.slice(0, charIndex))

      let delay = deleting ? 40 : 85
      if (!deleting && charIndex === phrase.length) {
        deleting = true
        delay = 1600
      } else if (deleting && charIndex === 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % phrases.length
        delay = 350
      }
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, 600)
    return () => clearTimeout(timer)
  }, [phrases, active])

  return text
}

// Opens the 30-second holiday planner instead of dropping the visitor straight
// into the package list — the enquiry is worth more than the search result.
function openPlanner(prefill) {
  window.dispatchEvent(new CustomEvent('open-travel-quiz', { detail: prefill }))
}

export default function HeroSection() {
  const navigate  = useNavigate()
  const heroRef   = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  const [destInput,      setDestInput]      = useState('')
  const [duration,       setDuration]       = useState('')
  const [travelers,      setTravelers]      = useState('')
  const [allDests,       setAllDests]       = useState([])
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [mobileDestInput, setMobileDestInput] = useState('')
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const typedPlaceholder       = useTypedPlaceholder(TYPED_PLACEHOLDERS, !destInput)
  const typedMobilePlaceholder = useTypedPlaceholder(TYPED_PLACEHOLDERS, !mobileDestInput)

  useEffect(() => {
    api.getDestinations({})
      .then(data => setAllDests(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filteredDests = destInput.trim()
    ? allDests.filter(d => d.name.toLowerCase().includes(destInput.toLowerCase()))
    : allDests.slice(0, 8)

  const filteredMobileDests = mobileDestInput.trim()
    ? allDests.filter(d => d.name.toLowerCase().includes(mobileDestInput.toLowerCase()))
    : allDests.slice(0, 6)

  const handleSearch = () => {
    openPlanner({ destination: destInput.trim(), season: duration, travellers: travelers })
  }

  const handleMobileSearch = () => {
    openPlanner({ destination: mobileDestInput.trim() })
  }

  const browsePackages = (name) => {
    const params = new URLSearchParams()
    if (name.trim()) params.set('destination', name.trim())
    navigate(params.toString() ? `/packages?${params}` : '/packages')
  }

  const selectDest = (name) => {
    setDestInput(name)
    setShowDropdown(false)
  }

  const selectMobileDest = (name) => {
    setMobileDestInput(name)
    setShowMobileDropdown(false)
  }

  return (
    <section ref={heroRef} className={styles.section}>
      {/* Background */}
      <div className={styles.bgWrap}>
        <motion.img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=2800"
          alt="Premium Travel"
          className={styles.bgImg}
          style={{ y: bgY }}
        />
      </div>
      <div className={`${styles.vignette} hero-vignette`} />

      {/* Content */}
      <div className={styles.content}>

        {/* Headline */}
        <h1 className={styles.headline}>
          <SplitTitle text="Your Journey." />
          {' '}
          <span className={styles.accentWrap}>
            <span className={styles.splitParent}>
              <motion.span
                className={styles.splitChild}
                style={{ color: '#FFD6D6', fontStyle: 'italic', fontWeight: 400, padding: '0 4px' }}
                variants={wordVariants}
                custom={2}
                initial="hidden"
                animate="visible"
              >
                Our Expertise.
              </motion.span>
            </span>
          </span>
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.33, 1, 0.68, 1] }}
          className={styles.subtitle}
        >
          Serving Memories since 2022
        </motion.p>

        {/* Quiz CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.55, ease: [0.33, 1, 0.68, 1] }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openPlanner()}
          className={styles.quizBtn}
        >
          <PingDot />
          <span>Get My Holiday Quote</span>
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
          <div className={styles.searchMobileCard} style={{ position: 'relative' }}>
            <div className={styles.searchMobileRow}>
              <div className={styles.searchMobileField}>
                <span className={styles.searchFieldLabel}>Where do you want to go?</span>
                <input
                  type="text"
                  placeholder={`${typedMobilePlaceholder}|`}
                  className={styles.searchFieldInput}
                  value={mobileDestInput}
                  onChange={e => { setMobileDestInput(e.target.value); setShowMobileDropdown(true) }}
                  onFocus={() => setShowMobileDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMobileDropdown(false), 150)}
                />
              </div>
              <button onClick={handleMobileSearch} className={styles.searchMobileGo}>
                {ARROW}
              </button>
            </div>
            <button onClick={handleMobileSearch} className={styles.searchMobileExplore}>
              Plan My Holiday →
            </button>
            <button onClick={() => browsePackages(mobileDestInput)} className={styles.searchMobileBrowse}>
              or browse holiday packages
            </button>
            {showMobileDropdown && filteredMobileDests.length > 0 && (
              <div className={styles.dropdownMobile}>
                {filteredMobileDests.map(d => (
                  <button key={d.id || d._id} className={styles.dropdownItem} onMouseDown={() => selectMobileDest(d.name)}>
                    <span className={styles.dropdownIcon}>📍</span> {d.name}
                    <span className={styles.dropdownCountry}>{d.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Desktop search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className={styles.searchDesktop}
          ref={dropdownRef}
        >
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>Where do you want to go?</label>
            <input
              type="text"
              placeholder={`${typedPlaceholder}|`}
              className={styles.searchInput}
              value={destInput}
              onChange={e => { setDestInput(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>When?</label>
            <select className={styles.searchSelect} value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="">Travel dates / Flexible</option>
              <option value="spring">Spring · Mar – May</option>
              <option value="summer">Summer · Jun – Aug</option>
              <option value="autumn">Autumn · Sep – Nov</option>
              <option value="winter">Winter · Dec – Feb</option>
            </select>
          </div>
          <div className={styles.searchDivider} />
          <div className={styles.searchField}>
            <label className={styles.searchFieldLabel2}>Who's travelling?</label>
            <select className={styles.searchSelect} value={travelers} onChange={e => setTravelers(e.target.value)}>
              <option value="">2 Adults, 1 Child</option>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>
          <button onClick={handleSearch} className={styles.searchGoBtn}>
            {ARROW}
          </button>
          {showDropdown && filteredDests.length > 0 && (
            <div className={styles.dropdown}>
              {filteredDests.map(d => (
                <button key={d.id || d._id} className={styles.dropdownItem} onMouseDown={() => selectDest(d.name)}>
                  <span className={styles.dropdownIcon}>📍</span> {d.name}
                  <span className={styles.dropdownCountry}>{d.country}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.9 }}
          onClick={() => browsePackages(destInput)}
          className={styles.browseLink}
        >
          or browse holiday packages →
        </motion.button>
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
