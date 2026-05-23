import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'

const REGIONS = ['Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas']

const regionColors = {
  Europe:        'bg-blue-50 text-blue-700 border-blue-100',
  Asia:          'bg-green-50 text-green-700 border-green-100',
  'Middle East': 'bg-orange-50 text-orange-700 border-orange-100',
  Africa:        'bg-yellow-50 text-yellow-700 border-yellow-100',
  Oceania:       'bg-teal-50 text-teal-700 border-teal-100',
  Americas:      'bg-purple-50 text-purple-700 border-purple-100',
}

const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=400'

const empty = { name: '', country: '', region: 'Europe', image: '' }

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [editId,       setEditId]       = useState(null)
  const [form,         setForm]         = useState(empty)
  const [saving,       setSaving]       = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getDestinations()
      setDestinations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = destinations.filter(d =>
    !search.trim() ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.country?.toLowerCase().includes(search.toLowerCase()) ||
    d.region?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditId(null)
    setForm(empty)
    setShowModal(true)
  }

  const openEdit = (dest) => {
    setEditId(dest.id || dest._id)
    setForm({
      name:    dest.name    || '',
      country: dest.country || '',
      region:  dest.region  || 'Europe',
      image:   dest.image   || '',
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditId(null); setForm(empty) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) return
    setSaving(true)
    try {
      if (editId) {
        const updated = await api.updateDestination(editId, form)
        setDestinations(prev => prev.map(d => (d.id || d._id) === editId ? { ...d, ...updated } : d))
      } else {
        const created = await api.createDestination(form)
        setDestinations(prev => [created, ...prev])
      }
      closeModal()
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dest) => {
    if (!confirm(`Delete "${dest.name}"? This cannot be undone.`)) return
    const id = dest.id || dest._id
    setDeletingId(id)
    try {
      await api.deleteDestination(id)
      setDestinations(prev => prev.filter(d => (d.id || d._id) !== id))
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const regionCounts = destinations.reduce((acc, d) => {
    acc[d.region] = (acc[d.region] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Destinations</h2>
          <p className="text-gray-400 mt-1 font-medium">{destinations.length} destination{destinations.length !== 1 ? 's' : ''} across {Object.keys(regionCounts).length} region{Object.keys(regionCounts).length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-brand-hover transition-colors shadow-glow"
        >
          + Add Destination
        </button>
      </div>

      {/* Region summary pills */}
      {Object.keys(regionCounts).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(regionCounts).map(([region, count]) => (
            <span key={region} className={`px-4 py-2 rounded-full text-xs font-black border uppercase tracking-[0.15em] ${regionColors[region] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
              {region} · {count}
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search destinations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand transition-colors font-bold text-dark shadow-sm"
        />
      </div>

      {/* Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-500 font-bold px-6 py-4 rounded-2xl">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-16 text-center text-gray-400 font-bold">
          {search ? 'No destinations match your search.' : 'No destinations yet. Add one to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((dest, i) => {
            const id = dest.id || dest._id
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={dest.image || FALLBACK}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = FALLBACK }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-[0.15em] ${regionColors[dest.region] || 'bg-white/90 text-gray-600 border-gray-100'}`}>
                    {dest.region}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="font-serif font-bold text-dark text-lg leading-tight">{dest.name}</p>
                  <p className="text-gray-400 text-sm font-bold mt-0.5">{dest.country}</p>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(dest)}
                      className="flex-1 text-[11px] font-black uppercase tracking-[0.15em] py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dest)}
                      disabled={deletingId === id}
                      className="flex-1 text-[11px] font-black uppercase tracking-[0.15em] py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-premium border border-gray-100"
          >
            <h3 className="text-3xl font-serif font-bold text-dark mb-8">{editId ? 'Edit Destination' : 'New Destination'}</h3>

            {/* Image preview */}
            {form.image && (
              <div className="mb-6 h-36 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}

            <div className="space-y-5">
              {[
                { label: 'Destination Name', key: 'name',    placeholder: 'e.g. Santorini' },
                { label: 'Country',          key: 'country', placeholder: 'e.g. Greece' },
                { label: 'Image URL',        key: 'image',   placeholder: 'https://images.unsplash.com/...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => f(field.key, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Region</label>
                <select
                  value={form.region}
                  onChange={e => f('region', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.country.trim()}
                className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : (editId ? 'Update' : 'Add Destination')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
