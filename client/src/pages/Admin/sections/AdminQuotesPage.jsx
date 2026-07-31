import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'
import QuotePrintDocument from '../../../components/quote/QuotePrintDocument'
import {
  DEFAULT_TAXES, TAX_PRESETS,
  computeQuote, quoteMarkdown, fmt, num, nightsLabel, tripDays,
  openQuotePrintWindow,
} from '../../../utils/quote'
import styles from './AdminQuotesPage.module.css'

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

const emptyTax = () => ({ name: 'GST', percent: 5 })

const defaultInclusionsMd = [
  '- Return airfare (as specified)',
  '- Accommodation as per itinerary',
  '- Daily breakfast at hotel',
  '- Airport transfers (SIC basis)',
  '- Sightseeing as per itinerary',
].join('\n')

const defaultExclusionsMd = [
  '- Visa fees & processing charges',
  '- Travel insurance (recommended)',
  '- Personal expenses & tips',
  '- Meals unless specified',
  '- Camera/entry fees at monuments',
  '- Anything not mentioned in inclusions',
].join('\n')

const defaultNotesMd = [
  '- Rates are subject to availability at time of confirmation.',
  '- Check-in time is typically **14:00** and check-out at **12:00**.',
  '- Valid passport required for all international travel.',
  '- EMV is not liable for delays due to weather, strikes, or force majeure.',
].join('\n')

const defaultTermsMd = [
  '- Advance payment of **25%** required to confirm booking.',
  '- Balance payment due **30 days** prior to departure.',
  '- Cancellation charges apply as per supplier policy.',
  '- EMV reserves the right to modify itinerary due to operational reasons.',
].join('\n')

const emptyForm = () => ({
  clientName: '', clientEmail: '', clientPhone: '',
  agentName: 'EMV Team', validUntil: '', tripTitle: '',
  destinations: [''], startDate: '', nights: 5,
  adults: 2, children: 0, perAdult: 0, perChild: 0,
  tripType: 'International', currency: 'INR',
  taxes: DEFAULT_TAXES.map(t => ({ ...t })),
  taxPercent: 0,
  costItems: [],
  flights: [], hotels: [emptyHotel()],
  itinerary: [emptyDay(1)],
  inclusionsMd: defaultInclusionsMd,
  exclusionsMd: defaultExclusionsMd,
  notesMd:      defaultNotesMd,
  termsMd:      defaultTermsMd,
  status: 'Draft',
})

/** Existing quote → form state, migrating legacy list/tax fields forward. */
function quoteToForm(quote) {
  const base = emptyForm()
  const md   = quoteMarkdown(quote)
  const calc = computeQuote(quote)
  return {
    ...base,
    ...quote,
    adults:   calc.adults,
    children: calc.children,
    perAdult: calc.perAdult,
    perChild: calc.perChild,
    costItems: quote.costItems?.length ? quote.costItems : [],
    taxes: calc.taxes.length ? calc.taxes.map(t => ({ name: t.name, percent: t.percent })) : [],
    taxPercent: 0,
    inclusionsMd: md.inclusions,
    exclusionsMd: md.exclusions,
    notesMd:      md.notes,
    termsMd:      md.terms,
  }
}

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      {children}
    </div>
  )
}

function Input({ label, className = '', ...props }) {
  return <Field label={label} className={className}><input className={styles.inp} {...props} /></Field>
}

function Select({ label, className = '', children, ...props }) {
  return <Field label={label} className={className}><select className={`${styles.inp} ${styles.sel}`} {...props}>{children}</select></Field>
}

// ─── Markdown note box (inclusions / exclusions / notes / policy) ─────────────
const MD_SNIPPETS = [
  { icon: '•',  title: 'Bullet list',  wrap: (s) => `- ${s || 'item'}` },
  { icon: '1.', title: 'Numbered list', wrap: (s) => `1. ${s || 'item'}` },
  { icon: 'B',  title: 'Bold',          wrap: (s) => `**${s || 'bold'}**` },
  { icon: 'I',  title: 'Italic',        wrap: (s) => `_${s || 'italic'}_` },
  { icon: 'H',  title: 'Heading',       wrap: (s) => `### ${s || 'Heading'}` },
]

