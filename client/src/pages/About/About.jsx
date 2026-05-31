import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './About.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2500
    let start = null
    function tick(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

const pillars = [
  { icon: '✦', title: 'Bespoke Itineraries', desc: 'Every trip is crafted from a blank canvas — your pace, your preferences, your style.' },
  { icon: '◎', title: '24/7 Concierge', desc: 'From your first query to your safe return, a dedicated concierge is available at all hours.' },
  { icon: '◈', title: 'Full Transparency', desc: 'No hidden fees, no surprises. Every expense itemised before you pay.' },
  { icon: '◇', title: 'Seamless Logistics', desc: 'Flights, hotels, transfers — coordinated in a single, elegant itinerary.' },
]

const stats = [
  { target: 1000, suffix: '+', label: 'Trips Completed' },
  { target: 50,   suffix: '+', label: 'Destinations' },
  { target: 2022, suffix: '',  label: 'Est. Year' },
]

const aiItems = [
  { icon: '🤖', title: 'AI-Powered Itineraries', desc: 'Personalized trip plans generated using intelligent travel data.' },
  { icon: '⚡', title: 'Smarter Recommendations', desc: 'Curated options based on your preferences and travel history.' },
  { icon: '💬', title: 'Instant Support', desc: 'AI-assisted customer support available around the clock.' },
]

export default function About() {
  usePageMeta(
    'About Ease My Vacations | Trusted Travel Company for Holiday Packages',
    'Learn about Ease My Vacations, a leading travel company offering customized holiday packages, family vacations, honeymoon tours, group departures, and memorable travel experiences across India and international destinations.'
  )
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.33,1,0.68,1] }}
              className={styles.heroLeft}
            >
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowLine} /> Founded 2022
              </span>
              <h1 className={styles.heroHeading}>
                Making travel easier,<br />smarter, more memorable.
              </h1>
              <p className={styles.heroPara}>
                Founded by <strong>Ved Anand</strong>, Ease My Vacations Global began with a simple vision — to make travel planning seamless, transparent, and accessible for every traveler.
              </p>
              <p className={styles.heroPara}>
                What started as a small travel venture in <strong>Siliguri, West Bengal</strong> has evolved into a rapidly growing company with a strong presence in Kolkata and its corporate headquarters in <strong>Gurugram, Haryana</strong>.
              </p>

              <div className={styles.statsRow}>
                {stats.map(s => (
                  <div key={s.label}>
                    <div className={styles.statNum}>
                      <Counter target={s.target} suffix={s.suffix} />
                    </div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.33,1,0.68,1] }}
              className={styles.heroRight}
            >
              <div className={styles.imgAccent1} />
              <div className={styles.imgAccent2} />
              <div className={styles.imgFrame}>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600"
                  alt="EMV Team"
                  className={styles.heroImg}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={styles.missionSection}>
        <div className={styles.sectionInner}>
          <div className={styles.missionGrid}>
            {[
              {
                label: 'Our Mission',
                text: 'To simplify travel through technology, personalized service, and reliable travel solutions while delivering exceptional value and memorable experiences to travelers across the globe.',
              },
              {
                label: 'Our Vision',
                text: "To become one of India's most trusted travel technology companies by combining human expertise with cutting-edge innovation, making travel planning smarter, faster, and more accessible for everyone.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className={styles.missionCard}
              >
                <span className={styles.missionCardEyebrow}>
                  <span className={styles.eyebrowLine} /> {item.label}
                </span>
                <p className={styles.missionText}>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bootstrapped banner */}
      <section className={styles.darkSection}>
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.darkInner}
          >
            <span className={styles.darkEyebrow}>
              <span className={styles.eyebrowLine} /> Bootstrapped &amp; Proud <span className={styles.eyebrowLine} />
            </span>
            <h2 className={styles.darkHeading}>Built on trust. Grown by excellence.</h2>
            <p className={styles.darkDesc}>
              As a proudly bootstrapped company, we have built our business without external funding — relying instead on our commitment to service excellence, operational efficiency, and the trust of our customers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className={styles.pillarsSection}>
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={styles.sectionHead}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> The Philosophy
            </span>
            <h2 className={styles.sectionHeading}>How we do things differently.</h2>
          </motion.div>
          <div className={styles.pillarsGrid}>
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className={styles.pillarCard}
              >
                <div className={styles.pillarIcon}>{p.icon}</div>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI & Innovation */}
      <section className={styles.aiSection}>
        <div className={styles.sectionInner}>
          <div className={styles.aiGrid}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={styles.aiLeft}
            >
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowLine} /> Innovation &amp; AI
              </span>
              <h2 className={styles.sectionHeading} style={{ marginBottom: '1.75rem' }}>
                Redefining travel with artificial intelligence.
              </h2>
              <p className={styles.heroPara}>
                As the travel industry evolves, Ease My Vacations is actively embracing the power of AI to redefine how travelers plan and experience their journeys.
              </p>
              <p className={styles.heroPara}>
                We are investing in AI-driven solutions that help customers discover personalized itineraries, receive intelligent travel recommendations, compare options efficiently, and access faster customer support.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={styles.aiRight}
            >
              {aiItems.map((item) => (
                <div key={item.title} className={styles.aiCard}>
                  <span className={styles.aiCardIcon}>{item.icon}</span>
                  <div>
                    <p className={styles.aiCardTitle}>{item.title}</p>
                    <p className={styles.aiCardDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Legal entity strip */}
      <section className={styles.legalStrip}>
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.legalStripInner}
          >
            <span className={styles.legalBadge}>
              <span className={styles.legalBadgeLabel}>CIN</span>
              U72900WB2022PTC254985
            </span>
            <span className={styles.legalDivider} />
            <span className={styles.legalBadge}>
              <span className={styles.legalBadgeLabel}>GST</span>
              19AAHCE1058Q2Z2
            </span>
            <span className={styles.legalDivider} />
            <span className={styles.legalNote}>Ease My Vacations Global Private Limited · Registered in India</span>
          </motion.div>
        </div>
      </section>

      {/* Road ahead */}
      <section className={styles.roadSection}>
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.roadCard}
          >
            <div className={styles.roadText}>
              <span className={styles.roadEyebrow}>
                <span className={styles.eyebrowLine} /> The Road Ahead
              </span>
              <h2 className={styles.roadHeading}>Our ambitions extend far beyond borders.</h2>
              <p className={styles.roadDesc}>
                While our journey began in Siliguri and expanded through Kolkata to Gurugram, we are committed to expanding our global footprint, enhancing our technology capabilities, and continuing to deliver world-class travel experiences worldwide.
              </p>
            </div>
            <div className={styles.taglineBox}>
              <span className={styles.taglineLabel}>Our tagline</span>
              <p className={styles.taglineQuote}>
                "Making Travel Easier, Smarter, and More Memorable Since 2022."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
