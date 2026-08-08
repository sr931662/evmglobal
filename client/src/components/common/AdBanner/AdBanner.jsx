import { useState, useEffect } from 'react'
import { api } from '../../../services/api'
import styles from './AdBanner.module.css'

// Renders the highest-priority active creative for `placement`, or nothing
// if the admin hasn't configured one (or it's outside its schedule window).
export default function AdBanner({ placement, className }) {
  const [ad, setAd] = useState(null)

  useEffect(() => {
    let active = true
    api.getActiveAds(placement)
      .then(ads => { if (active) setAd(Array.isArray(ads) && ads.length ? ads[0] : null) })
      .catch(() => { if (active) setAd(null) })
    return () => { active = false }
  }, [placement])

  if (!ad) return null

  const img = (
    <img src={ad.image} alt={ad.altText || ad.title} loading="lazy" className={styles.img} />
  )

  return (
    <div className={`${styles.wrap} ${className || ''}`} data-ad-slot={placement}>
      {ad.link ? (
        <a href={ad.link} target={ad.linkTarget || '_blank'} rel="noopener noreferrer" className={styles.link}>
          {img}
        </a>
      ) : img}
    </div>
  )
}
