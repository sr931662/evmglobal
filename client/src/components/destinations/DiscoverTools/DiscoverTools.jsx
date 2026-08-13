import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MONTHS, budgetSymbol, scoreRows } from '../../../utils/destinationMatch'
import styles from './DiscoverTools.module.css'

const ARROW = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

// The curated groupings we render, and the icon each gets. A collection only
// appears once at least one destination has been tagged into it.
const COLLECTIONS = [
  { name: 'Honeymoon Escapes', icon: '❤️' },
  { name: 'Family Adventures', icon: '👨‍👩‍👧' },
  { name: 'Beach Holidays',    icon: '🏖' },
  { name: 'Mountain Escapes',  icon: '🏔' },
  { name: 'Luxury Getaways',   icon: '💎' },
  { name: 'City Breaks',       icon: '🏙' },
]

function Reveal({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── "Not sure where to go?" entry point ──────────────────────────────────────

export function NotSureBanner() {
  return (
    <section className={`${styles.section} ${styles.sectionPlain}`}>
      <div className={styles.inner}>
        <Reveal className={styles.finderCard}>
          <div className={styles.finderCopy}>
            <h2 className={styles.finderHeading}>Not Sure Where to Go?</h2>
            <p className={styles.finderSub}>
              Tell us about your dream holiday &mdash; the kind of trip, roughly when, and your
              budget &mdash; and we&rsquo;ll recommend the destinations that fit.
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-destination-finder'))}
            className={styles.primaryBtn}
          >
            Help Me Choose {ARROW}
          </button>
        </Reveal>
      </div>
    </section>
  )
}

// ── Holiday collections ──────────────────────────────────────────────────────

export function HolidayCollections({ destinations }) {
  const grouped = useMemo(() => {
    return COLLECTIONS
      .map(collection => ({
        ...collection,
        places: (destinations || []).filter(dest =>
          (Array.isArray(dest.collections) ? dest.collections : [])
            .some(c => (c || '').toLowerCase().trim() === collection.name.toLowerCase())
        ),
      }))
      .filter(collection => collection.places.length > 0)
  }, [destinations])

  if (grouped.length === 0) return null

  return (
    <section className={`${styles.section} ${styles.sectionTint}`}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Collections
          </span>
          <h2 className={styles.heading}>Holiday Collections</h2>
          <p className={styles.sub}>
            Another way in &mdash; browse by the kind of trip rather than the place.
          </p>
        </Reveal>

        <div className={styles.collectionGrid}>
          {grouped.map(collection => (
            <Reveal key={collection.name} className={styles.collection}>
              <span className={styles.collectionIcon} aria-hidden="true">{collection.icon}</span>
              <h3 className={styles.collectionName}>{collection.name}</h3>
              <div className={styles.collectionPlaces}>
                {collection.places.map(place => (
                  <Link
                    key={place.id || place._id || place.name}
                    to={`/packages?destination=${encodeURIComponent(place.name)}`}
                    className={styles.collectionPlace}
                  >
                    {place.name}
                  </Link>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Travel by month ──────────────────────────────────────────────────────────

export function TravelByMonth({ destinations }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const anyMonthData = (destinations || []).some(
    d => Array.isArray(d.bestMonths) && d.bestMonths.length > 0
  )

  const matches = useMemo(
    () => (destinations || []).filter(d =>
      Array.isArray(d.bestMonths) && d.bestMonths.includes(month)
    ),
    [destinations, month]
  )

  // Nothing to browse until an admin has recorded which months work where.
  if (!anyMonthData) return null

  return (
    <section className={`${styles.section} ${styles.sectionPlain}`}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Travel by Month
          </span>
          <h2 className={styles.heading}>Where Should You Travel This Month?</h2>
          <p className={styles.sub}>
            Weather, crowds and pricing all shift through the year. These are the destinations at
            their best in each month.
          </p>
        </Reveal>

        <Reveal>
          <div className={`${styles.monthTabs} no-scrollbar`}>
            {MONTHS.map((name, i) => (
              <button
                key={name}
                onClick={() => setMonth(i + 1)}
                className={`${styles.monthTab} ${month === i + 1 ? styles.monthTabOn : ''}`}
                aria-current={month === i + 1 ? 'true' : undefined}
              >
                {name}
              </button>
            ))}
          </div>

          <div className={styles.monthResult}>
            {matches.length > 0 ? (
              <>
                <p className={styles.monthLead}>
                  <strong>{matches.length}</strong> destination{matches.length === 1 ? '' : 's'} at
                  their best in <strong>{MONTHS[month - 1]}</strong>
                </p>
                <div className={styles.monthPlaces}>
                  {matches.map(place => (
                    <Link
                      key={place.id || place._id || place.name}
                      to={`/packages?destination=${encodeURIComponent(place.name)}`}
                      className={styles.monthPlace}
                    >
                      {place.name}
                      {budgetSymbol(place.budgetLevel) && (
                        <span className={styles.monthBudget}>{budgetSymbol(place.budgetLevel)}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.monthEmpty}>
                Nothing on our list peaks in {MONTHS[month - 1]} &mdash; but that doesn&rsquo;t mean
                you can&rsquo;t travel.{' '}
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-destination-finder'))}
                  style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Let us suggest something
                </button>
                {' '}for your dates.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── At-a-glance score bars, used on destination cards ────────────────────────

export function DestinationScores({ dest }) {
  const rows = scoreRows(dest)
  if (rows.length === 0) return null

  return (
    <div className={styles.scoreList}>
      {rows.map(row => (
        <div key={row.id} className={styles.scoreRow}>
          <span className={styles.scoreLabel}>{row.label.split(' ')[0]}</span>
          <span className={styles.scoreDots} aria-label={`${row.label}: ${row.value} out of 5`}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} className={`${styles.scoreDot} ${n <= row.value ? styles.scoreDotOn : ''}`} />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
