import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './GallerySection.module.css'

// Rendered until the API responds, and kept if it fails — the section never goes blank.
const FALLBACK = [
  { src: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=1200', caption: 'Santorini, Greece',       span: 'wide' },
  { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',  caption: 'Kyoto, Japan' },
  { src: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=800',  caption: 'Maldives',              span: 'tall' },
  { src: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800',  caption: 'Swiss Alps' },
  { src: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800',  caption: 'Machu Picchu, Peru' },
  { src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',  caption: 'Serengeti, Tanzania' },
  { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200', caption: 'Bali, Indonesia',       span: 'wide' },
]

export default function GallerySection() {
  const [gallery, setGallery] = useState(FALLBACK)

  useEffect(() => {
    api.getHomeContent({ section: 'gallery', status: 'active' })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        setGallery(data
          .filter(item => item.image)
          .map(item => ({ src: item.image, caption: item.caption, span: item.span })))
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
            <span className={styles.eyebrowLine} /> Real Customer Experiences
          </span>
          <h2 className={styles.heading}>Memories We&rsquo;ve Helped Create</h2>
          <p className={styles.subtitle}>
            Real trips, real travellers — a glimpse of the journeys we&rsquo;ve helped bring to life since 2022.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {gallery.map((g, i) => (
            <motion.div
              key={g.caption || i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.33, 1, 0.68, 1] }}
              className={[
                styles.tile,
                g.span === 'wide' ? styles.tileWide : '',
                g.span === 'tall' ? styles.tileTall : '',
              ].filter(Boolean).join(' ')}
            >
              <motion.img
                src={g.src}
                alt={g.caption}
                className={styles.tileImg}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className={`${styles.tileVignette} card-vignette`} />
              <span className={styles.tileCaption}>{g.caption}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
