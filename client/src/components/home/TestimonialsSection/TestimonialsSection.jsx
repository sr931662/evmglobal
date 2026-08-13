import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './TestimonialsSection.module.css'

const AVATAR_COLORS = ['#E53935', '#0a0a0a', '#C62828', '#1a1a1a', '#E53935', '#0a0a0a']

// Rendered until the API responds, and kept if it fails — the section never goes blank.
const FALLBACK = [
  {
    name: 'Ananya Sharma',
    trip: 'Maldives Holiday · 2025',
    rating: 5,
    quote: "Ease My Vacations planned every last detail of our honeymoon — the overwater villa, the sunset cruise, all of it. We didn't have to think about a single thing. The one point of contact made the whole thing effortless, and everything we were promised was exactly what we got.",
  },
  {
    name: 'Rohan Mehta',
    trip: 'Switzerland Holiday · 2025',
    rating: 5,
    quote: 'Travelling with two kids can be stressful, but our travel expert had backup plans for everything. The itinerary felt tailor-made for our family, right down to the pace of each day and where we stopped to eat.',
  },
  {
    name: 'Priya & Karan',
    trip: 'Bali Holiday · 2025',
    rating: 5,
    quote: 'From the private villa to the hidden waterfall tour nobody else knew about — this was the most thoughtfully curated trip we have ever taken. We have already asked them to plan the next one.',
  },
  {
    name: 'Vikram Singh',
    trip: 'Dubai Holiday · 2025',
    rating: 4,
    quote: 'Seamless coordination between my meetings and leisure days. The on-trip assistance genuinely came through when my flight got rescheduled at midnight and a new transfer was waiting for me.',
  },
  {
    name: 'Neha Kapoor',
    trip: 'Vietnam Holiday · 2024',
    rating: 5,
    quote: 'As a solo traveller, safety and flexibility mattered most. Ease My Vacations built a route that felt personal, not like a packaged tour at all, and someone checked in on me at every city.',
  },
  {
    name: 'The Malhotra Family',
    trip: 'Europe Holiday · 2024',
    rating: 5,
    quote: 'Coordinating 12 of us across 4 countries sounded impossible until Ease My Vacations took over. Transparent pricing, zero surprises, unforgettable trip — and one number to call the whole way through.',
  },
]

const CLAMP_LENGTH = 150

function initials(name) {
  // Admin-entered names can be blank or oddly spaced — never let this throw.
  return (name || '')
    .replace('The ', '')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

function Stars({ count }) {
  return (
    <div className={styles.stars} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i < count ? 'currentColor' : 'none'} stroke="currentColor" className={styles.star}>
          <path strokeLinejoin="round" strokeWidth={i < count ? 0 : 1.5} d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
        </svg>
      ))}
    </div>
  )
}

// Long quotes are truncated so the grid stays scannable — the visitor opts in
// to the full story rather than being handed a wall of text.
function Quote({ text }) {
  const [expanded, setExpanded] = useState(false)
  const full = text || ''
  const needsClamp = full.length > CLAMP_LENGTH

  if (!needsClamp) return <p className={styles.quote}>{full}</p>

  return (
    <p className={styles.quote}>
      {expanded ? full : `${full.slice(0, CLAMP_LENGTH).trimEnd()}… `}
      <button type="button" onClick={() => setExpanded(v => !v)} className={styles.readMore}>
        {expanded ? 'Read less' : 'Read more'}
      </button>
    </p>
  )
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK)

  useEffect(() => {
    api.getHomeContent({ section: 'testimonial', status: 'active' })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        setTestimonials(data.map(item => ({
          name:   item.name,
          trip:   item.trip,
          rating: item.rating ?? 5,
          quote:  item.quote,
          photo:  item.image || item.photo,
        })))
      })
      .catch(() => {})
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Traveller Stories
          </span>
          <h2 className={styles.heading}>In their own words.</h2>
        </motion.div>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name || i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.33, 1, 0.68, 1] }}
              className={styles.card}
            >
              <svg viewBox="0 0 32 24" fill="currentColor" className={styles.quoteMark}>
                <path d="M0 24V14.4C0 6.4 4.8 1.1 12.6 0l1.4 3.7C9 5.3 6.4 8.2 6.4 12h6.2V24H0zm18 0V14.4C18 6.4 22.8 1.1 30.6 0l1.4 3.7C27 5.3 24.4 8.2 24.4 12h6.2V24H18z" />
              </svg>

              <Stars count={t.rating} />
              <Quote text={t.quote} />

              <div className={styles.person}>
                {t.photo ? (
                  <img src={t.photo} alt={t.name} loading="lazy" className={styles.avatarPhoto} />
                ) : (
                  <div className={styles.avatar} style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {initials(t.name)}
                  </div>
                )}
                <div>
                  <p className={styles.name}>{t.name}</p>
                  <p className={styles.trip}>{t.trip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
