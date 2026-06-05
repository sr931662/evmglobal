import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
import styles from './AdminLeadsPage.module.css'

const STATUS_OPTIONS  = ['All', 'new', 'contacted', 'qualified', 'converted', 'rejected', 'duplicate', 'not_interested']
const STATUS_EDITABLE = STATUS_OPTIONS.slice(1)
const TYPE_TABS       = ['all', 'lead', 'inquiry', 'signup']

const BUDGETS          = ['Under ₹50,000', '₹50k–₹1L', '₹1L–₹2L', '₹2L–₹5L', '₹5L+', 'Flexible / TBD']
const TRIP_TYPES       = ['Honeymoon', 'Family Holiday', 'Solo Travel', 'Group Tour', 'Luxury Escape', 'Adventure', 'Business + Leisure', 'Pilgrimage / Religious', 'Anniversary', 'Corporate Retreat']
const ACCOMMODATION    = ['3-Star', '4-Star', '5-Star', 'Boutique / Heritage', 'Budget / Hostel', 'Luxury Resort', 'Villa / Apartment', 'No Preference']
const HOW_HEARD        = ['Google Search', 'Instagram', 'Facebook', 'WhatsApp', 'Friend / Family', 'Travel Expo', 'LinkedIn', 'YouTube', 'OTA / Booking Site', 'Walk-in', 'Other']
const CONTACT_PREFS    = ['WhatsApp', 'Phone Call', 'Email', 'Any']
const MONTHS           = ['January','February','March','April','May','June','July','August','September','October','November','December']

const statusStyles = {
  new:           { pill: styles.stNew,           dot: styles.dotNew           },
  contacted:     { pill: styles.stContacted,     dot: styles.dotContacted     },
  qualified:     { pill: styles.stQualified,     dot: styles.dotQualified     },
  converted:     { pill: styles.stConverted,     dot: styles.dotConverted     },
  rejected:      { pill: styles.stRejected,      dot: styles.dotRejected      },
  duplicate:     { pill: styles.stDuplicate,     dot: styles.dotDuplicate     },
  not_interested:{ pill: styles.stNotInterested, dot: styles.dotNotInterested },
}

