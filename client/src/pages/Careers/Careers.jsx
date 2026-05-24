import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { openWhatsApp } from '../../utils/whatsapp'
import { api } from '../../services/api'

const values = [
  { icon: '✦', title: 'People First', desc: 'Our team is our greatest asset. We invest in growth, wellbeing, and creating an environment where everyone thrives.' },
  { icon: '◎', title: 'Ownership Mindset', desc: 'Every team member takes full ownership of their work — we move fast, iterate, and celebrate wins together.' },
  { icon: '◈', title: 'Passion for Travel', desc: 'We hire people who love travel as much as our clients do. Genuine passion translates into extraordinary service.' },
  { icon: '◇', title: 'Remote-Friendly', desc: 'Flexible work arrangements with regular team meetups — because great work can happen anywhere.' },
]

const departmentColors = {
  'Sales':            'bg-blue-50 text-blue-700',
  'Marketing':        'bg-pink-50 text-pink-700',
  'Customer Support': 'bg-green-50 text-green-700',
  'Technology':       'bg-purple-50 text-purple-700',
  'Operations':       'bg-orange-50 text-orange-700',
  'Management':       'bg-gray-100 text-gray-700',
}

const typeBadge = (type) => {
  const map = {
    'Full-time': 'bg-blue-50 text-blue-700',
    'Part-time': 'bg-purple-50 text-purple-700',
    'Remote':    'bg-green-50 text-green-700',
    'Hybrid':    'bg-orange-50 text-orange-700',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
}

export default function Careers() {
  const [openings, setOpenings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.getCareers({ status: 'open' })
      .then(data => setOpenings(Array.isArray(data) ? data : []))
      .catch(() => setOpenings([]))
      .finally(() => setLoading(false))
  }, [])

  const applyWhatsApp = (role) => {
    openWhatsApp(`Hi, I would like to apply for the ${role} position at EMV Global.`)
  }

  return (
    <div className="bg-white min-h-screen pt-[85px] md:pt-[100px]">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 -z-10 rounded-bl-[80px] md:rounded-bl-[150px]" />
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-24">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }} className="max-w-3xl">
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-brand" /> Join Our Team
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-serif font-bold text-dark mb-7 leading-[1.05] tracking-tight">
              Build the future<br />of travel with us.
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-10 leading-relaxed font-light max-w-xl">
              We are a fast-growing travel concierge company with a mission to make extraordinary journeys accessible. Join a team that is passionate, driven, and genuinely loves what they do.
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-bold text-dark">
              {[['🌍', loading ? 'Open Roles' : `${openings.length} Open Role${openings.length !== 1 ? 's' : ''}`], ['📍', 'Gurugram & Remote'], ['🏆', 'Great Place to Work']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2">{icon} {label}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark">Why EMV Global?</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
              className="bg-gray-50 rounded-3xl p-7 border border-gray-100"
            >
              <span className="text-brand text-xl font-black mb-4 block">{v.icon}</span>
              <h3 className="font-bold text-dark text-base mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mb-2">Open Positions</h2>
          {!loading && <p className="text-gray-400 font-medium text-sm">{openings.length} role{openings.length !== 1 ? 's' : ''} available</p>}
        </motion.div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : openings.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl px-8 py-14 text-center border border-gray-100">
            <p className="text-gray-400 font-bold text-sm">No open positions right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {openings.map((job, i) => (
              <motion.div key={job._id || job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.6 }}
                className="bg-white border border-gray-100 rounded-3xl p-7 md:p-8 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${departmentColors[job.department] || 'bg-gray-100 text-gray-600'}`}>
                        {job.department}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${typeBadge(job.type)}`}>{job.type}</span>
                      <span className="text-[10px] font-bold text-gray-400">📍 {job.location}</span>
                    </div>
                    <h3 className="font-serif font-bold text-dark text-xl mb-3 group-hover:text-brand transition-colors">{job.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-light mb-5">{job.description}</p>
                    {job.requirements?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">Requirements</p>
                        <ul className="space-y-1.5">
                          {job.requirements.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-2 text-sm text-gray-500 font-light">
                              <span className="text-brand mt-0.5 text-xs shrink-0">✓</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => applyWhatsApp(job.title)}
                      className="bg-dark text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-brand transition-colors shadow-sm flex items-center gap-2"
                    >
                      Apply via WhatsApp
                      <span className="text-base">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-dark text-white py-16 md:py-20">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Don't see your role?</h2>
            <p className="text-gray-400 mb-8 font-light max-w-md mx-auto">We are always looking for talented people. Send us your CV and tell us how you can contribute.</p>
            <button
              onClick={() => openWhatsApp('Hi, I would like to explore career opportunities at EMV Global.')}
              className="bg-white text-dark px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-float inline-flex items-center gap-3"
            >
              Get in Touch
            </button>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
