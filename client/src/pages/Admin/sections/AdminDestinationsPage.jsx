import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import c from './adminCommon.module.css'
import styles from './AdminDestinationsPage.module.css'

const REGIONS = ['Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas']

const regionColors = {
  Europe:        styles.regionBlue,
  Asia:          styles.regionGreen,
  'Middle East': styles.regionOrange,
  Africa:        styles.regionYellow,
  Oceania:       styles.regionTeal,
  Americas:      styles.regionPurple,
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
    <div className={c.page}>
      {/* Header */}
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Destinations</h2>
          <p className={c.subtitle}>{destinations.length} destination{destinations.length !== 1 ? 's' : ''} across {Object.keys(regionCounts).length} region{Object.keys(regionCounts).length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className={c.addBtn}>
          + Add Destination
        </button>
      </div>

      {/* Region summary pills */}
      {Object.keys(regionCounts).length > 0 && (
        <div className={c.pillRow}>
          {Object.entries(regionCounts).map(([region, count]) => (
            <span key={region} className={`${c.pill} ${regionColors[region] || styles.regionGray}`}>
              {region} · {count}
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className={c.searchWrapXs}>
        <span className={c.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search destinations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={c.searchSolo}
        />
      </div>

      {/* Grid */}
      {error ? (
        <div className={c.errorBox}>{error}</div>
      ) : loading ? (
        <div className={c.loadingSm}>
          <div className={c.spinner} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={c.emptyCard}>
          {search ? 'No destinations match your search.' : 'No destinations yet. Add one to get started.'}
        </div>
      ) : (
        <div className={c.cardGrid}>
          {filtered.map((dest, i) => {
            const id = dest.id || dest._id
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={styles.card}
              >
                {/* Image */}
                <div className={styles.imgWrap}>
                  <img
                    src={dest.image || FALLBACK}
                    alt={dest.name}
                    className={styles.img}
                    onError={e => { e.target.src = FALLBACK }}
                  />
                  <div className={styles.imgOverlay} />
                  <span className={`${styles.imgBadge} ${regionColors[dest.region] || styles.regionGray}`}>
                    {dest.region}
                  </span>
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <p className={styles.name}>{dest.name}</p>
                  <p className={styles.country}>{dest.country}</p>

                  <div className={styles.cardBtns}>
                    <button onClick={() => openEdit(dest)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dest)}
                      disabled={deletingId === id}
                      className={styles.delBtn}
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
        <div className={c.overlay} onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className={c.modal}
          >
            <h3 className={c.modalTitle}>{editId ? 'Edit Destination' : 'New Destination'}</h3>

            {/* Image preview */}
            {form.image && (
              <div className={styles.modalImgPreview}>
                <img src={form.image} alt="preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}

            <div className={c.stack}>
              {[
                { label: 'Destination Name', key: 'name',    placeholder: 'e.g. Santorini' },
                { label: 'Country',          key: 'country', placeholder: 'e.g. Greece' },
                { label: 'Image URL',        key: 'image',   placeholder: 'https://images.unsplash.com/...' },
              ].map(field => (
                <div key={field.key}>
                  <label className={c.label}>{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => f(field.key, e.target.value)}
                    className={c.input}
                  />
                </div>
              ))}

              <div>
                <label className={c.label}>Region</label>
                <select
                  value={form.region}
                  onChange={e => f('region', e.target.value)}
                  className={`${c.input} ${c.select}`}
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className={c.modalActions}>
              <button onClick={closeModal} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.country.trim()}
                className={`${c.btnBrand} ${c.flex1}`}
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