function MarkdownBox({ label, value, onChange, placeholder, rows = 8, accent = '' }) {
  const [preview, setPreview] = useState(false)
  const taRef = useRef(null)

  function apply(snippet) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const text  = value || ''
    const inserted = snippet.wrap(text.slice(start, end))
    const next = text.slice(0, start) + inserted + text.slice(end)
    onChange(next)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + inserted.length, start + inserted.length) }, 0)
  }

  return (
    <div className={`${styles.incBlock} ${accent}`}>
      <div className={styles.mdHead}>
        <p className={styles.mdLabel}>{label}</p>
        <div className={styles.mdTools}>
          {!preview && MD_SNIPPETS.map(sn => (
            <button key={sn.title} type="button" title={sn.title} onClick={() => apply(sn)} className={styles.mdToolBtn}>
              {sn.icon}
            </button>
          ))}
          <button type="button" onClick={() => setPreview(p => !p)} className={styles.mdPreviewToggle}>
            {preview ? '✏ Edit' : '👁 Preview'}
          </button>
        </div>
      </div>

      {preview ? (
        <div className={styles.mdPreview}>
          {value?.trim()
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            : <p className={styles.mdPreviewEmpty}>Nothing to preview yet…</p>}
        </div>
      ) : (
        <textarea
          ref={taRef}
          className={`${styles.inp} ${styles.mdTextarea}`}
          rows={rows}
          value={value || ''}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />
      )}
      <p className={styles.mdHint}>Markdown supported — <code>- bullet</code>, <code>**bold**</code>, <code>### heading</code></p>
    </div>
  )
}


// ─── Quote Builder Modal ───────────────────────────────────────────────────────
const TABS = ['Client & Trip', 'Costs & Flights', 'Hotels & Itinerary', 'Inclusions & Notes']

