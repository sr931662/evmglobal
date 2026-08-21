import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
import {
  AD_PLACEMENTS, AD_WIDTHS, AD_RATIOS, adFrameStyle, adImageStyle,
} from '../../../utils/adPlacements'
import c from './adminCommon.module.css'
import styles from './AdminAdsPage.module.css'

const STATUS_OPTIONS = ['All', 'Active', 'Inactive']

const emptyForm = {
  placement: AD_PLACEMENTS[0]?.value || '',
  title: '', image: '', link: '', linkTarget: '_blank', altText: '',
  width: 'full', aspectRatio: 'auto', objectFit: 'cover', rounded: true,
  status: 'Active', priority: '0', startDate: '', endDate: '',
}

function toDateInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function AdModal({ ad, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!ad?._id || !!ad?.id
  const [form,   setForm]   = useState(isEdit ? {
    placement:  ad.placement  || AD_PLACEMENTS[0]?.value || '',
    title:      ad.title      || '',
    image:      ad.image      || '',
    link:       ad.link       || '',
    linkTarget: ad.linkTarget || '_blank',
    altText:    ad.altText    || '',
    width:      ad.width      || 'full',
    aspectRatio: ad.aspectRatio || 'auto',
    objectFit:  ad.objectFit  || 'cover',
    rounded:    ad.rounded !== false,
    status:     ad.status     || 'Active',
    priority:   ad.priority   != null ? String(ad.priority) : '0',
    startDate:  toDateInput(ad.startDate),
    endDate:    toDateInput(ad.endDate),
  } : { ...emptyForm })
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')
  const [uploading, setUploading] = useState(false)
  const [dimensions, setDimensions] = useState(null)
  const fileRef = useRef(null)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Pick from disk instead of hunting for a URL. The upload goes to the same
  // image host the rest of the site already uses.
  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    setUploading(true); setErr('')
    try {
      const result = await api.uploadImage(file)
      f('image', result.url)
      if (result.width && result.height) setDimensions({ w: result.width, h: result.height })
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.image.trim()) {
      setErr('Title and image URL are required.')
      return
    }
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        title:    form.title.trim(),
        image:    form.image.trim(),
        link:     form.link.trim(),
        rounded:  !!form.rounded,
        priority: Number(form.priority) || 0,
        startDate: form.startDate || null,
        endDate:   form.endDate   || null,
      }
      await onSave(payload)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalLg} ${c.modalScroll} modal-scroll`}
        onWheel={e => e.stopPropagation()}
      >
        <h3 className={c.modalTitle}>{isEdit ? 'Edit Ad Banner' : 'New Ad Banner'}</h3>

        <div className={c.stack}>
          <div>
            <label className={c.label}>Placement <span className={c.req}>*</span></label>
            <select value={form.placement} onChange={e => f('placement', e.target.value)}
              className={`${c.input} ${c.select}`}>
              {AD_PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className={c.label}>Internal Title <span className={c.req}>*</span></label>
            <input type="text" value={form.title} onChange={e => f('title', e.target.value)}
              placeholder="e.g. Diwali Sale — Sri Lanka"
              className={c.input} />
          </div>

          <div>
            <label className={c.label}>Banner Image <span className={c.req}>*</span></label>

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

            <input type="text" value={form.image} onChange={e => f('image', e.target.value)}
              placeholder="…or paste an image URL"
              className={`${c.input} ${styles.urlInput}`} />

            {dimensions && (
              <p className={c.labelHint}>Uploaded at {dimensions.w} × {dimensions.h} px.</p>
            )}
          </div>

          {/* ── Size ── so a banner is fitted to its artwork, not stretched ── */}
          <div>
            <label className={c.label}>Banner Size</label>
            <div className={c.grid2}>
              <div>
                <label className={c.labelHint}>Width in the slot</label>
                <select value={form.width} onChange={e => f('width', e.target.value)}
                  className={`${c.input} ${c.select}`}>
                  {AD_WIDTHS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div>
                <label className={c.labelHint}>Shape</label>
                <select value={form.aspectRatio} onChange={e => f('aspectRatio', e.target.value)}
                  className={`${c.input} ${c.select}`}>
                  {AD_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div className={c.grid2}>
              <div>
                <label className={c.labelHint}>Fit</label>
                <select value={form.objectFit} onChange={e => f('objectFit', e.target.value)}
                  disabled={form.aspectRatio === 'auto'}
                  className={`${c.input} ${c.select}`}>
                  <option value="cover">Fill the frame (crops)</option>
                  <option value="contain">Show the whole image</option>
                </select>
              </div>
              <div className={styles.roundedRow}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={!!form.rounded}
                    onChange={e => f('rounded', e.target.checked)} />
                  Rounded corners
                </label>
              </div>
            </div>

            {/* Live preview at the chosen size, so what's set here is what the
                page will show. */}
            {form.image && (
              <div className={styles.previewStage}>
                <p className={styles.previewLabel}>Preview</p>
                <div className={styles.previewFrame} style={adFrameStyle(form)}>
                  <img
                    src={form.image}
                    alt=""
                    className={styles.previewImg}
                    style={adImageStyle(form)}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Click-through Link</label>
              <input type="text" value={form.link} onChange={e => f('link', e.target.value)}
                placeholder="https:// or /packages"
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>Opens In</label>
              <select value={form.linkTarget} onChange={e => f('linkTarget', e.target.value)}
                className={`${c.input} ${c.select}`}>
                <option value="_blank">New Tab</option>
                <option value="_self">Same Tab</option>
              </select>
            </div>
          </div>

          <div>
            <label className={c.label}>Alt Text</label>
            <input type="text" value={form.altText} onChange={e => f('altText', e.target.value)}
              placeholder="Describes the banner for accessibility"
              className={c.input} />
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)}
                className={`${c.input} ${c.select}`}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={c.label}>Priority</label>
              <input type="number" value={form.priority} onChange={e => f('priority', e.target.value)}
                placeholder="0"
                className={c.input} />
            </div>
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>End Date</label>
              <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)}
                className={c.input} />
            </div>
          </div>
          <p className={c.labelHint}>Leave dates blank to run indefinitely. When several banners share a placement, the highest priority active one shows.</p>
        </div>

        {err && <p className={c.formError}>{err}</p>}

        <div className={c.modalActions}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className={`${c.btnBrand} ${c.flex1}`}>
            {saving ? 'Saving…' : isEdit ? 'Update Banner' : 'Create Banner'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DeleteConfirm({ label, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalSm}`}
      >
        <div className={c.confirmIcon}>🗑️</div>
        <h3 className={c.confirmTitle}>Delete Banner?</h3>
        <p className={c.confirmText}>
          <span className={c.strong}>{label}</span> will be permanently removed.
        </p>
        <div className={c.actionsTight}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.btnSm} ${c.flex1}`}>Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }} disabled={deleting}
            className={`${c.btnDanger} ${c.flex1}`}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminAdsPage() {
  const [ads,          setAds]          = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState('')
  const [status,        setStatus]       = useState('All')
  const [modal,         setModal]        = useState(null)
  const [deleteTarget,  setDeleteTarget] = useState(null)

  const fetchAds = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (status !== 'All') params.status = status
      const data = await api.getAds(params)
      setAds(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchAds() }, [fetchAds])

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.createAd(form)
    } else {
      await api.updateAd(modal._id || modal.id, form)
    }
    fetchAds()
  }

  const handleDelete = async () => {
    await api.deleteAd(deleteTarget._id || deleteTarget.id)
    setDeleteTarget(null)
    fetchAds()
  }

  const placementLabel = (value) => AD_PLACEMENTS.find(p => p.value === value)?.label || value
  const active   = ads.filter(a => a.status === 'Active').length
  const inactive = ads.filter(a => a.status === 'Inactive').length

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Ad Banners</h2>
          <p className={c.subtitle}>{active} active · {inactive} inactive</p>
        </div>
        <button onClick={() => setModal('create')} className={c.addBtn}>
          + New Banner
        </button>
      </div>

      <div className={c.tabRow}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`${c.tab} ${status === s ? c.tabActive : ''}`}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <div className={c.errorBox}>{error}</div>
      ) : loading ? (
        <div className={c.loadingSm}>
          <div className={c.spinner} />
        </div>
      ) : ads.length === 0 ? (
        <div className={c.emptyCard}>
          <p className={styles.emptyMb}>No ad banners yet.</p>
          <button onClick={() => setModal('create')} className={c.btnBrandSm}>
            + Create First Banner
          </button>
        </div>
      ) : (
        <div className={c.listStack}>
          {ads.map(ad => {
            const id = ad._id || ad.id
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={styles.listRow}>
                <img src={ad.image} alt="" className={styles.thumb} />
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <h3 className={styles.rowTitle}>{ad.title}</h3>
                    <span className={`${c.badge} ${ad.status === 'Active' ? c.badgeGreen : c.badgeGray}`}>
                      {ad.status}
                    </span>
                  </div>
                  <p className={styles.meta}>{placementLabel(ad.placement)} · priority {ad.priority ?? 0}</p>
                  {ad.link && <p className={styles.link}>{ad.link}</p>}
                </div>
                <div className={c.actionsInline}>
                  <button onClick={() => setModal(ad)}
                    className={`${c.iconBtn} ${c.iconBtnEdit}`}
                    title="Edit banner">✏</button>
                  <button onClick={() => setDeleteTarget(ad)}
                    className={`${c.iconBtn} ${c.iconBtnDelete}`}
                    title="Delete banner">🗑</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <AdModal ad={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {deleteTarget && (
          <DeleteConfirm label={deleteTarget.title} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}
