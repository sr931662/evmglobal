import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'

const EMPTY = { name: '', phone: '', email: '', message: '' }

export default function InquirySection() {
  const [form,      setForm]      = useState(EMPTY)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.submitLead({ ...form, type: 'lead' })
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 md:py-28 bg-[#f7f8fa]">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-5 block">Free Consultation</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark leading-[1.1] tracking-tight mb-6">
              Plan your<br />dream trip.
            </h2>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 font-light">
              Share your travel dream with us and our expert concierge team will craft a completely personalised itinerary — no booking fees, no obligation.
            </p>
            <div className="space-y-4">
              {[
                { icon: '✈', text: 'Personalised itinerary within 24 hours' },
                { icon: '💰', text: 'Best price guarantee — no hidden charges' },
                { icon: '🎧', text: 'Dedicated concierge support throughout' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-gray-100 shrink-0">{item.icon}</span>
                  <p className="font-bold text-gray-700 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✅</div>
                  <h3 className="text-2xl font-serif font-bold text-dark mb-3">Inquiry Received!</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    Thank you for reaching out. Our concierge team will contact you within 24 hours to plan your perfect journey.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-8 text-brand font-bold text-sm hover:underline"
                  >
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-dark mb-1">Get in Touch</h3>
                    <p className="text-gray-400 text-sm font-medium">We'll respond within 24 hours.</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-bold px-4 py-3 rounded-2xl">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => f('name', e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => f('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => f('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Tell Us About Your Trip</label>
                    <textarea
                      value={form.message}
                      onChange={e => f('message', e.target.value)}
                      placeholder="Destination, travel dates, number of travellers, special requests…"
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand text-white py-4 rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send My Inquiry'}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 font-medium">
                    No spam, ever. Your details stay private.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