function QuoteModal({ quote, onSave, onClose }) {
  useScrollLock()
  const [form, setForm]     = useState(() => quote ? quoteToForm(quote) : emptyForm())
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

  const nights = Math.max(num(form.nights), 0)
  const days   = tripDays(nights)          // N nights → N+1 days

  // Keep the itinerary one entry per travel day (nights + 1)
  useEffect(() => {
    setForm(f => {
      const cur = f.itinerary || []
      if (cur.length === days) return f
      if (cur.length < days) {
        const added = Array.from({ length: days - cur.length }, (_, i) => emptyDay(cur.length + i + 1))
        return { ...f, itinerary: [...cur, ...added] }
      }
      return { ...f, itinerary: cur.slice(0, days) }
    })
  }, [days])

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
        nights:       num(form.nights),
        adults:       num(form.adults),
        children:     num(form.children),
        perAdult:     num(form.perAdult),
        perChild:     num(form.perChild),
        pax:          num(form.adults) + num(form.children),
        destinations: form.destinations.filter(Boolean),
        costItems:    form.costItems.filter(i => i.description).map(i => ({ ...i, amount: num(i.amount) })),
        taxes:        form.taxes.filter(t => t.name?.trim()).map(t => ({ name: t.name.trim(), percent: num(t.percent) })),
        taxPercent:   0,
        // Legacy list fields are superseded by the markdown boxes
        inclusions: [], exclusions: [], notes: [], terms: [],
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
    openQuotePrintWindow(printRef.current?.innerHTML, quote?.refNumber || 'Quote')
  }

  const calc = computeQuote(form)

  return (
    /* Overlay — this element scrolls, not the inner card */
    <div
      className={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.modalWrap}>
        <div className={styles.modalCard}>

        {/* Header — sticky inside the scrolling overlay */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {quote ? `Edit Quote · ${quote.refNumber}` : 'New Travel Quote'}
            </h2>
            <p className={styles.modalSub}>Fill in each tab · Save or Print as PDF</p>
          </div>
          <div className={styles.headerBtns}>
            <button onClick={handlePrint} className={styles.printBtn}>
              <span>🖨</span> Print PDF
            </button>
            <button onClick={onClose} className={styles.iconClose}>×</button>
          </div>
        </div>

        {/* Tab bar — sticky below header */}
        <div className={styles.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
            >
              {i + 1}. {t}
            </button>
          ))}
        </div>

        {/* Tab content — natural height, modal body is gray so white cards stand out */}
        <div className={styles.tabContent}>

          {/* ── Tab 0: Client & Trip ── */}
          {tab === 0 && (
            <div className={styles.section}>

              {/* Client info block */}
              <div className={`${styles.block} ${styles.blockStack}`}>
                <p className={styles.blockLabel}>Client Information</p>
                <div className={styles.grid2}>
                  <Input label="Client Name *" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Full name" />
                  <Input label="Phone" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="+91 99999 99999" />
                  <Input label="Email" type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="client@example.com" />
                  <Input label="Agent / Prepared by" value={form.agentName} onChange={e => set('agentName', e.target.value)} />
                </div>
              </div>

              {/* Trip info block */}
              <div className={`${styles.block} ${styles.blockStack}`}>
                <p className={styles.blockLabel}>Trip Information</p>
                <Input label="Trip Title *" value={form.tripTitle} onChange={e => set('tripTitle', e.target.value)} placeholder="Dubai 5N6D" />

                <div>
                  <label className={styles.fieldLabelFaint}>Destinations</label>
                  {form.destinations.map((d, i) => (
                    <div key={i} className={styles.rowMb}>
                      <input className={`${styles.inp} ${styles.flex1}`} value={d} placeholder="e.g. Dubai" onChange={e => { const a=[...form.destinations]; a[i]=e.target.value; set('destinations',a) }} />
                      {form.destinations.length > 1 && (
                        <button onClick={() => set('destinations', form.destinations.filter((_,idx)=>idx!==i))} className={styles.removeBtn}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => set('destinations', [...form.destinations, ''])} className={styles.addLink}>+ Add destination</button>
                </div>

                <div className={styles.gridDates}>
                  <Input label="Start Date" type="text" value={form.startDate} onChange={e => set('startDate', e.target.value)} placeholder="15 Jun 2026" className={styles.span2} />
                  <Input label="Valid Until" type="text" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} placeholder="31 May 2026" className={styles.span2} />
                  <Input label="Nights" type="number" min="0" value={form.nights} onChange={e => set('nights', e.target.value)} />
                  <Field label="Duration">
                    <div className={styles.durationPill}>{nightsLabel(nights)}</div>
                  </Field>
                  <Input label="Adults" type="number" min="0" value={form.adults} onChange={e => set('adults', e.target.value)} />
                  <Input label="Children" type="number" min="0" value={form.children} onChange={e => set('children', e.target.value)} />
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
            <div className={styles.section}>

              {/* Per-person pricing */}
              <div className={styles.block}>
                <div className={styles.blockHeadRow}>
                  <p className={styles.blockLabel}>Pricing — per person</p>
                  <span className={styles.normalHint}>Adults &amp; children are priced separately, then totalled</span>
                </div>

                <div className={styles.paxPriceGrid}>
                  <div className={styles.paxPriceCard}>
                    <p className={styles.paxPriceTitle}>Adults</p>
                    <div className={styles.paxPriceRow}>
                      <Input label="Count" type="number" min="0" value={form.adults} onChange={e => set('adults', e.target.value)} />
                      <Field label="Cost per adult">
                        <div className={styles.amountGroup}>
                          <span className={styles.amountPrefix}>₹</span>
                          <input type="number" min="0" className={styles.amountInput} placeholder="0" value={form.perAdult} onChange={e => set('perAdult', e.target.value)} />
                        </div>
                      </Field>
                    </div>
                    <p className={styles.paxPriceTotal}>{calc.adults} × ₹{fmt(calc.perAdult)} = <strong>₹{fmt(calc.adultTotal)}</strong></p>
                  </div>

                  <div className={styles.paxPriceCard}>
                    <p className={styles.paxPriceTitle}>Children</p>
                    <div className={styles.paxPriceRow}>
                      <Input label="Count" type="number" min="0" value={form.children} onChange={e => set('children', e.target.value)} />
                      <Field label="Cost per child">
                        <div className={styles.amountGroup}>
                          <span className={styles.amountPrefix}>₹</span>
                          <input type="number" min="0" className={styles.amountInput} placeholder="0" value={form.perChild} onChange={e => set('perChild', e.target.value)} />
                        </div>
                      </Field>
                    </div>
                    <p className={styles.paxPriceTotal}>{calc.children} × ₹{fmt(calc.perChild)} = <strong>₹{fmt(calc.childTotal)}</strong></p>
                  </div>
                </div>

                {/* Additional charges */}
                <div className={styles.blockHeadRowSm} style={{ marginTop: '1.25rem' }}>
                  <p className={styles.blockLabel}>Additional charges <span className={styles.normalHint}>(optional — visa, upgrades, etc.)</span></p>
                  <button onClick={() => addNested('costItems', () => ({ description: '', amount: 0 }))} className={styles.addLink}>+ Add charge</button>
                </div>
                <div className={styles.listStack}>
                  {form.costItems.length === 0 && <p className={styles.emptyHint}>No additional charges</p>}
                  {form.costItems.map((item, i) => (
                    <div key={i} className={styles.costRow}>
                      <input className={`${styles.inp} ${styles.flex1}`} placeholder="e.g. Visa fees" value={item.description} onChange={e => setNested('costItems', i, 'description', e.target.value)} />
                      <div className={styles.amountGroup}>
                        <span className={styles.amountPrefix}>₹</span>
                        <input type="number" className={styles.amountInput} placeholder="0" value={item.amount} onChange={e => setNested('costItems', i, 'amount', e.target.value)} />
                      </div>
                      <button onClick={() => removeNested('costItems', i)} className={styles.removeBtn}>×</button>
                    </div>
                  ))}
                </div>

                {/* Taxes — any number of named rates (GST, TCS, …) */}
                <div className={styles.blockHeadRowSm} style={{ marginTop: '1.25rem' }}>
                  <p className={styles.blockLabel}>Taxes <span className={styles.normalHint}>(applied on subtotal)</span></p>
                  <button onClick={() => addNested('taxes', emptyTax)} className={styles.addLink}>+ Add tax</button>
                </div>
                <div className={styles.listStack}>
                  {form.taxes.length === 0 && <p className={styles.emptyHint}>No taxes applied</p>}
                  {form.taxes.map((t, i) => {
                    const amount = Math.round(calc.subtotal * num(t.percent) / 100)
                    return (
                      <div key={i} className={styles.costRow}>
                        <input
                          className={`${styles.inp} ${styles.flex1}`}
                          list="tax-presets"
                          placeholder="Tax name — e.g. GST"
                          value={t.name}
                          onChange={e => setNested('taxes', i, 'name', e.target.value)}
                        />
                        <div className={styles.taxBox}>
                          <input type="number" min="0" step="0.01" className={styles.taxInput} value={t.percent} onChange={e => setNested('taxes', i, 'percent', e.target.value)} />
                          <span className={styles.taxSuffix}>%</span>
                        </div>
                        <span className={styles.taxAmount}>₹{fmt(amount)}</span>
                        <button onClick={() => removeNested('taxes', i)} className={styles.removeBtn}>×</button>
                      </div>
                    )
                  })}
                  <datalist id="tax-presets">
                    {TAX_PRESETS.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>

                {/* Summary row */}
                <div className={styles.summary}>
                  <div>
                    <div className={styles.summaryLabel}>Subtotal</div>
                    <div className={styles.summaryVal}>₹{fmt(calc.subtotal)}</div>
                  </div>
                  <div>
                    <div className={styles.summaryLabel}>Taxes</div>
                    <div className={styles.summaryVal}>₹{fmt(calc.taxTotal)}</div>
                  </div>
                  <div>
                    <div className={styles.summaryLabel}>Per person</div>
                    <div className={styles.summaryVal}>₹{fmt(calc.perPerson)}</div>
                  </div>
                  <div className={styles.toRight}>
                    <div className={styles.summaryLabel}>Grand Total ({calc.pax} pax)</div>
                    <div className={styles.summaryTotal}>₹{fmt(calc.total)}</div>
                  </div>
                </div>
              </div>

              {/* Flights */}
              <div>
                <div className={styles.blockHeadRowSm}>
                  <p className={styles.blockLabel}>Flights <span className={styles.normalHint}>(leave empty for land-only)</span></p>
                  <button onClick={() => addNested('flights', emptyFlight)} className={styles.addLink}>+ Add flight</button>
                </div>
                {form.flights.length === 0 && (
                  <div className={styles.emptyBox}>
                    No flights added
                  </div>
                )}
                {form.flights.map((fl, i) => (
                  <div key={i} className={styles.subCard}>
                    <div className={styles.subHead}>
                      <div className={styles.subHeadLeft}>
                        <span className={`${styles.typeTag} ${fl.type === 'outbound' ? styles.typeOut : styles.typeRet}`}>
                          {fl.type === 'outbound' ? '↗ Outbound' : '↙ Return'}
                        </span>
                        <select className={styles.typeSelect} value={fl.type} onChange={e => setNested('flights', i, 'type', e.target.value)}>
                          <option value="outbound">Mark as Outbound</option>
                          <option value="return">Mark as Return</option>
                        </select>
                      </div>
                      <button onClick={() => removeNested('flights', i)} className={styles.removeLink}>Remove</button>
                    </div>
                    <div className={styles.grid3}>
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
            <div className={styles.section}>

              {/* Hotels */}
              <div>
                <div className={styles.blockHeadRowSm}>
                  <p className={styles.blockLabel}>Hotels &amp; Accommodation</p>
                  <button onClick={() => addNested('hotels', emptyHotel)} className={styles.addLink}>+ Add hotel</button>
                </div>
                {form.hotels.map((h, i) => (
                  <div key={i} className={styles.subCard}>
                    <div className={styles.subHead}>
                      <div className={styles.subHeadLeft}>
                        <div className={styles.hotelTag}>H{i+1}</div>
                        <span className={styles.hotelName}>{h.name || `Hotel ${i + 1}`}</span>
                        {h.stars > 0 && <span className={styles.stars}>{'★'.repeat(h.stars)}</span>}
                      </div>
                      <button onClick={() => removeNested('hotels', i)} className={styles.removeLink}>Remove</button>
                    </div>
                    <div className={styles.grid23}>
                      <Input label="Hotel Name" value={h.name} onChange={e => setNested('hotels',i,'name',e.target.value)} placeholder="Atlantis The Palm" className={styles.span2} />
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
                      <Input label="Address" value={h.address} onChange={e => setNested('hotels',i,'address',e.target.value)} placeholder="Full address" className={styles.span2} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Itinerary */}
              <div>
                <p className={styles.blockLabelMb}>
                  Day-wise Itinerary — {nightsLabel(nights)}
                  <span className={styles.normalHint}> {days} days auto-synced with {nights} nights</span>
                </p>
                <div className={styles.listStack}>
                  {form.itinerary.map((day, i) => (
                    <div key={i} className={styles.dayCard}>
                      <div className={styles.dayHead}>
                        <div className={styles.dayNum}>
                          {day.day}
                        </div>
                        <input
                          className={`${styles.inp} ${styles.flex1}`}
                          placeholder={`Day ${day.day} title — e.g. Arrival & Desert Safari`}
                          value={day.title}
                          onChange={e => setNested('itinerary', i, 'title', e.target.value)}
                        />
                      </div>
                      <textarea
                        className={`${styles.inp} ${styles.resizeNone}`}
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
            <div className={styles.section}>
              <div className={styles.grid2}>
                <MarkdownBox
                  label="✓ Inclusions"
                  accent={styles.incGreen}
                  value={form.inclusionsMd}
                  onChange={v => set('inclusionsMd', v)}
                  placeholder={'- Return airfare\n- Daily breakfast'}
                />
                <MarkdownBox
                  label="✗ Exclusions"
                  accent={styles.incRed}
                  value={form.exclusionsMd}
                  onChange={v => set('exclusionsMd', v)}
                  placeholder={'- Visa fees\n- Travel insurance'}
                />
              </div>
              <div className={styles.grid2}>
                <MarkdownBox
                  label="⚠ Important Notes"
                  accent={styles.incAmber}
                  value={form.notesMd}
                  onChange={v => set('notesMd', v)}
                  placeholder={'- Tourism dirham fee charged at hotel'}
                />
                <MarkdownBox
                  label="§ Policy & Terms"
                  accent={styles.incGray}
                  value={form.termsMd}
                  onChange={v => set('termsMd', v)}
                  placeholder={'- 25% advance required to confirm'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer — sticky at bottom of viewport while scrolling */}
        <div className={styles.modalFooter}>
          <div className={styles.footInfo}>
            {err
              ? <p className={styles.footErr}>{err}</p>
              : <div className={styles.footSummary}>
                  <span className={styles.footTotal}>₹{fmt(calc.total)}</span>
                  <span className={styles.footMuted}> · {calc.pax} pax · {nightsLabel(nights)} · {form.tripType}</span>
                </div>
            }
          </div>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving…' : quote ? 'Save Changes' : 'Create Quote'}
          </button>
        </div>

        </div>{/* end modal card */}
      </div>{/* end centering wrapper */}

      {/* Hidden print template */}
      <div ref={printRef} style={{ display: 'none' }}>
        <QuotePrintDocument quote={{ ...form, refNumber: quote?.refNumber || 'DRAFT' }} />
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusColors = {
  Draft:    styles.stDraft,
  Sent:     styles.stSent,
  Accepted: styles.stAccepted,
  Rejected: styles.stRejected,
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
    const adults   = num(lead.numAdults)
    const children = num(lead.numChildren) + num(lead.numInfants)
    const prefilled = {
      ...emptyForm(),
      clientName:  lead.name        || '',
      clientPhone: lead.phone       || '',
      clientEmail: lead.email       || '',
      destinations: lead.destination ? [lead.destination] : [''],
      adults:       adults || 2,
      children,
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
      openQuotePrintWindow(printRef.current?.innerHTML, q.refNumber)
      setPrintQuote(null)
    }, 150)
  }

  const totalPages = Math.ceil(total / limit)

  const statCards = [
    { label: 'Total Quotes', value: stats.total, color: styles.statDark },
    { label: 'Sent',         value: stats.sent,     color: styles.statBlue },
    { label: 'Accepted',     value: stats.accepted,  color: styles.statGreen },
  ]

  return (
    <div>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Travel Quotes</h1>
          <p className={styles.pageSub}>Build, print, and manage client travel proposals</p>
        </div>
        <button onClick={() => setModal('new')} className={styles.newBtn}>
          <span>+</span> New Quote
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} className={`${styles.statCard} ${card.color}`}>
            <div className={styles.statValue}>{card.value}</div>
            <div className={styles.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.filterSearch}
          placeholder="Search by client, trip, ref..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
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
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : quotes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            No quotes found. Create your first quote.
          </div>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  {['Ref', 'Client', 'Trip', 'Pax', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map(q => {
                  const qc = computeQuote(q)
                  return (
                    <tr key={q.id} className={styles.row}>
                      <td className={styles.td}>
                        <span className={styles.refText}>{q.refNumber}</span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.clientName}>{q.clientName}</div>
                        {q.clientPhone && <div className={styles.subText}>{q.clientPhone}</div>}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.tripTitle}>{q.tripTitle}</div>
                        <div className={styles.subText}>{q.destinations?.join(', ')} · {nightsLabel(q.nights || 1)}</div>
                      </td>
                      <td className={styles.tdMuted}>{qc.pax}</td>
                      <td className={styles.tdStrong}>₹{fmt(qc.total)}</td>
                      <td className={styles.td}>
                        <span className={`${styles.statusBadge} ${statusColors[q.status] || statusColors.Draft}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className={styles.tdDate}>
                        {q.created_at ? new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.rowActions}>
                          <button onClick={() => handlePrint(q)} title="Print PDF" className={`${styles.actBtn} ${styles.actPrint}`}>🖨</button>
                          <button onClick={() => setModal(q)} title="Edit" className={`${styles.actBtn} ${styles.actEdit}`}>✏</button>
                          <button onClick={() => setDeleting(q)} title="Delete" className={`${styles.actBtn} ${styles.actDelete}`}>🗑</button>
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
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>🗑</div>
            <h3 className={styles.confirmTitle}>Delete Quote?</h3>
            <p className={styles.confirmText}>
              <strong>{deleting.refNumber}</strong> — {deleting.clientName} will be permanently deleted.
            </p>
            <div className={styles.confirmActions}>
              <button onClick={() => setDeleting(null)} className={styles.confirmCancel}>Cancel</button>
              <button onClick={() => handleDelete(deleting.id || deleting._id?.toString())} className={styles.confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print node for list-view print */}
      <div ref={printRef} style={{ display: 'none' }}>
        {printQuote && <QuotePrintDocument quote={printQuote} />}
      </div>
    </div>
  )
}
