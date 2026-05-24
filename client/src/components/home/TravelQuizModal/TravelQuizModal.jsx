import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { api } from '../../../services/api'

// ─── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS = [
  { id: 'europe',       label: 'Europe',         sub: 'Paris · Rome · Santorini',      img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&q=75&auto=format&fit=crop' },
  { id: 'maldives',     label: 'Maldives',        sub: 'Overwater villas · Lagoons',    img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=75&auto=format&fit=crop' },
  { id: 'southeast-asia', label: 'Southeast Asia', sub: 'Bali · Thailand · Vietnam',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&q=75&auto=format&fit=crop' },
  { id: 'middle-east',  label: 'Middle East',     sub: 'Dubai · Abu Dhabi · Jordan',   img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=700&q=75&auto=format&fit=crop' },
  { id: 'americas',     label: 'The Americas',    sub: 'New York · Cancún · Patagonia', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=75&auto=format&fit=crop' },
  { id: 'africa',       label: 'Africa & Safari', sub: 'Kenya · Tanzania · Zanzibar',  img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&q=75&auto=format&fit=crop' },
]

const SEASONS = [
  { id: 'spring', label: 'Spring', sub: 'Mar – May · Bloom season', icon: '🌸', accent: '#f472b6' },
  { id: 'summer', label: 'Summer', sub: 'Jun – Aug · Peak adventure', icon: '☀️', accent: '#fbbf24' },
  { id: 'autumn', label: 'Autumn', sub: 'Sep – Nov · Golden hues', icon: '🍂', accent: '#fb923c' },
  { id: 'winter', label: 'Winter', sub: 'Dec – Feb · Snow & magic', icon: '❄️', accent: '#60a5fa' },
]

const TRAVELLERS = [
  { id: 'solo',   label: 'Solo Explorer',   sub: 'Me, the world & my passport', icon: '🧳', accent: '#a78bfa' },
  { id: 'couple', label: 'Romantic Couple', sub: 'Two hearts, one adventure',   icon: '💑', accent: '#f43f5e' },
  { id: 'family', label: 'Family Tribe',    sub: 'Making memories together',    icon: '👨‍👩‍👧‍👦', accent: '#34d399' },
  { id: 'group',  label: 'Squad Goals',     sub: 'Friends unleashed on the world', icon: '🎉', accent: '#fbbf24' },
]

const BUDGETS = [
  { id: 'under50k', label: 'Under ₹50K', sub: 'Smart & stylish escapes',  icon: '🌿', accent: '#34d399' },
  { id: '50k-1l',   label: '₹50K – ₹1L', sub: 'Comfort meets culture',   icon: '💎', accent: '#60a5fa' },
  { id: '1l-2l',    label: '₹1L – ₹2L',  sub: 'Luxury & leisure vibes',  icon: '✨', accent: '#fbbf24' },
  { id: 'above2l',  label: '₹2L+',        sub: 'Ultra-premium, no limits', icon: '👑', accent: '#E53935' },
]

const BG_MAP = {
  default:        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=70&auto=format&fit=crop',
  europe:         'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=70&auto=format&fit=crop',
  maldives:       'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=70&auto=format&fit=crop',
  'southeast-asia': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=70&auto=format&fit=crop',
  'middle-east':  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=70&auto=format&fit=crop',
  americas:       'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=70&auto=format&fit=crop',
  africa:         'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=70&auto=format&fit=crop',
}

const STEPS = ['destination', 'season', 'travellers', 'budget', 'contact']

const STEP_META = {
  destination: { emoji: '🌍', q: 'Where do you dream of going?',    sub: 'Your world is waiting — pick your paradise' },
  season:      { emoji: '🗓️', q: 'When do you want to escape?',      sub: 'Every season holds a different kind of magic' },
  travellers:  { emoji: '✈️', q: "Who's coming with you?",           sub: 'Every adventure is better with the right company' },
  budget:      { emoji: '💰', q: "What's your budget range?",        sub: 'We craft extraordinary experiences at every level' },
  contact:     { emoji: '🚀', q: 'Ready for takeoff?',               sub: 'Your dream itinerary is just moments away' },
}

// Stagger entrance direction per card index
const DEST_ORIGINS = [
  { x: -60, y: -50 }, { x: 0, y: -70 }, { x: 60, y: -50 },
  { x: -60, y:  50 }, { x: 0, y:  70 }, { x: 60, y:  50 },
]
const ICON_ORIGINS = [
  { x: -70, y: -20 }, { x: 70, y: -20 },
  { x: -70, y:  20 }, { x: 70, y:  20 },
]

// ─── Ambient floating particles ───────────────────────────────────────────────

function FloatingParticles() {
  const pts = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 1.5 + Math.random() * 3.5,
      dur: 7 + Math.random() * 12,
      delay: Math.random() * 8,
      dx: (Math.random() - 0.5) * 40,
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
          animate={{ y: [-20, 20, -20], x: [0, p.dx, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const v = 100 + Math.random() * 240
      return {
        id: i,
        dx: Math.cos(angle) * v,
        dy: -(Math.random() * 0.6 + 0.2) * v - 60,
        color: ['#E53935','#FF7043','#FFB300','#4CAF50','#2196F3','#9C27B0','#FFD700','#FF80AB','#00BCD4'][i % 9],
        w: 5 + Math.random() * 10,
        h: 3 + Math.random() * 6,
        rot: Math.random() * 840 * (Math.random() > 0.5 ? 1 : -1),
        delay: Math.random() * 0.4,
        circle: Math.random() > 0.55,
      }
    }), [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-clip z-20" style={{ overflow: 'clip' }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width:  p.circle ? p.w * 0.8 : p.w,
            height: p.circle ? p.w * 0.8 : p.h,
            backgroundColor: p.color,
            borderRadius: p.circle ? '50%' : 3,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 500], opacity: [1, 1, 0], rotate: p.rot, scale: [1, 1, 0.3] }}
          transition={{ duration: 2.2 + Math.random() * 0.8, delay: p.delay, ease: [0.215, 0.61, 0.355, 1] }}
        />
      ))}
    </div>
  )
}

