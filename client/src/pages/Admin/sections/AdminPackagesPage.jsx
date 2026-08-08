import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { formatPrice } from '../../../utils/currency'
import s from './AdminPackagesPage.module.css'

const cx = (...values) => values.filter(Boolean).join(' ')

const CATEGORIES = ['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness']

const ACTIVITY_ICONS = ['✈', '🚗', '🚢', '🏨', '🍽', '🎭', '🧘', '🏖', '⛵', '🏔', '🎿', '🛕', '🌅', '🤿', '📍', '🚌', '🚂', '🛳', '🎪', '🏛', '🌊', '🦁', '🌋', '🏰', '🎑']

const FLIGHT_TYPES   = ['Departure', 'Return', 'Connecting']
const CABIN_CLASSES  = ['Economy', 'Premium Economy', 'Business', 'First Class']
const STOPS_OPTIONS  = ['0 (Non-Stop)', '1 Stop', '2 Stops', '3+ Stops']
const MEAL_OPTIONS   = ['', 'Meal Included', 'Snack', 'Vegetarian', 'Non-Vegetarian', 'No Meal']
const MEAL_PLAN_OPTIONS = ['EP', 'CP', 'MAP', 'AP', 'AI', 'UAI']
const MEAL_PLAN_LABELS  = { EP: 'EP – Room Only', CP: 'CP – Breakfast', MAP: 'MAP – Breakfast + Dinner', AP: 'AP – All Meals', AI: 'AI – All Inclusive', UAI: 'UAI – Ultra All Inclusive' }
const TRANSPORT_OPTIONS = ['', 'Private Car / SUV', 'Shared Transfer', 'Flight', 'Train', 'Bus', 'Boat / Ferry', 'Cruise Ship', 'Walk / Self', 'Overnight Train', 'Overnight Bus', 'Helicopter']
const DAY_MEAL_OPTS = ['Breakfast', 'Lunch', 'Dinner']

const categoryColors = {
  Honeymoon: s.catHoneymoon,
  Luxury:    s.catLuxury,
  Domestic:  s.catDomestic,
  Family:    s.catFamily,
  Wellness:  s.catWellness,
}

// ── Inclusions / Exclusions / Notes unified markdown helpers ──────────────────
const CONTENT_MD_TEMPLATE = `## ✅ Inclusions
- Airport transfers (both ways)
- Luxury hotel stay on twin-sharing basis
- Daily breakfast included
- Sightseeing as per itinerary
- Dedicated tour manager

## ❌ Exclusions
- Visa fees & processing charges
- City taxes (payable directly at hotel)
- Personal expenses & shopping
- Tips & gratuities
- Any activity not mentioned above

## 📋 Important Notes
- Carry valid government photo ID at all times
- Check visa requirements well in advance of travel`

function buildContentMarkdown(inclusions, exclusions, notes) {
  const parts = []
  if (inclusions.length)
    parts.push('## ✅ Inclusions\n' + inclusions.map(s => `- ${s}`).join('\n'))
  if (exclusions.length)
    parts.push('## ❌ Exclusions\n' + exclusions.map(s => `- ${s}`).join('\n'))
  if (notes.length)
    parts.push('## 📋 Important Notes\n' + notes.map(s => `- ${s}`).join('\n'))
  return parts.length ? parts.join('\n\n') : ''
}

function parseContentMarkdown(md) {
  const result = { inclusions: [], exclusions: [], notes: [] }
  if (!md?.trim()) return result
  let current = 'inclusions'
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (/^##.*inclusion/i.test(line) || /^##.*✅/i.test(line))  { current = 'inclusions'; continue }
    if (/^##.*exclusion/i.test(line) || /^##.*❌/i.test(line))  { current = 'exclusions'; continue }
    if (/^##.*note/i.test(line)      || /^##.*📋/i.test(line))  { current = 'notes';      continue }
    if (/^#{1,6}\s/.test(line)) continue
    const bullet = line.replace(/^[-*+]\s+/, '').trim()
    if (bullet) result[current].push(bullet)
  }
  return result
}

const emptyActivity = () => ({ time: '', description: '', icon: '📍' })
const emptyHotel    = () => ({
  name: '', location: '', stars: '4', roomType: '', mealPlan: 'CP',
  nights: '', checkIn: '', checkOut: '', amenities: '', address: '', contact: '',
})
const emptyFlight   = () => ({
  type: 'Departure', airline: '', flightNumber: '', from: '', to: '',
  date: '', time: '', arrivalTime: '', duration: '', stops: '0',
  cabinClass: 'Economy', baggage: '', meal: '', pnr: '', terminal: '',
})
const emptyDay = (n) => ({ day: n, title: '', note: '', activities: [emptyActivity()], transport: '', mealsIncluded: [] })
const emptyForm = () => ({
  title: '', category: 'Honeymoon', nights: '', price: '', priceValue: '',
  description: '', destinations: [], highlights: '', image: '', status: 'Active',
  contentMarkdown: CONTENT_MD_TEMPLATE,
  itinerary: [], flights: [], hotels: [],
})

// ── Small reusable input ──────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className={s.fieldWrap}>
      <label className={s.fieldLabel}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className={cx(s.fieldInput, s.fieldTextarea)}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={s.fieldInput}
        />
      )}
    </div>
  )
}

