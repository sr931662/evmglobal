import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'

const EMPTY = { name: '', phone: '', email: '', destination: '', travelDate: '', travellers: '', message: '' }

export default function Contact() {
  const location = useLocation()
  const [form,    setForm]    = useState(EMPTY)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pkg = params.get('package')
    if (pkg) setForm(p => ({ ...p, message: `Interested in: ${pkg}` }))
  }, [location.search])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.submitLead({ ...form, type: 'inquiry' })
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen pt-[85px] md:pt-[100px]">

      {/* Hero strip */}
      <section className="bg-dark text-white py-14 md:py-20">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-5 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-brand" /> Free Consultation
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-serif font-bold leading-[1.05] tracking-tight mb-4">
              Plan your dream trip.<br />We'll handle the rest.
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-light max-w-xl leading-relaxed">
              Share your travel vision and our expert concierge team will craft a completely personalised itinerary — no booking fees, no obligation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* Left — contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-serif font-bold text-dark mb-8">Get in touch</h2>

            <div className="space-y-5 mb-10">
              {[
                { icon: '✈', label: 'Personalised itinerary', desc: 'Custom plan crafted within 24 hours' },
                { icon: '💰', label: 'Best price guarantee', desc: 'No hidden charges, full transparency' },
                { icon: '🎧', label: 'Dedicated concierge', desc: '24/7 support from inquiry to return' },
                { icon: '🗺', label: 'All destinations', desc: 'India, international & group tours' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-lg shadow-sm border border-gray-100 shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-bold text-dark text-sm">{item.label}</p>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-3xl p-7 border border-gray-100 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Direct Contact</h3>
              <div className="space-y-3">
                <p className="text-dark font-bold text-sm break-all">concierge@emvglobal.in</p>
                <p className="text-dark font-bold text-sm">Gurugram, Haryana</p>
              </div>
              <button
                onClick={() => openWhatsApp('I have a travel inquiry')}
                className="w-full mt-2 bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-brand transition-colors flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-whatsapp">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Chat on WhatsApp
              </button>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
                  <h3 className="text-2xl font-serif font-bold text-dark mb-3">Inquiry Received!</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                    Thank you! Our concierge team will contact you within 24 hours to start planning your perfect journey.
                  </p>
                  <button onClick={() => setSuccess(false)} className="mt-8 text-brand font-bold text-sm hover:underline">
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif font-bold text-dark mb-1">Send an Inquiry</h3>
                    <p className="text-gray-400 text-sm font-medium">We'll respond within 24 hours.</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-bold px-4 py-3 rounded-2xl">
                      {error}
                    </div>
                  )}

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your full name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Phone *</label>
                      <input type="tel" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email Address</label>
                    <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="your@email.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                  </div>

                  {/* Destination + Travel Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Destination</label>
                      <input type="text" value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="e.g. Kashmir, Bali, Europe"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Approximate Travel Date</label>
                      <input type="text" value={form.travelDate} onChange={e => f('travelDate', e.target.value)} placeholder="e.g. July 2025"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                    </div>
                  </div>

                  {/* Travellers */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Number of Travellers</label>
                    <input type="text" value={form.travellers} onChange={e => f('travellers', e.target.value)} placeholder="e.g. 2 adults, 1 child"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Special Requests / Notes</label>
                    <textarea value={form.message} onChange={e => f('message', e.target.value)}
                      placeholder="Any specific hotels, activities, dietary needs, budget range…"
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-brand text-white py-4 rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send My Inquiry →'}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 font-medium">
                    No spam, ever. Your details stay private.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
