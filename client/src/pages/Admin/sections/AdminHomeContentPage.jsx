import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import c from './adminCommon.module.css'
import styles from './AdminHomeContentPage.module.css'

/**
 * Field definitions per home-page section. `key` maps 1:1 to the
 * home-content schema, so forms serialise straight to the API.
 */
const TRUST_ICONS = ['shield', 'lock', 'check', 'users', 'award', 'headset']

const SECTIONS = [
  {
    id: 'trust',
    label: 'Trust & Assurance',
    hint: 'Badges shown under the hero — keep these short and factual.',
    empty: { icon: 'shield', title: '', subtitle: '' },
    required: ['title'],
    primary: (it) => it.title,
    secondary: (it) => it.subtitle,
    fields: [
      { key: 'icon',     label: 'Icon',     type: 'select', options: TRUST_ICONS },
      { key: 'title',    label: 'Title',    type: 'text', placeholder: 'e.g. IATA Accredited', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'e.g. Certified travel partner' },
    ],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    hint: '"Wide" spans two columns, "Tall" spans two rows. Mix them for the mosaic look.',
    empty: { image: '', caption: '', span: 'normal' },
    required: ['image'],
    primary: (it) => it.caption || 'Untitled',
    secondary: (it) => it.span === 'normal' ? 'Standard tile' : `${it.span} tile`,
    image: (it) => it.image,
    fields: [
      { key: 'image',   label: 'Image URL', type: 'text', placeholder: 'https://images.unsplash.com/...', required: true },
      { key: 'caption', label: 'Caption',   type: 'text', placeholder: 'e.g. Santorini, Greece' },
      { key: 'span',    label: 'Tile size', type: 'select', options: ['normal', 'wide', 'tall'] },
    ],
  },
  {
    id: 'testimonial',
    label: 'Travel Stories',
    hint: 'Traveller reviews. Rating drives the star row on the card.',
    empty: { name: '', trip: '', rating: 5, quote: '' },
    required: ['name', 'quote'],
    primary: (it) => it.name,
    secondary: (it) => it.trip,
    fields: [
      { key: 'name',   label: 'Traveller name', type: 'text', placeholder: 'e.g. Ananya Sharma', required: true },
      { key: 'trip',   label: 'Trip',           type: 'text', placeholder: 'e.g. Maldives · Honeymoon' },
      { key: 'rating', label: 'Rating',         type: 'select', options: ['5', '4', '3', '2', '1'] },
      { key: 'quote',  label: 'Review',         type: 'textarea', placeholder: 'What did they say?', required: true },
    ],
  },
  {
    id: 'faq',
    label: 'FAQs',
    hint: 'The optional link renders inline right after the answer text.',
    empty: { question: '', answer: '', linkLabel: '', linkTo: '' },
    required: ['question', 'answer'],
    primary: (it) => it.question,
    secondary: (it) => it.answer,
    fields: [
      { key: 'question',  label: 'Question',           type: 'text', placeholder: 'e.g. Do you help with visas?', required: true },
      { key: 'answer',    label: 'Answer',             type: 'textarea', placeholder: 'Keep it clear and direct.', required: true },
      { key: 'linkLabel', label: 'Link text (optional)', type: 'text', placeholder: 'e.g. Cancellation Policy' },
      { key: 'linkTo',    label: 'Link URL (optional)',  type: 'text', placeholder: 'e.g. /cancellation-policy' },
    ],
  },
]

const byId = (item) => item.id || item._id

