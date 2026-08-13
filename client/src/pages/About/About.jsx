import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useJsonLd } from '../../hooks/useJsonLd'
import styles from './About.module.css'

const FOUNDED_YEAR = 2022

const openPlanner = () => window.dispatchEvent(new CustomEvent('open-travel-quiz'))

const ARROW = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.arrow}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

// ── Static content ───────────────────────────────────────────────────────────

const SERVICES_SUMMARY = ['Holidays', 'Visa Assistance', 'Travel Insurance', 'Cruises', 'Trekking', 'MICE']

// Wording taken from the revision brief. Milestones must stay factually true —
// an admin should verify these against what actually happened before launch.
const TIMELINE = [
  { year: '2022',    title: 'Ease My Vacations begins',                     desc: 'A travel company built on the idea that planning should feel easier.' },
  { year: '2023–24', title: 'Expanding destinations & travel services',     desc: 'More destinations, and services beyond holiday packages.' },
  { year: '2025',    title: 'Building a stronger digital travel experience', desc: 'Investing in how travellers discover and plan with us online.' },
  { year: '2026',    title: 'Growing our personalised travel ecosystem',     desc: 'Deepening the parts of the journey we can make simpler.' },
]

const BELIEFS = [
  { title: 'Travel should feel personal.',            desc: 'No two travellers are the same.' },
  { title: 'Planning should feel easy.',              desc: 'We simplify the complicated parts.' },
  { title: 'Value matters.',                          desc: 'We help you find the right experience for your budget.' },
  { title: "Support shouldn't stop at booking.",      desc: "We're here throughout your journey." },
  { title: 'Memories matter more than transactions.', desc: "Because the best holiday isn't just something you book — it's something you remember." },
]

const USPS = [
  { icon: '☎', title: 'One Point of Contact',    desc: 'One travel expert who understands your journey.' },
  { icon: '✎', title: 'Personalised Holidays',   desc: 'Itineraries shaped around your preferences.' },
  { icon: '₹', title: 'Value-Focused Planning',  desc: 'We help compare options to find the right balance of experience and budget.' },
  { icon: '🌍', title: 'On-Trip Assistance',      desc: 'Support before and during your journey.' },
]

const SERVICES = [
  { icon: '🌍', title: 'Holiday Packages',      desc: 'Domestic and international personalised holidays.', to: '/packages' },
  { icon: '🛂', title: 'Visa Assistance',       desc: 'Guidance through the visa process.',                to: '/contact' },
  { icon: '🛡', title: 'Travel Insurance',      desc: 'Travel protection for greater peace of mind.',      to: '/contact' },
  { icon: '🚢', title: 'Cruises',               desc: 'Curated cruise experiences.',                       to: '/packages?q=cruise' },
  { icon: '🏔', title: 'Trekking & Adventure',  desc: 'Journeys for travellers who want something beyond the ordinary.', to: '/packages?q=trek' },
  { icon: '💼', title: 'MICE & Corporate Travel', desc: 'Travel solutions for businesses and groups.',     to: '/contact' },
]

const REGIONS = [
  { name: 'India',  places: ['Kashmir', 'Himachal', 'Sikkim', 'Darjeeling', 'Andaman'] },
  { name: 'Asia',   places: ['Thailand', 'Vietnam', 'Bali', 'Singapore', 'Maldives'] },
  { name: 'Gulf',   places: ['UAE', 'Dubai', 'Abu Dhabi'] },
  { name: 'Europe', places: ['France', 'Switzerland', 'Italy', 'Austria', 'Belgium'] },
]

const AUDIENCES = [
  { icon: '❤️', label: 'Couples & Honeymooners' },
  { icon: '👨‍👩‍👧', label: 'Families' },
  { icon: '👯', label: 'Friends & Groups' },
  { icon: '💼', label: 'Corporate & MICE' },
  { icon: '🥾', label: 'Adventure Seekers' },
  { icon: '🌍', label: 'First-Time International Travellers' },
]

const HOW_WE_WORK = [
  { num: '01', title: 'Tell Us Your Plans',     desc: 'Destination, dates, travellers and preferences.' },
  { num: '02', title: 'We Build Your Journey',  desc: 'Our travel team creates an itinerary around you.' },
  { num: '03', title: 'Refine & Confirm',       desc: 'Change the hotels, activities, duration or inclusions.' },
  { num: '04', title: 'Travel With Confidence', desc: "We're available to support you throughout your trip." },
]