// ─── Ambient light orbs ───────────────────────────────────────────────────────

function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { x: '10%', y: '15%', size: 320, dur: 8,  delay: 0 },
        { x: '85%', y: '75%', size: 280, dur: 10, delay: 3 },
        { x: '60%', y: '30%', size: 180, dur: 7,  delay: 5 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.x, top: o.y,
            width: o.size, height: o.size,
            background: '#E53935',
            filter: 'blur(70px)',
            transform: 'translate(-50%,-50%)',
          }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── 3-D tilting destination card ─────────────────────────────────────────────

function ImageCard({ option, selected, onClick, index }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 160, damping: 20 })
  const sry = useSpring(ry, { stiffness: 160, damping: 20 })

  const onMove = useCallback(e => {
    const r = e.currentTarget.getBoundingClientRect()
    rx.set(((e.clientY - r.top)  / r.height - 0.5) * -16)
    ry.set(((e.clientX - r.left) / r.width  - 0.5) *  16)
  }, [rx, ry])
  const onLeave = useCallback(() => { rx.set(0); ry.set(0) }, [rx, ry])

  const origin = DEST_ORIGINS[index] || { x: 0, y: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, x: origin.x, y: origin.y, scale: 0.65, rotate: (Math.random() - 0.5) * 12 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay: 0.05 + index * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
      style={{ perspective: 600 }}
    >
      <motion.button
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={{ scale: 0.92 }}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className={`relative w-full block rounded-2xl overflow-hidden cursor-pointer text-left transition-all duration-200 ring-2 ${
          selected ? 'ring-brand' : 'ring-transparent hover:ring-white/25'
        }`}
      >
        <div style={{ aspectRatio: '4/3' }} className="relative overflow-hidden">
          {/* Image with hover zoom */}
          <motion.img
            src={option.img}
            alt={option.label}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

          {/* Selected colour wash */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand/25"
              />
            )}
          </AnimatePresence>

          {/* Shimmer on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
            }}
            whileHover={{ opacity: 1, backgroundPosition: ['200% center', '-100% center'] }}
            transition={{ duration: 0.6 }}
          />

          {/* Checkmark badge */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-brand rounded-full flex items-center justify-center shadow-glow"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight">{option.label}</p>
            <p className="text-white/60 text-[11px] mt-0.5 font-medium">{option.sub}</p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}

