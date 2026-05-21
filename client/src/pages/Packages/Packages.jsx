import { useState } from 'react'
import { motion } from 'framer-motion'
import PackageCard from '../../components/packages/PackageCard/PackageCard'
import { packages } from '../../data/packages'
import styles from './Packages.module.css'

const filters = ['All', 'Honeymoon', 'Family', 'Domestic']

export default function Packages() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? packages : packages.filter(p => p.badge === active)

  return (
    <div className="bg-gray-50 pt-[85px] md:pt-[100px] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60 pb-8 pt-8 shadow-sm">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-3 block">Collection</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-dark tracking-tight">Curated Journeys</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${active === f ? 'bg-dark text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-8 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {filtered.map((pkg, i) => <PackageCard key={pkg.id} pkg={pkg} index={i} />)}
        </div>
      </div>
    </div>
  )
}