// ── Markdown toolbar groups ───────────────────────────────────────────────────
const MD_TOOLBAR_GROUPS = [
  { label: 'Headings', items: [
    { icon: 'H1', title: 'Heading 1',         type: 'prefix', value: '# '    },
    { icon: 'H2', title: 'Heading 2',         type: 'prefix', value: '## '   },
    { icon: 'H3', title: 'Heading 3 / Sub',   type: 'prefix', value: '### '  },
  ]},
  { label: 'Format', items: [
    { icon: 'B',   title: 'Bold  (Ctrl+B)',   type: 'wrap',   value: '**', ph: 'bold text',   btnStyle: { fontWeight: 800 } },
    { icon: 'I',   title: 'Italic (Ctrl+I)',  type: 'wrap',   value: '*',  ph: 'italic text', btnStyle: { fontStyle: 'italic' } },
    { icon: 'S̶',   title: 'Strikethrough',    type: 'wrap',   value: '~~', ph: 'text',        btnStyle: { textDecoration: 'line-through' } },
    { icon: '`',   title: 'Inline Code',      type: 'wrap',   value: '`',  ph: 'code',        btnStyle: { fontFamily: 'monospace', fontSize: '11px' } },
    { icon: '🔗',  title: 'Link  (Ctrl+K)',   type: 'tpl',    value: '[link text](https://)' },
  ]},
  { label: 'Lists', items: [
    { icon: '•',  title: 'Bullet List',       type: 'prefix', value: '- '      },
    { icon: '1.', title: 'Numbered List',     type: 'prefix', value: '1. '     },
    { icon: '☑',  title: 'Task / Checklist', type: 'prefix', value: '- [ ] '  },
  ]},
  { label: 'Blocks', items: [
    { icon: '❝',   title: 'Blockquote',       type: 'prefix', value: '> '       },
    { icon: '⊞',   title: 'Table',            type: 'block',  value: '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |\n' },
    { icon: '——',  title: 'Divider / HR',     type: 'block',  value: '\n---\n'  },
    { icon: '{ }', title: 'Code Block',       type: 'block',  value: '\n```\n\n```\n', btnStyle: { fontFamily: 'monospace', fontSize: '10px' } },
  ]},
]

function applyMdAction(value, ta, btn) {
  const start = ta.selectionStart
  const end   = ta.selectionEnd
  const sel   = value.slice(start, end)
  let nv, cs, ce

  if (btn.type === 'wrap') {
    const w = btn.value
    if (sel) {
      nv = value.slice(0, start) + w + sel + w + value.slice(end)
      cs = start + w.length; ce = end + w.length
    } else {
      const ph = btn.ph || 'text'
      nv = value.slice(0, start) + w + ph + w + value.slice(end)
      cs = start + w.length; ce = cs + ph.length
    }
  } else if (btn.type === 'prefix') {
    const ls = value.lastIndexOf('\n', start - 1) + 1
    const p  = btn.value
    if (value.slice(ls).startsWith(p)) {
      nv = value.slice(0, ls) + value.slice(ls + p.length)
      cs = Math.max(ls, start - p.length)
      ce = Math.max(ls, end - p.length)
    } else {
      nv = value.slice(0, ls) + p + value.slice(ls)
      cs = start + p.length; ce = end + p.length
    }
  } else if (btn.type === 'block') {
    nv = value.slice(0, start) + btn.value + value.slice(end)
    cs = ce = start + btn.value.length
  } else {
    nv = value.slice(0, start) + btn.value + value.slice(end)
    cs = start; ce = start + btn.value.length
  }
  return { nv, cs, ce }
}

