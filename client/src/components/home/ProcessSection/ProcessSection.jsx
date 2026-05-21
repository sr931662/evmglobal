import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from './ProcessSection.module.css'

const steps = [
  { num: '01', title: 'Connect', desc: 'Share your travel dreams with our dedicated concierge. A 15-minute consultation — phone or WhatsApp.' },
  { num: '02', title: 'Curate', desc: 'We design a bespoke itinerary with handpicked stays, experiences and logistics tailored to you.' },
  { num: '03', title: 'Depart', desc: 'Travel with confidence. Your concierge is available 24/7 throughout the journey.' },
]

export default function ProcessSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start center', 'center center'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={sectionRef} id="process-section" className="py-14 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-dark tracking-tight">The EMV Journey.</h2>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gray-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand origin-left rounded-full" style={{ scaleX }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.33, 1, 0.68, 1] }}
                className={`${styles.step} flex flex-col items-center text-center process-step`}
              >
                <div className={`${styles.circle} step-circle w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center text-xl md:text-2xl font-serif font-bold text-gray-400 mb-5 md:mb-7 relative z-10 shadow-glass transition-all duration-500`}>
                  {step.num}
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-dark mb-2 md:mb-3">{step.title}</h3>
                <p className="text-gray-500 font-light text-sm md:text-base max-w-xs leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
