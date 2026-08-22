import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
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

const SCORE_FIELDS = [
  { key: 'beach',     label: 'Beach' },
  { key: 'family',    label: 'Family' },
  { key: 'honeymoon', label: 'Honeymoon' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'culture',   label: 'Culture' },
  { key: 'nightlife', label: 'Nightlife' },
]

const COLLECTION_OPTIONS = [
  'Honeymoon Escapes', 'Family Adventures', 'Beach Holidays',
  'Mountain Escapes', 'Luxury Getaways', 'City Breaks',
]

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const emptyScores = () =>
  SCORE_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: 0 }), {})

const empty = {
  name: '', country: '', region: 'Europe', image: '',
  blurb: '', highlights: '',
  visaInfo: '', currency: '', bestTime: '',
  scores: emptyScores(), budgetLevel: 0, bestMonths: [], collections: [],
}

// `highlights` is stored as an array but edited as one-per-line text.
const linesToArray = (text) => text.split('\n').map(s => s.trim()).filter(Boolean)
const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '')

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
  const [uploading,    setUploading]    = useState(false)
  const [uploadErr,    setUploadErr]    = useState('')
  const fileRef = useRef(null)

  // The form is long (scores, months, collections…) — lock the page behind
  // it while it's open, same as every other admin modal.
  useScrollLock(showModal)

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
    setUploadErr('')
    setShowModal(true)
  }

  const openEdit = (dest) => {
    setEditId(dest.id || dest._id)
    setForm({
      name:       dest.name    || '',
      country:    dest.country || '',
      region:     dest.region  || 'Europe',
      image:      dest.image   || '',
      blurb:      dest.blurb   || '',
      highlights: arrayToLines(dest.highlights),
      visaInfo:   dest.visaInfo || '',
      currency:   dest.currency || '',
      bestTime:   dest.bestTime || '',
      scores:      { ...emptyScores(), ...(dest.scores || {}) },
      budgetLevel: Number(dest.budgetLevel) || 0,
      bestMonths:  Array.isArray(dest.bestMonths) ? dest.bestMonths.map(Number) : [],
      collections: Array.isArray(dest.collections) ? dest.collections : [],
    })
    setUploadErr('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditId(null); setForm(empty); setUploadErr('') }

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) return
    setSaving(true)
    const payload = { ...form, highlights: linesToArray(form.highlights) }
    try {
      if (editId) {
        const updated = await api.updateDestination(editId, payload)
        setDestinations(prev => prev.map(d => (d.id || d._id) === editId ? { ...d, ...updated } : d))
      } else {
        const created = await api.createDestination(payload)
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

  // Pick from disk instead of hunting for a URL. The upload goes to the same
  // image host the rest of the site already uses.
  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Please choose an image file.'); return }
    setUploading(true); setUploadErr('')
    try {
      const result = await api.uploadImage(file)
      f('image', result.url)
    } catch (err) {
      setUploadErr(err.message)
    } finally {
      setUploading(false)
    }
  }

  const setScore = (key, value) =>
    setForm(p => ({ ...p, scores: { ...p.scores, [key]: value } }))

  const toggleInList = (key, value) =>
    setForm(p => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter(v => v !== value) : [...p[key], value],
    }))

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
            className={`${c.modal} ${c.modalLg} ${c.modalScroll}`}
          >
            {/* This inner div is the actual scroll container — a rounded
                card's own scrollbar doesn't clip to its border-radius
                reliably, which is what let it visibly poke past the corner. */}
            <div className={`${c.modalScrollBody} modal-scroll`} onWheel={e => e.stopPropagation()}>
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
                <label className={c.label}>Destination Image</label>

                {/* Upload from disk, or paste a URL — both end up in the same field. */}
                <div
                  className={styles.dropZone}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className={styles.fileInput}
                    onChange={e => { handleFile(e.target.files?.[0]); e.target.value = '' }}
                  />
                  {uploading
                    ? <span className={styles.dropText}>Uploading…</span>
                    : <span className={styles.dropText}>
                        <strong>Choose an image</strong> or drop one here · PNG, JPG, GIF or WebP, up to 5&nbsp;MB
                      </span>}
                </div>

                <input
                  type="text"
                  placeholder="…or paste an image URL"
                  value={form.image}
                  onChange={e => f('image', e.target.value)}
                  className={`${c.input} ${styles.urlInput}`}
                />

                {uploadErr && <p className={c.formError}>{uploadErr}</p>}
              </div>

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

              {/* Shown on package pages that visit this destination */}
              <div>
                <label className={c.label}>Short blurb</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Limestone cliffs, longtail boats and some of Thailand's best beaches."
                  value={form.blurb}
                  onChange={e => f('blurb', e.target.value)}
                  className={c.input}
                />
              </div>

              <div>
                <label className={c.label}>Highlights &mdash; one per line</label>
                <textarea
                  rows={4}
                  placeholder={'Island experiences\nLimestone cliffs\nBeaches & sunsets'}
                  value={form.highlights}
                  onChange={e => f('highlights', e.target.value)}
                  className={c.input}
                />
              </div>

              {[
                { label: 'Visa guidance',   key: 'visaInfo', placeholder: 'e.g. Visa on arrival for Indian passport holders; 15-day stay.' },
                { label: 'Currency',        key: 'currency', placeholder: 'e.g. Thai Baht (THB)' },
                { label: 'Best time to travel', key: 'bestTime', placeholder: 'e.g. November to April for dry, sunny weather.' },
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

              {/* Powers "Help Me Choose". A destination with every score at 0
                  is never recommended, so leave these blank rather than guess. */}
              <div>
                <label className={c.label}>How well does this suit each trip type?</label>
                <p className={styles.fieldHint}>
                  0 = not suitable, 5 = one of the best in the world for it. Only scored
                  destinations appear in the recommender.
                </p>
                <div className={styles.scoreGrid}>
                  {SCORE_FIELDS.map(field => (
                    <div key={field.key} className={styles.scoreField}>
                      <span className={styles.scoreName}>{field.label}</span>
                      <div className={styles.scoreBtns}>
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setScore(field.key, n)}
                            className={`${styles.scoreBtn} ${Number(form.scores[field.key]) === n ? styles.scoreBtnOn : ''}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={c.label}>Relative cost</label>
                <div className={styles.scoreBtns}>
                  {[
                    { level: 0, label: 'Not set' },
                    { level: 1, label: '₹ Under ₹1L' },
                    { level: 2, label: '₹₹ ₹1L–₹2L' },
                    { level: 3, label: '₹₹₹ ₹2L+' },
                  ].map(band => (
                    <button
                      key={band.level}
                      type="button"
                      onClick={() => f('budgetLevel', band.level)}
                      className={`${styles.bandBtn} ${Number(form.budgetLevel) === band.level ? styles.scoreBtnOn : ''}`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={c.label}>Best months to visit</label>
                <p className={styles.fieldHint}>Drives the &ldquo;Travel by Month&rdquo; browser.</p>
                <div className={styles.monthGrid}>
                  {MONTH_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleInList('bestMonths', i + 1)}
                      className={`${styles.scoreBtn} ${form.bestMonths.includes(i + 1) ? styles.scoreBtnOn : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={c.label}>Holiday collections</label>
                <div className={styles.collectionRow}>
                  {COLLECTION_OPTIONS.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleInList('collections', name)}
                      className={`${styles.bandBtn} ${form.collections.includes(name) ? styles.scoreBtnOn : ''}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
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
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
