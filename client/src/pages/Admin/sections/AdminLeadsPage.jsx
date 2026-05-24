import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'

const STATUS_OPTIONS  = ['All', 'new', 'contacted', 'qualified', 'converted', 'rejected']
const STATUS_EDITABLE = STATUS_OPTIONS.slice(1)
const TYPE_TABS       = ['all', 'lead', 'inquiry']

const statusStyles = {
  new:       { pill: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500'    },
  contacted: { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500'   },
  qualified: { pill: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  converted: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected:  { pill: 'bg-red-50 text-red-500 border-red-200',       dot: 'bg-red-400'     },
}

const typeConfig = {
  lead:    { label: 'Lead',    icon: '📣', color: 'bg-orange-50 text-orange-600 border-orange-200'   },
  inquiry: { label: 'Inquiry', icon: '📥', color: 'bg-indigo-50 text-indigo-600 border-indigo-200'   },
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

  const style = statusStyles[lead.status] || { pill: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400' }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] transition-opacity ${style.pill} ${saving ? 'opacity-50' : 'hover:opacity-75 cursor-pointer'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {saving ? '…' : lead.status}
        <span className="text-[8px] opacity-50">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 4,  scale: 0.95  }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden z-20 min-w-[145px]"
          >
            {STATUS_EDITABLE.map(s => {
              const st = statusStyles[s]
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold capitalize hover:bg-gray-50 transition-colors text-left ${s === lead.status ? 'text-brand' : 'text-dark'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                  {s}
                  {s === lead.status && <span className="ml-auto text-brand">✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Add / Edit modal (type-aware) ───────────────────────────────────────────────
function LeadModal({ lead, onClose, onSave }) {
  const isEdit = !!lead?._id || !!lead?.id
  const [type, setType] = useState(lead?.type || 'lead')
  const [form, setForm] = useState(
    isEdit
      ? { name: lead.name || '', phone: lead.phone || '', email: lead.email || '', destination: lead.destination || '', travelDate: lead.travelDate || '', travellers: lead.travellers || '', message: lead.message || '', status: lead.status || 'new' }
      : { name: '', phone: '', email: '', destination: '', travelDate: '', travellers: '', message: '', status: 'new' }
  )
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setErr('Name and phone are required.'); return }
    setSaving(true); setErr('')
    try { await onSave({ ...form, type }); onClose() }
    catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const baseFields = [
    { label: 'Full Name',        key: 'name',  placeholder: 'e.g. Rahul Sharma',      required: true  },
    { label: 'Phone / WhatsApp', key: 'phone', placeholder: 'e.g. +919876543210',     required: true  },
    { label: 'Email Address',    key: 'email', placeholder: 'e.g. rahul@email.com',   required: false },
  ]
  const tripFields = [
    { label: 'Destination', key: 'destination', placeholder: 'e.g. Maldives, Bali'       },
    { label: 'Travel Date', key: 'travelDate',  placeholder: 'e.g. December 2025'         },
    { label: 'Travellers',  key: 'travellers',  placeholder: 'e.g. 2 adults, 1 child'     },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95,  y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-premium border border-gray-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-serif font-bold text-dark">
            {isEdit ? `Edit ${lead.type === 'inquiry' ? 'Inquiry' : 'Lead'}` : 'Add New'}
          </h3>
          {!isEdit && (
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
              {['lead', 'inquiry'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${type === t ? 'bg-white text-dark shadow-sm' : 'text-gray-400 hover:text-dark'}`}
                >
                  {t === 'lead' ? '📣 Lead' : '📥 Inquiry'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Base fields */}
          {baseFields.map(field => (
            <div key={field.key}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">
                {field.label}{field.required && <span className="text-brand ml-1">*</span>}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => f(field.key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          ))}

          {/* Inquiry trip fields (animated) */}
          <AnimatePresence initial={false}>
            {(type === 'inquiry' || (isEdit && lead.type === 'inquiry')) && (
              <motion.div
                key="trip-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{   opacity: 0, height: 0     }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-5"
              >
                <div className="h-px bg-indigo-100 mt-2" />
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Trip Details</p>
                {tripFields.map(field => (
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Message</label>
            <textarea
              rows={3}
              placeholder="What are they looking for?"
              value={form.message}
              onChange={e => f('message', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Status</label>
            <select
              value={form.status}
              onChange={e => f('status', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors capitalize cursor-pointer"
            >
              {STATUS_EDITABLE.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        {err && <p className="mt-4 text-red-500 text-sm font-bold">{err}</p>}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50"
          >
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.95         }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-premium border border-gray-100 text-center"
      >
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-xl font-serif font-bold text-dark mb-2">
          Delete {lead.type === 'inquiry' ? 'Inquiry' : 'Lead'}?
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          <span className="font-bold text-dark">{lead.name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50 text-sm">Cancel</button>
          <button
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Detail side-drawer ──────────────────────────────────────────────────────────
function DetailDrawer({ lead, onClose, onEdit, onDelete, onStatusUpdate, onWhatsApp }) {
  const typeConf  = typeConfig[lead.type] || typeConfig.lead

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0       }}
        exit={{   x: '100%'  }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] mb-3 ${typeConf.color}`}>
                {typeConf.icon} {typeConf.label}
              </span>
              <h3 className="text-2xl font-serif font-bold text-dark truncate">{lead.name}</h3>
              <p className="text-gray-500 font-bold text-sm mt-1 tracking-wide">{lead.phone}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xl font-light transition-colors ml-4 shrink-0"
            >×</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-7 flex-1">

          {/* Status (inline updatable) */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">Status</p>
            <StatusBadge lead={lead} onUpdate={onStatusUpdate} />
          </div>

          {/* Contact info */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Contact</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-sm shrink-0">📞</span>
                <span className="font-bold text-dark text-sm">{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-sm shrink-0">✉</span>
                  <span className="font-medium text-dark text-sm">{lead.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trip details — inquiry only */}
          {lead.type === 'inquiry' && (lead.destination || lead.travelDate || lead.travellers) && (
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-3">Trip Details</p>
              <div className="bg-indigo-50/60 rounded-2xl p-5 space-y-3">
                {[
                  { icon: '🌍', label: 'Destination', value: lead.destination },
                  { icon: '📅', label: 'Travel Date',  value: lead.travelDate  },
                  { icon: '👥', label: 'Travellers',   value: lead.travellers  },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{row.icon}</span>
                    <div>
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{row.label}</p>
                      <p className="font-bold text-dark text-sm">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {lead.message && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">Message</p>
              <p className="text-sm text-dark font-medium leading-relaxed bg-gray-50 rounded-2xl p-4">{lead.message}</p>
            </div>
          )}

          {/* Date */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1">Submitted</p>
            <p className="text-sm font-medium text-gray-500">{formatDate(lead.created_at)}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-6 border-t border-gray-100 space-y-3 sticky bottom-0 bg-white">
          <button
            onClick={onWhatsApp}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#1eb853] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp {lead.name?.split(' ')[0]}
          </button>
          <div className="flex gap-3">
            <button onClick={onEdit}   className="flex-1 border border-gray-200 text-dark py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">✏ Edit</button>
            <button onClick={onDelete} className="flex-1 border border-red-100 text-red-500 py-3.5 rounded-full font-bold text-sm hover:bg-red-50 transition-colors">🗑 Delete</button>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}

// ── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className={`text-3xl font-serif font-bold ${valueClass || 'text-dark'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 font-medium mt-1">{sub}</p>}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
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
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Leads</h2>
          <p className="text-gray-400 mt-1 font-medium">Leads &amp; inquiries · manage your pipeline</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="border border-gray-200 text-gray-600 px-6 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={() => setModal('create')}
            className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-glow"
          >
            + Add New
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"     value={stats.total}     sub="all leads &amp; inquiries" />
        <StatCard label="New"       value={stats.newCount}  sub="awaiting response"  valueClass="text-blue-600" />
        <StatCard label="Inquiries" value={stats.inquiries} sub="from contact form"  valueClass="text-indigo-600" />
        <StatCard label="Converted" value={stats.converted} sub="closed deals"       valueClass="text-emerald-600" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search name, phone, destination…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand transition-colors font-bold text-dark shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Type toggle */}
          <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            {TYPE_TABS.map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1) }}
                className={`px-4 py-2 rounded-full text-xs font-black capitalize transition-all ${typeFilter === t ? 'bg-dark text-white' : 'text-gray-500 hover:text-dark'}`}
              >
                {t === 'all' ? 'All' : t === 'lead' ? '📣 Leads' : '📥 Inquiries'}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${status === s ? 'bg-dark text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-brand hover:text-brand'}`}
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
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {error ? (
          <div className="px-8 py-12 text-center text-red-500 font-bold">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-400 font-bold mb-1">No records found</p>
            <p className="text-gray-300 text-sm font-medium mb-6">Try adjusting your filters or add a new lead</p>
            <button
              onClick={() => setModal('create')}
              className="bg-brand text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-hover transition-colors"
            >
              + Add First Lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 text-left">Type</th>
                  <th className="px-6 py-5 text-left">Client</th>
                  <th className="px-6 py-5 text-left hidden md:table-cell">Details</th>
                  <th className="px-6 py-5 text-left hidden lg:table-cell">Date</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
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
                      className={`hover:bg-gray-50/60 transition-colors group cursor-pointer ${isActive ? 'bg-brand/[0.04] border-l-2 border-l-brand' : ''}`}
                    >
                      {/* Type */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] whitespace-nowrap ${typeConf.color}`}>
                          {typeConf.icon} {typeConf.label}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-5">
                        <p className="font-bold text-dark group-hover:text-brand transition-colors">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{lead.phone}</p>
                      </td>

                      {/* Smart details column */}
                      <td className="px-6 py-5 hidden md:table-cell max-w-[240px]">
                        {lead.type === 'inquiry' ? (
                          <div>
                            {lead.destination && <p className="font-bold text-dark">🌍 {lead.destination}</p>}
                            {(lead.travelDate || lead.travellers) && (
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                {[lead.travelDate, lead.travellers].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {!lead.destination && !lead.travelDate && lead.message && (
                              <p className="text-gray-500 font-medium truncate text-xs">{lead.message}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 font-medium truncate text-xs">{lead.message || '—'}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-gray-500 font-medium hidden lg:table-cell whitespace-nowrap text-xs">
                        {formatDate(lead.created_at)}
                      </td>

                      {/* Status (stop row-click) */}
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        <StatusBadge lead={lead} onUpdate={handleStatusUpdate} />
                      </td>

                      {/* Actions (stop row-click) */}
                      <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleWhatsApp(lead)}
                            className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center shadow-sm"
                            title="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => { setModal(lead); setDrawer(null) }}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                            title="Edit"
                          >✏</button>
                          <button
                            onClick={() => setDeleteTarget(lead)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center justify-center shadow-sm"
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
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-400 font-bold">Showing {leads.length} of {total}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-bold ${p === page ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">›</button>
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
