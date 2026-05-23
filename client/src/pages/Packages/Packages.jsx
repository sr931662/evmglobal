import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import PackageCard from '../../components/packages/PackageCard/PackageCard'
import { api } from '../../services/api'
import styles from './Packages.module.css'

const FILTERS = ['All', 'Honeymoon', 'Family', 'Domestic', 'Luxury', 'Wellness']

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

function adaptPackage(pkg) {
  return {
    id:           pkg.id || pkg._id,
    title:        pkg.title,
    nights:       pkg.nights,
    badge:        pkg.category,
    badgeVariant: pkg.category === 'Domestic' ? 'dark' : 'brand',
    image:        pkg.image || FALLBACK_IMAGE,
    location:     Array.isArray(pkg.destinations) && pkg.destinations.length
                    ? pkg.destinations.join(', ')
                    : pkg.category,
    pricePerAdult: pkg.price,
    priceLabel:   'Per Adult',
    description:  pkg.description || '',
    amenities:    Array.isArray(pkg.highlights) && pkg.highlights.length
                    ? pkg.highlights.slice(0, 3).map(h => ({ label: h }))
                    : [{ label: 'Accommodation' }, { label: 'Transfers' }, { label: 'Sightseeing' }],
  }
}

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationFilter = searchParams.get('destination') || ''

  const [active,   setActive]   = useState('All')
  const [packages, setPackages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const handleCategoryChange = (cat) => {
    setActive(cat)
    // clear destination filter when user manually picks a category tab
    if (destinationFilter) setSearchParams({})
  }

  const clearDestination = () => setSearchParams({})

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = { status: 'Active' }
    if (destinationFilter) {
      params.destination = destinationFilter
    } else if (active !== 'All') {
      params.category = active
    }
    api.getPackages(params)
      .then(data => setPackages(Array.isArray(data) ? data : data.packages || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [active, destinationFilter])

  return (
    <div className="bg-gray-50 pt-[85px] md:pt-[100px] min-h-screen">
      <div className="bg-white border-b border-gray-200/60 pb-8 pt-8 shadow-sm">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-3 block">Collection</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark tracking-tight">Curated Journeys</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="flex flex-wrap gap-2">
            {destinationFilter ? (
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-brand text-white shadow-sm">
                📍 {destinationFilter}
                <button onClick={clearDestination} className="ml-1 hover:opacity-70 transition-opacity text-base leading-none">✕</button>
              </span>
            ) : (
              FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => handleCategoryChange(f)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${active === f ? 'bg-dark text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-8 md:py-14">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold">{error}</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">
            {destinationFilter ? `No packages found for "${destinationFilter}".` : 'No packages found in this category yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {packages.map((pkg, i) => <PackageCard key={pkg.id || pkg._id} pkg={adaptPackage(pkg)} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