const typeConfig = {
  lead:    { label: 'Lead',    icon: '📣', color: styles.typeLead    },
  inquiry: { label: 'Inquiry', icon: '📥', color: styles.typeInquiry },
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Inline status badge with dropdown ──────────────────────────────────────────
function StatusBadge({ lead, onUpdate }) {
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = async (status) => {
    if (status === lead.status) { setOpen(false); return }
    setSaving(true)
    try { await onUpdate(lead._id || lead.id, status) }
    finally { setSaving(false); setOpen(false) }
  }

  const style = statusStyles[lead.status] || { pill: styles.stDefault, dot: styles.dotDefault }
  const fmtStatus = (s) => s.replace(/_/g, ' ')

  return (
    <div ref={ref} className={styles.statusWrap}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`${styles.statusBtn} ${style.pill} ${saving ? styles.statusBtnSaving : ''}`}
      >
        <span className={`${styles.statusDot} ${style.dot}`} />
        {saving ? '…' : fmtStatus(lead.status)}
        <span className={styles.caret}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 4,  scale: 0.95  }}
            transition={{ duration: 0.12 }}
            className={styles.statusMenu}
          >
            {STATUS_EDITABLE.map(s => {
              const st = statusStyles[s]
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className={`${styles.statusOption} ${s === lead.status ? styles.statusOptionActive : ''}`}
                >
                  <span className={`${styles.statusDot} ${st.dot}`} />
                  {s.replace(/_/g, ' ')}
                  {s === lead.status && <span className={styles.statusCheck}>✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Add / Edit modal (type-aware, full CRM) ─────────────────────────────────
const MODAL_TABS_LEAD    = ['Contact', 'Trip Details', 'Preferences', 'Pipeline']
const MODAL_TABS_INQUIRY = ['Contact', 'Trip Details', 'Preferences', 'Pipeline']

function LeadModal({ lead, onClose, onSave }) {
  useScrollLock()
  const isEdit  = !!lead?._id || !!lead?.id
  const [type,  setType]  = useState(lead?.type || 'lead')
  const [tab,   setTab]   = useState(0)
  const [saving,setSaving]= useState(false)
  const [err,   setErr]   = useState('')

  const [form, setForm] = useState(isEdit ? {
    name:               lead.name               || '',
    phone:              lead.phone              || '',
    email:              lead.email              || '',
    city:               lead.city               || '',
    destination:        lead.destination        || '',
    travelDate:         lead.travelDate         || '',
    travelMonth:        lead.travelMonth        || '',
    travellers:         lead.travellers         || '',
    numAdults:          lead.numAdults          ?? '',
    numChildren:        lead.numChildren        ?? '',
    numInfants:         lead.numInfants         ?? '',
    departureCity:      lead.departureCity      || '',
    tripDuration:       lead.tripDuration       || '',
    budget:             lead.budget             || '',
    tripType:           lead.tripType           || '',
    accommodation:      lead.accommodation      || '',
    occasion:           lead.occasion           || '',
    howHeard:           lead.howHeard           || '',
    preferredContact:   lead.preferredContact   || '',
    specialRequirements:lead.specialRequirements|| '',
    message:            lead.message            || '',
    status:             lead.status             || 'new',
  } : {
    name: '', phone: '', email: '', city: '',
    destination: '', travelDate: '', travelMonth: '', travellers: '',
    numAdults: '', numChildren: '', numInfants: '',
    departureCity: '', tripDuration: '',
    budget: '', tripType: '', accommodation: '', occasion: '',
    howHeard: '', preferredContact: '', specialRequirements: '',
    message: '', status: 'new',
  })

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = styles.input
  const sel = `${styles.input} ${styles.select}`
  const lbl = styles.label

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setErr('Name and phone are required.'); setTab(0); return }
    setSaving(true); setErr('')
    try { await onSave({ ...form, type }); onClose() }
    catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const isInquiry = type === 'inquiry' || (isEdit && lead?.type === 'inquiry')
  const modalTabs = MODAL_TABS_LEAD

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95,  y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={styles.modal}
      >
        {/* Header */}
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>
            {isEdit ? `Edit ${lead.type === 'inquiry' ? 'Inquiry' : 'Lead'}` : 'Add New'}
          </h3>
          <div className={styles.modalHeadRight}>
            {!isEdit && (
              <div className={styles.segmented}>
                {['lead', 'inquiry'].map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`${styles.segBtn} ${type === t ? styles.segBtnActive : ''}`}>
                    {t === 'lead' ? '📣 Lead' : '📥 Inquiry'}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose} className={styles.iconClose}>×</button>
          </div>
        </div>

        {/* Tab bar */}
        <div className={`${styles.modalTabs} no-scrollbar`}>
          {modalTabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`${styles.modalTab} ${tab === i ? styles.modalTabActive : ''}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={styles.modalBody}>

          {/* ── Tab 0: Contact ── */}
          {tab === 0 && (
            <>
              <div>
                <label className={lbl}>Full Name <span className={styles.req}>*</span></label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => f('name', e.target.value)} className={inp} />
              </div>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>Phone / WhatsApp <span className={styles.req}>*</span></label>
                  <input type="text" placeholder="+919876543210" value={form.phone} onChange={e => f('phone', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Email Address</label>
                  <input type="email" placeholder="rahul@email.com" value={form.email} onChange={e => f('email', e.target.value)} className={inp} />
                </div>
              </div>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>City / Location</label>
                  <input type="text" placeholder="e.g. Mumbai" value={form.city} onChange={e => f('city', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Preferred Contact</label>
                  <select value={form.preferredContact} onChange={e => f('preferredContact', e.target.value)} className={sel}>
                    <option value="">Select…</option>
                    {CONTACT_PREFS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>How did they hear about us?</label>
                <select value={form.howHeard} onChange={e => f('howHeard', e.target.value)} className={sel}>
                  <option value="">Select source…</option>
                  {HOW_HEARD.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Message / Initial Note</label>
                <textarea rows={3} placeholder="What are they looking for?" value={form.message} onChange={e => f('message', e.target.value)}
                  className={`${styles.input} ${styles.textarea}`} />
              </div>
            </>
          )}

          {/* ── Tab 1: Trip Details ── */}
          {tab === 1 && (
            <>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>Destination(s)</label>
                  <input type="text" placeholder="e.g. Maldives, Bali" value={form.destination} onChange={e => f('destination', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Departure City</label>
                  <input type="text" placeholder="e.g. Delhi" value={form.departureCity} onChange={e => f('departureCity', e.target.value)} className={inp} />
                </div>
              </div>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>Approx. Travel Date</label>
                  <input type="text" placeholder="e.g. 15 Dec 2025" value={form.travelDate} onChange={e => f('travelDate', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Travel Month</label>
                  <select value={form.travelMonth} onChange={e => f('travelMonth', e.target.value)} className={sel}>
                    <option value="">Select month…</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Trip Duration</label>
                <input type="text" placeholder="e.g. 7 nights / 8 days" value={form.tripDuration} onChange={e => f('tripDuration', e.target.value)} className={inp} />
              </div>

              <div className={styles.travellersBlock}>
                <p className={styles.travellersLabel}>Travellers</p>
                <div className={styles.grid3}>
                  <div>
                    <label className={lbl}>Adults</label>
                    <input type="number" min="0" max="20" placeholder="2" value={form.numAdults} onChange={e => f('numAdults', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Children (2–12)</label>
                    <input type="number" min="0" max="10" placeholder="1" value={form.numChildren} onChange={e => f('numChildren', e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Infants (&lt;2)</label>
                    <input type="number" min="0" max="5" placeholder="0" value={form.numInfants} onChange={e => f('numInfants', e.target.value)} className={inp} />
                  </div>
                </div>
                <p className={styles.legacyNote}>Or use legacy field: <input type="text" placeholder="e.g. 2 adults, 1 child" value={form.travellers} onChange={e => f('travellers', e.target.value)} className={styles.legacyInput} /></p>
              </div>
            </>
          )}

          {/* ── Tab 2: Preferences ── */}
          {tab === 2 && (
            <>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>Budget (per person)</label>
                  <select value={form.budget} onChange={e => f('budget', e.target.value)} className={sel}>
                    <option value="">Select budget…</option>
                    {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Trip Type</label>
                  <select value={form.tripType} onChange={e => f('tripType', e.target.value)} className={sel}>
                    <option value="">Select type…</option>
                    {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.grid2}>
                <div>
                  <label className={lbl}>Accommodation</label>
                  <select value={form.accommodation} onChange={e => f('accommodation', e.target.value)} className={sel}>
                    <option value="">Select preference…</option>
                    {ACCOMMODATION.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Occasion / Purpose</label>
                  <input type="text" placeholder="e.g. Honeymoon, Anniversary" value={form.occasion} onChange={e => f('occasion', e.target.value)} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Special Requirements</label>
                <textarea rows={4} placeholder="Dietary needs, accessibility, specific activities, visa help, anniversary surprise, etc."
                  value={form.specialRequirements} onChange={e => f('specialRequirements', e.target.value)}
                  className={`${styles.input} ${styles.textarea}`} />
              </div>
            </>
          )}

          {/* ── Tab 3: Pipeline ── */}
          {tab === 3 && (
            <>
              <div>
                <label className={lbl}>Pipeline Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)} className={sel}>
                  {STATUS_EDITABLE.map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className={styles.summaryBox}>
                <p className={styles.summaryTitle}>Quick Summary</p>
                {[
                  { label: 'Name',        value: form.name       },
                  { label: 'Phone',       value: form.phone      },
                  { label: 'Destination', value: form.destination },
                  { label: 'Budget',      value: form.budget     },
                  { label: 'Trip Type',   value: form.tripType   },
                  { label: 'Adults',      value: form.numAdults  },
                  { label: 'Children',    value: form.numChildren },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className={styles.summaryRow}>
                    <span className={styles.summaryKey}>{row.label}</span>
                    <span className={styles.summaryVal}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {err && <p className={styles.modalErr}>{err}</p>}

        <div className={styles.modalFoot}>
          <button onClick={onClose} className={styles.btnOutline}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.btnBrand}>
            {saving ? 'Saving…' : isEdit ? 'Update' : `Add ${type === 'inquiry' ? 'Inquiry' : 'Lead'}`}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Delete confirm ──────────────────────────────────────────────────────────────
function DeleteConfirm({ lead, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95         }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={styles.confirm}
      >
        <div className={styles.confirmIcon}>🗑️</div>
        <h3 className={styles.confirmTitle}>
          Delete {lead.type === 'inquiry' ? 'Inquiry' : 'Lead'}?
        </h3>
        <p className={styles.confirmText}>
          <span className={styles.strong}>{lead.name}</span> will be permanently removed.
        </p>
        <div className={styles.confirmActions}>
          <button onClick={onClose} className={styles.btnOutlineSm}>Cancel</button>
          <button
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            disabled={deleting}
            className={styles.btnDanger}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Detail side-drawer ──────────────────────────────────────────────────────────
function DetailDrawer({ lead, onClose, onEdit, onDelete, onStatusUpdate, onWhatsApp, onCreateQuote }) {
  useScrollLock()
  const typeConf  = typeConfig[lead.type] || typeConfig.lead

  return (
    <div className={styles.drawerOverlay}>
      <div className={styles.drawerBackdrop} onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0       }}
        exit={{   x: '100%'  }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className={styles.drawer}
      >
        {/* Header */}
        <div className={styles.drawerHead}>
          <div className={styles.drawerHeadRow}>
            <div className={styles.drawerHeadMain}>
              <span className={`${styles.typeBadge} ${typeConf.color} ${styles.drawerTypeBadge}`}>
                {typeConf.icon} {typeConf.label}
              </span>
              <h3 className={styles.drawerName}>{lead.name}</h3>
              <p className={styles.drawerPhone}>{lead.phone}</p>
            </div>
            <button onClick={onClose} className={styles.drawerClose}>×</button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>

          {/* Status (inline updatable) */}
          <div>
            <p className={styles.sectionLabel}>Status</p>
            <StatusBadge lead={lead} onUpdate={onStatusUpdate} />
          </div>

          {/* Contact info */}
          <div>
            <p className={styles.sectionLabelMb}>Contact</p>
            <div className={styles.contactList}>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>📞</span>
                <span className={styles.contactStrong}>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className={styles.contactRow}>
                  <span className={styles.contactIcon}>✉</span>
                  <span className={styles.contactText}>{lead.email}</span>
                </div>
              )}
              {lead.city && (
                <div className={styles.contactRow}>
                  <span className={styles.contactIcon}>📍</span>
                  <span className={styles.contactText}>{lead.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trip details */}
          {(lead.destination || lead.travelDate || lead.travelMonth || lead.travellers || lead.numAdults || lead.departureCity || lead.tripDuration) && (
            <div>
              <p className={styles.sectionLabelIndigo}>Trip Details</p>
              <div className={styles.detailGroupIndigo}>
                {[
                  { icon: '🌍', label: 'Destination',     value: lead.destination    },
                  { icon: '🛫', label: 'From',             value: lead.departureCity  },
                  { icon: '📅', label: 'Travel Date',      value: lead.travelDate     },
                  { icon: '🗓', label: 'Month',            value: lead.travelMonth    },
                  { icon: '⏱', label: 'Duration',         value: lead.tripDuration   },
                  { icon: '👥', label: 'Travellers',       value: lead.travellers || [lead.numAdults && `${lead.numAdults} adult(s)`, lead.numChildren && `${lead.numChildren} child(ren)`, lead.numInfants && `${lead.numInfants} infant(s)`].filter(Boolean).join(', ') || null },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className={styles.detailRow}>
                    <span className={styles.detailRowIcon}>{row.icon}</span>
                    <div>
                      <p className={styles.detailRowLabelIndigo}>{row.label}</p>
                      <p className={styles.detailRowVal}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {(lead.budget || lead.tripType || lead.accommodation || lead.occasion) && (
            <div>
              <p className={styles.sectionLabelAmber}>Preferences</p>
              <div className={styles.detailGroupAmber}>
                {[
                  { icon: '💰', label: 'Budget',        value: lead.budget        },
                  { icon: '✈', label: 'Trip Type',     value: lead.tripType      },
                  { icon: '🏨', label: 'Accommodation', value: lead.accommodation  },
                  { icon: '🎉', label: 'Occasion',      value: lead.occasion      },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className={styles.detailRow}>
                    <span className={styles.detailRowIcon}>{row.icon}</span>
                    <div>
                      <p className={styles.detailRowLabelAmber}>{row.label}</p>
                      <p className={styles.detailRowVal}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special requirements */}
          {lead.specialRequirements && (
            <div>
              <p className={styles.sectionLabel}>Special Requirements</p>
              <p className={styles.noteBox}>{lead.specialRequirements}</p>
            </div>
          )}

          {/* Message */}
          {lead.message && (
            <div>
              <p className={styles.sectionLabel}>Message</p>
              <p className={styles.noteBox}>{lead.message}</p>
            </div>
          )}

          {/* Date */}
          <div>
            <p className={styles.sectionLabel}>Submitted</p>
            <p className={styles.dateText}>{formatDate(lead.created_at)}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.drawerFoot}>
          <button onClick={onWhatsApp} className={styles.waBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp {lead.name?.split(' ')[0]}
          </button>
          {onCreateQuote && (
            <button onClick={onCreateQuote} className={styles.quoteBtn}>
              📋 Create Quote
            </button>
          )}
          <div className={styles.drawerActions}>
            <button onClick={onEdit}   className={styles.drawerEdit}>✏ Edit</button>
            <button onClick={onDelete} className={styles.drawerDelete}>🗑 Delete</button>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}

// ── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={`${styles.statValue} ${valueClass || ''}`}>{value ?? '—'}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function AdminLeadsPage({ onNavigate }) {
  const [leads,        setLeads]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [stats,        setStats]        = useState({ total: 0, newCount: 0, inquiries: 0, converted: 0 })
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [status,       setStatus]       = useState('All')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [modal,        setModal]        = useState(null)   // null | 'create' | lead
  const [drawer,       setDrawer]       = useState(null)   // null | lead
  const [deleteTarget, setDeleteTarget] = useState(null)

  const limit = 20

  const fetchStats = useCallback(async () => {
    try {
      const [all, newLeads, inqLeads, convLeads] = await Promise.all([
        api.getLeads({ limit: 1 }),
        api.getLeads({ limit: 1, status: 'new' }),
        api.getLeads({ limit: 1, type: 'inquiry' }),
        api.getLeads({ limit: 1, status: 'converted' }),
      ])
      setStats({
        total:     all.pagination?.total     || 0,
        newCount:  newLeads.pagination?.total || 0,
        inquiries: inqLeads.pagination?.total || 0,
        converted: convLeads.pagination?.total || 0,
      })
    } catch {}
  }, [])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit }
      if (status !== 'All')    params.status = status
      if (search.trim())       params.search = search.trim()
      if (typeFilter !== 'all') params.type  = typeFilter
      const data = await api.getLeads(params)
      setLeads(data.leads || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, status, search, typeFilter])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchLeads() }, [fetchLeads])

  useEffect(() => {
    const t = setTimeout(() => { if (page !== 1) setPage(1); else fetchLeads() }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAll = () => { fetchLeads(); fetchStats() }

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.submitLead(form)
    } else {
      const id = modal._id || modal.id
      await api.updateLead(id, form)
      if (drawer && (drawer._id || drawer.id) === id) setDrawer(prev => ({ ...prev, ...form }))
    }
    refreshAll()
  }

  const handleStatusUpdate = async (id, newStatus) => {
    await api.updateLeadStatus(id, newStatus)
    setLeads(prev => prev.map(l => (l._id || l.id) === id ? { ...l, status: newStatus } : l))
    if (drawer && (drawer._id || drawer.id) === id) setDrawer(prev => ({ ...prev, status: newStatus }))
    fetchStats()
  }

  const handleDelete = async () => {
    const id = deleteTarget._id || deleteTarget.id
    await api.deleteLead(id)
    setDeleteTarget(null)
    if (drawer && (drawer._id || drawer.id) === id) setDrawer(null)
    refreshAll()
  }

  const handleWhatsApp = async (lead) => {
    try {
      const data = await api.getWhatsAppLink(lead.phone, lead.message || '')
      window.open(data.link, '_blank')
    } catch {
      window.open(`https://wa.me/${lead.phone?.replace(/\D/g, '')}`, '_blank')
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (status !== 'All')     params.status = status
      if (typeFilter !== 'all') params.type   = typeFilter
      const res = await api.exportLeads(params)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `EMV_Leads_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Leads</h2>
          <p className={styles.subtitle}>Leads &amp; inquiries · manage your pipeline</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleExport} className={styles.btnExport}>
            ⬇ Export CSV
          </button>
          <button onClick={() => setModal('create')} className={styles.addBtn}>
            + Add New
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statGrid}>
        <StatCard label="Total"     value={stats.total}     sub="all leads & inquiries" />
        <StatCard label="New"       value={stats.newCount}  sub="awaiting response"  valueClass={styles.statValueBlue} />
        <StatCard label="Inquiries" value={stats.inquiries} sub="from contact form"  valueClass={styles.statValueIndigo} />
        <StatCard label="Converted" value={stats.converted} sub="closed deals"       valueClass={styles.statValueEmerald} />
      </div>

      {/* ── Filters ── */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search name, phone, destination…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>

        <div className={styles.filterGroup}>
          {/* Type toggle */}
          <div className={styles.typeToggle}>
            {TYPE_TABS.map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1) }}
                className={`${styles.typeBtn} ${typeFilter === t ? styles.typeBtnActive : ''}`}
              >
                {t === 'all' ? 'All' : t === 'lead' ? '📣 Leads' : '📥 Inquiries'}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className={styles.statusPills}>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={`${styles.statusPill} ${status === s ? styles.statusPillActive : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: 0.1 }}
        className={styles.panel}
      >
        {error ? (
          <div className={styles.errorCenter}>{error}</div>
        ) : loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : leads.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>📋</p>
            <p className={styles.emptyTitle}>No records found</p>
            <p className={styles.emptyHint}>Try adjusting your filters or add a new lead</p>
            <button onClick={() => setModal('create')} className={styles.btnBrandSm}>
              + Add First Lead
            </button>
          </div>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Client</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Details</th>
                  <th className={`${styles.th} ${styles.hideLg}`}>Date</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const id       = lead._id || lead.id
                  const typeConf = typeConfig[lead.type] || typeConfig.lead
                  const isActive = drawer && (drawer._id || drawer.id) === id

                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setDrawer(isActive ? null : lead)}
                      className={`${styles.row} ${isActive ? styles.rowActiveSel : ''}`}
                    >
                      {/* Type */}
                      <td className={styles.td}>
                        <span className={`${styles.typeBadge} ${typeConf.color}`}>
                          {typeConf.icon} {typeConf.label}
                        </span>
                      </td>

                      {/* Client */}
                      <td className={styles.td}>
                        <p className={styles.clientName}>{lead.name}</p>
                        <p className={styles.clientPhone}>{lead.phone}</p>
                      </td>

                      {/* Smart details column */}
                      <td className={`${styles.td} ${styles.hideMd} ${styles.detailCell}`}>
                        {lead.type === 'inquiry' ? (
                          <div>
                            {lead.destination && <p className={styles.detailStrong}>🌍 {lead.destination}</p>}
                            {(lead.travelDate || lead.travellers) && (
                              <p className={styles.detailSub}>
                                {[lead.travelDate, lead.travellers].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {!lead.destination && !lead.travelDate && lead.message && (
                              <p className={styles.detailMsg}>{lead.message}</p>
                            )}
                          </div>
                        ) : (
                          <p className={styles.detailMsg}>{lead.message || '—'}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className={`${styles.td} ${styles.cellDate} ${styles.hideLg}`}>
                        {formatDate(lead.created_at)}
                      </td>

                      {/* Status (stop row-click) */}
                      <td className={styles.td} onClick={e => e.stopPropagation()}>
                        <StatusBadge lead={lead} onUpdate={handleStatusUpdate} />
                      </td>

                      {/* Actions (stop row-click) */}
                      <td className={styles.tdRight} onClick={e => e.stopPropagation()}>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleWhatsApp(lead)}
                            className={`${styles.iconBtn} ${styles.iconBtnWa}`}
                            title="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => { setModal(lead); setDrawer(null) }}
                            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                            title="Edit"
                          >✏</button>
                          <button
                            onClick={() => setDeleteTarget(lead)}
                            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                            title="Delete"
                          >🗑</button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagBar}>
            <p className={styles.pagInfo}>Showing {leads.length} of {total}</p>
            <div className={styles.pagBtns}>
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className={styles.pagBtn}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={p} onClick={() => setPage(p)} className={`${styles.pagBtn} ${p === page ? styles.pagBtnActive : ''}`}>{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className={styles.pagBtn}>›</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Detail drawer ── */}
      <AnimatePresence>
        {drawer && (
          <DetailDrawer
            lead={drawer}
            onClose={() => setDrawer(null)}
            onEdit={() => { setModal(drawer); setDrawer(null) }}
            onDelete={() => { setDeleteTarget(drawer); setDrawer(null) }}
            onStatusUpdate={handleStatusUpdate}
            onWhatsApp={() => handleWhatsApp(drawer)}
            onCreateQuote={onNavigate ? () => { setDrawer(null); onNavigate('quotes', { prefillLead: drawer }) } : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Add / Edit modal ── */}
      <AnimatePresence>
        {modal && (
          <LeadModal
            lead={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            lead={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
