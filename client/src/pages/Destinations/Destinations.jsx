import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DestinationCard from '../../components/destinations/DestinationCard/DestinationCard'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './Destinations.module.css'

const REGIONS = ['All Regions', 'Europe', 'Asia', 'Middle East', 'Africa', 'Oceania']

export default function Destinations() {
  const [activeRegion,  setActiveRegion]  = useState('All Regions')
  const [destinations,  setDestinations]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = activeRegion !== 'All Regions' ? { region: activeRegion } : {}
    api.getDestinations(params)
      .then(data => setDestinations(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeRegion])

  return (
    <div className="bg-gray-50 pt-[85px] md:pt-[100px] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60 pb-8 pt-8 relative z-10 shadow-sm">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-3 block">Portfolio</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark tracking-tight">Global Canvas</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.33,1,0.68,1] }} className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeRegion === r ? 'bg-dark text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {r}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-8 md:py-14">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold">{error}</div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">No destinations found in this region.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {destinations.map((dest, i) => <DestinationCard key={dest.id || dest._id} dest={dest} index={i} />)}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-12 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
          className="bg-dark rounded-2xl md:rounded-[2.5rem] p-8 sm:p-10 md:p-16 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-premium border border-gray-800"
        >
          <div className="max-w-xl">
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 block">Bespoke Requests</span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-4 tracking-tight">Can't find your destination?</h3>
            <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed">Our concierges design curations across 50+ countries globally.</p>
          </div>
          <button onClick={() => openWhatsApp('New Destination Inquiry')} className="bg-white text-dark px-7 py-4 rounded-full font-bold shadow-float flex items-center gap-3 whitespace-nowrap hover:bg-gray-100 transition-colors shrink-0 text-base">
            Connect Now
          </button>
        </motion.div>
      </div>
    </div>
  )
}