const COMPARISON = [
  ['Standard itineraries',        'Personalised itineraries'],
  ['Multiple points of contact',  'One travel expert'],
  ['Booking-focused',             'Journey-focused'],
  ['Limited flexibility',         'Customisable experiences'],
  ['Support can feel fragmented', 'Dedicated assistance'],
]

const PROMISE_POINTS = [
  'Simple planning.',
  'Thoughtful recommendations.',
  'Transparent communication.',
  'Dedicated support.',
]

const FAQS = [
  {
    q: 'What does Ease My Vacations specialise in?',
    a: 'Personalised holidays — domestic and international — planned by a travel expert around your dates, budget and preferences, rather than sold off a fixed shelf.',
  },
  {
    q: 'Can I customise your holiday packages?',
    a: 'Yes. Every package on the site is a starting point. Add or remove nights, upgrade hotels, add flights or sightseeing, change transfers, or extend your stay — we requote it around the changes.',
  },
  {
    q: 'Do you provide visa assistance?',
    a: 'Yes. We guide you through visa requirements, documentation and processing timelines for your destination as part of the booking.',
  },
  {
    q: 'Do you arrange travel insurance?',
    a: 'Yes, through our partners, so your trip, health and belongings are covered while you are away.',
  },
  {
    q: 'Can you arrange flights and hotels?',
    a: 'Yes. Flights, hotels, transfers and sightseeing can all be built into a single itinerary, or booked individually if that is all you need.',
  },
  {
    q: 'Do you offer domestic as well as international holidays?',
    a: 'Both. We plan holidays across India as well as international destinations including Thailand, Dubai, Vietnam, Bali, the Maldives, Singapore, Georgia and Europe.',
  },
  {
    q: 'Can I speak to a travel expert before booking?',
    a: 'Of course. You get one dedicated point of contact from the first conversation onward — on call or WhatsApp, before and during your trip.',
  },
  {
    q: 'How do I request a personalised quote?',
    a: 'Use Plan My Trip anywhere on the site, message us on WhatsApp, or send an enquiry. You will have a personalised quote back within 24 hours.',
  },
]

