import { motion } from 'framer-motion'
import styles from './PackageSections.module.css'
import destStyles from './DestinationHighlights.module.css'

// Matches the highlight text to a fitting icon so a beach bullet doesn't get a
// mountain. Falls back to a neutral marker.
const ICON_RULES = [
  [/beach|sand|coast|shore/i,                 '🏖'],
  [/island|archipelago|isle|lagoon/i,         '🏝'],
  [/sea|ocean|water|snorkel|dive|reef/i,      '🌊'],
  [/cliff|limestone|rock|mountain|peak|hill/i,'🏔'],
  [/sunset|sunrise|view|scenic|panorama/i,    '🌅'],
  [/night|bar|party|club/i,                   '🌃'],
  [/shop|market|bazaar|souk/i,                '🛍'],
  [/food|cuisine|street food|dining|eat/i,    '🍜'],
  [/temple|palace|heritage|culture|museum/i,  '🛕'],
  [/spa|wellness|massage|relax|calm/i,        '🧖'],
  [/boat|cruise|ferry|sail|kayak/i,           '⛵'],
  [/wildlife|jungle|forest|park|safari/i,     '🌿'],
  [/city|urban|skyline|downtown/i,            '🏙'],
]

function iconFor(text) {
  const match = ICON_RULES.find(([pattern]) => pattern.test(text))
  return match ? match[1] : '✦'
}

// Breaks a multi-city package into a block per destination so it doesn't read
// as one undifferentiated "Thailand" product — and gives each city its own
// keyword-rich H3 for search.
//
// Content comes from the Destinations CMS record (blurb + highlights). A
// destination with nothing filled in is skipped rather than padded with
// invented copy, and the whole section hides if none of them have content.
export default function DestinationHighlights({ pkg, destinationRecords = [] }) {
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  if (destinations.length === 0) return null

  const byName = new Map(
    destinationRecords.map(record => [(record.name || '').toLowerCase().trim(), record])
  )

  const blocks = destinations
    .map(name => {
      const record = byName.get(name.toLowerCase().trim())
      const highlights = Array.isArray(record?.highlights) ? record.highlights.filter(Boolean) : []
      if (!record || (highlights.length === 0 && !record.blurb)) return null
      return { name, blurb: record.blurb, highlights }
    })
    .filter(Boolean)

  if (blocks.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Where You&rsquo;ll Stay</span>
      <h2 className={styles.heading}>What Each Stop Is Known For</h2>
      <p className={styles.sub}>
        Every destination on this trip has its own character. Here&rsquo;s what each one is really about.
      </p>

      <div className={destStyles.blocks}>
        {blocks.map(block => (
          <div key={block.name} className={destStyles.block}>
            <h3 className={destStyles.name}>{block.name}</h3>
            {block.blurb && <p className={destStyles.blurb}>{block.blurb}</p>}
            {block.highlights.length > 0 && (
              <ul className={destStyles.list}>
                {block.highlights.map((highlight, i) => (
                  <li key={i} className={destStyles.item}>
                    <span className={destStyles.icon} aria-hidden="true">{iconFor(highlight)}</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
