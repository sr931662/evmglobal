import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { api } from '../../../services/api'

// ─── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS = [
  { id: 'europe',         label: 'Europe',         sub: 'Paris · Rome · Santorini',      img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&q=75&auto=format&fit=crop' },
  { id: 'maldives',       label: 'Maldives',        sub: 'Overwater villas · Lagoons',    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=75&auto=format&fit=crop' },
  { id: 'southeast-asia', label: 'Southeast Asia',  sub: 'Bali · Thailand · Vietnam',     img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&q=75&auto=format&fit=crop' },
  { id: 'middle-east',    label: 'Middle East',     sub: 'Dubai · Abu Dhabi · Jordan',    img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=700&q=75&auto=format&fit=crop' },
  { id: 'americas',       label: 'The Americas',    sub: 'New York · Cancún · Patagonia', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=75&auto=format&fit=crop' },
  { id: 'africa',         label: 'Africa & Safari', sub: 'Kenya · Tanzania · Zanzibar',   img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&q=75&auto=format&fit=crop' },
]

const SEASONS = [
  { id: 'spring', label: 'Spring', sub: 'Mar – May · Bloom season',   icon: '🌸', accent: '#f472b6' },
  { id: 'summer', label: 'Summer', sub: 'Jun – Aug · Peak adventure', icon: '☀️', accent: '#fbbf24' },
  { id: 'autumn', label: 'Autumn', sub: 'Sep – Nov · Golden hues',    icon: '🍂', accent: '#fb923c' },
  { id: 'winter', label: 'Winter', sub: 'Dec – Feb · Snow & magic',   icon: '❄️', accent: '#60a5fa' },
]

const TRAVELLERS = [
  { id: 'solo',   label: 'Solo Explorer',   sub: 'Me, the world & my passport',    icon: '🧳', accent: '#a78bfa' },
  { id: 'couple', label: 'Romantic Couple', sub: 'Two hearts, one adventure',      icon: '💑', accent: '#f43f5e' },
  { id: 'family', label: 'Family Tribe',    sub: 'Making memories together',       icon: '👨‍👩‍👧‍👦', accent: '#34d399' },
  { id: 'group',  label: 'Squad Goals',     sub: 'Friends unleashed on the world', icon: '🎉', accent: '#fbbf24' },
]

const BUDGETS = [
  { id: 'under50k', label: 'Under ₹50K', sub: 'Smart & stylish escapes',   icon: '🌿', accent: '#34d399' },
  { id: '50k-1l',   label: '₹50K – ₹1L', sub: 'Comfort meets culture',    icon: '💎', accent: '#60a5fa' },
  { id: '1l-2l',    label: '₹1L – ₹2L',  sub: 'Luxury & leisure vibes',   icon: '✨', accent: '#fbbf24' },
  { id: 'above2l',  label: '₹2L+',        sub: 'Ultra-premium, no limits', icon: '👑', accent: '#E53935' },
]

const BG_MAP = {
  default:          'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=70&auto=format&fit=crop',
  europe:           'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=70&auto=format&fit=crop',
  maldives:         'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=70&auto=format&fit=crop',
  'southeast-asia': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=70&auto=format&fit=crop',
  'middle-east':    'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=70&auto=format&fit=crop',
  americas:         'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=70&auto=format&fit=crop',
  africa:           'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=70&auto=format&fit=crop',
}

const STEPS = ['destination', 'season', 'travellers', 'budget', 'contact']

const STEP_META = {
  destination: { emoji: '🌍', q: 'Where do you dream of going?',    sub: 'Your world is waiting — pick your paradise' },
  season:      { emoji: '🗓️', q: 'When do you want to escape?',      sub: 'Every season holds a different kind of magic' },
  travellers:  { emoji: '✈️', q: "Who's coming with you?",           sub: 'Every adventure is better with the right company' },
  budget:      { emoji: '💰', q: "What's your budget range?",        sub: 'We craft extraordinary experiences at every level' },
  contact:     { emoji: '🚀', q: 'Ready for takeoff?',               sub: 'Your dream itinerary is just moments away' },
}

const DEST_ORIGINS = [
  { x: -60, y: -50 }, { x: 0, y: -70 }, { x: 60, y: -50 },
  { x: -60, y:  50 }, { x: 0, y:  70 }, { x: 60, y:  50 },
]
const ICON_ORIGINS = [
  { x: -70, y: -20 }, { x: 70, y: -20 },
  { x: -70, y:  20 }, { x: 70, y:  20 },
]

// ─── FAB background detection — swaps light/dark theme on scroll ─────────────

function useFabTheme() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    const check = () => {
      // Sample the pixel behind the FAB (bottom-right corner)
      const x = window.innerWidth  - 80
      const y = window.innerHeight - 60
      const el = document.elementFromPoint(x, y)
      if (!el) return
      const bg = window.getComputedStyle(el).backgroundColor
      const m  = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (m) {
        const luma = 0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]
        setDark(luma < 160)
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])
  return dark
}

// ─── FAB bottom offset — lifts the FAB above the footer when it's visible ─────

function useFabBottom(defaultBottom = 24) {
  const [bottom, setBottom] = useState(defaultBottom)
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // How many px of the footer are currently visible
          const visiblePx = entry.intersectionRect.height
          setBottom(defaultBottom + visiblePx)
        } else {
          setBottom(defaultBottom)
        }
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    )
    obs.observe(footer)
    return () => obs.disconnect()
  }, [defaultBottom])
  return bottom
}

