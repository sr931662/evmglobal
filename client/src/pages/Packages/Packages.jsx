import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import PackageCard from '../../components/packages/PackageCard/PackageCard'
import { api } from '../../services/api'
import { formatPrice } from '../../utils/currency'
import styles from './Packages.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

const CATEGORIES = ['All', 'Honeymoon', 'Family', 'Domestic', 'Luxury', 'Wellness']

const INDIAN_LOCATIONS = new Set([
  // States & UTs
  'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh','goa','gujarat',
  'haryana','himachal pradesh','jharkhand','karnataka','kerala','madhya pradesh',
  'maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab',
  'rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh',
  'uttarakhand','west bengal','andaman and nicobar','andaman','nicobar','chandigarh',
  'dadra and nagar haveli','daman and diu','delhi','new delhi','jammu and kashmir',
  'jammu','kashmir','ladakh','lakshadweep','puducherry','pondicherry',
  // Popular cities & tourist spots
  'agra','ajmer','alleppey','allepy','amritsar','aurangabad','banaras','bangalore',
  'bengaluru','bhopal','bhubaneswar','bodh gaya','chennai','cherrapunji','chikmagalur',
  'coorg','coimbatore','darjeeling','dehradun','dooars','dwarka','gulmarg','hampi',
  'haridwar','hyderabad','jaipur','jaisalmer','jodhpur','kannur','kanyakumari',
  'kochi','kodaikanal','kolkata','kovalam','kufri','kullu','manali','leh','lonavala',
  'mahabalipuram','mahabaleshwar','matheran','mount abu','munnar','mussoorie',
  'mysore','mysuru','nagpur','nainital','northeast india','north east india','ooty',
  'pachmarhi','pahalgam','panaji','puri','pushkar','ranthambore','rishikesh','shimla',
  'spiti','spiti valley','srinagar','thekkady','tirupati','udaipur','varanasi',
  'varkala','vishakhapatnam','visakhapatnam','vrindavan','wayanad','kutch',
  'india','north india','south india',
])

function isDomestic(pkg) {
  if (pkg.category === 'Domestic') return true
  const dests = Array.isArray(pkg.destinations) ? pkg.destinations : []
  return dests.some(d => INDIAN_LOCATIONS.has((d || '').toLowerCase().trim()))
}
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

const SORT_OPTIONS = [
  { value: 'default',      label: 'Default'               },
  { value: 'price-asc',    label: 'Price: Low → High'     },
  { value: 'price-desc',   label: 'Price: High → Low'     },
  { value: 'duration-asc', label: 'Duration: Shortest'    },
  { value: 'duration-desc',label: 'Duration: Longest'     },
  { value: 'popular',      label: 'Most Popular'          },
]

const NIGHT_FILTERS = [
  { value: 'all',   label: 'Any Duration'  },
  { value: '1-3',   label: '1–3 Nights'   },
  { value: '4-6',   label: '4–6 Nights'   },
  { value: '7-10',  label: '7–10 Nights'  },
  { value: '11+',   label: '11+ Nights'   },
]

const BUDGET_FILTERS = [
  { value: 'all',         label: 'Any Budget'    },
  { value: '0-50000',     label: 'Under ₹50k'   },
  { value: '50000-100000',label: '₹50k–₹1L'     },
  { value: '100000-200000',label: '₹1L–₹2L'     },
  { value: '200000-500000',label: '₹2L–₹5L'     },
  { value: '500000+',     label: '₹5L+'         },
]

function adaptPackage(pkg) {
  const domestic = isDomestic(pkg)
  return {
    id:            pkg.id || pkg._id,
    slug:          pkg.slug || pkg.id || pkg._id,
    title:         pkg.title,
    nights:        pkg.nights,
    badge:         pkg.category,
    badgeVariant:  pkg.category === 'Domestic' ? 'dark' : 'brand',
    geoTag:        domestic ? 'Domestic' : 'International',
    image:         pkg.image || FALLBACK_IMAGE,
    location:      Array.isArray(pkg.destinations) && pkg.destinations.length
                     ? pkg.destinations.join(', ')
                     : pkg.category,
    pricePerAdult: formatPrice(pkg.priceValue, pkg.price) || '—',
    priceLabel:    'Per Adult',
    description:   pkg.description || '',
    amenities:     Array.isArray(pkg.highlights) && pkg.highlights.length
                     ? pkg.highlights.slice(0, 3).map(h => ({ label: h }))
                     : [{ label: 'Accommodation' }, { label: 'Transfers' }, { label: 'Sightseeing' }],
    _raw: pkg,
  }
}

