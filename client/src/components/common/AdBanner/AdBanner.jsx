import { useState, useEffect } from 'react'
import { api } from '../../../services/api'
import { adFrameStyle, adImageStyle } from '../../../utils/adPlacements'
import styles from './AdBanner.module.css'

// Renders the highest-priority active creative for `placement`, or nothing
// if the admin hasn't configured one (or it's outside its schedule window).
export default function AdBanner({ placement, className, page = false }) {
  const [ad, setAd] = useState(null)

  useEffect(() => {
    let active = true
    api.getActiveAds(placement)
      .then(ads => { if (active) setAd(Array.isArray(ads) && ads.length ? ads[0] : null) })
      .catch(() => { if (active) setAd(null) })
    return () => { active = false }
  }, [placement])

  if (!ad) return null

  // Frame and fit come from the sizing chosen against this banner, so a tall
  // creative isn't cropped to a strip and a strip isn't stretched tall.
  const img = (
    <img
      src={ad.image}
      alt={ad.altText || ad.title}
      loading="lazy"
      className={styles.img}
      style={adImageStyle(ad)}
    />
  )

  return (
    <div className={`${styles.slot} ${page ? styles.pageSlot : ''} ${className || ''}`}>
      <div
        className={styles.wrap}
        style={adFrameStyle(ad)}
        data-ad-slot={placement}
      >
        {ad.link ? (
          <a href={ad.link} target={ad.linkTarget || '_blank'} rel="noopener noreferrer" className={styles.link}>
            {img}
          </a>
        ) : img}
      </div>
    </div>
  )
}
