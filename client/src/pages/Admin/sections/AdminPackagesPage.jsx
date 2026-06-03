import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'

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
  Honeymoon: 'bg-pink-50 text-pink-700 border-pink-100',
  Luxury:    'bg-purple-50 text-purple-700 border-purple-100',
  Domestic:  'bg-blue-50 text-blue-700 border-blue-100',
  Family:    'bg-orange-50 text-orange-700 border-orange-100',
  Wellness:  'bg-green-50 text-green-700 border-green-100',
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
  inclusions: '', exclusions: '', notes: '', itinerary: [], flights: [], hotels: [],
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

// ── Markdown Editor with live preview ─────────────────────────────────────────
function MarkdownEditor({ label, hint, value, onChange, placeholder, bgClass, borderClass, focusClass, rows = 8 }) {
  const [preview, setPreview] = useState(false)
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">{label}</label>
          {hint && <span className="text-[9px] text-gray-400 font-medium ml-3">{hint}</span>}
        </div>
        <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5">
          <button type="button" onClick={() => setPreview(false)}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors ${!preview ? 'bg-white text-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >✏ Edit</button>
          <button type="button" onClick={() => setPreview(true)}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors ${preview ? 'bg-white text-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >👁 Preview</button>
        </div>
      </div>
      {!preview ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border rounded-2xl px-5 py-3.5 text-dark font-mono text-xs focus:outline-none transition-colors resize-none ${bgClass} ${borderClass} ${focusClass}`}
        />
      ) : (
        <div className={`border rounded-2xl px-5 py-4 overflow-y-auto ${bgClass} ${borderClass}`} style={{ minHeight: `${rows * 22}px` }}>
          {value.trim() ? (
            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-dark prose-p:text-dark prose-li:text-dark prose-strong:text-dark">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 text-xs italic">Nothing to preview yet…</p>
          )}
        </div>
      )}
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
function FlightsHotelsBuilder({ flights, hotels, onFlightsChange, onHotelsChange }) {
  const addFlight = () => onFlightsChange([...flights, emptyFlight()])
  const removeFlight = (i) => onFlightsChange(flights.filter((_, idx) => idx !== i))
  const updateFlight = (i, key, val) => onFlightsChange(flights.map((f, idx) => idx === i ? { ...f, [key]: val } : f))

  const addHotel = () => onHotelsChange([...hotels, emptyHotel()])
  const removeHotel = (i) => onHotelsChange(hotels.filter((_, idx) => idx !== i))
  const updateHotel = (i, key, val) => onHotelsChange(hotels.map((h, idx) => idx === i ? { ...h, [key]: val } : h))

  const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors'
  const lbl = 'text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block'

  return (
    <div className="space-y-8">
      {/* ── Flights ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">✈ Flight Details</h4>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Add all flights in the itinerary</p>
          </div>
          <button onClick={addFlight} className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors">+ Add Flight</button>
        </div>
        {flights.length === 0 ? (
          <p className="text-gray-400 text-xs font-bold text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">No flights added yet — click + Add Flight</p>
        ) : (
          <div className="space-y-5">
            {flights.map((fl, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Flight header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base">✈</span>
                    <select value={fl.type} onChange={e => updateFlight(i, 'type', e.target.value)}
                      className="bg-transparent text-dark font-black text-xs focus:outline-none cursor-pointer">
                      {FLIGHT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {fl.from && fl.to && (
                      <span className="text-[10px] font-bold text-gray-500">{fl.from} → {fl.to}</span>
                    )}
                  </div>
                  <button onClick={() => removeFlight(i)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors text-[10px] flex items-center justify-center">✕</button>
                </div>

                <div className="p-4 space-y-3">
                  {/* Row 1: Airline + Flight No + Cabin Class */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Airline</label>
                      <input type="text" value={fl.airline} onChange={e => updateFlight(i, 'airline', e.target.value)} placeholder="e.g. IndiGo" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Flight No.</label>
                      <input type="text" value={fl.flightNumber} onChange={e => updateFlight(i, 'flightNumber', e.target.value)} placeholder="e.g. 6E-204" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Cabin Class</label>
                      <select value={fl.cabinClass || 'Economy'} onChange={e => updateFlight(i, 'cabinClass', e.target.value)} className={inp + ' cursor-pointer'}>
                        {CABIN_CLASSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: From + To + Date */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>From (Origin)</label>
                      <input type="text" value={fl.from} onChange={e => updateFlight(i, 'from', e.target.value)} placeholder="Delhi (DEL)" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>To (Destination)</label>
                      <input type="text" value={fl.to} onChange={e => updateFlight(i, 'to', e.target.value)} placeholder="Srinagar (SXR)" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Date / Day Ref</label>
                      <input type="text" value={fl.date} onChange={e => updateFlight(i, 'date', e.target.value)} placeholder="Day 1 / 12 Jun" className={inp} />
                    </div>
                  </div>

                  {/* Row 3: Dep time + Arr time + Duration + Stops */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={lbl}>Departs</label>
                      <input type="text" value={fl.time} onChange={e => updateFlight(i, 'time', e.target.value)} placeholder="06:30 AM" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Arrives</label>
                      <input type="text" value={fl.arrivalTime || ''} onChange={e => updateFlight(i, 'arrivalTime', e.target.value)} placeholder="09:15 AM" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Duration</label>
                      <input type="text" value={fl.duration || ''} onChange={e => updateFlight(i, 'duration', e.target.value)} placeholder="2h 45m" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Stops</label>
                      <select value={fl.stops || '0'} onChange={e => updateFlight(i, 'stops', e.target.value)} className={inp + ' cursor-pointer'}>
                        {STOPS_OPTIONS.map((s, idx) => <option key={s} value={String(idx)}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Terminal + Baggage + Meal + PNR */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={lbl}>Terminal</label>
                      <input type="text" value={fl.terminal || ''} onChange={e => updateFlight(i, 'terminal', e.target.value)} placeholder="T2" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Baggage</label>
                      <input type="text" value={fl.baggage || ''} onChange={e => updateFlight(i, 'baggage', e.target.value)} placeholder="15 kg + 7 kg" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Meal</label>
                      <select value={fl.meal || ''} onChange={e => updateFlight(i, 'meal', e.target.value)} className={inp + ' cursor-pointer'}>
                        {MEAL_OPTIONS.map(m => <option key={m} value={m}>{m || 'Select…'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>PNR / Ref</label>
                      <input type="text" value={fl.pnr || ''} onChange={e => updateFlight(i, 'pnr', e.target.value)} placeholder="ABC123" className={inp} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Hotels ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em]">🏨 Hotel Details</h4>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">All hotels across the itinerary</p>
          </div>
          <button onClick={addHotel} className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100">+ Add Hotel</button>
        </div>
        {hotels.length === 0 ? (
          <p className="text-gray-400 text-xs font-bold text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">No hotels added yet — click + Add Hotel</p>
        ) : (
          <div className="space-y-5">
            {hotels.map((h, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Hotel header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base">🏨</span>
                    <span className="text-dark font-black text-xs uppercase tracking-[0.12em]">
                      {h.name || `Hotel ${i + 1}`}
                    </span>
                    {h.stars && <span className="text-amber-500 text-xs">{'★'.repeat(Number(h.stars))}</span>}
                  </div>
                  <button onClick={() => removeHotel(i)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors text-[10px] flex items-center justify-center">✕</button>
                </div>

                <div className="p-4 space-y-3">
                  {/* Row 1: Hotel name + Stars */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <label className={lbl}>Hotel Name</label>
                      <input type="text" value={h.name || ''} onChange={e => updateHotel(i, 'name', e.target.value)} placeholder="e.g. The Lalit Grand Palace" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Stars</label>
                      <select value={h.stars || '4'} onChange={e => updateHotel(i, 'stars', e.target.value)} className={inp + ' cursor-pointer'}>
                        {['1','2','3','4','5'].map(s => <option key={s} value={s}>{s} ★</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Location + Room Type + Meal Plan */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Location / Area</label>
                      <input type="text" value={h.location || ''} onChange={e => updateHotel(i, 'location', e.target.value)} placeholder="e.g. Dal Lake, Srinagar" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Room Type</label>
                      <input type="text" value={h.roomType || ''} onChange={e => updateHotel(i, 'roomType', e.target.value)} placeholder="e.g. Deluxe Double" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Meal Plan</label>
                      <select value={h.mealPlan || 'CP'} onChange={e => updateHotel(i, 'mealPlan', e.target.value)} className={inp + ' cursor-pointer'}>
                        {MEAL_PLAN_OPTIONS.map(m => <option key={m} value={m}>{MEAL_PLAN_LABELS[m]}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Check-in + Check-out + Nights */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Check-in Date / Day</label>
                      <input type="text" value={h.checkIn || ''} onChange={e => updateHotel(i, 'checkIn', e.target.value)} placeholder="Day 1 / 12 Jun" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Check-out Date / Day</label>
                      <input type="text" value={h.checkOut || ''} onChange={e => updateHotel(i, 'checkOut', e.target.value)} placeholder="Day 4 / 15 Jun" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>No. of Nights</label>
                      <input type="number" min="1" value={h.nights || ''} onChange={e => updateHotel(i, 'nights', e.target.value)} placeholder="3" className={inp} />
                    </div>
                  </div>

                  {/* Row 4: Address + Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Full Address</label>
                      <input type="text" value={h.address || ''} onChange={e => updateHotel(i, 'address', e.target.value)} placeholder="Srinagar, Jammu & Kashmir" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Hotel Contact</label>
                      <input type="text" value={h.contact || ''} onChange={e => updateHotel(i, 'contact', e.target.value)} placeholder="+91 xxxx xxxxxx" className={inp} />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className={lbl}>Amenities (comma-separated)</label>
                    <input type="text" value={h.amenities || ''} onChange={e => updateHotel(i, 'amenities', e.target.value)} placeholder="Pool, Spa, Gym, Free WiFi, Airport Shuttle" className={inp} />
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
    <div className="space-y-4">
      {itinerary.length === 0 && (
        <div className="text-center py-8 text-gray-400 font-bold text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          No days added yet. Set the <strong>Nights</strong> in Basic Info — days auto-populate, or click below.
        </div>
      )}

      {itinerary.map((day, di) => (
        <div key={di} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Day header */}
          <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-3">
            <span className="w-7 h-7 bg-dark text-white rounded-lg text-[11px] font-black flex items-center justify-center shrink-0">{day.day}</span>
            <input
              type="text"
              value={day.title}
              onChange={e => updateDay(di, 'title', e.target.value)}
              placeholder={`Day ${day.day} — what happens today?`}
              className="flex-1 bg-transparent text-dark font-bold text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button onClick={() => removeDay(di)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors text-[10px] flex items-center justify-center shrink-0">✕</button>
          </div>

          {/* Quick metadata row: transport + meals */}
          <div className="px-4 pt-3 pb-2 bg-gray-50/50 border-b border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">🚗 Transport</label>
              <select
                value={day.transport || ''}
                onChange={e => updateDay(di, 'transport', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors cursor-pointer"
              >
                {TRANSPORT_OPTIONS.map(t => <option key={t} value={t}>{t || 'Select transport…'}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">🍽 Meals Included</label>
              <div className="flex gap-1.5">
                {DAY_MEAL_OPTS.map(meal => {
                  const meals = Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []
                  const on = meals.includes(meal)
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleMeal(di, meal)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-colors ${on ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-600'}`}
                    >
                      {meal[0]}
                    </button>
                  )
                })}
                {Array.isArray(day.mealsIncluded) && day.mealsIncluded.length > 0 && (
                  <span className="text-[9px] text-green-600 font-bold self-center">{day.mealsIncluded.join(' + ')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="p-4 space-y-2.5">
            {day.activities.map((act, ai) => (
              <div key={ai} className="flex gap-2 items-center">
                <select
                  value={act.icon}
                  onChange={e => updateActivity(di, ai, 'icon', e.target.value)}
                  className="w-12 h-9 bg-gray-50 border border-gray-200 rounded-xl text-center text-base focus:outline-none cursor-pointer shrink-0"
                >
                  {ACTIVITY_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input
                  type="text"
                  value={act.time}
                  onChange={e => updateActivity(di, ai, 'time', e.target.value)}
                  placeholder="Time"
                  className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-dark font-bold text-xs focus:outline-none focus:border-brand transition-colors shrink-0"
                />
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
              placeholder="Special instructions, tips, or notes for this day…"
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
        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 pb-6 modal-scroll" onWheel={e => e.stopPropagation()}>

          {/* ── Tab 0: Basic Info ── */}
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
                  <p className="text-[9px] text-gray-400 font-medium mt-1">Auto-creates itinerary days</p>
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

          {/* ── Tab 1: Itinerary ── */}
          {tab === 1 && (
            <ItineraryBuilder itinerary={form.itinerary} onChange={v => f('itinerary', v)} />
          )}

          {/* ── Tab 2: Flights & Hotels ── */}
          {tab === 2 && (
            <FlightsHotelsBuilder
              flights={form.flights}
              hotels={form.hotels || []}
              onFlightsChange={v => f('flights', v)}
              onHotelsChange={v => f('hotels', v)}
            />
          )}

          {/* ── Tab 3: Inclusions & Exclusions (Markdown) ── */}
          {tab === 3 && (
            <div className="space-y-8">
              <MarkdownEditor
                label="✅ Inclusions"
                hint="Supports **bold**, *italic*, - lists"
                value={form.inclusions}
                onChange={v => f('inclusions', v)}
                placeholder={"- Airport transfers (both ways)\n- **Luxury hotel** stay on twin-sharing basis\n- Daily breakfast\n- Sightseeing as per itinerary\n- Dedicated tour manager"}
                bgClass="bg-green-50"
                borderClass="border-green-200"
                focusClass="focus:border-green-400"
                rows={9}
              />

              <div className="border-t border-gray-100" />

              <MarkdownEditor
                label="❌ Exclusions"
                hint="Supports **bold**, *italic*, - lists"
                value={form.exclusions}
                onChange={v => f('exclusions', v)}
                placeholder={"- Visa fees & processing charges\n- City taxes (payable at hotel)\n- Personal expenses & shopping\n- Tips & gratuities\n- Any activity not mentioned in inclusions"}
                bgClass="bg-red-50"
                borderClass="border-red-200"
                focusClass="focus:border-red-400"
                rows={7}
              />

              <div className="border-t border-gray-100" />

              <MarkdownEditor
                label="📋 Important Notes"
                hint="Supports **bold**, *italic*, - lists"
                value={form.notes}
                onChange={v => f('notes', v)}
                placeholder={"- Carry valid photo ID at all times\n- Check visa requirements before travel\n- **COVID policy**: Valid vaccination certificate required"}
                bgClass="bg-amber-50"
                borderClass="border-amber-200"
                focusClass="focus:border-amber-400"
                rows={5}
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
      inclusions:   Array.isArray(pkg.inclusions) && pkg.inclusions.length ? pkg.inclusions.join('\n') : '',
      exclusions:   Array.isArray(pkg.exclusions) && pkg.exclusions.length ? pkg.exclusions.join('\n') : '',
      notes:        Array.isArray(pkg.notes)      && pkg.notes.length      ? pkg.notes.join('\n')      : '',
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
        inclusions:   (typeof form.inclusions === 'string' ? form.inclusions : form.inclusions.join('\n')).split('\n').map(s => s.trim()).filter(Boolean),
        exclusions:   (typeof form.exclusions === 'string' ? form.exclusions : form.exclusions.join('\n')).split('\n').map(s => s.trim()).filter(Boolean),
        notes:        (typeof form.notes      === 'string' ? form.notes      : form.notes.join('\n')).split('\n').map(s => s.trim()).filter(Boolean),
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
            { label: 'Active Packages', value: stats.active,            icon: '✅' },
            { label: 'Total Bookings',  value: stats.totalBookings,     icon: '📋' },
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