const PAGE_META = {
  Honeymoon: {
    title: 'Honeymoon Packages | Romantic Holiday Tours by Ease My Vacations',
    desc:  'Plan your dream honeymoon with customized romantic holiday packages to Maldives, Bali, Kashmir, Andaman, Kerala, Thailand, and other top honeymoon destinations.',
    image: 'https://images.unsplash.com/photo-1531195a37764-dc8aaf3c3d48?auto=format&fit=crop&q=80&w=2800',
  },
  Domestic: {
    title: 'Domestic Tour Packages India | Affordable Holidays by Ease My Vacations',
    desc:  'Discover the best domestic tour packages across Kashmir, Goa, Kerala, Andaman, Sikkim, Northeast India, Rajasthan, Ladakh, and more with Ease My Vacations.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2800',
  },
  All: {
    title: 'International Holiday Packages | Best Overseas Tours by EMV',
    desc:  'Explore international holiday packages to Bali, Dubai, Thailand, Maldives, Europe, Vietnam, Singapore, and more. Book affordable overseas vacations with Ease My Vacations.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800',
  },
}

function nightsMatch(nights, filter) {
  if (filter === 'all' || !filter) return true
  const n = Number(nights) || 0
  if (filter === '1-3')  return n >= 1  && n <= 3
  if (filter === '4-6')  return n >= 4  && n <= 6
  if (filter === '7-10') return n >= 7  && n <= 10
  if (filter === '11+')  return n >= 11
  return true
}

function budgetMatch(priceValue, filter) {
  if (filter === 'all' || !filter) return true
  const p = Number(priceValue) || 0
  if (filter === '0-50000')      return p > 0    && p <= 50000
  if (filter === '50000-100000') return p > 50000 && p <= 100000
  if (filter === '100000-200000')return p > 100000&& p <= 200000
  if (filter === '200000-500000')return p > 200000&& p <= 500000
  if (filter === '500000+')      return p > 500000
  return true
}

