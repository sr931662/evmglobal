import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPriceCompact } from '../../../utils/currency'
import styles from './DestinationCard.module.css'

const ARROW = (
  <svg style={{width:'1.25rem',height:'1.25rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
)

function buildShareUrl(name) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/destination/${encodeURIComponent(name)}`
}

export default function DestinationCard({ dest, index, priceMin, priceMax, packageCount }) {
  const navigate  = useNavigate()
  const [hovered, setHovered] = useState(false)

  const minFmt = formatPriceCompact(priceMin, dest.startingPrice)
  const maxFmt = formatPriceCompact(priceMax)

  const hasPricing = !!minFmt

  async function handleShare(event) {
    event.stopPropagation()
    const shareUrl  = buildShareUrl(dest.name)
    const shareText = `Explore ${dest.name}, ${dest.country} with Ease My Vacations`
    try {
      if (navigator.share) {
        await navigator.share({ title: dest.name, text: shareText, url: shareUrl })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        window.alert('Destination link copied. You can share it now.')
        return
      }
    } catch {}
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.2, delay: (index % 4) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
      className={styles.card}
    >
      <motion.img
        src={dest.image}
        alt={dest.name}
        className={styles.img}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className={`${styles.vignette} card-vignette`} />
      <div className={`${styles.arrow} glass`}>{ARROW}</div>
      <button
        type="button"
        className={styles.shareBtn}
        onClick={handleShare}
        aria-label={`Share ${dest.name}`}
      >
        Share
      </button>

      {/* Pricing hover panel */}
      <AnimatePresence>
        {hovered && hasPricing && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 8,   scale: 0.96  }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className={styles.pricePanel}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.pricePanelInner}>
              <span className={styles.priceLabel}>
                {packageCount ? `${packageCount} package${packageCount > 1 ? 's' : ''}` : 'Packages available'}
              </span>
              <div className={styles.priceRange}>
                <span className={styles.priceFrom}>From</span>
                <span className={styles.priceValue}>{minFmt}</span>
                {maxFmt && maxFmt !== minFmt && (
                  <>
                    <span className={styles.priceSep}>–</span>
                    <span className={styles.priceValue}>{maxFmt}</span>
                  </>
                )}
                <span className={styles.pricePerAdult}>/ adult</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/packages?destination=${encodeURIComponent(dest.name)}`) }}
                className={styles.viewBtn}
              >
                View Packages →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.info}>
        <span className={styles.region}>{dest.region}</span>
        <h3 className={styles.name}>{dest.name}</h3>
        <p className={styles.country}>{dest.country}</p>
        {hasPricing && !hovered && (
          <p className={styles.priceTeaser}>From {minFmt} · hover to explore</p>
        )}
      </div>
    </motion.div>
  )
}
