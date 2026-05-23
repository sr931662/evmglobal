import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import styles from './DestinationsFeatured.module.css'

const FALLBACK_DESTINATIONS = [
  { id: 1, name: 'Maldives',     startingPrice: '₹85k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Switzerland',  startingPrice: '₹1.2L', region: 'Europe',      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Bali',         startingPrice: '₹45k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Dubai',        startingPrice: '₹65k',  region: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
]

export default function DestinationsFeatured() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(FALLBACK_DESTINATIONS)

  useEffect(() => {
    api.getDestinations()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        if (list.length > 0) {
          // Pick first 4 destinations, adapt to expected shape
          setFeatured(list.slice(0, 4).map(d => ({
            id:            d.id || d._id,
            name:          d.name,
            region:        d.region,
            image:         d.image,
            startingPrice: d.startingPrice || null,
          })))
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  return (
    <section className="py-14 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-8 md:mb-12"
        >
          <div>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> Popular Escapes
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-dark leading-[1.1] tracking-tight">
              Where will you<br />go next?
            </h2>
          </div>
          <button
            onClick={() => navigate('/destinations')}
            className="inline-flex items-center gap-3 text-dark font-bold hover:text-brand transition-colors text-sm uppercase tracking-[0.2em] group whitespace-nowrap shrink-0"
          >
            All Destinations
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {featured.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
              className="h-[280px] sm:h-[340px] md:h-[400px] relative rounded-xl sm:rounded-2xl md:rounded-[1.75rem] overflow-hidden group cursor-pointer shadow-glass bento-hover"
            >
              <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover img-zoom" />
              <div className="absolute inset-0 card-vignette opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 z-10">
                <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-white group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-rotate-45">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 flex flex-col justify-end z-10">
                <span className="text-brand text-[9px] font-black uppercase tracking-[0.25em] mb-1 drop-shadow-md">{dest.region}</span>
                <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 tracking-tight">{dest.name}</h3>
                {dest.startingPrice && <p className="text-white/80 font-bold text-xs md:text-sm">From {dest.startingPrice}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
