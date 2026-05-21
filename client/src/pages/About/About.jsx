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

export default function About() {
  return (
    <section className="bg-white relative overflow-hidden pt-[85px] md:pt-[100px] min-h-screen">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 -z-10 rounded-bl-[80px] md:rounded-bl-[150px]" />
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.33,1,0.68,1] }}
            className="lg:col-span-6"
          >
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-brand" /> Our Ethos
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-serif font-bold text-dark mb-7 leading-[1.05] tracking-tight">
              Redefining the way you see the world.
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-6 leading-relaxed font-light">
              EaseMyVacations Global was born from a simple realization: the modern traveler is overwhelmed by choices, hidden fees, and generic algorithms.
            </p>
            <p className="text-base md:text-lg text-gray-500 mb-10 leading-relaxed font-light">
              We are a collective of passionate travelers, logistics experts, and local insiders. When you book with EMV, you aren't just getting an itinerary; you're getting a dedicated concierge.
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-8">
              <div>
                <div className="text-5xl md:text-6xl font-serif font-bold text-dark mb-2 tracking-tight">
                  <Counter target={10} suffix="k+" />
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Travelers Served</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-serif font-bold text-dark mb-2 tracking-tight">
                  <Counter target={50} suffix="+" />
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Destinations Mastered</div>
              </div>
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
            <div className="relative rounded-[2rem] md:rounded-[3rem] shadow-float overflow-hidden h-[340px] sm:h-[480px] lg:h-[680px] w-full">
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
  )
}