// ─── Mobile detection ─────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ─── Floating particles — desktop only ───────────────────────────────────────

function FloatingParticles() {
  const pts = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 1.5 + Math.random() * 3,
      dur: 8 + Math.random() * 10,
      delay: Math.random() * 6,
      dx: (Math.random() - 0.5) * 30,
    })), [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pts.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: '#fff',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            willChange: 'transform, opacity',
          }}
          animate={{ y: [-20, 20, -20], x: [0, p.dx, 0], opacity: [0, 0.35, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const v = 80 + Math.random() * 200
      return {
        id: i,
        dx: Math.cos(angle) * v,
        dy: -(Math.random() * 0.6 + 0.2) * v - 60,
        color: ['#E53935','#FF7043','#FFB300','#4CAF50','#2196F3','#9C27B0','#FFD700','#FF80AB','#00BCD4'][i % 9],
        w: 5 + Math.random() * 8,
        h: 3 + Math.random() * 5,
        rot: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
        delay: Math.random() * 0.3,
        circle: Math.random() > 0.55,
      }
    }), [])

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'clip', zIndex: 20 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width:  p.circle ? p.w * 0.8 : p.w,
            height: p.circle ? p.w * 0.8 : p.h,
            backgroundColor: p.color,
            borderRadius: p.circle ? '50%' : 3,
            willChange: 'transform, opacity',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 400], opacity: [1, 1, 0], rotate: p.rot, scale: [1, 1, 0.3] }}
          transition={{ duration: 2 + Math.random() * 0.6, delay: p.delay, ease: [0.215, 0.61, 0.355, 1] }}
        />
      ))}
    </div>
  )
}

// ─── Ambient orbs — desktop only ─────────────────────────────────────────────

function AmbientOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[
        { x: '10%', y: '15%', size: 300, dur: 8,  delay: 0 },
        { x: '85%', y: '75%', size: 260, dur: 10, delay: 3 },
        { x: '60%', y: '30%', size: 160, dur: 7,  delay: 5 },
      ].map((o, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: o.x, top: o.y,
            width: o.size, height: o.size,
            background: '#E53935',
            filter: 'blur(60px)',
            transform: 'translate(-50%,-50%)',
            willChange: 'transform, opacity',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── 3-D tilting destination card ─────────────────────────────────────────────

function ImageCard({ option, selected, onClick, index, isMobile }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })

  const onMove = useCallback(e => {
    if (isMobile) return
    const r = e.currentTarget.getBoundingClientRect()
    rx.set(((e.clientY - r.top)  / r.height - 0.5) * -14)
    ry.set(((e.clientX - r.left) / r.width  - 0.5) *  14)
  }, [rx, ry, isMobile])
  const onLeave = useCallback(() => { rx.set(0); ry.set(0) }, [rx, ry])

  const origin = DEST_ORIGINS[index] || { x: 0, y: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : origin.x, y: isMobile ? 16 : origin.y, scale: isMobile ? 0.95 : 0.65 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={isMobile
        ? { delay: 0.04 + index * 0.04, duration: 0.35, ease: [0.32, 0.72, 0, 1] }
        : { delay: 0.05 + index * 0.07, type: 'spring', stiffness: 200, damping: 20 }
      }
      style={{ perspective: isMobile ? 'none' : 600, willChange: 'transform' }}
    >
      <motion.button
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={{ scale: 0.94 }}
        style={isMobile
          ? { transformStyle: 'flat' }
          : { rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }
        }
        className={`relative w-full block rounded-2xl overflow-hidden cursor-pointer text-left ring-2 ${
          selected ? 'ring-brand' : 'ring-transparent hover:ring-white/25'
        }`}
      >
        <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
          <motion.img
            src={option.img}
            alt={option.label}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={isMobile ? undefined : { scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand/25"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-brand rounded-full flex items-center justify-center shadow-glow"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{option.label}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-[11px] mt-0.5 font-medium">{option.sub}</p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}

// ─── Bouncy icon card ─────────────────────────────────────────────────────────

function IconCard({ option, selected, onClick, index, isMobile }) {
  const origin = ICON_ORIGINS[index] || { x: 0, y: 0 }

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: isMobile ? 0 : origin.x, y: isMobile ? 12 : origin.y, scale: isMobile ? 0.95 : 0.7 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={isMobile
        ? { delay: 0.04 + index * 0.04, duration: 0.3, ease: [0.32, 0.72, 0, 1] }
        : { delay: 0.05 + index * 0.09, type: 'spring', stiffness: 220, damping: 22 }
      }
      whileHover={isMobile ? undefined : { y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.93 }}
      style={{ willChange: 'transform' }}
      className={`relative rounded-2xl p-5 cursor-pointer text-left border-2 overflow-hidden ${
        selected
          ? 'border-brand bg-brand/10'
          : 'border-white/15 bg-white/6 hover:border-white/25'
      }`}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 4, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none"
            style={{ backgroundColor: option.accent, filter: 'blur(24px)', opacity: 0.2 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute top-3 right-3 w-6 h-6 bg-brand rounded-full flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="text-4xl mb-3 leading-none relative"
        animate={selected ? { scale: [1, 1.3, 1], rotate: [0, -12, 12, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: 'backOut' }}
      >
        {option.icon}
      </motion.div>

      <p className="relative text-white font-bold text-sm">{option.label}</p>
      <p className="relative text-[11px] mt-0.5 font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{option.sub}</p>
    </motion.button>
  )
}

// ─── Step question ────────────────────────────────────────────────────────────

function StepQuestion({ stepKey, isMobile }) {
  const { emoji, q, sub } = STEP_META[stepKey]

  return (
    <div style={{ marginBottom: '1.25rem', marginTop: '0.25rem' }}>
      <motion.span
        key={stepKey + 'e'}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.04 }}
        style={{ display: 'inline-block', fontSize: '2.25rem', lineHeight: 1, marginBottom: '0.75rem' }}
      >
        {emoji}
      </motion.span>

      {isMobile ? (
        /* Simple fade on mobile — no per-word blur (expensive) */
        <motion.h2
          key={stepKey + 'q'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.4rem, 5vw, 1.75rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
          }}
        >
          {q}
        </motion.h2>
      ) : (
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.8rem)', fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '0.5rem' }}>
          {q.split(' ').map((word, i) => (
            <motion.span
              key={stepKey + i}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.04 + i * 0.04, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {word}
            </motion.span>
          ))}
        </h2>
      )}

      <motion.p
        key={stepKey + 's'}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 500 }}
      >
        {sub}
      </motion.p>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function TravelQuizModal() {
  const isMobile   = useIsMobile()
  const fabIsDark  = useFabTheme()
  const fabBottom  = useFabBottom(24)

  const [open,    setOpen]    = useState(false)
  const [step,    setStep]    = useState(0)
  const [dir,     setDir]     = useState(1)
  const [answers, setAnswers] = useState({ destination: null, season: null, travellers: null, budget: null })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const currentStepKey = STEPS[step]
  const bgKey  = answers.destination?.id || 'default'
  const bgSrc  = BG_MAP[bgKey]

  // Mouse-parallax — desktop only
  const mouseX  = useMotionValue(0.5)
  const mouseY  = useMotionValue(0.5)
  const rawBgX  = useTransform(mouseX, [0, 1], [8, -8])
  const rawBgY  = useTransform(mouseY, [0, 1], [8, -8])
  const bgOffX  = useSpring(rawBgX, { stiffness: 22, damping: 15 })
  const bgOffY  = useSpring(rawBgY, { stiffness: 22, damping: 15 })

  const overlayRef = useRef(null)
  const handleMouseMove = useCallback(e => {
    if (isMobile) return
    const r = overlayRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set((e.clientX - r.left) / r.width)
    mouseY.set((e.clientY - r.top)  / r.height)
  }, [mouseX, mouseY, isMobile])

  useEffect(() => {
    if (localStorage.getItem('emv_quiz_done') || sessionStorage.getItem('emv_quiz_seen')) return
    const t = setTimeout(() => { openModal(); sessionStorage.setItem('emv_quiz_seen', '1') }, 10000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const h = () => openModal()
    window.addEventListener('open-travel-quiz', h)
    return () => window.removeEventListener('open-travel-quiz', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const openModal  = () => { setOpen(true); sessionStorage.setItem('emv_quiz_seen', '1') }
  const closeModal = () => setOpen(false)

  const reset = () => {
    setStep(0); setDir(1)
    setAnswers({ destination: null, season: null, travellers: null, budget: null })
    setContact({ name: '', phone: '', email: '' })
    setError(''); setDone(false)
  }

  const select = (key, val) => setAnswers(p => ({ ...p, [key]: val }))

  const canProceed = () =>
    currentStepKey === 'contact'
      ? contact.name.trim().length >= 2 && contact.phone.trim().length >= 7
      : !!answers[currentStepKey]

  const goNext = () => { if (!canProceed()) return; setDir(1); setStep(s => s + 1) }
  const goBack = () => { setDir(-1); setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (!canProceed() || loading) return
    setLoading(true); setError('')
    try {
      await api.submitLead({
        name:  contact.name.trim(),
        phone: contact.phone.trim(),
        ...(contact.email.trim() && { email: contact.email.trim() }),
        ...(answers.destination  && { destination: answers.destination.label }),
        ...(answers.travellers   && { travellers: answers.travellers.label }),
        ...(answers.season       && { travelDate: `${answers.season.label} (${answers.season.sub.split('·')[0].trim()})` }),
        message: `Budget: ${answers.budget?.label || 'N/A'} per person. Via Trip Planner Quiz.`,
        type: 'lead',
      })
      localStorage.setItem('emv_quiz_done', '1')
      setDone(true)
      window.dispatchEvent(new CustomEvent('emv-quiz-completed'))
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progressPct = done ? 100 : (step / STEPS.length) * 100

  const slideV = {
    enter:  d => ({ x: d > 0 ? 70 : -70, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
    exit:   d => ({ x: d > 0 ? -70 : 70, opacity: 0, scale: 0.96, transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] } }),
  }

  // Panel glass styles — full blur on desktop, solid on mobile (cheaper)
  const panelStyle = isMobile
    ? { background: 'rgba(10,10,10,0.97)' }
    : { background: 'rgba(10,10,10,0.84)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }

  // Panel entrance — simpler on mobile
  const panelAnimate = isMobile
    ? { initial: { opacity: 0, y: 40, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 30, scale: 0.97 }, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }
    : { initial: { opacity: 0, scale: 0.4, y: -80, rotate: -8 }, animate: { opacity: 1, scale: 1, y: 0, rotate: 0 }, exit: { opacity: 0, scale: 0.78, y: 50, rotate: 3 }, transition: { type: 'spring', stiffness: 290, damping: 24, mass: 0.85 } }

  return (
    <>
      {/* ── Floating trigger button ── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="quiz-fab"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: 3.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ position: 'fixed', bottom: fabBottom, right: '1.5rem', zIndex: 40, transition: 'bottom 0.2s ease' }}
          >
            {/* Pulse rings */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 9999,
                  border: '1px solid #E53935',
                  pointerEvents: 'none',
                }}
                animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, delay: i * 0.75, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}

            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                paddingLeft: '1rem',
                paddingRight: '1.25rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                borderRadius: 9999,
                border: fabIsDark
                  ? '1px solid rgba(255,255,255,0.18)'
                  : '1px solid rgba(0,0,0,0.12)',
                background: fabIsDark
                  ? 'rgba(10,10,10,0.92)'
                  : 'rgba(255,255,255,0.96)',
                color: fabIsDark ? '#fff' : '#0a0a0a',
                boxShadow: fabIsDark
                  ? '0 8px 32px rgba(0,0,0,0.45)'
                  : '0 8px 32px rgba(0,0,0,0.18)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                cursor: 'pointer',
                transition: 'background 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
                willChange: 'transform',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Live dot */}
              <span style={{ position: 'relative', display: 'flex', width: 10, height: 10, flexShrink: 0 }}>
                <span
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: '#E53935', opacity: 0.75,
                    animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                  }}
                />
                <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#E53935', display: 'inline-flex' }} />
              </span>

              <span style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.02em' }}>Plan My Trip</span>

              <motion.svg
                style={{ width: 14, height: 14, color: '#E53935', flexShrink: 0 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </motion.svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            key="quiz-modal"
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          >
            {/* Cinematic background */}
            <div className="absolute inset-0 overflow-hidden">
              <AnimatePresence>
                <motion.div
                  key={bgKey}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1.06 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <motion.img
                    src={bgSrc}
                    alt=""
                    className="w-full h-full object-cover"
                    style={isMobile ? undefined : { x: bgOffX, y: bgOffY }}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-black/65" />
              <div className="absolute inset-0 hero-vignette opacity-50" />
            </div>

            {/* Ambient orbs & particles — desktop only */}
            {!isMobile && <AmbientOrbs />}
            {!isMobile && <FloatingParticles />}

            {done && <ConfettiBurst />}

            <div className="absolute inset-0" onClick={closeModal} />

            {/* Panel */}
            <motion.div
              key="panel"
              {...panelAnimate}
              onClick={e => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl flex flex-col max-h-[92vh] rounded-3xl border border-white/12 shadow-[0_30px_80px_-10px_rgba(0,0,0,0.85)] overflow-hidden"
              style={{ ...panelStyle, willChange: 'transform, opacity' }}
            >
              {/* Corner glow */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-brand/18 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-brand/12 rounded-full blur-3xl pointer-events-none" />

              {/* Progress bar */}
              <div className="h-[3px] shrink-0 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand via-red-400 to-brand"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {!isMobile && (
                  <motion.div
                    className="absolute inset-y-0 w-12 bg-white/40"
                    animate={{ x: ['-100%', '2000%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1, ease: 'linear' }}
                    style={{ filter: 'blur(6px)' }}
                  />
                )}
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  {!done && STEPS.map((s, i) => (
                    <motion.div
                      key={s}
                      className={`h-[3px] rounded-full ${i <= step ? 'bg-brand' : 'bg-white/18'}`}
                      animate={{ width: i === step ? 26 : i < step ? 10 : 7 }}
                      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                    />
                  ))}
                  {!done && (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em' }}
                    >
                      {step + 1}/{STEPS.length}
                    </motion.span>
                  )}
                </div>

                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
                <AnimatePresence mode="wait" custom={dir}>

                  {/* SUCCESS */}
                  {done ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="py-10 text-center relative"
                    >
                      {['🌍','✈️','🏖️','🗺️','🎊'].map((emoji, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl pointer-events-none select-none"
                          style={{ left: `${10 + i * 20}%`, top: '10%' }}
                          initial={{ y: 0, opacity: 0 }}
                          animate={{ y: [-10, -35, -10], opacity: [0, 1, 0] }}
                          transition={{ duration: 2.5, delay: 0.3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {emoji}
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ scale: 0, rotate: -18 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl relative"
                        style={{ background: 'linear-gradient(135deg, rgba(229,57,53,0.2), rgba(229,57,53,0.05))', border: '1px solid rgba(229,57,53,0.3)' }}
                      >
                        ✈️
                        <motion.div
                          className="absolute inset-[-6px] rounded-full border-2 border-dashed border-brand/40"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <h2 className="text-3xl font-serif font-bold text-white mb-3">Your Journey Awaits! 🎉</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm font-medium leading-relaxed max-w-xs mx-auto">
                          Our travel concierge will craft your personalised itinerary and reach out within{' '}
                          <span className="text-white font-bold">24 hours</span>.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.42 }}
                        className="mt-6 mx-auto max-w-sm rounded-2xl p-4 text-left"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.75rem' }}>Your Trip Profile</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { icon: '🌍', key: 'Destination', val: answers.destination?.label },
                            { icon: '📅', key: 'Season',      val: answers.season?.label },
                            { icon: '👥', key: 'Travellers',  val: answers.travellers?.label },
                            { icon: '💰', key: 'Budget',      val: answers.budget?.label },
                          ].filter(x => x.val).map((x, i) => (
                            <motion.div
                              key={x.key}
                              initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.52 + i * 0.07 }}
                              className="flex items-center gap-2 rounded-xl px-3 py-2"
                              style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                              <span className="text-lg">{x.icon}</span>
                              <div>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{x.key}</p>
                                <p className="text-white font-bold text-xs">{x.val}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { reset(); closeModal() }}
                        className="mt-7 px-8 py-3 bg-brand text-white rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shadow-glow"
                      >
                        Close &amp; Explore Packages →
                      </motion.button>
                    </motion.div>

                  ) : (
                    /* QUIZ STEP */
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slideV}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <StepQuestion stepKey={currentStepKey} isMobile={isMobile} />

                      {currentStepKey === 'destination' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {DESTINATIONS.map((d, i) => (
                            <ImageCard key={d.id} option={d} index={i} isMobile={isMobile}
                              selected={answers.destination?.id === d.id}
                              onClick={() => select('destination', d)}
                            />
                          ))}
                        </div>
                      )}

                      {currentStepKey === 'season' && (
                        <div className="grid grid-cols-2 gap-3">
                          {SEASONS.map((s, i) => (
                            <IconCard key={s.id} option={s} index={i} isMobile={isMobile}
                              selected={answers.season?.id === s.id}
                              onClick={() => select('season', s)}
                            />
                          ))}
                        </div>
                      )}

                      {currentStepKey === 'travellers' && (
                        <div className="grid grid-cols-2 gap-3">
                          {TRAVELLERS.map((t, i) => (
                            <IconCard key={t.id} option={t} index={i} isMobile={isMobile}
                              selected={answers.travellers?.id === t.id}
                              onClick={() => select('travellers', t)}
                            />
                          ))}
                        </div>
                      )}

                      {currentStepKey === 'budget' && (
                        <div className="grid grid-cols-2 gap-3">
                          {BUDGETS.map((b, i) => (
                            <IconCard key={b.id} option={b} index={i} isMobile={isMobile}
                              selected={answers.budget?.id === b.id}
                              onClick={() => select('budget', b)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Contact form */}
                      {currentStepKey === 'contact' && (
                        <motion.div
                          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {/* Recap chips */}
                          <div className="flex flex-wrap gap-2 mb-1">
                            {[
                              answers.destination && { icon: '🌍', val: answers.destination.label },
                              answers.season      && { icon: '📅', val: answers.season.label },
                              answers.travellers  && { icon: '👥', val: answers.travellers.label },
                              answers.budget      && { icon: '💰', val: answers.budget.label },
                            ].filter(Boolean).map((x, i) => (
                              <motion.span
                                key={x.val}
                                initial={{ opacity: 0, scale: 0.75 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold"
                                style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ff6b6b', fontSize: '0.6875rem' }}
                              >
                                {x.icon} {x.val}
                              </motion.span>
                            ))}
                          </div>

                          {[
                            { key: 'name',  type: 'text',  label: 'Full Name',     placeholder: 'Your full name',  required: true  },
                            { key: 'phone', type: 'tel',   label: 'Phone Number',  placeholder: '+91 70705 95907', required: true  },
                            { key: 'email', type: 'email', label: 'Email Address', placeholder: 'your@email.com',  required: false },
                          ].map(({ key, type, label, placeholder, required }, i) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.12 + i * 0.09 }}
                            >
                              <label style={{
                                display: 'block',
                                fontSize: '0.625rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.25em',
                                color: 'rgba(255,255,255,0.7)',
                                marginBottom: '0.5rem',
                              }}>
                                {label}
                                {required
                                  ? ' *'
                                  : <span style={{ textTransform: 'none', letterSpacing: 'normal', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginLeft: '0.25rem' }}>(optional)</span>
                                }
                              </label>
                              <input
                                type={type}
                                className="quiz-input"
                                autoComplete={key}
                                value={contact[key]}
                                onChange={e => setContact(p => ({ ...p, [key]: e.target.value }))}
                                placeholder={placeholder}
                                style={{
                                  width: '100%',
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.22)',
                                  borderRadius: '1rem',
                                  padding: '0.875rem 1rem',
                                  color: '#fff',
                                  WebkitTextFillColor: '#fff',
                                  fontWeight: 600,
                                  fontSize: '0.9375rem',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  boxSizing: 'border-box',
                                  caretColor: '#E53935',
                                }}
                                onFocus={e => { e.target.style.borderColor = 'rgba(229,57,53,0.7)'; e.target.style.background = 'rgba(255,255,255,0.13)' }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; e.target.style.background = 'rgba(255,255,255,0.1)' }}
                              />
                              {/* Placeholder via CSS — injected once globally */}
                            </motion.div>
                          ))}

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.875rem', fontWeight: 700, padding: '0.75rem 1rem', borderRadius: '1rem' }}
                              >
                                {error}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', fontWeight: 500 }}>
                            No spam, ever. Your details stay private. 🔒
                          </p>
                        </motion.div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <motion.button
                          onClick={step > 0 ? goBack : closeModal}
                          whileHover={{ x: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm transition-colors"
                          style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                          </svg>
                          {step > 0 ? 'Back' : 'Skip for now'}
                        </motion.button>

                        <motion.button
                          onClick={currentStepKey === 'contact' ? handleSubmit : goNext}
                          disabled={!canProceed() || loading}
                          whileHover={canProceed() && !loading ? { scale: 1.04, boxShadow: '0 0 28px rgba(229,57,53,0.5)' } : undefined}
                          whileTap={canProceed() && !loading ? { scale: 0.95 } : undefined}
                          className="relative flex items-center gap-2.5 px-6 py-3 bg-brand text-white rounded-full font-bold text-sm hover:bg-brand-hover transition-all shadow-glow disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                          style={{ willChange: 'transform' }}
                        >
                          {!isMobile && (
                            <motion.div
                              className="absolute inset-0 bg-white/15 -skew-x-12"
                              animate={{ x: ['-200%', '200%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5, ease: 'linear' }}
                            />
                          )}
                          <span className="relative flex items-center gap-2.5">
                            {loading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Building your dream…
                              </>
                            ) : currentStepKey === 'contact' ? (
                              <>🚀 Launch My Itinerary</>
                            ) : (
                              <>
                                Continue
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                              </>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .quiz-input::placeholder { color: rgba(255,255,255,0.38) !important; }
        .quiz-input:-webkit-autofill,
        .quiz-input:-webkit-autofill:hover,
        .quiz-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(30,10,10,0.95) inset !important;
          transition: background-color 9999s ease-in-out 0s;
          caret-color: #E53935;
        }
      `}</style>
    </>
  )
}
