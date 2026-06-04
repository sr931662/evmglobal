import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'

// ─── Default data factories ───────────────────────────────────────────────────
const emptyFlight = () => ({
  type: 'outbound', airline: '', flightNumber: '', from: '', to: '',
  departure: '', arrival: '', duration: '', baggage: '30 kg', class: 'Economy',
})

const emptyHotel = () => ({
  name: '', stars: 3, location: '', nights: 2,
  roomCategory: '', mealPlan: 'BB', address: '',
})

const emptyDay = (day) => ({ day, title: '', description: '' })

const defaultInclusions = [
  'Return airfare (as specified)',
  'Accommodation as per itinerary',
  'Daily breakfast at hotel',
  'Airport transfers (SIC basis)',
  'Sightseeing as per itinerary',
  'GST & service charges',
]

const defaultExclusions = [
  'Visa fees & processing charges',
  'Travel insurance (recommended)',
  'Personal expenses & tips',
  'Meals unless specified',
  'Camera/entry fees at monuments',
  'Anything not mentioned in inclusions',
]

const defaultNotes = [
  'Rates are subject to availability at time of confirmation.',
  'Check-in time is typically 14:00 and check-out at 12:00.',
  'Valid passport required for all international travel.',
  'EMV is not liable for delays due to weather, strikes, or force majeure.',
]

const defaultTerms = [
  'Advance payment of 25% required to confirm booking.',
  'Balance payment due 30 days prior to departure.',
  'Cancellation charges apply as per supplier policy.',
  'EMV reserves the right to modify itinerary due to operational reasons.',
]

const emptyForm = () => ({
  clientName: '', clientEmail: '', clientPhone: '',
  agentName: 'EMV Team', validUntil: '', tripTitle: '',
  destinations: [''], startDate: '', nights: 5, pax: 2,
  tripType: 'International', taxPercent: 5, currency: 'INR',
  costItems: [{ description: 'Land Package', amount: 0 }],
  flights: [], hotels: [emptyHotel()],
  itinerary: [emptyDay(1)],
  inclusions: [...defaultInclusions],
  exclusions: [...defaultExclusions],
  notes: [...defaultNotes],
  terms: [...defaultTerms],
  status: 'Draft',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeSubtotal(costItems) {
  return costItems.reduce((s, i) => s + (Number(i.amount) || 0), 0)
}

function computeTotal(costItems, taxPercent) {
  const sub = computeSubtotal(costItems)
  return Math.round(sub + sub * (Number(taxPercent) || 0) / 100)
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

function nightsLabel(n) {
  return `${n}N${n + 1}D`
}

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1.5">{label}</label>}
      {children}
    </div>
  )
}

const inp = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white'
const sel = inp + ' appearance-none cursor-pointer'

function Input({ label, className = '', ...props }) {
  return <Field label={label} className={className}><input className={inp} {...props} /></Field>
}

function Select({ label, className = '', children, ...props }) {
  return <Field label={label} className={className}><select className={sel} {...props}>{children}</select></Field>
}

// ─── List editor (inclusions / exclusions / notes / terms) ────────────────────
function ListEditor({ items, onChange, placeholder = 'Add item...' }) {
  const update = (i, val) => { const a = [...items]; a[i] = val; onChange(a) }
  const add    = () => onChange([...items, ''])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inp + ' flex-1'}
            value={item}
            placeholder={placeholder}
            onChange={e => update(i, e.target.value)}
          />
          <button onClick={() => remove(i)} className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center text-base flex-shrink-0">×</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-brand font-bold hover:underline">+ Add item</button>
    </div>
  )
}