function sortPackages(pkgs, sortBy) {
  const arr = [...pkgs]
  if (sortBy === 'price-asc')     return arr.sort((a,b) => (a._raw.priceValue||0) - (b._raw.priceValue||0))
  if (sortBy === 'price-desc')    return arr.sort((a,b) => (b._raw.priceValue||0) - (a._raw.priceValue||0))
  if (sortBy === 'duration-asc')  return arr.sort((a,b) => (a._raw.nights||0) - (b._raw.nights||0))
  if (sortBy === 'duration-desc') return arr.sort((a,b) => (b._raw.nights||0) - (a._raw.nights||0))
  if (sortBy === 'popular')       return arr.sort((a,b) => (b._raw.bookings||0) - (a._raw.bookings||0))
  return arr
}

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationFilter = searchParams.get('destination') || ''

  const [active,        setActive]        = useState('All')
  const [allPackages,   setAllPackages]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [sortBy,        setSortBy]        = useState('default')
  const [nightFilter,   setNightFilter]   = useState('all')
  const [budgetFilter,  setBudgetFilter]  = useState('all')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [showFilters,   setShowFilters]   = useState(false)

  const meta = PAGE_META[active] || PAGE_META.All
  usePageMeta(meta.title, meta.desc, {
    image: meta.image,
    url: typeof window !== 'undefined' ? `${window.location.origin}/packages` : '',
    type: 'website'
  })

  const handleCategoryChange = (cat) => {
    setActive(cat)
    if (destinationFilter) setSearchParams({})
    resetFilters()
  }

  const resetFilters = () => {
    setSortBy('default')
    setNightFilter('all')
    setBudgetFilter('all')
    setSearchQuery('')
  }

  useEffect(() => {
    setLoading(true); setError('')
    const params = { status: 'Active', limit: 200 }
    if (destinationFilter)    { params.destination = destinationFilter }
    else if (active !== 'All') { params.category = active }
    api.getPackages(params)
      .then(data => setAllPackages(Array.isArray(data) ? data : data.packages || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [active, destinationFilter])

  const packages = useMemo(() => {
    let filtered = allPackages.map(adaptPackage)

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p._raw.category || '').toLowerCase().includes(q) ||
        (p._raw.description || '').toLowerCase().includes(q)
      )
    }

    // Nights filter
    filtered = filtered.filter(p => nightsMatch(p._raw.nights, nightFilter))

    // Budget filter
    filtered = filtered.filter(p => budgetMatch(p._raw.priceValue, budgetFilter))

    // Sort
    return sortPackages(filtered, sortBy)
  }, [allPackages, sortBy, nightFilter, budgetFilter, searchQuery])

  const activeFilterCount = [
    sortBy !== 'default'  ? 1 : 0,
    nightFilter !== 'all' ? 1 : 0,
    budgetFilter !== 'all'? 1 : 0,
    searchQuery.trim()    ? 1 : 0,
  ].reduce((a,b) => a + b, 0)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className={styles.eyebrow}>Collection</span>
            <h1 className={styles.h1}>Curated Holidays</h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className={styles.filters}>
            {destinationFilter ? (
              <span className={styles.destFilter}>
                📍 {destinationFilter}
                <button onClick={() => setSearchParams({})} className={styles.clearDestBtn}>✕</button>
              </span>
            ) : (
              CATEGORIES.map(f => (
                <button
                  key={f}
                  onClick={() => handleCategoryChange(f)}
                  className={`${styles.filterBtn} ${active === f ? styles.filterActive : styles.filterInactive}`}
                >
                  {f}
                </button>
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Filter & Sort toolbar */}
      <div className={styles.toolbarWrap}>
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search packages…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.clearSearch}>✕</button>
            )}
          </div>

          {/* Sort */}
          <div className={styles.sortWrap}>
            <label className={styles.sortLabel}>Sort</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.sortSelect}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
          >
            ⚙ Filters
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>

          {/* Results count */}
          <span className={styles.resultsCount}>
            {loading ? '…' : `${packages.length} result${packages.length !== 1 ? 's' : ''}`}
          </span>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className={styles.clearAll}>Clear all</button>
          )}
        </div>

        {/* Expanded filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0     }}
              transition={{ duration: 0.25 }}
              className={styles.filterPanel}
            >
              <div className={styles.filterPanelInner}>
                {/* Duration */}
                <div className={styles.filterGroup}>
                  <p className={styles.filterGroupLabel}>Duration</p>
                  <div className={styles.filterChips}>
                    {NIGHT_FILTERS.map(n => (
                      <button
                        key={n.value}
                        onClick={() => setNightFilter(n.value)}
                        className={`${styles.chip} ${nightFilter === n.value ? styles.chipActive : ''}`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className={styles.filterGroup}>
                  <p className={styles.filterGroupLabel}>Budget (per person)</p>
                  <div className={styles.filterChips}>
                    {BUDGET_FILTERS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => setBudgetFilter(b.value)}
                        className={`${styles.chip} ${budgetFilter === b.value ? styles.chipActive : ''}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.gridWrap}>
        {loading ? (
          <div className={styles.spinner}><div className={styles.spinnerCircle} /></div>
        ) : error ? (
          <div className={styles.errMsg}>{error}</div>
        ) : packages.length === 0 ? (
          <div className={styles.emptyMsg}>
            <p className={styles.emptyIcon}>🔍</p>
            {destinationFilter
              ? `No packages found for "${destinationFilter}".`
              : activeFilterCount > 0
                ? 'No packages match your filters. Try adjusting them.'
                : 'No packages found in this category yet.'
            }
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className={styles.clearAllEmpty}>Clear Filters</button>
            )}
          </div>
        ) : (
          <motion.div
            className={styles.grid}
            layout
          >
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