export default function AdminHomeContentPage() {
  const [activeTab, setActiveTab] = useState('trust')
  const [grouped,   setGrouped]   = useState({ trust: [], gallery: [], testimonial: [], faq: [] })
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [form,      setForm]      = useState({})
  const [saving,    setSaving]    = useState(false)
  const [busyId,    setBusyId]    = useState(null)

  const section = SECTIONS.find(s => s.id === activeTab)
  const items   = grouped[activeTab] || []

  // Runs once on mount; `loading` already starts true so no need to re-set it here.
  const fetchAll = useCallback(async () => {
    try {
      const data = await api.getHomeContentGrouped()
      setGrouped({
        trust:       data.trust       || [],
        gallery:     data.gallery     || [],
        testimonial: data.testimonial || [],
        faq:         data.faq         || [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => {
    setEditId(null)
    setForm({ ...section.empty })
    setShowModal(true)
  }

  const openEdit = (item) => {
    const next = {}
    section.fields.forEach(f => { next[f.key] = item[f.key] ?? section.empty[f.key] ?? '' })
    setEditId(byId(item))
    setForm(next)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditId(null); setForm({}) }

  const isValid = section.required.every(k => String(form[k] ?? '').trim())

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      const payload = { ...form, section: activeTab }
      if ('rating' in payload) payload.rating = Number(payload.rating) || 5

      if (editId) {
        const updated = await api.updateHomeContent(editId, payload)
        setGrouped(prev => ({
          ...prev,
          [activeTab]: prev[activeTab].map(it => byId(it) === editId ? { ...it, ...updated } : it),
        }))
      } else {
        const created = await api.createHomeContent(payload)
        setGrouped(prev => ({ ...prev, [activeTab]: [...prev[activeTab], created] }))
      }
      closeModal()
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    const label = section.primary(item) || 'this item'
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    const id = byId(item)
    setBusyId(id)
    try {
      await api.deleteHomeContent(id)
      setGrouped(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(it => byId(it) !== id) }))
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const toggleStatus = async (item) => {
    const id = byId(item)
    const next = item.status === 'hidden' ? 'active' : 'hidden'
    setBusyId(id)
    try {
      await api.updateHomeContent(id, { status: next })
      setGrouped(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(it => byId(it) === id ? { ...it, status: next } : it),
      }))
    } catch (err) {
      alert(`Could not update visibility: ${err.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const move = async (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return

    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    const previous = items
    setGrouped(prev => ({ ...prev, [activeTab]: reordered }))   // optimistic

    try {
      await api.reorderHomeContent(reordered.map((it, i) => ({ id: byId(it), order: i })))
    } catch (err) {
      setGrouped(prev => ({ ...prev, [activeTab]: previous }))  // roll back
      alert(`Reorder failed: ${err.message}`)
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const visibleCount = items.filter(it => it.status !== 'hidden').length

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Home Page</h2>
          <p className={c.subtitle}>
            Manage the Trust, Gallery, Travel Stories and FAQ sections of the landing page.
          </p>
        </div>
        <button onClick={openCreate} className={c.addBtn}>+ Add Item</button>
      </div>

      {/* Section tabs */}
      <div className={c.tabRow}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`${c.tab} ${activeTab === s.id ? c.tabActive : ''}`}
          >
            {s.label} {grouped[s.id]?.length ? `(${grouped[s.id].length})` : ''}
          </button>
        ))}
      </div>

      <p className={styles.hint}>
        {section.hint} <strong>{visibleCount}</strong> of {items.length} visible on the site.
      </p>

      {error ? (
        <div className={c.errorBox}>{error}</div>
      ) : loading ? (
        <div className={c.loadingSm}><div className={c.spinner} /></div>
      ) : items.length === 0 ? (
        <div className={c.emptyCard}>Nothing here yet. Add the first item to this section.</div>
      ) : (
        <div className={styles.list}>
          {items.map((item, i) => {
            const id = byId(item)
            const hidden = item.status === 'hidden'
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03 }}
                className={`${styles.row} ${hidden ? styles.rowHidden : ''}`}
              >
                <div className={styles.orderBtns}>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className={styles.orderBtn}
                    title="Move up"
                  >↑</button>
                  <span className={styles.orderNum}>{i + 1}</span>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    className={styles.orderBtn}
                    title="Move down"
                  >↓</button>
                </div>

                {section.image && (
                  <div className={styles.thumb}>
                    {section.image(item)
                      ? <img src={section.image(item)} alt="" onError={e => { e.target.style.visibility = 'hidden' }} />
                      : <span className={styles.thumbEmpty}>?</span>}
                  </div>
                )}

                <div className={styles.rowBody}>
                  <p className={styles.rowTitle}>
                    {section.primary(item) || <em>Untitled</em>}
                    {activeTab === 'testimonial' && (
                      <span className={styles.rating}>{'★'.repeat(item.rating || 0)}</span>
                    )}
                  </p>
                  {section.secondary(item) && (
                    <p className={styles.rowSub}>{section.secondary(item)}</p>
                  )}
                </div>

                <div className={styles.rowActions}>
                  <button
                    onClick={() => toggleStatus(item)}
                    disabled={busyId === id}
                    className={`${styles.statusBtn} ${hidden ? styles.statusHidden : styles.statusActive}`}
                    title={hidden ? 'Hidden — click to show on the site' : 'Visible — click to hide from the site'}
                  >
                    {hidden ? 'Hidden' : 'Visible'}
                  </button>
                  <div className={c.actionsInline}>
                    <button
                      onClick={() => openEdit(item)}
                      className={`${c.iconBtn} ${c.iconBtnEdit}`}
                      title="Edit"
                    >✏</button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={busyId === id}
                      className={`${c.iconBtn} ${c.iconBtnDelete}`}
                      title="Delete"
                    >{busyId === id ? '…' : '🗑'}</button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create / edit modal */}
      {showModal && (
        <div className={c.overlay} onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className={c.modal}
          >
            <h3 className={c.modalTitle}>
              {editId ? 'Edit' : 'New'} — {section.label}
            </h3>

            {activeTab === 'gallery' && form.image && (
              <div className={styles.modalPreview}>
                <img src={form.image} alt="preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}

            <div className={c.stack}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className={c.label}>
                    {field.label}{field.required && <span className={c.req}> *</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key] ?? ''}
                      onChange={e => f(field.key, e.target.value)}
                      className={`${c.input} ${c.select}`}
                    >
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      placeholder={field.placeholder}
                      value={form[field.key] ?? ''}
                      onChange={e => f(field.key, e.target.value)}
                      className={c.textarea}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.key] ?? ''}
                      onChange={e => f(field.key, e.target.value)}
                      className={c.input}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={c.modalActions}>
              <button onClick={closeModal} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !isValid}
                className={`${c.btnBrand} ${c.flex1}`}
              >
                {saving ? 'Saving…' : (editId ? 'Update' : 'Add Item')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