// ── Markdown Editor — toolbar, split view, keyboard shortcuts ─────────────────
function MarkdownEditor({ label, hint, value, onChange, placeholder, bgClass, borderClass, rows = 8 }) {
  const [mode, setMode] = useState('edit') // 'edit' | 'split' | 'preview'
  const taRef = useRef(null)

  const apply = (btn) => {
    const ta = taRef.current
    if (!ta) return
    const { nv, cs, ce } = applyMdAction(value, ta, btn)
    onChange(nv)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(cs, ce) }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const kmap = {
        b: { type: 'wrap', value: '**', ph: 'bold text' },
        i: { type: 'wrap', value: '*',  ph: 'italic text' },
        k: { type: 'tpl',  value: '[link text](https://)' },
      }
      const btn = kmap[e.key.toLowerCase()]
      if (btn) {
        e.preventDefault()
        const ta = taRef.current
        if (!ta) return
        const { nv, cs, ce } = applyMdAction(value, ta, btn)
        onChange(nv)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(cs, ce) }, 0)
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      if (!ta) return
      const s = ta.selectionStart
      const nv = value.slice(0, s) + '  ' + value.slice(s)
      onChange(nv)
      setTimeout(() => { ta.focus(); ta.setSelectionRange(s + 2, s + 2) }, 0)
    }
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0

  function Toolbar() {
    return (
      <div className={s.mdToolbar}>
        {MD_TOOLBAR_GROUPS.map((grp, gi) => (
          <div key={grp.label} className={s.mdToolbarGroup}>
            {gi > 0 && <span className={s.mdToolbarDivider} />}
            {grp.items.map(btn => (
              <button
                key={btn.icon}
                type="button"
                title={btn.title}
                onClick={() => apply(btn)}
                style={btn.btnStyle}
                className={s.mdToolbarBtn}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ))}
        {/* Group labels on right */}
        <div className={s.mdToolbarMeta}>
          {MD_TOOLBAR_GROUPS.map(g => (
            <span key={g.label} className={s.mdToolbarMetaLabel}>{g.label}</span>
          ))}
        </div>
      </div>
    )
  }

  const minH = `${rows * 22}px`
  const editorCls = s.mdTextarea

  const PreviewPane = () => (
    <div className={cx(s.mdPreview, bgClass)}
      style={{ minHeight: minH }}>
      {value.trim()
        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        : <p className={s.mdPreviewEmpty}>Preview renders here…</p>
      }
    </div>
  )

  return (
    <div>
      {/* Header row */}
      <div className={s.mdHeader}>
        <div>
          <label className={s.fieldLabelCompact}>{label}</label>
          {hint && <span className={s.mdHint}>{hint}</span>}
        </div>
        {/* Mode toggle */}
        <div className={s.mdModeToggle}>
          {[
            { id: 'edit',    icon: '✏',  name: 'Edit'    },
            { id: 'split',   icon: '⧉',  name: 'Split'   },
            { id: 'preview', icon: '👁',  name: 'Preview' },
          ].map(m => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)} title={m.name}
              className={cx(s.mdModeBtn, mode === m.id ? s.mdModeBtnActive : s.mdModeBtnInactive)}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Container */}
      <div className={cx(s.mdContainer, borderClass)}>
        {/* Toolbar — hidden in pure preview mode */}
        {mode !== 'preview' && <Toolbar />}

        {/* Editor area */}
        {mode === 'edit' && (
          <textarea
            ref={taRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${editorCls} ${bgClass}`}
            style={{ minHeight: minH }}
          />
        )}

        {mode === 'preview' && <PreviewPane />}

        {mode === 'split' && (
          <div className={s.mdSplit} style={{ minHeight: minH }}>
            <textarea
              ref={taRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`${editorCls} ${bgClass}`}
            />
            <PreviewPane />
          </div>
        )}

        {/* Footer: stats + shortcut hints */}
        <div className={s.mdFooter}>
          <span className={s.mdFooterMeta}>
            {words} word{words !== 1 ? 's' : ''} · {value.length} chars
          </span>
          <span className={s.mdFooterHints}>
            Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link · Tab Indent
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Destinations multi-select ─────────────────────────────────────────────────
function DestinationsPicker({ selected, onChange }) {
  const [available, setAvailable] = useState([])
  useEffect(() => {
    api.getDestinations().then(d => setAvailable(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const toggle = (name) => {
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])
  }

  return (
    <div>
      <label className={s.fieldLabel}>Destinations</label>
      {available.length === 0 ? (
        <p className={s.destinationsEmpty}>
          No destinations available — add destinations first
        </p>
      ) : (
        <div className={s.destinationsList}>
          {available.map(dest => {
            const name = dest.name
            const isSelected = selected.includes(name)
            return (
              <button
                key={dest.id || dest._id}
                type="button"
                onClick={() => toggle(name)}
                className={cx(s.destinationChip, isSelected ? s.destinationChipActive : s.destinationChipInactive)}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}
      {selected.length > 0 && (
        <p className={s.destinationsSelected}>Selected: {selected.join(', ')}</p>
      )}
    </div>
  )
}

// ── Flights builder ───────────────────────────────────────────────────────────
function FlightsBuilder({ flights, onChange }) {
  const add    = () => onChange([...flights, emptyFlight()])
  const remove = (i) => onChange(flights.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(flights.map((f, idx) => idx === i ? { ...f, [key]: val } : f))

  return (
    <div className={`${s.panel} ${s.panelFlight}`}>
      <div className={`${s.panelHead} ${s.panelHeadFlight}`}>
        <div className={s.panelHeadLeft}>
          <div className={`${s.panelIcon} ${s.panelIconFlight}`}>✈</div>
          <div>
            <h4 className={`${s.panelTitle} ${s.panelTitleFlight}`}>Flight Details</h4>
            <p className={`${s.panelCount} ${s.panelCountFlight}`}>
              {flights.length === 0 ? 'No flights added' : `${flights.length} flight${flights.length > 1 ? 's' : ''} added`}
            </p>
          </div>
        </div>
        <button onClick={add} className={`${s.addBtn} ${s.addBtnFlight}`}>+ Add Flight</button>
      </div>

      <div className={s.panelBody}>
        {flights.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIcon}>✈</span>
            <p className={s.emptyText}>No flights added yet — click + Add Flight</p>
          </div>
        ) : (
          <div className={s.cardList}>
            {flights.map((fl, i) => (
              <div key={i} className={`${s.card} ${s.cardFlight}`}>
                <div className={`${s.cardHead} ${s.cardHeadFlight}`}>
                  <div className={s.cardHeadLeft}>
                    <span className={`${s.cardIndex} ${s.cardIndexFlight}`}>{i + 1}</span>
                    <select value={fl.type} onChange={e => update(i, 'type', e.target.value)}
                      className={`${s.cardTypeSel} ${s.cardTypeSelFlight}`}>
                      {FLIGHT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {fl.from && fl.to && (
                      <span className={`${s.cardRoutePill} ${s.cardRoutePillFlight}`}>{fl.from} → {fl.to}</span>
                    )}
                  </div>
                  <button onClick={() => remove(i)} className={s.removeBtn}>✕</button>
                </div>
                <div className={`${s.cardFields} ${s.cardFieldsFlight}`}>
                  <div className={s.grid4}>
                    <div><label className={s.lbl}>Airline</label><input type="text" value={fl.airline} onChange={e => update(i, 'airline', e.target.value)} placeholder="e.g. IndiGo" className={s.inp} /></div>
                    <div><label className={s.lbl}>Flight No.</label><input type="text" value={fl.flightNumber} onChange={e => update(i, 'flightNumber', e.target.value)} placeholder="e.g. 6E-204" className={s.inp} /></div>
                    <div><label className={s.lbl}>Cabin Class</label><select value={fl.cabinClass || 'Economy'} onChange={e => update(i, 'cabinClass', e.target.value)} className={s.inp}>{CABIN_CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className={s.lbl}>Date / Day Ref</label><input type="text" value={fl.date} onChange={e => update(i, 'date', e.target.value)} placeholder="Day 1 / 12 Jun" className={s.inp} /></div>
                  </div>
                  <div className={s.grid6}>
                    <div className={s.col2}><label className={s.lbl}>From (Origin)</label><input type="text" value={fl.from} onChange={e => update(i, 'from', e.target.value)} placeholder="Delhi (DEL)" className={s.inp} /></div>
                    <div className={s.col2}><label className={s.lbl}>To (Destination)</label><input type="text" value={fl.to} onChange={e => update(i, 'to', e.target.value)} placeholder="Srinagar (SXR)" className={s.inp} /></div>
                    <div><label className={s.lbl}>Departs</label><input type="text" value={fl.time} onChange={e => update(i, 'time', e.target.value)} placeholder="06:30 AM" className={s.inp} /></div>
                    <div><label className={s.lbl}>Arrives</label><input type="text" value={fl.arrivalTime || ''} onChange={e => update(i, 'arrivalTime', e.target.value)} placeholder="09:15 AM" className={s.inp} /></div>
                  </div>
                  <div className={s.grid6}>
                    <div><label className={s.lbl}>Duration</label><input type="text" value={fl.duration || ''} onChange={e => update(i, 'duration', e.target.value)} placeholder="2h 45m" className={s.inp} /></div>
                    <div><label className={s.lbl}>Stops</label><select value={fl.stops || '0'} onChange={e => update(i, 'stops', e.target.value)} className={s.inp}>{STOPS_OPTIONS.map((st, idx) => <option key={st} value={String(idx)}>{st}</option>)}</select></div>
                    <div><label className={s.lbl}>Terminal</label><input type="text" value={fl.terminal || ''} onChange={e => update(i, 'terminal', e.target.value)} placeholder="T2" className={s.inp} /></div>
                    <div><label className={s.lbl}>Baggage</label><input type="text" value={fl.baggage || ''} onChange={e => update(i, 'baggage', e.target.value)} placeholder="15 kg + 7 kg" className={s.inp} /></div>
                    <div><label className={s.lbl}>Meal</label><select value={fl.meal || ''} onChange={e => update(i, 'meal', e.target.value)} className={s.inp}>{MEAL_OPTIONS.map(m => <option key={m} value={m}>{m || 'Select…'}</option>)}</select></div>
                    <div><label className={s.lbl}>PNR / Ref</label><input type="text" value={fl.pnr || ''} onChange={e => update(i, 'pnr', e.target.value)} placeholder="ABC123" className={s.inp} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Hotels builder ────────────────────────────────────────────────────────────
function HotelsBuilder({ hotels, onChange }) {
  const add    = () => onChange([...hotels, emptyHotel()])
  const remove = (i) => onChange(hotels.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(hotels.map((h, idx) => idx === i ? { ...h, [key]: val } : h))

  return (
    <div className={`${s.panel} ${s.panelHotel}`}>
      <div className={`${s.panelHead} ${s.panelHeadHotel}`}>
        <div className={s.panelHeadLeft}>
          <div className={`${s.panelIcon} ${s.panelIconHotel}`}>🏨</div>
          <div>
            <h4 className={`${s.panelTitle} ${s.panelTitleHotel}`}>Hotel Details</h4>
            <p className={`${s.panelCount} ${s.panelCountHotel}`}>
              {hotels.length === 0 ? 'No hotels added' : `${hotels.length} hotel${hotels.length > 1 ? 's' : ''} added`}
            </p>
          </div>
        </div>
        <button onClick={add} className={`${s.addBtn} ${s.addBtnHotel}`}>+ Add Hotel</button>
      </div>

      <div className={s.panelBody}>
        {hotels.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIcon}>🏨</span>
            <p className={s.emptyText}>No hotels added yet — click + Add Hotel</p>
          </div>
        ) : (
          <div className={s.cardList}>
            {hotels.map((h, i) => (
              <div key={i} className={`${s.card} ${s.cardHotel}`}>
                <div className={`${s.cardHead} ${s.cardHeadHotel}`}>
                  <div className={s.cardHeadLeft}>
                    <span className={`${s.cardIndex} ${s.cardIndexHotel}`}>{i + 1}</span>
                    <span className={s.cardNamePillHotel}>{h.name || `Hotel ${i + 1}`}</span>
                    {h.stars && <span className={s.cardStars}>{'★'.repeat(Number(h.stars))}</span>}
                    {h.location && <span className={s.cardLocPill}>📍 {h.location}</span>}
                  </div>
                  <button onClick={() => remove(i)} className={s.removeBtn}>✕</button>
                </div>
                <div className={`${s.cardFields} ${s.cardFieldsHotel}`}>
                  <div className={s.grid6}>
                    <div className={s.col3}><label className={s.lbl}>Hotel Name</label><input type="text" value={h.name || ''} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. The Lalit Grand Palace" className={s.inp} /></div>
                    <div><label className={s.lbl}>Stars</label><select value={h.stars || '4'} onChange={e => update(i, 'stars', e.target.value)} className={s.inp}>{['1','2','3','4','5'].map(st => <option key={st} value={st}>{st} ★</option>)}</select></div>
                    <div><label className={s.lbl}>Room Type</label><input type="text" value={h.roomType || ''} onChange={e => update(i, 'roomType', e.target.value)} placeholder="Deluxe Double" className={s.inp} /></div>
                    <div><label className={s.lbl}>Meal Plan</label><select value={h.mealPlan || 'CP'} onChange={e => update(i, 'mealPlan', e.target.value)} className={s.inp}>{MEAL_PLAN_OPTIONS.map(m => <option key={m} value={m}>{MEAL_PLAN_LABELS[m]}</option>)}</select></div>
                  </div>
                  <div className={s.grid6}>
                    <div className={s.col2}><label className={s.lbl}>Location / Area</label><input type="text" value={h.location || ''} onChange={e => update(i, 'location', e.target.value)} placeholder="Dal Lake, Srinagar" className={s.inp} /></div>
                    <div><label className={s.lbl}>Check-in</label><input type="text" value={h.checkIn || ''} onChange={e => update(i, 'checkIn', e.target.value)} placeholder="Day 1 / 12 Jun" className={s.inp} /></div>
                    <div><label className={s.lbl}>Check-out</label><input type="text" value={h.checkOut || ''} onChange={e => update(i, 'checkOut', e.target.value)} placeholder="Day 4 / 15 Jun" className={s.inp} /></div>
                    <div><label className={s.lbl}>Nights</label><input type="number" min="1" value={h.nights || ''} onChange={e => update(i, 'nights', e.target.value)} placeholder="3" className={s.inp} /></div>
                    <div><label className={s.lbl}>Contact</label><input type="text" value={h.contact || ''} onChange={e => update(i, 'contact', e.target.value)} placeholder="+91 xxxx xxxxxx" className={s.inp} /></div>
                  </div>
                  <div className={s.grid2}>
                    <div><label className={s.lbl}>Full Address</label><input type="text" value={h.address || ''} onChange={e => update(i, 'address', e.target.value)} placeholder="Srinagar, Jammu & Kashmir" className={s.inp} /></div>
                    <div><label className={s.lbl}>Amenities (comma-separated)</label><input type="text" value={h.amenities || ''} onChange={e => update(i, 'amenities', e.target.value)} placeholder="Pool, Spa, Gym, Free WiFi" className={s.inp} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Itinerary builder ─────────────────────────────────────────────────────────
function ItineraryBuilder({ itinerary, onChange }) {
  const addDay = () => onChange([...itinerary, emptyDay(itinerary.length + 1)])

  const removeDay = (di) => {
    const updated = itinerary.filter((_, i) => i !== di).map((d, i) => ({ ...d, day: i + 1 }))
    onChange(updated)
  }

  const updateDay = (di, key, val) => {
    onChange(itinerary.map((d, i) => i === di ? { ...d, [key]: val } : d))
  }

  const addActivity = (di) => {
    onChange(itinerary.map((d, i) => i === di ? { ...d, activities: [...d.activities, emptyActivity()] } : d))
  }

  const removeActivity = (di, ai) => {
    onChange(itinerary.map((d, i) => i === di ? { ...d, activities: d.activities.filter((_, j) => j !== ai) } : d))
  }

  const updateActivity = (di, ai, key, val) => {
    onChange(itinerary.map((d, i) =>
      i === di ? { ...d, activities: d.activities.map((a, j) => j === ai ? { ...a, [key]: val } : a) } : d
    ))
  }

  const toggleMeal = (di, meal) => {
    const day = itinerary[di]
    const meals = Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []
    const updated = meals.includes(meal) ? meals.filter(m => m !== meal) : [...meals, meal]
    updateDay(di, 'mealsIncluded', updated)
  }

  return (
    <div className={s.itineraryWrap}>
      {itinerary.length === 0 && (
        <div className={s.itineraryEmpty}>
          No days added yet. Set the <strong>Nights</strong> in Basic Info — days auto-populate, or click below.
        </div>
      )}

      {itinerary.map((day, di) => (
        <div key={di} className={s.dayCard}>
          {/* Day header */}
          <div className={s.dayHead}>
            <span className={s.dayIndex}>{day.day}</span>
            <input
              type="text"
              value={day.title}
              onChange={e => updateDay(di, 'title', e.target.value)}
              placeholder={`Day ${day.day} — what happens today?`}
              className={s.dayTitleInput}
            />
            <button onClick={() => removeDay(di)} className={s.dayRemoveBtn}>✕</button>
          </div>

          {/* Quick metadata row: transport + meals */}
          <div className={s.dayMetaRow}>
            <div>
              <label className={s.microLabel}>🚗 Transport</label>
              <select
                value={day.transport || ''}
                onChange={e => updateDay(di, 'transport', e.target.value)}
                className={s.dayTransportSelect}
              >
                {TRANSPORT_OPTIONS.map(t => <option key={t} value={t}>{t || 'Select transport…'}</option>)}
              </select>
            </div>
            <div>
              <label className={s.microLabel}>🍽 Meals Included</label>
              <div className={s.mealsRow}>
                {DAY_MEAL_OPTS.map(meal => {
                  const meals = Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []
                  const on = meals.includes(meal)
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleMeal(di, meal)}
                      className={cx(s.mealChip, on ? s.mealChipActive : s.mealChipInactive)}
                    >
                      {meal[0]}
                    </button>
                  )
                })}
                {Array.isArray(day.mealsIncluded) && day.mealsIncluded.length > 0 && (
                  <span className={s.mealsSummary}>{day.mealsIncluded.join(' + ')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className={s.activitiesWrap}>
            {day.activities.map((act, ai) => (
              <div key={ai} className={s.activityRow}>
                <select
                  value={act.icon}
                  onChange={e => updateActivity(di, ai, 'icon', e.target.value)}
                  className={s.activityIconSelect}
                >
                  {ACTIVITY_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input
                  type="text"
                  value={act.time}
                  onChange={e => updateActivity(di, ai, 'time', e.target.value)}
                  placeholder="Time"
                  className={s.activityTimeInput}
                />
                <input
                  type="text"
                  value={act.description}
                  onChange={e => updateActivity(di, ai, 'description', e.target.value)}
                  placeholder="Activity description…"
                  className={s.activityDescInput}
                />
                <button onClick={() => removeActivity(di, ai)} className={s.activityRemoveBtn}>✕</button>
              </div>
            ))}
            <button
              onClick={() => addActivity(di)}
              className={s.addActivityBtn}
            >
              + Add Activity
            </button>
          </div>

          {/* Day note */}
          <div className={s.dayNoteWrap}>
            <label className={s.dayNoteLabel}>📝 Day Note (optional)</label>
            <textarea
              value={day.note || ''}
              onChange={e => updateDay(di, 'note', e.target.value)}
              placeholder="Special instructions, tips, or notes for this day…"
              rows={2}
              className={s.dayNoteInput}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className={s.addDayBtn}
      >
        + Add Day {itinerary.length + 1}
      </button>
    </div>
  )
}

// ── Modal tabs ────────────────────────────────────────────────────────────────
const TABS = ['Basic Info', 'Itinerary', 'Flights', 'Hotels', 'Inclusions & Exclusions']

function PackageModal({ editPkg, form, setForm, onSave, onClose, saving }) {
  useScrollLock()
  const [tab, setTab] = useState(0)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Auto-sync itinerary days when nights changes
  const nightsMounted = useRef(false)
  useEffect(() => {
    if (!nightsMounted.current) { nightsMounted.current = true; return }
    const n = parseInt(form.nights) || 0
    if (n <= 0) return
    setForm(p => {
      const cur = Array.isArray(p.itinerary) ? p.itinerary : []
      if (cur.length === n) return p
      if (n > cur.length) {
        const added = Array.from({ length: n - cur.length }, (_, i) => emptyDay(cur.length + i + 1))
        return { ...p, itinerary: [...cur, ...added] }
      }
      return { ...p, itinerary: cur.slice(0, n).map((d, i) => ({ ...d, day: i + 1 })) }
    })
  }, [form.nights]) // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = form.title.trim() && Number(form.priceValue) > 0 && form.nights

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className={s.modal}
      >
        {/* Modal header */}
        <div className={s.modalHeader}>
          <h3 className={s.modalTitle}>{editPkg ? 'Edit Package' : 'New Package'}</h3>
          <button onClick={onClose} className={s.modalCloseBtn}>✕</button>
        </div>

        {/* Tab bar */}
        <div className={s.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
               className={cx(s.tabBtn, tab === i ? s.tabBtnActive : s.tabBtnInactive)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={s.tabContent} onWheel={e => e.stopPropagation()}>

          {/* ── Tab 0: Basic Info ── */}
          {tab === 0 && (
            <div className={s.basicInfoStack}>
              <Field label="Package Title" value={form.title} onChange={v => f('title', v)} placeholder="e.g. Romantic Bali Escape" />
              <div className={s.basicInfoGrid2}>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Price (per adult)</label>
                  <input
                    type="number" min="0" value={form.priceValue}
                    onChange={e => f('priceValue', e.target.value)}
                    placeholder="e.g. 85000"
                    className={s.fieldInput}
                  />
                  <p className={s.fieldHelp}>Enter the numeric amount only — no ₹ or commas</p>
                </div>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Displayed as</label>
                  <input type="text" disabled value={formatPrice(form.priceValue) || '—'} className={s.fieldInput} />
                  <p className={s.fieldHelp}>Generated automatically, always in sync</p>
                </div>
              </div>
              <div className={s.basicInfoGrid2}>
                <div>
                  <label className={s.fieldLabel}>Nights</label>
                <input type="number" min="1" value={form.nights} onChange={e => f('nights', e.target.value)} placeholder="e.g. 6"
                    className={s.fieldInput} />
                  <p className={s.fieldHelp}>Auto-creates itinerary days</p>
                </div>
                <div>
                  <label className={s.fieldLabel}>Category</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)}
                    className={cx(s.fieldInput, s.selectInput)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Description" value={form.description} onChange={v => f('description', v)} placeholder="A short description of the package…" type="textarea" />
              <DestinationsPicker selected={form.destinations} onChange={v => f('destinations', v)} />
              <Field label="Highlights (comma-separated)" value={form.highlights} onChange={v => f('highlights', v)} placeholder="e.g. Airport transfers, Luxury hotel" />
              <Field label="Cover Image URL" value={form.image} onChange={v => f('image', v)} placeholder="https://images.unsplash.com/..." />
              {form.image && (
                <div className={s.imagePreviewWrap}>
                  <img src={form.image} alt="preview" className={s.imagePreview} onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              <div>
                <label className={s.fieldLabel}>Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)}
                  className={cx(s.fieldInput, s.selectInput)}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Tab 1: Itinerary ── */}
          {tab === 1 && (
            <ItineraryBuilder itinerary={form.itinerary} onChange={v => f('itinerary', v)} />
          )}

          {/* ── Tab 2: Flights ── */}
          {tab === 2 && (
            <FlightsBuilder
              flights={form.flights}
              onChange={v => f('flights', v)}
            />
          )}

          {/* ── Tab 3: Hotels ── */}
          {tab === 3 && (
            <HotelsBuilder
              hotels={form.hotels || []}
              onChange={v => f('hotels', v)}
            />
          )}

          {/* ── Tab 4: Inclusions & Exclusions ── */}
          {tab === 4 && (() => {
            const parsed = parseContentMarkdown(form.contentMarkdown)
            return (
              <div className={s.inExWrap}>
                {/* Left: markdown editor */}
                <MarkdownEditor
                  label="📄 Write in Markdown"
                  hint="Use ## ✅ Inclusions / ## ❌ Exclusions / ## 📋 Important Notes as headers"
                  value={form.contentMarkdown}
                  onChange={v => f('contentMarkdown', v)}
                  placeholder={CONTENT_MD_TEMPLATE}
                  bgClass={s.mdSurface}
                  borderClass={s.mdBorder}
                  rows={24}
                />

                {/* Right: live visual preview */}
                <div className={s.inExPreview}>
                  <p className={s.inExPreviewLabel}>Live Preview</p>

                  <div className={`${s.inExSection} ${s.inExSectionInc}`}>
                    <div className={s.inExSectionHead}>
                      <span>✅</span> Inclusions
                      <span className={s.inExSectionCount}>{parsed.inclusions.length}</span>
                    </div>
                    {parsed.inclusions.length === 0
                      ? <p className={s.inExEmpty}>No inclusions yet</p>
                      : <ul className={s.inExList}>{parsed.inclusions.map((item, i) => (
                          <li key={i} className={s.inExItem}><span className={s.inExDot}>✓</span>{item}</li>
                        ))}</ul>
                    }
                  </div>

                  <div className={`${s.inExSection} ${s.inExSectionExc}`}>
                    <div className={s.inExSectionHead}>
                      <span>❌</span> Exclusions
                      <span className={s.inExSectionCount}>{parsed.exclusions.length}</span>
                    </div>
                    {parsed.exclusions.length === 0
                      ? <p className={s.inExEmpty}>No exclusions yet</p>
                      : <ul className={s.inExList}>{parsed.exclusions.map((item, i) => (
                          <li key={i} className={s.inExItem}><span className={s.inExDot}>✕</span>{item}</li>
                        ))}</ul>
                    }
                  </div>

                  <div className={`${s.inExSection} ${s.inExSectionNotes}`}>
                    <div className={s.inExSectionHead}>
                      <span>📋</span> Important Notes
                      <span className={s.inExSectionCount}>{parsed.notes.length}</span>
                    </div>
                    {parsed.notes.length === 0
                      ? <p className={s.inExEmpty}>No notes yet</p>
                      : <ul className={s.inExList}>{parsed.notes.map((item, i) => (
                          <li key={i} className={s.inExItem}><span className={s.inExDot}>•</span>{item}</li>
                        ))}</ul>
                    }
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Footer */}
        <div className={s.modalFooter}>
          <button onClick={onClose} className={s.modalCancelBtn}>Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !canSave}
            className={s.modalSaveBtn}
          >
            {saving ? 'Saving…' : (editPkg ? 'Update Package' : 'Save Package')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages,   setPackages]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editPkg,    setEditPkg]    = useState(null)
  const [form,       setForm]       = useState(emptyForm())
  const [saving,     setSaving]     = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const limit = 20

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [pkgsData, statsData] = await Promise.all([
        api.getPackages({ search: search.trim() || undefined, page, limit }),
        api.getPackageStats(),
      ])
      setPackages(pkgsData.packages || [])
      setTotal(pkgsData.pagination?.total || 0)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setPage(1) }, [search])

  const openCreate = () => {
    setEditPkg(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  const openEdit = (pkg) => {
    setEditPkg(pkg._id || pkg.id)
    setForm({
      title:        pkg.title        || '',
      category:     pkg.category     || 'Honeymoon',
      nights:       pkg.nights?.toString() || '',
      price:        pkg.price        || '',
      priceValue:   pkg.priceValue?.toString() || '',
      description:  pkg.description  || '',
      destinations: Array.isArray(pkg.destinations) ? pkg.destinations : [],
      highlights:   Array.isArray(pkg.highlights)   ? pkg.highlights.join(', ')   : (pkg.highlights   || ''),
      image:        pkg.image        || '',
      status:       pkg.status       || 'Active',
      contentMarkdown: pkg.contentMarkdown ||
        buildContentMarkdown(
          Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
          Array.isArray(pkg.exclusions) ? pkg.exclusions : [],
          Array.isArray(pkg.notes)      ? pkg.notes      : [],
        ) || CONTENT_MD_TEMPLATE,
      itinerary:    Array.isArray(pkg.itinerary) ? pkg.itinerary.map(d => ({
        day:           d.day,
        title:         d.title || '',
        note:          d.note  || '',
        transport:     d.transport || '',
        mealsIncluded: Array.isArray(d.mealsIncluded) ? d.mealsIncluded : [],
        activities:    Array.isArray(d.activities) ? d.activities.map(a => ({
          time: a.time || '', description: a.description || '', icon: a.icon || '📍',
        })) : [emptyActivity()],
      })) : [],
      flights: Array.isArray(pkg.flights) ? pkg.flights.map(fl => ({
        type:        fl.type        || 'Departure',
        airline:     fl.airline     || '',
        flightNumber:fl.flightNumber|| '',
        from:        fl.from        || '',
        to:          fl.to          || '',
        date:        fl.date        || '',
        time:        fl.time        || '',
        arrivalTime: fl.arrivalTime || '',
        duration:    fl.duration    || '',
        stops:       fl.stops       || '0',
        cabinClass:  fl.cabinClass  || 'Economy',
        baggage:     fl.baggage     || '',
        meal:        fl.meal        || '',
        pnr:         fl.pnr         || '',
        terminal:    fl.terminal    || '',
      })) : [],
      hotels: Array.isArray(pkg.hotels) ? pkg.hotels.map(h => ({
        name:      h.name      || '',
        location:  h.location  || '',
        stars:     h.stars?.toString() || '4',
        roomType:  h.roomType  || '',
        mealPlan:  h.mealPlan  || 'CP',
        nights:    h.nights?.toString() || '',
        checkIn:   h.checkIn   || '',
        checkOut:  h.checkOut  || '',
        amenities: h.amenities || '',
        address:   h.address   || '',
        contact:   h.contact   || '',
      })) : [],
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditPkg(null); setForm(emptyForm()) }

  const handleSave = async () => {
    const priceValue = parseFloat(form.priceValue) || 0
    if (!form.title.trim() || !priceValue) return
    setSaving(true)
    try {
      const payload = {
        title:        form.title.trim(),
        category:     form.category,
        nights:       parseInt(form.nights)     || 0,
        price:        formatPrice(priceValue),
        priceValue,
        description:  form.description,
        destinations: form.destinations,
        highlights:   form.highlights.split(',').map(s => s.trim()).filter(Boolean),
        image:        form.image.trim(),
        status:       form.status,
        contentMarkdown: form.contentMarkdown || '',
        ...(() => {
          const parsed = parseContentMarkdown(form.contentMarkdown)
          return {
            inclusions: parsed.inclusions,
            exclusions: parsed.exclusions,
            notes:      parsed.notes,
          }
        })(),
        itinerary:    form.itinerary.map(d => ({
          day:           d.day,
          title:         d.title.trim(),
          note:          (d.note || '').trim(),
          transport:     d.transport || '',
          mealsIncluded: Array.isArray(d.mealsIncluded) ? d.mealsIncluded : [],
          activities:    d.activities.filter(a => a.description.trim()).map(a => ({
            time: a.time.trim(), description: a.description.trim(), icon: a.icon,
          })),
        })).filter(d => d.title || d.activities.length),
        hotels: (form.hotels || []).filter(h => h.name).map(h => ({
          name:      h.name.trim(),
          location:  h.location?.trim() || '',
          stars:     parseInt(h.stars) || 4,
          roomType:  h.roomType?.trim() || '',
          mealPlan:  h.mealPlan || 'CP',
          nights:    h.nights ? parseInt(h.nights) : null,
          checkIn:   h.checkIn?.trim() || '',
          checkOut:  h.checkOut?.trim() || '',
          amenities: h.amenities?.trim() || '',
          address:   h.address?.trim() || '',
          contact:   h.contact?.trim() || '',
        })),
        flights: form.flights.filter(fl => fl.airline || fl.flightNumber || fl.from).map(fl => ({
          type:        fl.type,
          airline:     fl.airline.trim(),
          flightNumber:fl.flightNumber.trim(),
          from:        fl.from.trim(),
          to:          fl.to.trim(),
          date:        fl.date.trim(),
          time:        fl.time.trim(),
          arrivalTime: fl.arrivalTime?.trim() || '',
          duration:    fl.duration?.trim() || '',
          stops:       fl.stops || '0',
          cabinClass:  fl.cabinClass || 'Economy',
          baggage:     fl.baggage?.trim() || '',
          meal:        fl.meal || '',
          pnr:         fl.pnr?.trim() || '',
          terminal:    fl.terminal?.trim() || '',
        })),
      }
      if (editPkg) {
        await api.updatePackage(editPkg, payload)
      } else {
        await api.createPackage(payload)
      }
      closeModal()
      fetchAll()
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pkg) => {
    if (!confirm(`Delete "${pkg.title}"? This cannot be undone.`)) return
    const id = pkg._id || pkg.id
    setDeletingId(id)
    try {
      await api.deletePackage(id)
      setPackages(prev => prev.filter(p => (p._id || p.id) !== id))
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (pkg) => {
    const newStatus = pkg.status === 'Active' ? 'Draft' : 'Active'
    const id = pkg._id || pkg.id
    try {
      await api.updatePackage(id, { status: newStatus })
      setPackages(prev => prev.map(p => (p._id || p.id) === id ? { ...p, status: newStatus } : p))
    } catch (err) {
      alert(`Failed to update: ${err.message}`)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.pageHeader}>
        <div>
          <h2 className={s.pageTitle}>Packages</h2>
          <p className={s.pageSubtitle}>
            {stats ? `${stats.total} packages · ${stats.active} active` : 'Loading…'}
          </p>
        </div>
        <button onClick={openCreate} className={s.addPackageBtn}>
          + Add Package
        </button>
      </div>

      {/* Performance Summary */}
      {stats && (
        <div className={s.statsGrid}>
          {[
            { label: 'Active Packages', value: stats.active,            icon: '✅' },
            { label: 'Total Bookings',  value: stats.totalBookings,     icon: '📋' },
            { label: 'Best Seller',     value: stats.bestSeller || '—', icon: '🏆' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={s.statCard}
            >
              <span className={s.statIcon}>{s.icon}</span>
              <p className={s.statLabel}>{s.label}</p>
              <p className={s.statValue}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className={s.searchWrap}>
        <span className={s.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search packages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={s.searchInput}
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className={s.tableCard}
      >
        {error ? (
          <div className={s.tableError}>{error}</div>
        ) : loading ? (
          <div className={s.tableLoading}>
            <div className={s.spinner} />
          </div>
        ) : packages.length === 0 ? (
          <div className={s.tableEmpty}>No packages found. Add one to get started.</div>
        ) : (
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th className={cx(s.th, s.thLeft)}>Package</th>
                  <th className={cx(s.th, s.thLeft)}>Category</th>
                  <th className={cx(s.th, s.thCenter, s.hideMd)}>Nights</th>
                  <th className={cx(s.th, s.thCenter, s.hideLg)}>Itinerary</th>
                  <th className={cx(s.th, s.thRight)}>Price</th>
                  <th className={cx(s.th, s.thCenter)}>Bookings</th>
                  <th className={cx(s.th, s.thCenter)}>Status</th>
                  <th className={cx(s.th, s.thRight)}>Actions</th>
                </tr>
              </thead>
              <tbody className={s.tableBody}>
                {packages.map((pkg, i) => {
                  const id = pkg._id || pkg.id
                  const hasDays = Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
                  return (
                    <motion.tr key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 + i * 0.03 }}
                      className={s.tableRow}
                    >
                      <td className={s.cell}>
                        <p className={s.pkgTitle}>{pkg.title}</p>
                        <p className={s.pkgMeta}>{pkg.nights ? `${pkg.nights}N / ${pkg.nights + 1}D` : '—'}</p>
                      </td>
                      <td className={s.cell}>
                        <span className={cx(s.categoryBadge, categoryColors[pkg.category] || s.catDefault)}>
                          {pkg.category}
                        </span>
                      </td>
                      <td className={cx(s.cell, s.cellCenter, s.cellMuted, s.hideMd)}>{pkg.nights || '—'}</td>
                      <td className={cx(s.cell, s.cellCenter, s.hideLg)}>
                        <span className={cx(s.itineraryBadge, hasDays ? s.itineraryBadgeActive : s.itineraryBadgeEmpty)}>
                          {hasDays ? `${pkg.itinerary.length}d` : 'None'}
                        </span>
                      </td>
                      <td className={cx(s.cell, s.cellRight, s.priceCell)}>{formatPrice(pkg.priceValue, pkg.price) || '—'}</td>
                      <td className={cx(s.cell, s.cellCenter)}>
                        <div className={s.bookingsWrap}>
                          <span className={s.bookingsValue}>{pkg.bookings ?? 0}</span>
                          <div className={s.bookingsTrack}>
                            <div className={s.bookingsFill} style={{ width: `${Math.min(((pkg.bookings ?? 0) / 90) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className={cx(s.cell, s.cellCenter)}>
                        <button
                          onClick={() => handleToggleStatus(pkg)}
                          className={cx(s.statusBtn, pkg.status === 'Active' ? s.statusBtnActive : s.statusBtnDraft)}
                        >
                          {pkg.status}
                        </button>
                      </td>
                      <td className={cx(s.cell, s.cellRight)}>
                        <div className={s.actionRow}>
                          <button onClick={() => openEdit(pkg)}
                            className={s.editIconBtn} title="Edit">
                            ✏
                          </button>
                          <button onClick={() => handleDelete(pkg)} disabled={deletingId === id}
                            className={s.deleteIconBtn} title="Delete">
                            {deletingId === id ? '…' : '🗑'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
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
          showing={packages.length}
          onPage={setPage}
          label="packages"
        />
      </motion.div>

      {showModal && (
        <PackageModal
          editPkg={editPkg}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  )
}