// ── Small pieces ─────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, sub, centered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={centered ? `${styles.sectionHead} ${styles.sectionHeadCentered}` : styles.sectionHead}
    >
      <span className={styles.eyebrow}>
        <span className={styles.eyebrowLine} /> {eyebrow}
      </span>
      <h2 className={styles.sectionHeading}>{title}</h2>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
    </motion.div>
  )
}

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FaqList() {
  const [open, setOpen] = useState(0)
  return (
    <div className={styles.faqList}>
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={faq.q} className={styles.faqItem}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className={styles.faqQ}
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isOpen && <div className={styles.faqA}>{faq.a}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function About() {
  const navigate = useNavigate()
  const [team,    setTeam]    = useState([])
  const [stories, setStories] = useState([])
  const [counts,  setCounts]  = useState({ destinations: 0, holidays: 0 })

  const yearsRunning = new Date().getFullYear() - FOUNDED_YEAR

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.getTeam({ status: 'active' }).catch(() => []),
      api.getHomeContent({ section: 'testimonial', status: 'active' }).catch(() => []),
      api.getDestinations().catch(() => []),
      api.getPackages({ status: 'Active', limit: 200 }).catch(() => []),
    ]).then(([teamData, storyData, destData, pkgData]) => {
      if (cancelled) return

      const members = Array.isArray(teamData) ? teamData : (teamData?.team || [])
      setTeam(members)

      setStories(Array.isArray(storyData) ? storyData.slice(0, 3) : [])

      const dests = Array.isArray(destData) ? destData : []
      const pkgs  = Array.isArray(pkgData?.packages) ? pkgData.packages
        : (Array.isArray(pkgData) ? pkgData : [])
      setCounts({ destinations: dests.length, holidays: pkgs.length })
    })

    return () => { cancelled = true }
  }, [])

  // The founder leads the section; everyone else becomes the team strip.
  const founder = team.find(m => /founder/i.test(m.role || '')) || null
  const others  = team.filter(m => m !== founder)

  // Only counts we can actually stand behind. The brief was explicit that a
  // modest true number beats an inflated one, so nothing here is invented.
  const glanceStats = [
    { value: `Since ${FOUNDED_YEAR}`, label: 'Serving Memories' },
    yearsRunning > 0 && { value: `${yearsRunning}+ Years`, label: 'Of creating travel experiences' },
    counts.destinations > 0 && { value: `${counts.destinations}+`, label: 'Destinations' },
    counts.holidays > 0 && { value: `${counts.holidays}+`, label: 'Holiday Experiences' },
  ].filter(Boolean)

  usePageMeta(
    'About Ease My Vacations | Personalised Holidays Since 2022',
    'Ease My Vacations plans personalised holidays with one dedicated travel expert, transparent options and on-trip support. Serving Memories since 2022 — holidays, visa assistance, insurance, cruises, trekking and MICE.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}/about` : '',
      type: 'website',
    }
  )

  useJsonLd('about-faq-schema', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  })

  return (
    <div className={styles.page}>

      {/* ── 01 · Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
            className={styles.heroContent}
          >
            <h1 className={styles.heroHeading}>Travel Made Personal.</h1>
            <p className={styles.heroLine}>Your Journey. Our Expertise.</p>
            <p className={styles.heroTagline}>Serving Memories since {FOUNDED_YEAR}</p>

            <p className={styles.heroPara}>
              At Ease My Vacations, we believe a holiday should be more than a booking. It should be
              an experience designed around you. From discovering the right destination to planning
              the details and supporting you throughout your journey, our travel experts make every
              step simpler.
            </p>

            {/* Who / what / why — answered inside the first screen */}
            <div className={styles.answerGrid}>
              <div className={styles.answer}>
                <p className={styles.answerQ}>Who are we?</p>
                <p className={styles.answerA}>
                  Ease My Vacations — a travel company built around personalised journeys.
                </p>
              </div>
              <div className={styles.answer}>
                <p className={styles.answerQ}>What do we do?</p>
                <p className={styles.answerA}>{SERVICES_SUMMARY.join(' • ')}</p>
              </div>
              <div className={styles.answer}>
                <p className={styles.answerQ}>Why trust us?</p>
                <p className={styles.answerA}>
                  Serving Memories since {FOUNDED_YEAR} · genuine customer experiences ·
                  transparent support · a real team you can reach.
                </p>
              </div>
            </div>

            <div className={styles.heroBtns}>
              <button onClick={openPlanner} className={styles.primaryBtn}>
                Plan My Trip {ARROW}
              </button>
              <button onClick={() => navigate('/packages')} className={styles.ghostBtn}>
                Our Holidays
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 02 · Our Story ────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="Our Story"
            title="How Ease My Vacations began — and where we're going."
          />
          <div className={styles.storyGrid}>
            <Reveal className={styles.storyText}>
              <p className={styles.storyLead}>
                Ease My Vacations began in {FOUNDED_YEAR} with a simple idea — travel planning
                should feel easier.
              </p>
              <p className={styles.storyPara}>
                We wanted to create a travel experience where customers weren&rsquo;t passed between
                multiple people, where itineraries could be shaped around their needs, and where
                support didn&rsquo;t end once the booking was confirmed.
              </p>
              <p className={styles.storyPara}>
                Today, Ease My Vacations helps travellers discover destinations, plan personalised
                holidays and travel with greater confidence.
              </p>
            </Reveal>

            {/* Timeline */}
            <Reveal className={styles.timeline} delay={0.1}>
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={styles.milestone}>
                  <div className={styles.milestoneMark}>
                    <span className={styles.milestoneDot} />
                    {i < TIMELINE.length - 1 && <span className={styles.milestoneLine} />}
                  </div>
                  <div className={styles.milestoneBody}>
                    <p className={styles.milestoneYear}>{item.year}</p>
                    <p className={styles.milestoneTitle}>{item.title}</p>
                    <p className={styles.milestoneDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 03 · At a glance ──────────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="At a Glance"
            title="Ease My Vacations, in numbers we can stand behind."
            sub="We'd rather show a modest true figure than an impressive one we can't evidence."
            centered
          />
          <div className={styles.glanceGrid}>
            {glanceStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06} className={styles.glanceCard}>
                <p className={styles.glanceValue}>{stat.value}</p>
                <p className={styles.glanceLabel}>{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · Meet the Founder ─────────────────────────────────── */}
      {founder && (
        <section className={styles.section}>
          <div className={styles.inner}>
            <SectionHead eyebrow="Meet the Founder" title={`Why ${founder.name.split(' ')[0]} started Ease My Vacations.`} />
            <Reveal className={styles.founderCard}>
              {founder.avatar && (
                <img src={founder.avatar} alt={founder.name} className={styles.founderPhoto} />
              )}
              <div className={styles.founderBody}>
                {founder.bio && <blockquote className={styles.founderQuote}>{founder.bio}</blockquote>}
                <p className={styles.founderName}>{founder.name}</p>
                <p className={styles.founderRole}>{founder.role}</p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Team strip */}
      {others.length > 0 && (
        <section className={styles.sectionTint}>
          <div className={styles.inner}>
            <SectionHead
              eyebrow="The Team"
              title="The people who plan your journey."
              sub="One of them becomes your single point of contact from the first conversation onward."
              centered
            />
            <div className={styles.teamGrid}>
              {others.map((member, i) => (
                <Reveal key={member.id || member.name} delay={(i % 4) * 0.06} className={styles.teamCard}>
                  {member.avatar
                    ? <img src={member.avatar} alt={member.name} loading="lazy" className={styles.teamPhoto} />
                    : <div className={styles.teamPhotoFallback} aria-hidden="true">{member.name?.[0] || '·'}</div>}
                  <p className={styles.teamName}>{member.name}</p>
                  <p className={styles.teamRole}>{member.role}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 05 · What We Believe ──────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHead eyebrow="What We Believe" title="Five things we keep coming back to." />
          <div className={styles.beliefList}>
            {BELIEFS.map((belief, i) => (
              <Reveal key={belief.title} delay={i * 0.05} className={styles.belief}>
                <p className={styles.beliefTitle}>{belief.title}</p>
                <p className={styles.beliefDesc}>{belief.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 · Why Ease My Vacations ────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="The Difference"
            title="Why Ease My Vacations?"
            sub="The same four promises you'll find on every holiday we plan."
            centered
          />
          <div className={styles.uspGrid}>
            {USPS.map((usp, i) => (
              <Reveal key={usp.title} delay={i * 0.06} className={styles.uspCard}>
                <span className={styles.uspIcon} aria-hidden="true">{usp.icon}</span>
                <p className={styles.uspTitle}>{usp.title}</p>
                <p className={styles.uspDesc}>{usp.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 · More Than Just Holidays ──────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="Our Services"
            title="More Than Just Holidays"
            sub="Ease My Vacations isn't only a holiday-package company. Ask us about any of these."
          />
          <div className={styles.serviceGrid}>
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={(i % 3) * 0.06}>
                <Link to={service.to} className={styles.serviceCard}>
                  <span className={styles.serviceIcon} aria-hidden="true">{service.icon}</span>
                  <span className={styles.serviceTitle}>{service.title}</span>
                  <span className={styles.serviceDesc}>{service.desc}</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.sectionCta} delay={0.1}>
            <Link to="/contact" className={styles.linkBtn}>Explore Our Services {ARROW}</Link>
          </Reveal>
        </div>
      </section>

      {/* ── 08 · Where We Take You ────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead eyebrow="Destinations" title="Where We Take You" />
          <div className={styles.regionGrid}>
            {REGIONS.map((region, i) => (
              <Reveal key={region.name} delay={i * 0.06} className={styles.regionCard}>
                <p className={styles.regionName}>{region.name}</p>
                <div className={styles.regionPlaces}>
                  {region.places.map(place => (
                    <Link
                      key={place}
                      to={`/packages?destination=${encodeURIComponent(place)}`}
                      className={styles.regionPlace}
                    >
                      {place}
                    </Link>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.sectionCta} delay={0.1}>
            <Link to="/destinations" className={styles.linkBtn}>Explore Destinations {ARROW}</Link>
          </Reveal>
        </div>
      </section>

      {/* ── 09 · Who We Serve ─────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="Who We Serve"
            title="Travel For Every Kind of Traveller"
            centered
          />
          <div className={styles.audienceRow}>
            {AUDIENCES.map((audience, i) => (
              <Reveal key={audience.label} delay={i * 0.04} className={styles.audience}>
                <span aria-hidden="true">{audience.icon}</span> {audience.label}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 · How We Work ──────────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="How We Work"
            title="From Dream to Destination"
            centered
          />
          <div className={styles.stepGrid}>
            {HOW_WE_WORK.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.07} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepDesc}>{step.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.sectionCta} delay={0.1}>
            <button onClick={openPlanner} className={styles.primaryBtn}>
              Start Planning My Trip {ARROW}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── 11 · Memories We've Helped Create ─────────────────────── */}
      {stories.length > 0 && (
        <section className={styles.section}>
          <div className={styles.inner}>
            <SectionHead
              eyebrow="Traveller Stories"
              title="Memories We've Helped Create"
            />
            <div className={styles.storyCards}>
              {stories.map((story, i) => (
                <Reveal key={story.name || i} delay={i * 0.07} className={styles.storyCard}>
                  {story.trip && <p className={styles.storyTrip}>{story.trip}</p>}
                  <blockquote className={styles.storyQuote}>{story.quote}</blockquote>
                  <div className={styles.storyPerson}>
                    {(story.image || story.photo) && (
                      <img src={story.image || story.photo} alt={story.name} loading="lazy" className={styles.storyAvatar} />
                    )}
                    <span className={styles.storyName}>&mdash; {story.name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className={styles.sectionCta} delay={0.1}>
              <Link to="/" className={styles.linkBtn}>View More Traveller Stories {ARROW}</Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 12 · Comparison ───────────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="What Makes Us Different"
            title="More Than a Booking. A Travel Partner."
            centered
          />
          <Reveal className={styles.compareWrap}>
            <table className={styles.compare}>
              <thead>
                <tr>
                  <th scope="col">Traditional booking</th>
                  <th scope="col" className={styles.compareUs}>Ease My Vacations</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([them, us]) => (
                  <tr key={us}>
                    <td>{them}</td>
                    <td className={styles.compareUs}>{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ── 13 · Our Promise ──────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <Reveal className={styles.promise}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Our Promise
            </span>
            <p className={styles.promiseStatement}>
              We make travel easier — from the moment you start dreaming about your trip to the
              moment you return home with memories worth keeping.
            </p>
            <div className={styles.promiseList}>
              {PROMISE_POINTS.map(point => (
                <span key={point} className={styles.promisePoint}>{point}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 14 · Registered & recognised ──────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow="Trust"
            title="Recognised &amp; Registered"
            sub="Only genuine, current registrations are listed here."
            centered
          />
          <Reveal className={styles.trustRow}>
            <span className={styles.trustBadge}>
              <span className={styles.trustLabel}>CIN</span>
              U79110HR2026OPC146794
            </span>
            <span className={styles.trustBadge}>
              <span className={styles.trustLabel}>GST</span>
              06AANCG1457H1Z1
            </span>
            <span className={styles.trustNote}>
              Global Ease My Vacations (OPC) Private Limited · Registered in India
            </span>
          </Reveal>
        </div>
      </section>

      {/* ── 15 · FAQ ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHead eyebrow="Good to Know" title="Frequently Asked Questions" centered />
          <Reveal><FaqList /></Reveal>
          <Reveal className={styles.sectionCta} delay={0.1}>
            <p className={styles.faqFooter}>Still have questions?</p>
            <button onClick={() => openWhatsApp()} className={styles.ghostBtn}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}><path d={WA_PATH} /></svg>
              Talk to a Travel Expert
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── 16 · Final CTA ────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <Reveal className={styles.finalCta}>
            <h2 className={styles.finalHeading}>Let&rsquo;s Plan Your Next Journey</h2>
            <p className={styles.finalSub}>
              Tell us where you want to go. We&rsquo;ll help you build the journey around you.
            </p>
            <div className={styles.finalBtns}>
              <button onClick={openPlanner} className={styles.primaryBtn}>
                Plan My Trip {ARROW}
              </button>
              <button onClick={() => openWhatsApp()} className={styles.ghostBtn}>
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}><path d={WA_PATH} /></svg>
                WhatsApp a Travel Expert
              </button>
            </div>

            {/* Deliberate onward routes rather than a dead end */}
            <div className={styles.onward}>
              {[
                ['Our Holidays',    '/packages'],
                ['Destinations',    '/destinations'],
                ['Travel Services', '/contact'],
                ['Travel Journal',  '/blog'],
                ['Contact Us',      '/contact'],
              ].map(([label, to]) => (
                <Link key={label} to={to} className={styles.onwardLink}>{label} →</Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
