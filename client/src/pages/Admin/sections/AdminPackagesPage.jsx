import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'

const CATEGORIES = ['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness']

const ACTIVITY_ICONS = ['✈', '🚗', '🚢', '🏨', '🍽', '🎭', '🧘', '🏖', '⛵', '🏔', '🎿', '🛕', '🌅', '🤿', '📍']

const FLIGHT_TYPES = ['Departure', 'Return', 'Connecting']

const categoryColors = {
  Honeymoon: 'bg-pink-50 text-pink-700 border-pink-100',
  Luxury:    'bg-purple-50 text-purple-700 border-purple-100',
  Domestic:  'bg-blue-50 text-blue-700 border-blue-100',
  Family:    'bg-orange-50 text-orange-700 border-orange-100',
  Wellness:  'bg-green-50 text-green-700 border-green-100',
}

const emptyActivity = () => ({ time: '', description: '', icon: '📍' })
const emptyHotel    = () => ({ name: '', roomType: '', checkIn: '', checkOut: '' })
const emptyFlight   = () => ({ type: 'Departure', airline: '', flightNumber: '', from: '', to: '', date: '', time: '' })
const emptyDay      = (n) => ({ day: n, title: '', note: '', activities: [emptyActivity()], hotel: emptyHotel() })
const emptyForm     = () => ({
  title: '', category: 'Honeymoon', nights: '', price: '', priceValue: '',
  description: '', destinations: [], highlights: '', image: '', status: 'Active',
  inclusions: [''], exclusions: [''], notes: [''], itinerary: [], flights: [],
})

// ── Small reusable input ──────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">{label}</label>
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
        />
      )}
    </div>
  )
}

