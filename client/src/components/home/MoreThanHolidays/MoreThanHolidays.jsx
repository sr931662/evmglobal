import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './MoreThanHolidays.module.css'

const ICONS = {
  passport: <><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 17h6" /></>,
  shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
  ship:     <><path d="M3 17l1.5-5h15L21 17" /><path d="M2 20c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" /><path d="M12 12V4" /><path d="M8 8h8" /></>,
  mountain: <><path d="M8 3l4 8 3-4 6 12H3z" /></>,
  briefcase:<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
}

const SERVICES = [
  { icon: 'passport',  title: 'Visa Assistance',       desc: 'Make your visa process simpler.' },
  { icon: 'shield',    title: 'Travel Insurance',      desc: 'Travel with greater confidence.' },
  { icon: 'ship',      title: 'Cruises',               desc: 'Discover the world differently.' },
  { icon: 'mountain',  title: 'Trekking & Adventure',  desc: 'For journeys beyond the ordinary.' },
  { icon: 'briefcase', title: 'MICE & Corporate',      desc: 'Travel solutions for businesses.' },
]

export default function MoreThanHolidays() {
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
            <span className={styles.eyebrowLine} /> Services
          </span>
          <h2 className={styles.heading}>More Than Just Holidays</h2>
          <p className={styles.sub}>
            Ease My Vacations isn&rsquo;t another holiday-package website. Ask us about any of these and
            a travel expert will take it from there.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {SERVICES.map((service, i) => (
            <motion.button
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.33, 1, 0.68, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => openWhatsApp(service.title)}
              className={styles.card}
            >
              <span className={styles.iconWrap}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[service.icon]}
                </svg>
              </span>
              <span className={styles.title}>{service.title}</span>
              <span className={styles.desc}>{service.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