// ─── Bouncy icon card ─────────────────────────────────────────────────────────

function IconCard({ option, selected, onClick, index }) {
  const origin = ICON_ORIGINS[index] || { x: 0, y: 0 }

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: origin.x, y: origin.y, scale: 0.7, rotate: (Math.random() - 0.5) * 10 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay: 0.05 + index * 0.09, type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.92 }}
      className={`relative rounded-2xl p-5 cursor-pointer text-left transition-all duration-300 border-2 overflow-hidden ${
        selected
          ? 'border-brand bg-brand/10'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8'
      }`}
    >
      {/* Glowing blob */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 4, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none"
            style={{ backgroundColor: option.accent, filter: 'blur(28px)', opacity: 0.22 }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring on select */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-xl border-2 border-brand pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Check */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
            className="absolute top-3 right-3 w-6 h-6 bg-brand rounded-full flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji — bounces when selected */}
      <motion.div
        className="text-4xl mb-3 leading-none relative"
        animate={selected ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      >
        {option.icon}
      </motion.div>

      <p className="relative text-white font-bold text-sm">{option.label}</p>
      <p className="relative text-white/45 text-[11px] mt-0.5 font-medium leading-relaxed">{option.sub}</p>
    </motion.button>
  )
}

// ─── Animated step question ───────────────────────────────────────────────────

function StepQuestion({ stepKey }) {
  const { emoji, q, sub } = STEP_META[stepKey]

  return (
    <div className="mb-5 mt-1">
      <motion.span
        key={stepKey + 'e'}
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
        className="inline-block text-4xl mb-3 leading-none"
      >
        {emoji}
      </motion.span>

      <h2 className="text-2xl md:text-[1.8rem] font-serif font-bold text-white leading-snug mb-2">
        {q.split(' ').map((word, i) => (
          <motion.span
            key={stepKey + i}
            initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.05 + i * 0.045, duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            className="inline-block mr-[0.28em]"
          >
            {word}
          </motion.span>
        ))}
      </h2>

      <motion.p
        key={stepKey + 's'}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.22, duration: 0.4 }}
        className="text-white/45 text-sm font-medium"
      >
        {sub}
      </motion.p>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function TravelQuizModal() {
  const [open, setOpen]       = useState(false)
  const [step, setStep]       = useState(0)
  const [dir,  setDir]        = useState(1)
  const [answers, setAnswers] = useState({ destination: null, season: null, travellers: null, budget: null })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const currentStepKey = STEPS[step]
  const bgKey  = answers.destination?.id || 'default'
  const bgSrc  = BG_MAP[bgKey]

  // Mouse-parallax for background
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const rawBgX = useTransform(mouseX, [0, 1], [10, -10])
  const rawBgY = useTransform(mouseY, [0, 1], [10, -10])
  const bgOffX = useSpring(rawBgX, { stiffness: 22, damping: 15 })
  const bgOffY = useSpring(rawBgY, { stiffness: 22, damping: 15 })

  const overlayRef = useRef(null)
  const handleMouseMove = useCallback(e => {
    const r = overlayRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set((e.clientX - r.left) / r.width)
    mouseY.set((e.clientY - r.top)  / r.height)
  }, [mouseX, mouseY])

  // Auto-open after 10 s — once per session
  useEffect(() => {
    if (localStorage.getItem('emv_quiz_done') || sessionStorage.getItem('emv_quiz_seen')) return
    const t = setTimeout(() => { openModal(); sessionStorage.setItem('emv_quiz_seen', '1') }, 10000)
    return () => clearTimeout(t)
  }, [])

  // Hero-section event bridge
  useEffect(() => {
    const h = () => openModal()
    window.addEventListener('open-travel-quiz', h)
    return () => window.removeEventListener('open-travel-quiz', h)
  }, [])

  // Scroll lock
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
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progressPct = done ? 100 : (step / STEPS.length) * 100

  // Step slide variants
  const slideV = {
    enter: d => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.38, ease: [0.32, 0.72, 0, 1] } },
    exit:   d => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.95, transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } }),
  }

  return (
    <>
      {/* ─── Floating trigger button ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="quiz-fab"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: 3.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-6 left-6 z-40"
          >
            {/* Pulsing rings */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-brand"
                animate={{ scale: [1, 2.8], opacity: [0.55, 0] }}
                transition={{ duration: 2.4, delay: i * 0.75, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="relative flex items-center gap-2.5 bg-dark/92 backdrop-blur-xl text-white pl-4 pr-5 py-3 rounded-full border border-white/15 shadow-glass-dark hover:border-brand/50 transition-colors duration-300 group"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
              </span>
              <span className="font-bold text-sm tracking-wide whitespace-nowrap">Plan My Trip</span>
              <motion.svg
                className="w-3.5 h-3.5 text-brand"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </motion.svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            key="quiz-modal"
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          >
            {/* ── Cinematic background ── */}
            <div className="absolute inset-0 overflow-hidden">
              <AnimatePresence>
                <motion.div
                  key={bgKey}
                  initial={{ opacity: 0, scale: 1.18 }}
                  animate={{ opacity: 1, scale: 1.08 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <motion.img
                    src={bgSrc}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ x: bgOffX, y: bgOffY }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Radial dark reveal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/62"
              />

              {/* Vignette */}
              <div className="absolute inset-0 hero-vignette opacity-60" />
            </div>

            {/* Ambient orbs */}
            <AmbientOrbs />

            {/* Floating particles */}
            <FloatingParticles />

            {/* Confetti on success */}
            {done && <ConfettiBurst />}

            {/* Click-outside to close */}
            <div className="absolute inset-0" onClick={closeModal} />

            {/* ── Panel ── */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.4, y: -100, rotate: -10 }}
              animate={{ opacity: 1, scale: 1,   y: 0,    rotate: 0 }}
              exit={{   opacity: 0, scale: 0.75,  y: 60,   rotate: 4 }}
              transition={{ type: 'spring', stiffness: 290, damping: 24, mass: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl flex flex-col max-h-[92vh] rounded-3xl border border-white/10 shadow-[0_40px_100px_-10px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
            >
              {/* Corner glow accents */}
              <div className="absolute -top-20 -left-20  w-48 h-48 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-brand/15 rounded-full blur-3xl pointer-events-none" />

              {/* ── Progress bar ── */}
              <div className="h-[3px] bg-white/8 shrink-0 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand via-red-400 to-brand"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                {/* Shimmer on progress bar */}
                <motion.div
                  className="absolute inset-y-0 w-12 bg-white/40"
                  animate={{ x: ['-100%', '2000%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1, ease: 'linear' }}
                  style={{ filter: 'blur(6px)' }}
                />
              </div>

              {/* ── Top bar ── */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  {!done && STEPS.map((s, i) => (
                    <motion.div
                      key={s}
                      className={`h-[3px] rounded-full ${i < step ? 'bg-brand' : i === step ? 'bg-brand' : 'bg-white/15'}`}
                      animate={{ width: i === step ? 28 : i < step ? 10 : 7 }}
                      transition={{ duration: 0.45, type: 'spring', stiffness: 200 }}
                    />
                  ))}
                  {!done && (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-2 text-white/35 text-[11px] font-black uppercase tracking-[0.3em]"
                    >
                      {step + 1}/{STEPS.length}
                    </motion.span>
                  )}
                </div>

                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/18 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
                <AnimatePresence mode="wait" custom={dir}>

                  {/* ── SUCCESS ── */}
                  {done ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.88, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                      className="py-10 text-center relative"
                    >
                      {/* Floating celebration emojis */}
                      {['🌍','✈️','🏖️','🗺️','🎊'].map((emoji, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl pointer-events-none select-none"
                          style={{ left: `${10 + i * 20}%`, top: '10%' }}
                          initial={{ y: 0, opacity: 0 }}
                          animate={{ y: [-10, -40, -10], opacity: [0, 1, 0] }}
                          transition={{ duration: 2.5, delay: 0.3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {emoji}
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 16 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl relative"
                        style={{ background: 'linear-gradient(135deg, rgba(229,57,53,0.2), rgba(229,57,53,0.05)', border: '1px solid rgba(229,57,53,0.3)' }}
                      >
                        ✈️
                        {/* Orbit ring */}
                        <motion.div
                          className="absolute inset-[-6px] rounded-full border-2 border-dashed border-brand/40"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                      >
                        <h2 className="text-3xl font-serif font-bold text-white mb-3">
                          Your Journey Awaits! 🎉
                        </h2>
                        <p className="text-white/55 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                          Our travel concierge will craft your personalised itinerary and reach out within{' '}
                          <span className="text-white font-bold">24 hours</span>.
                        </p>
                      </motion.div>

                      {/* Boarding-pass style summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="mt-6 mx-auto max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-left"
                      >
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Your Trip Profile</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { icon: '🌍', key: 'Destination', val: answers.destination?.label },
                            { icon: '📅', key: 'Season',      val: answers.season?.label },
                            { icon: '👥', key: 'Travellers',  val: answers.travellers?.label },
                            { icon: '💰', key: 'Budget',      val: answers.budget?.label },
                          ].filter(x => x.val).map((x, i) => (
                            <motion.div
                              key={x.key}
                              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.55 + i * 0.08 }}
                              className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"
                            >
                              <span className="text-lg">{x.icon}</span>
                              <div>
                                <p className="text-white/35 text-[9px] font-black uppercase tracking-widest">{x.key}</p>
                                <p className="text-white font-bold text-xs">{x.val}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { reset(); closeModal() }}
                        className="mt-7 px-8 py-3 bg-brand text-white rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shadow-glow"
                      >
                        Close & Explore Packages →
                      </motion.button>
                    </motion.div>

                  ) : (
                    /* ── QUIZ STEP ── */
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slideV}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <StepQuestion stepKey={currentStepKey} />

                      {/* ── Destination grid ── */}
                      {currentStepKey === 'destination' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {DESTINATIONS.map((d, i) => (
                            <ImageCard
                              key={d.id}
                              option={d}
                              index={i}
                              selected={answers.destination?.id === d.id}
                              onClick={() => select('destination', d)}
                            />
                          ))}
                        </div>
                      )}

                      {/* ── Season grid ── */}
                      {currentStepKey === 'season' && (
                        <div className="grid grid-cols-2 gap-3">
                          {SEASONS.map((s, i) => (
                            <IconCard
                              key={s.id}
                              option={s}
                              index={i}
                              selected={answers.season?.id === s.id}
                              onClick={() => select('season', s)}
                            />
                          ))}
                        </div>
                      )}

                      {/* ── Travellers grid ── */}
                      {currentStepKey === 'travellers' && (
                        <div className="grid grid-cols-2 gap-3">
                          {TRAVELLERS.map((t, i) => (
                            <IconCard
                              key={t.id}
                              option={t}
                              index={i}
                              selected={answers.travellers?.id === t.id}
                              onClick={() => select('travellers', t)}
                            />
                          ))}
                        </div>
                      )}

                      {/* ── Budget grid ── */}
                      {currentStepKey === 'budget' && (
                        <div className="grid grid-cols-2 gap-3">
                          {BUDGETS.map((b, i) => (
                            <IconCard
                              key={b.id}
                              option={b}
                              index={i}
                              selected={answers.budget?.id === b.id}
                              onClick={() => select('budget', b)}
                            />
                          ))}
                        </div>
                      )}

                      {/* ── Contact form ── */}
                      {currentStepKey === 'contact' && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {/* Selected recap chips */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {[
                              answers.destination && { icon: '🌍', val: answers.destination.label },
                              answers.season      && { icon: '📅', val: answers.season.label },
                              answers.travellers  && { icon: '👥', val: answers.travellers.label },
                              answers.budget      && { icon: '💰', val: answers.budget.label },
                            ].filter(Boolean).map((x, i) => (
                              <motion.span
                                key={x.val}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-brand/12 border border-brand/25 text-brand text-[11px] font-bold rounded-full"
                              >
                                {x.icon} {x.val}
                              </motion.span>
                            ))}
                          </div>

                          {[
                            { key: 'name',  type: 'text',  label: 'Full Name',      placeholder: 'Your full name',        required: true  },
                            { key: 'phone', type: 'tel',   label: 'Phone Number',   placeholder: '+91 98765 43210',       required: true  },
                            { key: 'email', type: 'email', label: 'Email Address',  placeholder: 'your@email.com',        required: false },
                          ].map(({ key, type, label, placeholder, required }, i) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + i * 0.1 }}
                            >
                              <label className="text-[10px] font-black text-white/35 uppercase tracking-[0.25em] mb-2 block">
                                {label}{required ? ' *' : <span className="normal-case text-white/22 font-medium ml-1">(optional)</span>}
                              </label>
                              <input
                                type={type}
                                autoComplete={key}
                                value={contact[key]}
                                onChange={e => setContact(p => ({ ...p, [key]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full bg-white/6 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold text-sm placeholder-white/22 focus:outline-none focus:border-brand/55 focus:bg-white/9 transition-all"
                              />
                            </motion.div>
                          ))}

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-bold px-4 py-3 rounded-2xl"
                              >
                                {error}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <p className="text-white/22 text-[11px] font-medium">
                            No spam, ever. Your details stay private. 🔒
                          </p>
                        </motion.div>
                      )}

                      {/* ── Navigation ── */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/8">
                        <motion.button
                          onClick={step > 0 ? goBack : closeModal}
                          whileHover={{ x: -3 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-white/38 hover:text-white font-bold text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                          </svg>
                          {step > 0 ? 'Back' : 'Skip for now'}
                        </motion.button>

                        <motion.button
                          onClick={currentStepKey === 'contact' ? handleSubmit : goNext}
                          disabled={!canProceed() || loading}
                          whileHover={canProceed() && !loading ? { scale: 1.04, boxShadow: '0 0 30px rgba(229,57,53,0.55)' } : undefined}
                          whileTap={canProceed() && !loading ? { scale: 0.95 } : undefined}
                          className="relative flex items-center gap-2.5 px-6 py-3 bg-brand text-white rounded-full font-bold text-sm hover:bg-brand-hover transition-all shadow-glow disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                        >
                          {/* Shimmer on button */}
                          <motion.div
                            className="absolute inset-0 bg-white/15 -skew-x-12"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 1.5, ease: 'linear' }}
                          />
                          <span className="relative flex items-center gap-2.5">
                            {loading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Building your dream…
                              </>
                            ) : currentStepKey === 'contact' ? (
                              <>
                                🚀 Launch My Itinerary
                              </>
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
    </>
  )
}