// ─── Print/PDF template ───────────────────────────────────────────────────────
function QuotePrint({ quote }) {
  const subtotal = computeSubtotal(quote.costItems)
  const tax      = Math.round(subtotal * (quote.taxPercent || 0) / 100)
  const total    = subtotal + tax

  const outbound = quote.flights?.find(f => f.type === 'outbound')
  const ret      = quote.flights?.find(f => f.type === 'return')

  return (
    <div id="quote-print" style={{ fontFamily: 'Georgia, serif', color: '#111', background: '#fff', maxWidth: 860, margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <table width="100%" style={{ borderBottom: '3px solid #c9a96e', paddingBottom: 24, marginBottom: 28 }}>
        <tbody><tr>
          <td>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 28, fontWeight: 900, letterSpacing: 2, color: '#111' }}>EMV</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 4, color: '#888', marginTop: 2 }}>GLOBAL</div>
          </td>
          <td style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, fontWeight: 700, color: '#111' }}>TRAVEL QUOTE</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#666', marginTop: 4 }}>Ref: <strong>{quote.refNumber}</strong></div>
            {quote.validUntil && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#666' }}>Valid until: {quote.validUntil}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* Client + Trip */}
      <table width="100%" style={{ marginBottom: 28 }}>
        <tbody><tr>
          <td width="50%" style={{ verticalAlign: 'top' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>PREPARED FOR</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{quote.clientName}</div>
            {quote.clientPhone && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 4 }}>{quote.clientPhone}</div>}
            {quote.clientEmail && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>{quote.clientEmail}</div>}
          </td>
          <td width="50%" style={{ verticalAlign: 'top' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>TRIP DETAILS</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{quote.tripTitle}</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 4 }}>
              {[quote.destinations?.join(' · '), nightsLabel(quote.nights), `${quote.pax} Pax`, quote.tripType].filter(Boolean).join(' | ')}
            </div>
            {quote.startDate && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>Departure: {quote.startDate}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* Cost breakdown */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 10 }}>COST BREAKDOWN</div>
        <table width="100%" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {quote.costItems?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '8px 0' }}>{item.description}</td>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '8px 0' }}>
                  {quote.currency} {fmt(item.amount)}
                </td>
              </tr>
            ))}
            {quote.taxPercent > 0 && (
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#777', padding: '8px 0' }}>Tax &amp; Markup ({quote.taxPercent}%)</td>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#777', textAlign: 'right', padding: '8px 0' }}>{quote.currency} {fmt(tax)}</td>
              </tr>
            )}
            <tr style={{ background: '#f9f5ee' }}>
              <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 15, fontWeight: 900, padding: '12px 8px' }}>TOTAL ({quote.pax} Pax)</td>
              <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 15, fontWeight: 900, textAlign: 'right', padding: '12px 8px', color: '#c9a96e' }}>
                {quote.currency} {fmt(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Flights */}
      {(outbound || ret) && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 10 }}>FLIGHT DETAILS</div>
          {[outbound, ret].filter(Boolean).map((fl, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1 }}>{fl.type === 'outbound' ? 'OUTBOUND' : 'RETURN'}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{fl.airline} {fl.flightNumber}</span>
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
                <strong>{fl.from}</strong> {fl.departure} → <strong>{fl.to}</strong> {fl.arrival}
                {fl.duration && <span style={{ color: '#777' }}> · {fl.duration}</span>}
                {fl.class && <span style={{ color: '#777' }}> · {fl.class}</span>}
                {fl.baggage && <span style={{ color: '#777' }}> · Baggage: {fl.baggage}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotels */}
      {quote.hotels?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 10 }}>ACCOMMODATION</div>
          {quote.hotels.map((h, i) => (
            <div key={i} style={{ borderLeft: '3px solid #c9a96e', paddingLeft: 14, marginBottom: 12 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 14 }}>
                {h.name} {'★'.repeat(h.stars || 3)}
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 3 }}>
                {[h.location, `${h.nights}N`, h.roomCategory, h.mealPlan].filter(Boolean).join(' · ')}
              </div>
              {h.address && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#888', marginTop: 2 }}>{h.address}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Itinerary */}
      {quote.itinerary?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 10 }}>ITINERARY</div>
          {quote.itinerary.map((day) => (
            <div key={day.day} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                Day {day.day}{day.title ? ` — ${day.title}` : ''}
              </div>
              {day.description && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#444', lineHeight: 1.7 }}>{day.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Inclusions / Exclusions */}
      {(quote.inclusions?.length > 0 || quote.exclusions?.length > 0) && (
        <table width="100%" style={{ marginBottom: 28, verticalAlign: 'top' }}>
          <tbody><tr>
            {quote.inclusions?.length > 0 && (
              <td width="50%" style={{ verticalAlign: 'top', paddingRight: 20 }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>INCLUSIONS</div>
                {quote.inclusions.map((item, i) => (
                  <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 5, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </td>
            )}
            {quote.exclusions?.length > 0 && (
              <td width="50%" style={{ verticalAlign: 'top' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>EXCLUSIONS</div>
                {quote.exclusions.map((item, i) => (
                  <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 5, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#c62828', fontWeight: 700 }}>✗</span> {item}
                  </div>
                ))}
              </td>
            )}
          </tr></tbody>
        </table>
      )}

      {/* Important Notes */}
      {quote.notes?.filter(Boolean).length > 0 && (
        <div style={{ marginBottom: 24, background: '#fffdf7', border: '1px solid #e8d9b5', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>IMPORTANT NOTES</div>
          {quote.notes.filter(Boolean).map((n, i) => (
            <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 5, color: '#333' }}>• {n}</div>
          ))}
        </div>
      )}

      {/* Terms */}
      {quote.terms?.filter(Boolean).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>TERMS &amp; CONDITIONS</div>
          {quote.terms.filter(Boolean).map((t, i) => (
            <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, marginBottom: 4, color: '#555' }}>{i + 1}. {t}</div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2px solid #c9a96e', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#888' }}>
          Generated by EMV CRM · Confidential · Ease My Vacations · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, fontWeight: 700, color: '#555' }}>
          Agent: {quote.agentName || 'EMV Team'}
        </div>
      </div>
    </div>
  )
}

// ─── Quote Builder Modal ───────────────────────────────────────────────────────
const TABS = ['Client & Trip', 'Costs & Flights', 'Hotels & Itinerary', 'Inclusions & Notes']

function QuoteModal({ quote, onSave, onClose }) {
  useScrollLock()
  const [form, setForm]     = useState(() => quote ? { ...emptyForm(), ...quote } : emptyForm())
  const [tab, setTab]       = useState(0)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)
  const printRef            = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setNested = (key, idx, field, val) => {
    setForm(f => {
      const arr = [...(f[key] || [])]
      arr[idx] = { ...arr[idx], [field]: val }
      return { ...f, [key]: arr }
    })
  }

  const addNested    = (key, factory) => setForm(f => ({ ...f, [key]: [...(f[key] || []), factory()] }))
  const removeNested = (key, idx)     => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }))

  const nights = Number(form.nights) || 1

  // Keep itinerary length in sync with nights
  useEffect(() => {
    setForm(f => {
      const cur = f.itinerary || []
      if (cur.length === nights) return f
      if (cur.length < nights) {
        const added = Array.from({ length: nights - cur.length }, (_, i) => emptyDay(cur.length + i + 1))
        return { ...f, itinerary: [...cur, ...added] }
      }
      return { ...f, itinerary: cur.slice(0, nights) }
    })
  }, [nights])

  async function handleSave() {
    if (!form.clientName.trim() || !form.tripTitle.trim()) {
      setErr('Client name and trip title are required.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const payload = {
        ...form,
        destinations: form.destinations.filter(Boolean),
        costItems:    form.costItems.filter(i => i.description),
        inclusions:   form.inclusions.filter(Boolean),
        exclusions:   form.exclusions.filter(Boolean),
        notes:        form.notes.filter(Boolean),
        terms:        form.terms.filter(Boolean),
        itinerary:    form.itinerary.filter(d => d.title || d.description),
        hotels:       form.hotels.filter(h => h.name),
        flights:      form.flights.filter(f => f.airline || f.flightNumber),
      }
      await onSave(payload)
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  function handlePrint() {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${form.refNumber || 'Quote'}</title>
      <style>@page{size:A4;margin:20mm}*{box-sizing:border-box}body{margin:0;background:#fff}</style>
    </head><body>${printContent}</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const w    = window.open(url, '_blank')
    w?.addEventListener('load', () => { w.print(); URL.revokeObjectURL(url) })
  }

  const subtotal = computeSubtotal(form.costItems)
  const total    = computeTotal(form.costItems, form.taxPercent)

  return (
    /* Overlay — this element scrolls, not the inner card */
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-[#f7f8fa] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] ring-1 ring-black/10 w-full max-w-4xl">

        {/* Header — sticky inside the scrolling overlay */}
        <div className="sticky top-10 z-20 bg-white rounded-t-3xl flex items-center justify-between px-7 py-4 border-b border-gray-200 shadow-sm">
          <div>
            <h2 className="font-serif font-bold text-xl text-dark">
              {quote ? `Edit Quote · ${quote.refNumber}` : 'New Travel Quote'}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Fill in each tab · Save or Print as PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>🖨</span> Print PDF
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-dark text-xl leading-none transition-colors font-bold">×</button>
          </div>
        </div>

        {/* Tab bar — sticky below header */}
        <div className="sticky top-[114px] z-20 bg-white flex gap-1 px-7 py-3 border-b border-gray-200 overflow-x-auto shadow-sm">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                tab === i ? 'bg-dark text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-dark'
              }`}
            >
              {i + 1}. {t}
            </button>
          ))}
        </div>

        {/* Tab content — natural height, modal body is gray so white cards stand out */}
        <div className="px-7 py-6">

          {/* ── Tab 0: Client & Trip ── */}
          {tab === 0 && (
            <div className="space-y-6">

              {/* Client info block */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-gray-200 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Client Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Client Name *" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Full name" />
                  <Input label="Phone" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="+91 99999 99999" />
                  <Input label="Email" type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="client@example.com" />
                  <Input label="Agent / Prepared by" value={form.agentName} onChange={e => set('agentName', e.target.value)} />
                </div>
              </div>

              {/* Trip info block */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-gray-200 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trip Information</p>
                <Input label="Trip Title *" value={form.tripTitle} onChange={e => set('tripTitle', e.target.value)} placeholder="Dubai 5N6D" />

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5">Destinations</label>
                  {form.destinations.map((d, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input className={inp + ' flex-1'} value={d} placeholder="e.g. Dubai" onChange={e => { const a=[...form.destinations]; a[i]=e.target.value; set('destinations',a) }} />
                      {form.destinations.length > 1 && (
                        <button onClick={() => set('destinations', form.destinations.filter((_,idx)=>idx!==i))} className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-base flex-shrink-0 transition-colors">×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => set('destinations', [...form.destinations, ''])} className="text-xs text-brand font-bold hover:underline">+ Add destination</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input label="Start Date" type="text" value={form.startDate} onChange={e => set('startDate', e.target.value)} placeholder="15 Jun 2026" className="col-span-2" />
                  <Input label="Valid Until" type="text" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} placeholder="31 May 2026" className="col-span-2" />
                  <Input label="Nights" type="number" min="1" value={form.nights} onChange={e => set('nights', e.target.value)} />
                  <Input label="Pax" type="number" min="1" value={form.pax} onChange={e => set('pax', e.target.value)} />
                  <Select label="Trip Type" value={form.tripType} onChange={e => set('tripType', e.target.value)}>
                    <option>International</option>
                    <option>Domestic</option>
                  </Select>
                  <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 1: Costs & Flights ── */}
          {tab === 1 && (
            <div className="space-y-6">

              {/* Cost items */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cost Breakdown</p>
                  <button onClick={() => addNested('costItems', () => ({ description: '', amount: 0 }))} className="text-xs text-brand font-bold hover:underline">+ Add item</button>
                </div>
                <div className="space-y-2">
                  {form.costItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className={inp + ' flex-1'} placeholder="e.g. Land Package" value={item.description} onChange={e => setNested('costItems', i, 'description', e.target.value)} />
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                        <span className="px-3 text-xs text-gray-400 font-bold border-r border-gray-200 py-2.5">₹</span>
                        <input type="number" className="w-32 px-3 py-2.5 text-sm focus:outline-none" placeholder="0" value={item.amount} onChange={e => setNested('costItems', i, 'amount', e.target.value)} />
                      </div>
                      <button onClick={() => removeNested('costItems', i)} className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-base flex-shrink-0 transition-colors">×</button>
                    </div>
                  ))}
                </div>

                {/* Summary row */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6 flex-wrap bg-gray-50 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtotal</div>
                    <div className="text-lg font-serif font-bold text-dark mt-0.5">₹{fmt(subtotal)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tax / Markup</div>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                      <input type="number" className="w-14 px-2 py-1.5 text-sm font-bold text-center focus:outline-none" value={form.taxPercent} onChange={e => set('taxPercent', e.target.value)} />
                      <span className="px-2 text-xs text-gray-400 font-bold border-l border-gray-200 py-1.5">%</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grand Total</div>
                    <div className="text-xl font-serif font-bold text-brand mt-0.5">₹{fmt(total)}</div>
                  </div>
                </div>
              </div>

              {/* Flights */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Flights <span className="font-medium normal-case tracking-normal text-gray-400">(leave empty for land-only)</span></p>
                  <button onClick={() => addNested('flights', emptyFlight)} className="text-xs text-brand font-bold hover:underline">+ Add flight</button>
                </div>
                {form.flights.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                    No flights added
                  </div>
                )}
                {form.flights.map((fl, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-5 mb-3 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${fl.type === 'outbound' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                          {fl.type === 'outbound' ? '↗ Outbound' : '↙ Return'}
                        </span>
                        <select className="text-xs font-bold text-gray-500 border-none bg-transparent focus:outline-none cursor-pointer" value={fl.type} onChange={e => setNested('flights', i, 'type', e.target.value)}>
                          <option value="outbound">Mark as Outbound</option>
                          <option value="return">Mark as Return</option>
                        </select>
                      </div>
                      <button onClick={() => removeNested('flights', i)} className="text-xs text-red-400 font-bold hover:underline">Remove</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="Airline" value={fl.airline} onChange={e => setNested('flights',i,'airline',e.target.value)} placeholder="Emirates" />
                      <Input label="Flight No." value={fl.flightNumber} onChange={e => setNested('flights',i,'flightNumber',e.target.value)} placeholder="EK 500" />
                      <Input label="Class" value={fl.class} onChange={e => setNested('flights',i,'class',e.target.value)} placeholder="Economy" />
                      <Input label="From" value={fl.from} onChange={e => setNested('flights',i,'from',e.target.value)} placeholder="BOM — Mumbai" />
                      <Input label="Departure" value={fl.departure} onChange={e => setNested('flights',i,'departure',e.target.value)} placeholder="08:30" />
                      <Input label="Duration" value={fl.duration} onChange={e => setNested('flights',i,'duration',e.target.value)} placeholder="3h 30m" />
                      <Input label="To" value={fl.to} onChange={e => setNested('flights',i,'to',e.target.value)} placeholder="DXB — Dubai" />
                      <Input label="Arrival" value={fl.arrival} onChange={e => setNested('flights',i,'arrival',e.target.value)} placeholder="11:00" />
                      <Input label="Baggage" value={fl.baggage} onChange={e => setNested('flights',i,'baggage',e.target.value)} placeholder="30 kg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: Hotels & Itinerary ── */}
          {tab === 2 && (
            <div className="space-y-6">

              {/* Hotels */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hotels &amp; Accommodation</p>
                  <button onClick={() => addNested('hotels', emptyHotel)} className="text-xs text-brand font-bold hover:underline">+ Add hotel</button>
                </div>
                {form.hotels.map((h, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-5 mb-3 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 text-xs font-black flex items-center justify-center">H{i+1}</div>
                        <span className="text-sm font-bold text-dark">{h.name || `Hotel ${i + 1}`}</span>
                        {h.stars > 0 && <span className="text-xs text-amber-400">{'★'.repeat(h.stars)}</span>}
                      </div>
                      <button onClick={() => removeNested('hotels', i)} className="text-xs text-red-400 font-bold hover:underline">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Input label="Hotel Name" value={h.name} onChange={e => setNested('hotels',i,'name',e.target.value)} placeholder="Atlantis The Palm" className="col-span-2" />
                      <Select label="Stars" value={h.stars} onChange={e => setNested('hotels',i,'stars',Number(e.target.value))}>
                        {[1,2,3,4,5].map(s=><option key={s} value={s}>{s} ★</option>)}
                      </Select>
                      <Input label="City / Location" value={h.location} onChange={e => setNested('hotels',i,'location',e.target.value)} placeholder="Dubai" />
                      <Input label="No. of Nights" type="number" min="1" value={h.nights} onChange={e => setNested('hotels',i,'nights',e.target.value)} />
                      <Input label="Room Category" value={h.roomCategory} onChange={e => setNested('hotels',i,'roomCategory',e.target.value)} placeholder="Deluxe Room" />
                      <Select label="Meal Plan" value={h.mealPlan} onChange={e => setNested('hotels',i,'mealPlan',e.target.value)}>
                        <option value="EP">EP — Room Only</option>
                        <option value="CP">CP — Breakfast</option>
                        <option value="BB">BB — Bed &amp; Breakfast</option>
                        <option value="MAP">MAP — Half Board</option>
                        <option value="AP">AP — Full Board</option>
                        <option value="AI">All Inclusive</option>
                      </Select>
                      <Input label="Address" value={h.address} onChange={e => setNested('hotels',i,'address',e.target.value)} placeholder="Full address" className="col-span-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Itinerary */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  Day-wise Itinerary — {nightsLabel(nights)}
                  <span className="font-medium normal-case tracking-normal text-gray-400 ml-2">auto-synced with nights</span>
                </p>
                <div className="space-y-3">
                  {form.itinerary.map((day, i) => (
                    <div key={i} className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-dark text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                          {day.day}
                        </div>
                        <input
                          className={inp + ' flex-1'}
                          placeholder={`Day ${day.day} title — e.g. Arrival & Desert Safari`}
                          value={day.title}
                          onChange={e => setNested('itinerary', i, 'title', e.target.value)}
                        />
                      </div>
                      <textarea
                        className={inp + ' resize-none'}
                        rows={3}
                        placeholder="Describe activities, sightseeing, meals, transfers for this day..."
                        value={day.description}
                        onChange={e => setNested('itinerary', i, 'description', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 3: Inclusions & Notes ── */}
          {tab === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-4">✓ Inclusions</p>
                  <ListEditor items={form.inclusions} onChange={v => set('inclusions', v)} placeholder="e.g. Return airfare" />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm border-l-4 border-l-red-400">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">✗ Exclusions</p>
                  <ListEditor items={form.exclusions} onChange={v => set('exclusions', v)} placeholder="e.g. Visa fees" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm border-l-4 border-l-amber-400">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-4">⚠ Important Notes</p>
                  <ListEditor items={form.notes} onChange={v => set('notes', v)} placeholder="e.g. Tourism dirham fee charged at hotel" />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm border-l-4 border-l-gray-400">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">§ Terms &amp; Conditions</p>
                  <ListEditor items={form.terms} onChange={v => set('terms', v)} placeholder="e.g. 25% advance required to confirm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — sticky at bottom of viewport while scrolling */}
        <div className="sticky bottom-0 z-20 bg-white rounded-b-3xl flex items-center gap-4 px-7 py-4 border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex-1 min-w-0">
            {err
              ? <p className="text-xs text-red-500 font-bold">{err}</p>
              : <div className="text-xs text-gray-500">
                  <span className="font-black text-dark">₹{fmt(total)}</span>
                  <span className="text-gray-400"> · {form.pax} pax · {nightsLabel(nights)} · {form.tripType}</span>
                </div>
            }
          </div>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-dark text-white text-sm font-bold hover:bg-dark/90 disabled:opacity-50 transition-colors shadow-sm">
            {saving ? 'Saving…' : quote ? 'Save Changes' : 'Create Quote'}
          </button>
        </div>

        </div>{/* end modal card */}
      </div>{/* end centering wrapper */}

      {/* Hidden print template */}
      <div ref={printRef} style={{ display: 'none' }}>
        <QuotePrint quote={{ ...form, refNumber: quote?.refNumber || 'DRAFT' }} />
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusColors = {
  Draft:    'bg-gray-100 text-gray-500',
  Sent:     'bg-blue-50 text-blue-600',
  Accepted: 'bg-green-50 text-green-600',
  Rejected: 'bg-red-50 text-red-500',
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminQuotesPage({ navState }) {
  const [quotes, setQuotes]   = useState([])
  const [total,  setTotal]    = useState(0)
  const [page,   setPage]     = useState(1)
  const [stats, setStats]     = useState({ total: 0, sent: 0, accepted: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('')
  const [modal, setModal]     = useState(null)  // null | 'new' | quote object
  const [deleting, setDeleting] = useState(null)
  const [printQuote, setPrintQuote] = useState(null)
  const printRef = useRef(null)

  // Auto-open pre-filled modal when navigated from a lead
  useEffect(() => {
    if (!navState?.prefillLead) return
    const lead = navState.prefillLead
    const pax = [
      lead.numAdults   ? Number(lead.numAdults)   : null,
      lead.numChildren ? Number(lead.numChildren) : null,
      lead.numInfants  ? Number(lead.numInfants)  : null,
    ].filter(Boolean).reduce((a, b) => a + b, 0)
    const prefilled = {
      ...emptyForm(),
      clientName:  lead.name        || '',
      clientPhone: lead.phone       || '',
      clientEmail: lead.email       || '',
      destinations: lead.destination ? [lead.destination] : [''],
      pax:          pax || 2,
      tripTitle:    lead.destination ? `${lead.destination} Trip` : '',
      startDate:    lead.travelDate  || '',
    }
    setModal(prefilled)
  }, [navState])

  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [q, s] = await Promise.all([
        api.getQuotes({ search, status: filter, page, limit }),
        api.getQuoteStats(),
      ])
      setQuotes(q.quotes || [])
      setTotal(q.pagination?.total || 0)
      setStats(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filter, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setPage(1)
  }, [search, filter])

  async function handleSave(data) {
    const editId = modal && modal !== 'new' ? (modal.id || modal._id?.toString()) : null
    if (editId) {
      await api.updateQuote(editId, data)
    } else {
      await api.createQuote(data)
    }
    setModal(null)
    load()
  }

  async function handleDelete(id) {
    if (!id) return
    await api.deleteQuote(id)
    setDeleting(null)
    load()
  }

  function handlePrint(q) {
    setPrintQuote(q)
    setTimeout(() => {
      const content = printRef.current?.innerHTML
      if (!content) return
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${q.refNumber}</title>
        <style>@page{size:A4;margin:20mm}*{box-sizing:border-box}body{margin:0;background:#fff}</style>
      </head><body>${content}</body></html>`
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url  = URL.createObjectURL(blob)
      const w    = window.open(url, '_blank')
      w?.addEventListener('load', () => { w.print(); URL.revokeObjectURL(url) })
      setPrintQuote(null)
    }, 150)
  }

  const totalPages = Math.ceil(total / limit)

  const statCards = [
    { label: 'Total Quotes', value: stats.total, color: 'bg-dark text-white' },
    { label: 'Sent',         value: stats.sent,     color: 'bg-blue-50 text-blue-700' },
    { label: 'Accepted',     value: stats.accepted,  color: 'bg-green-50 text-green-700' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-dark">Travel Quotes</h1>
          <p className="text-sm text-gray-400 mt-1 font-light">Build, print, and manage client travel proposals</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark text-white rounded-2xl text-sm font-bold hover:bg-dark/90 transition-colors shadow-sm"
        >
          <span>+</span> New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className={`${c.color} rounded-2xl p-5`}>
            <div className="text-3xl font-serif font-bold">{c.value}</div>
            <div className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand flex-1 min-w-48"
          placeholder="Search by client, trip, ref..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option>Draft</option>
          <option>Sent</option>
          <option>Accepted</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <div className="text-4xl mb-3">📋</div>
            No quotes found. Create your first quote.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Ref', 'Client', 'Trip', 'Pax', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map(q => {
                  const total = computeTotal(q.costItems || [], q.taxPercent || 5)
                  return (
                    <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-gray-500">{q.refNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-dark">{q.clientName}</div>
                        {q.clientPhone && <div className="text-xs text-gray-400">{q.clientPhone}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-dark max-w-48 truncate">{q.tripTitle}</div>
                        <div className="text-xs text-gray-400">{q.destinations?.join(', ')} · {nightsLabel(q.nights || 1)}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{q.pax}</td>
                      <td className="px-5 py-4 font-bold text-dark">₹{fmt(total)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[q.status] || statusColors.Draft}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {q.created_at ? new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handlePrint(q)} title="Print PDF" className="w-8 h-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 flex items-center justify-center transition-colors text-base">🖨</button>
                          <button onClick={() => setModal(q)} title="Edit" className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-dark flex items-center justify-center transition-colors text-base">✏</button>
                          <button onClick={() => setDeleting(q)} title="Delete" className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors text-base">🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          showing={quotes.length}
          onPage={setPage}
          label="quotes"
        />
      </div>

      {/* Quote Builder Modal */}
      {modal && (
        <QuoteModal
          quote={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🗑</div>
            <h3 className="font-serif font-bold text-lg text-dark mb-2">Delete Quote?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{deleting.refNumber}</strong> — {deleting.clientName} will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={() => handleDelete(deleting.id || deleting._id?.toString())} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print node for list-view print */}
      <div ref={printRef} style={{ display: 'none' }}>
        {printQuote && <QuotePrint quote={printQuote} />}
      </div>
    </div>
  )
}