// ── List editor (inclusions / exclusions) ─────────────────────────────────────
function ListEditor({ label, items, onChange, placeholder, accentClass }) {
  const add    = () => onChange([...items, ''])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, v) => onChange(items.map((item, idx) => idx === i ? v : item))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">{label}</label>
        <button onClick={add} className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${accentClass} transition-colors`}>+ Add</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
            />
            <button onClick={() => remove(i)} className="w-8 h-8 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm flex items-center justify-center shrink-0">✕</button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-xs font-bold text-center py-3">None added yet — click + Add</p>
        )}
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
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Destinations</label>
      {available.length === 0 ? (
        <p className="text-gray-400 text-xs font-bold text-center py-3 border-2 border-dashed border-gray-200 rounded-2xl">
          No destinations available — add destinations first
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {available.map(dest => {
            const name = dest.name
            const isSelected = selected.includes(name)
            return (
              <button
                key={dest.id || dest._id}
                type="button"
                onClick={() => toggle(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  isSelected
                    ? 'bg-dark text-white border-dark'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}
      {selected.length > 0 && (
        <p className="text-[10px] text-brand font-bold mt-2 truncate">Selected: {selected.join(', ')}</p>
      )}
    </div>
  )
}

// ── Flights & Hotels builder ──────────────────────────────────────────────────
function FlightsHotelsBuilder({ flights, itinerary, onFlightsChange, onItineraryChange }) {
  const addFlight = () => onFlightsChange([...flights, emptyFlight()])
  const removeFlight = (i) => onFlightsChange(flights.filter((_, idx) => idx !== i))
  const updateFlight = (i, key, val) => onFlightsChange(flights.map((f, idx) => idx === i ? { ...f, [key]: val } : f))

  const updateHotel = (di, key, val) => {
    onItineraryChange(itinerary.map((d, i) => i === di ? { ...d, hotel: { ...d.hotel, [key]: val } } : d))
  }

  return (
    <div className="space-y-8">
      {/* Flights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">✈ Flight Details</h4>
          <button onClick={addFlight} className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors">+ Add Flight</button>
        </div>
        {flights.length === 0 ? (
          <p className="text-gray-400 text-xs font-bold text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">No flights added yet — click + Add Flight</p>
        ) : (
          <div className="space-y-4">
            {flights.map((fl, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✈</span>
                    <select value={fl.type} onChange={e => updateFlight(i, 'type', e.target.value)}
                      className="bg-transparent text-dark font-black text-xs focus:outline-none cursor-pointer">
                      {FLIGHT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeFlight(i)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors text-[10px] flex items-center justify-center">✕</button>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Airline</label>
                    <input type="text" value={fl.airline} onChange={e => updateFlight(i, 'airline', e.target.value)} placeholder="e.g. IndiGo"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Flight No.</label>
                    <input type="text" value={fl.flightNumber} onChange={e => updateFlight(i, 'flightNumber', e.target.value)} placeholder="e.g. 6E-204"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">From</label>
                    <input type="text" value={fl.from} onChange={e => updateFlight(i, 'from', e.target.value)} placeholder="e.g. Delhi (DEL)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">To</label>
                    <input type="text" value={fl.to} onChange={e => updateFlight(i, 'to', e.target.value)} placeholder="e.g. Srinagar (SXR)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Date</label>
                    <input type="text" value={fl.date} onChange={e => updateFlight(i, 'date', e.target.value)} placeholder="e.g. Day 1 / 12 Jun"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Time</label>
                    <input type="text" value={fl.time} onChange={e => updateFlight(i, 'time', e.target.value)} placeholder="e.g. 06:30 AM"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Hotels per day */}
      <div>
        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">🏨 Hotel Details (per day)</h4>
        {itinerary.length === 0 ? (
          <p className="text-gray-400 text-xs font-bold text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">Add days in the Itinerary tab first</p>
        ) : (
          <div className="space-y-4">
            {itinerary.map((day, di) => (
              <div key={di} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-dark text-white rounded-lg text-[11px] font-black flex items-center justify-center shrink-0">{day.day}</span>
                  <span className="text-dark font-bold text-sm truncate">{day.title || `Day ${day.day}`}</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Hotel Name</label>
                    <input type="text" value={day.hotel?.name || ''} onChange={e => updateHotel(di, 'name', e.target.value)} placeholder="e.g. The Lalit Grand Palace"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Room Type</label>
                    <input type="text" value={day.hotel?.roomType || ''} onChange={e => updateHotel(di, 'roomType', e.target.value)} placeholder="e.g. Deluxe Double"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Check-in / Check-out</label>
                    <input type="text" value={day.hotel?.checkIn || ''} onChange={e => updateHotel(di, 'checkIn', e.target.value)} placeholder="e.g. 2:00 PM / 11:00 AM"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors" />
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

  return (
    <div className="space-y-4">
      {itinerary.length === 0 && (
        <div className="text-center py-8 text-gray-400 font-bold text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          No days added yet. Click below to build the itinerary.
        </div>
      )}

      {itinerary.map((day, di) => (
        <div key={di} className="border border-gray-200 rounded-2xl overflow-hidden">
          {/* Day header */}
          <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-3">
            <span className="w-7 h-7 bg-dark text-white rounded-lg text-[11px] font-black flex items-center justify-center shrink-0">{day.day}</span>
            <input
              type="text"
              value={day.title}
              onChange={e => updateDay(di, 'title', e.target.value)}
              placeholder={`Day ${day.day} title…`}
              className="flex-1 bg-transparent text-dark font-bold text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button onClick={() => removeDay(di)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors text-[10px] flex items-center justify-center shrink-0">✕</button>
          </div>

          {/* Activities */}
          <div className="p-4 space-y-2.5">
            {day.activities.map((act, ai) => (
              <div key={ai} className="flex gap-2 items-center">
                {/* Icon picker */}
                <select
                  value={act.icon}
                  onChange={e => updateActivity(di, ai, 'icon', e.target.value)}
                  className="w-12 h-9 bg-gray-50 border border-gray-200 rounded-xl text-center text-base focus:outline-none cursor-pointer shrink-0"
                >
                  {ACTIVITY_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                {/* Time */}
                <input
                  type="text"
                  value={act.time}
                  onChange={e => updateActivity(di, ai, 'time', e.target.value)}
                  placeholder="Time"
                  className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors shrink-0"
                />
                {/* Description */}
                <input
                  type="text"
                  value={act.description}
                  onChange={e => updateActivity(di, ai, 'description', e.target.value)}
                  placeholder="Activity description…"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors"
                />
                <button onClick={() => removeActivity(di, ai)} className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-[10px] flex items-center justify-center shrink-0">✕</button>
              </div>
            ))}
            <button
              onClick={() => addActivity(di)}
              className="w-full text-[10px] font-black uppercase tracking-[0.15em] py-2 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-brand hover:text-brand transition-colors"
            >
              + Add Activity
            </button>
          </div>

          {/* Day note */}
          <div className="px-4 pb-4">
            <label className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 block">📝 Day Note (optional)</label>
            <textarea
              value={day.note || ''}
              onChange={e => updateDay(di, 'note', e.target.value)}
              placeholder="Special instructions or notes for this day…"
              rows={2}
              className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-dark font-medium text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none placeholder:text-amber-300"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-brand/30 text-brand text-sm font-black uppercase tracking-[0.15em] hover:border-brand hover:bg-brand/5 transition-colors"
      >
        + Add Day {itinerary.length + 1}
      </button>
    </div>
  )
}

// ── Modal tabs ────────────────────────────────────────────────────────────────
const TABS = ['Basic Info', 'Itinerary', 'Flights & Hotels', 'Inclusions & Exclusions']

function PackageModal({ editPkg, form, setForm, onSave, onClose, saving }) {
  const [tab, setTab] = useState(0)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const canSave = form.title.trim() && form.price.trim() && form.nights

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-premium border border-gray-100 flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 sm:px-10 pt-7 sm:pt-10 pb-5 sm:pb-6 shrink-0">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-dark">{editPkg ? 'Edit Package' : 'New Package'}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-lg flex items-center justify-center shrink-0">✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 sm:px-10 pb-4 shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${tab === i ? 'bg-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 pb-6 modal-scroll">
          {tab === 0 && (
            <div className="space-y-5">
              <Field label="Package Title" value={form.title} onChange={v => f('title', v)} placeholder="e.g. Romantic Bali Escape" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price Display" value={form.price} onChange={v => f('price', v)} placeholder="e.g. ₹85,000" />
                <Field label="Price (numeric)" value={form.priceValue} onChange={v => f('priceValue', v)} placeholder="e.g. 85000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Nights</label>
                  <input type="number" min="1" value={form.nights} onChange={e => f('nights', e.target.value)} placeholder="e.g. 6"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Category</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Description" value={form.description} onChange={v => f('description', v)} placeholder="A short description of the package…" type="textarea" />
              <DestinationsPicker selected={form.destinations} onChange={v => f('destinations', v)} />
              <Field label="Highlights (comma-separated)" value={form.highlights} onChange={v => f('highlights', v)} placeholder="e.g. Airport transfers, Luxury hotel" />
              <Field label="Cover Image URL" value={form.image} onChange={v => f('image', v)} placeholder="https://images.unsplash.com/..." />
              {form.image && (
                <div className="h-32 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          )}

          {tab === 1 && (
            <ItineraryBuilder
              itinerary={form.itinerary}
              onChange={v => f('itinerary', v)}
            />
          )}

          {tab === 2 && (
            <FlightsHotelsBuilder
              flights={form.flights}
              itinerary={form.itinerary}
              onFlightsChange={v => f('flights', v)}
              onItineraryChange={v => f('itinerary', v)}
            />
          )}

          {tab === 3 && (
            <div className="space-y-8">
              <ListEditor
                label="Inclusions"
                items={form.inclusions}
                onChange={v => f('inclusions', v)}
                placeholder="e.g. Airport transfers"
                accentClass="bg-green-50 text-green-700 border border-green-100 hover:bg-green-100"
              />
              <div className="border-t border-gray-100" />
              <ListEditor
                label="Exclusions"
                items={form.exclusions}
                onChange={v => f('exclusions', v)}
                placeholder="e.g. Visa fees & processing"
                accentClass="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
              />
              <div className="border-t border-gray-100" />
              <ListEditor
                label="Important Notes"
                items={form.notes}
                onChange={v => f('notes', v)}
                placeholder="e.g. Carry valid photo ID at all times"
                accentClass="bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-6 sm:px-10 py-5 sm:py-6 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !canSave}
            className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50"
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
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editPkg,    setEditPkg]    = useState(null)
  const [form,       setForm]       = useState(emptyForm())
  const [saving,     setSaving]     = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [pkgsData, statsData] = await Promise.all([
        api.getPackages({ search: search.trim() || undefined }),
        api.getPackageStats(),
      ])
      setPackages(pkgsData.packages || pkgsData || [])
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchAll() }, [fetchAll])

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
      inclusions:   Array.isArray(pkg.inclusions) && pkg.inclusions.length ? pkg.inclusions : [''],
      exclusions:   Array.isArray(pkg.exclusions) && pkg.exclusions.length ? pkg.exclusions : [''],
      notes:        Array.isArray(pkg.notes)      && pkg.notes.length      ? pkg.notes      : [''],
      itinerary:    Array.isArray(pkg.itinerary)  ? pkg.itinerary.map(d => ({
        day:        d.day,
        title:      d.title || '',
        note:       d.note  || '',
        activities: Array.isArray(d.activities) ? d.activities.map(a => ({
          time: a.time || '', description: a.description || '', icon: a.icon || '📍',
        })) : [emptyActivity()],
        hotel: d.hotel ? { name: d.hotel.name || '', roomType: d.hotel.roomType || '', checkIn: d.hotel.checkIn || '', checkOut: d.hotel.checkOut || '' } : emptyHotel(),
      })) : [],
      flights: Array.isArray(pkg.flights) ? pkg.flights.map(fl => ({
        type: fl.type || 'Departure', airline: fl.airline || '', flightNumber: fl.flightNumber || '',
        from: fl.from || '', to: fl.to || '', date: fl.date || '', time: fl.time || '',
      })) : [],
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditPkg(null); setForm(emptyForm()) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.price.trim()) return
    setSaving(true)
    try {
      const payload = {
        title:        form.title.trim(),
        category:     form.category,
        nights:       parseInt(form.nights)     || 0,
        price:        form.price.trim(),
        priceValue:   parseFloat(form.priceValue) || 0,
        description:  form.description,
        destinations: form.destinations,
        highlights:   form.highlights.split(',').map(s => s.trim()).filter(Boolean),
        image:        form.image.trim(),
        status:       form.status,
        inclusions:   form.inclusions.filter(s => s.trim()),
        exclusions:   form.exclusions.filter(s => s.trim()),
        notes:        form.notes.filter(s => s.trim()),
        itinerary:    form.itinerary.map(d => ({
          day:        d.day,
          title:      d.title.trim(),
          note:       (d.note || '').trim(),
          activities: d.activities.filter(a => a.description.trim()).map(a => ({
            time:        a.time.trim(),
            description: a.description.trim(),
            icon:        a.icon,
          })),
          hotel: d.hotel && (d.hotel.name || d.hotel.roomType) ? {
            name:      d.hotel.name.trim(),
            roomType:  d.hotel.roomType.trim(),
            checkIn:   d.hotel.checkIn.trim(),
            checkOut:  d.hotel.checkOut.trim(),
          } : undefined,
        })).filter(d => d.title || d.activities.length),
        flights: form.flights.filter(fl => fl.airline || fl.flightNumber || fl.from).map(fl => ({
          type: fl.type, airline: fl.airline.trim(), flightNumber: fl.flightNumber.trim(),
          from: fl.from.trim(), to: fl.to.trim(), date: fl.date.trim(), time: fl.time.trim(),
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Packages</h2>
          <p className="text-gray-400 mt-1 font-medium">
            {stats ? `${stats.total} packages · ${stats.active} active` : 'Loading…'}
          </p>
        </div>
        <button onClick={openCreate} className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-brand-hover transition-colors shadow-glow">
          + Add Package
        </button>
      </div>

      {/* Performance Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Active Packages', value: stats.active,           icon: '✅' },
            { label: 'Total Bookings',  value: stats.totalBookings,    icon: '📋' },
            { label: 'Best Seller',     value: stats.bestSeller || '—', icon: '🏆' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <span className="text-2xl mb-3 block">{s.icon}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1">{s.label}</p>
              <p className="text-2xl font-serif font-bold text-dark truncate">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search packages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand transition-colors font-bold text-dark shadow-sm"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {error ? (
          <div className="px-8 py-12 text-center text-red-500 font-bold">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="px-8 py-12 text-center text-gray-400 font-bold">No packages found. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 text-left">Package</th>
                  <th className="px-8 py-5 text-left">Category</th>
                  <th className="px-8 py-5 text-center hidden md:table-cell">Nights</th>
                  <th className="px-8 py-5 text-center hidden lg:table-cell">Itinerary</th>
                  <th className="px-8 py-5 text-right">Price</th>
                  <th className="px-8 py-5 text-center">Bookings</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {packages.map((pkg, i) => {
                  const id = pkg._id || pkg.id
                  const hasDays = Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
                  return (
                    <motion.tr key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 + i * 0.03 }}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <p className="font-bold text-dark group-hover:text-brand transition-colors">{pkg.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{pkg.nights ? `${pkg.nights}N / ${pkg.nights + 1}D` : '—'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${categoryColors[pkg.category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                          {pkg.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center text-gray-500 font-bold hidden md:table-cell">{pkg.nights || '—'}</td>
                      <td className="px-8 py-5 text-center hidden lg:table-cell">
                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${hasDays ? 'bg-brand/5 text-brand border-brand/20' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                          {hasDays ? `${pkg.itinerary.length}d` : 'None'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-serif font-bold text-dark">{pkg.price || '—'}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-black text-dark">{pkg.bookings ?? 0}</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min(((pkg.bookings ?? 0) / 90) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => handleToggleStatus(pkg)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] cursor-pointer transition-colors ${pkg.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                        >
                          {pkg.status}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(pkg)}
                            className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-xs flex items-center justify-center shadow-sm" title="Edit">
                            ✏
                          </button>
                          <button onClick={() => handleDelete(pkg)} disabled={deletingId === id}
                            className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-xs flex items-center justify-center shadow-sm disabled:opacity-40" title="Delete">
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
