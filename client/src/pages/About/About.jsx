import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './About.module.css'

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

export default function About() {
  return (
    <div className="bg-white min-h-screen pt-[85px] md:pt-[100px]">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 -z-10 rounded-bl-[80px] md:rounded-bl-[150px]" />
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.33,1,0.68,1] }}
              className="lg:col-span-6"
            >
              <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-brand" /> Founded 2022
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-serif font-bold text-dark mb-7 leading-[1.05] tracking-tight">
                Making travel easier,<br />smarter, more memorable.
              </h1>
              <p className="text-base md:text-lg text-gray-500 mb-5 leading-relaxed font-light">
                Founded by <strong className="text-dark font-bold">Ved Anand</strong>, Ease My Vacations Global began with a simple vision — to make travel planning seamless, transparent, and accessible for every traveler.
              </p>
              <p className="text-base md:text-lg text-gray-500 mb-10 leading-relaxed font-light">
                What started as a small travel venture in <strong className="text-dark font-bold">Siliguri, West Bengal</strong> has evolved into a rapidly growing company with a strong presence in Kolkata and its corporate headquarters in <strong className="text-dark font-bold">Gurugram, Haryana</strong>.
              </p>

              <div className="grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
                {[
                  { target: 1000, suffix: '+', label: 'Trips Completed' },
                  { target: 50,   suffix: '+', label: 'Destinations' },
                  { target: 2022, suffix: '',  label: 'Est. Year' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-4xl md:text-5xl font-serif font-bold text-dark mb-2 tracking-tight">
                      <Counter target={s.target} suffix={s.suffix} />
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.33,1,0.68,1] }}
              className="lg:col-span-6 relative"
            >
              <div className="absolute inset-0 bg-brand/10 rounded-[4rem] transform rotate-3 scale-105 origin-bottom-right pointer-events-none" />
              <div className="absolute inset-0 bg-dark/5 rounded-[4rem] transform -rotate-3 scale-105 origin-bottom-left pointer-events-none" />
              <div className="relative rounded-[2rem] md:rounded-[3rem] shadow-float overflow-hidden h-[340px] sm:h-[480px] lg:h-[620px] w-full">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600"
                  alt="EMV Team"
                  className="w-full h-full object-cover img-zoom"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm"
              >
                <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-5 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-brand" /> {item.label}
                </span>
                <p className="text-dark text-lg md:text-xl font-light leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bootstrapped milestone banner */}
      <section className="bg-dark py-14 md:py-20">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> Bootstrapped &amp; Proud <span className="w-8 h-[2px] bg-brand" />
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 tracking-tight">
              Built on trust. Grown by excellence.
            </h2>
            <p className="text-gray-400 font-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              As a proudly bootstrapped company, we have built our business without external funding — relying instead on our commitment to service excellence, operational efficiency, and the trust of our customers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our pillars */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 md:mb-16"
          >
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> The Philosophy
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-dark tracking-tight">
              How we do things differently.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-dark text-white rounded-2xl flex items-center justify-center text-lg mb-5 shadow-sm">{p.icon}</div>
                <h3 className="text-xl font-serif font-bold text-dark mb-3">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI & Innovation */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-brand" /> Innovation & AI
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-dark mb-7 tracking-tight leading-tight">
                Redefining travel with artificial intelligence.
              </h2>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed font-light mb-5">
                As the travel industry evolves, Ease My Vacations is actively embracing the power of AI to redefine how travelers plan and experience their journeys.
              </p>
              <p className="text-gray-500 text-base md:text-lg leading-relaxed font-light">
                We are investing in AI-driven solutions that help customers discover personalized itineraries, receive intelligent travel recommendations, compare options efficiently, and access faster customer support.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { icon: '🤖', title: 'AI-Powered Itineraries', desc: 'Personalized trip plans generated using intelligent travel data.' },
                { icon: '⚡', title: 'Smarter Recommendations', desc: 'Curated options based on your preferences and travel history.' },
                { icon: '💬', title: 'Instant Support', desc: 'AI-assisted customer support available around the clock.' },
              ].map((item, i) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-5 items-start">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-dark mb-1">{item.title}</p>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* The road ahead */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-dark text-white rounded-[2.5rem] md:rounded-[3.5rem] p-10 sm:p-14 md:p-20 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16"
          >
            <div className="flex-1">
              <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-brand" /> The Road Ahead
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 tracking-tight leading-tight">
                Our ambitions extend far beyond borders.
              </h2>
              <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed max-w-xl">
                While our journey began in Siliguri and expanded through Kolkata to Gurugram, we are committed to expanding our global footprint, enhancing our technology capabilities, and continuing to deliver world-class travel experiences worldwide.
              </p>
            </div>
            <div className="shrink-0 bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 text-center w-full md:w-64">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Our tagline</p>
              <p className="text-white font-serif font-bold text-xl md:text-2xl leading-snug italic">
                "Making Travel Easier, Smarter, and More Memorable Since 2022."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
