import logoPng from '../assets/logo.png'

// ─── Brand ────────────────────────────────────────────────────────────────────
export const BRAND = {
  red:      '#E53935',
  redDark:  '#C62828',
  redLight: '#FFEBEE',
  ink:      '#111111',
  muted:    '#6b7280',
  faint:    '#9ca3af',
  line:     '#e5e7eb',
}

export const COMPANY = {
  name:    'Ease My Vacations',
  tagline: 'Serving Memories Since 2022',
  legal:   'Global Ease My Vacations (OPC) Private Limited',
  cin:     'U79110HR2026OPC146794',
  gst:     '06AANCG1457H1Z1',
}

// The print window is a blob: document, so relative asset paths do not resolve —
// hand it an absolute URL instead.
export const LOGO_URL = (() => {
  try { return new URL(logoPng, window.location.href).href } catch { return logoPng }
})()

// ─── Numbers ──────────────────────────────────────────────────────────────────
export function num(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function fmt(n) {
  return num(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ─── Duration ─────────────────────────────────────────────────────────────────
// N nights always means N+1 days. Values arrive from <input type="number"> as
// strings, so coerce before adding or "5" + 1 becomes "51".
export function nightsLabel(nights) {
  const n = Math.max(num(nights), 0)
  return `${n}N${n + 1}D`
}

export function tripDays(nights) {
  return Math.max(num(nights), 0) + 1
}

export function durationLabel(nights) {
  const n = Math.max(num(nights), 0)
  return `${n} Night${n === 1 ? '' : 's'} / ${n + 1} Day${n === 0 ? '' : 's'}`
}

// ─── Dates ────────────────────────────────────────────────────────────────────
// Dates are picked from a calendar and stored as ISO (YYYY-MM-DD), but quotes
// written before the picker existed hold free text like "15 Jun 2026". Both
// have to render, so anything that isn't ISO passes through untouched.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value) {
  return ISO_DATE.test((value || '').trim())
}

/** ISO value for <input type="date">, or '' when the stored text isn't a date. */
export function toDateInputValue(value) {
  const text = (value || '').trim()
  if (isIsoDate(text)) return text
  const parsed = new Date(text)
  if (text && !Number.isNaN(parsed.getTime())) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`
  }
  return ''
}

/** "15 June 2026" for display; legacy free text is shown as the agent typed it. */
export function formatDate(value) {
  const text = (value || '').trim()
  if (!isIsoDate(text)) return text
  // Parsed as parts, not as a string — "2026-06-15" would otherwise be read
  // as UTC midnight and shift a day backwards in western timezones.
  const [year, month, day] = text.split('-').map(Number)
  return new Date(year, month - 1, day)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Cities and nights ────────────────────────────────────────────────────────
/**
 * Each city on the trip with the nights spent there, so a quote reads
 * "Dubai — 3 Nights · Abu Dhabi — 2 Nights" instead of just naming the places.
 *
 * Explicit per-city nights win; otherwise they're read off the hotel list,
 * which already carries a city and a night count. When neither exists the
 * cities are still listed, just without a night count — never a guessed one.
 */
export function cityStays(quote = {}) {
  const destinations = (Array.isArray(quote.destinations) ? quote.destinations : [])
    .map(d => (typeof d === 'string' ? d : d?.city || '').trim())
    .filter(Boolean)

  const explicit = new Map()
  for (const stay of Array.isArray(quote.destinationStays) ? quote.destinationStays : []) {
    const city = (stay?.city || '').trim()
    if (city) explicit.set(city.toLowerCase(), Math.max(num(stay.nights), 0))
  }

  const fromHotels     = new Map()
  const hotelCityNames = new Map()
  for (const group of hotelGroups(quote)) {
    for (const hotel of group.hotels) {
      const city = (hotel.location || hotel.city || '').trim()
      if (!city) continue
      const key = city.toLowerCase()
      if (!hotelCityNames.has(key)) hotelCityNames.set(key, city)
      fromHotels.set(key, (fromHotels.get(key) || 0) + Math.max(num(hotel.nights), 0))
    }
    // Hotel options describe the same trip with different hotels — counting
    // every option would double the nights.
    break
  }

  // Falling back to hotel cities means falling back to their stored spelling,
  // which the lowercased lookup key has thrown away — hence the display copy.
  const names = destinations.length ? destinations : [...hotelCityNames.values()]

  return names.map(city => {
    const key = city.toLowerCase()
    const nights = explicit.has(key) ? explicit.get(key) : (fromHotels.get(key) || 0)
    return { city, nights }
  })
}

/** "Dubai — 3 Nights · Abu Dhabi — 2 Nights", or just the cities when unknown. */
export function cityStaysLabel(quote = {}) {
  return cityStays(quote)
    .map(({ city, nights }) => (nights > 0 ? `${city} — ${nights} Night${nights === 1 ? '' : 's'}` : city))
    .join(' · ')
}

// ─── Passenger counts ─────────────────────────────────────────────────────────
// A number input changes its value on mouse-wheel/trackpad scroll while
// focused — inside a scrollable form, an ordinary scroll gesture that passes
// over the field silently mutates it (a single scroll flick can add 40+ to a
// count). The field is blurred on wheel globally, but a sane ceiling here is
// a second line of defence against any count driving something — like a
// per-child age box — from ballooning to an unusable size.
export const MAX_ADULTS = 30
export const MAX_CHILDREN = 20

export function clampCount(value, max) {
  const n = Math.round(num(value, 0))
  return String(Math.max(0, Math.min(n, max)))
}

// ─── Children ─────────────────────────────────────────────────────────────────
// "Children" always means this age band. A count drives pricing; individual
// ages are optional and only used for display (hotel/airline booking needs
// the actual age, the per-child rate doesn't vary by it).
export const CHILD_AGE_RANGE = '0–18 yrs'
export const CHILD_AGES = Array.from({ length: 19 }, (_, i) => i) // 0–18

// -1 marks an age slot the agent hasn't filled in yet.
export function resizeChildrenAges(ages, count) {
  const current = Array.isArray(ages) ? ages : []
  return Array.from({ length: count }, (_, i) => (Number.isFinite(current[i]) ? current[i] : -1))
}

// ─── Taxes ────────────────────────────────────────────────────────────────────
export const DEFAULT_TAXES = [{ name: 'GST', percent: 5 }]

export const TAX_PRESETS = ['GST', 'IGST', 'CGST', 'SGST', 'TCS', 'TDS', 'Service Tax']

/** Named tax lines, falling back to the legacy single `taxPercent` field. */
export function normalizeTaxes(quote = {}) {
  const list = Array.isArray(quote.taxes) ? quote.taxes.filter(t => t && (t.name || t.percent)) : []
  if (list.length) return list.map(t => ({ name: t.name || 'Tax', percent: num(t.percent) }))
  const legacy = num(quote.taxPercent)
  return legacy > 0 ? [{ name: 'Tax', percent: legacy }] : []
}

// ─── Discount ─────────────────────────────────────────────────────────────────
/** Discount is applied to the post-tax total — everything above, then discount. */
export function normalizeDiscount(quote = {}) {
  return {
    label: (quote.discountLabel || '').trim() || 'Discount',
    type:  quote.discountType === 'percent' ? 'percent' : 'flat',
    value: Math.max(num(quote.discountValue), 0),
  }
}

// ─── Hotel options ────────────────────────────────────────────────────────────
/**
 * Hotel categories the client can pick between (Option 1 · 4★, Option 2 · 5★ …).
 * Quotes written before options existed carry one flat `hotels` list.
 */
export function hotelGroups(quote = {}) {
  const groups = (Array.isArray(quote.hotelOptions) ? quote.hotelOptions : [])
    .map(o => ({
      label:              (o.label || '').trim(),
      category:           (o.category || '').trim(),
      supplementPerAdult: num(o.supplementPerAdult),
      supplementPerChild: num(o.supplementPerChild),
      hotels:             (o.hotels || []).filter(h => h.name),
    }))
    .filter(g => g.hotels.length)
  if (groups.length) return groups

  const legacy = (quote.hotels || []).filter(h => h.name)
  return legacy.length
    ? [{ label: '', category: '', supplementPerAdult: 0, supplementPerChild: 0, hotels: legacy }]
    : []
}

// ─── Totals ───────────────────────────────────────────────────────────────────
/**
 * Per-person pricing → subtotal → named taxes → grand total.
 * Quotes created before per-pax pricing existed carry their whole cost in
 * `costItems`, which is still honoured as "additional charges".
 */
export function computeQuote(quote = {}) {
  const adults   = Math.max(num(quote.adults, num(quote.pax, 0)), 0)
  const children = Math.max(num(quote.children), 0)
  const perAdult = Math.max(num(quote.perAdult), 0)
  const perChild = Math.max(num(quote.perChild), 0)

  const adultTotal = Math.round(adults * perAdult)
  const childTotal = Math.round(children * perChild)
  const extraItems = (quote.costItems || []).map(i => ({
    description: i.description || '',
    amount: num(i.amount),
  }))
  const extras   = extraItems.reduce((s, i) => s + i.amount, 0)
  const subtotal = adultTotal + childTotal + extras

  const taxes = normalizeTaxes(quote).map(t => ({
    ...t,
    amount: Math.round(subtotal * t.percent / 100),
  }))
  const taxTotal = taxes.reduce((s, t) => s + t.amount, 0)

  // Everything above, then the discount
  const grossTotal = subtotal + taxTotal
  const disc = normalizeDiscount(quote)
  const discountAmount = Math.min(
    disc.type === 'percent' ? Math.round(grossTotal * disc.value / 100) : Math.round(disc.value),
    grossTotal
  )
  const total = grossTotal - discountAmount

  const pax = adults + children || Math.max(num(quote.pax), 0)

  return {
    adults, children, pax,
    perAdult, perChild,
    adultTotal, childTotal,
    extraItems, extras,
    subtotal,
    taxes, taxTotal,
    grossTotal,
    discount: { ...disc, amount: discountAmount },
    total,
    perPerson: pax > 0 ? Math.round(total / pax) : 0,
    currency: quote.currency || 'INR',
  }
}

// ─── Markdown note blocks ─────────────────────────────────────────────────────
// Inclusions / exclusions / notes / terms are authored as markdown. Quotes saved
// before that change hold plain string arrays — render those as bullet lists.
export function toMarkdown(md, legacyList) {
  if (typeof md === 'string' && md.trim()) return md
  const list = (Array.isArray(legacyList) ? legacyList : []).filter(Boolean)
  return list.map(item => `- ${item}`).join('\n')
}

export function quoteMarkdown(quote = {}) {
  return {
    inclusions: toMarkdown(quote.inclusionsMd, quote.inclusions),
    exclusions: toMarkdown(quote.exclusionsMd, quote.exclusions),
    notes:      toMarkdown(quote.notesMd,      quote.notes),
    terms:      toMarkdown(quote.termsMd,      quote.terms),
  }
}

// ─── Print ────────────────────────────────────────────────────────────────────
const PRINT_CSS = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; font-family: Georgia, serif; color: ${BRAND.ink}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  table { border-collapse: collapse; }
  .avoid-break { page-break-inside: avoid; break-inside: avoid; }
  .md { font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.65; color: #333; }
  .md :first-child { margin-top: 0; }
  .md :last-child { margin-bottom: 0; }
  .md p { margin: 0 0 6px; }
  .md ul { list-style: disc outside;    margin: 0 0 6px; padding-left: 18px; }
  .md ol { list-style: decimal outside; margin: 0 0 6px; padding-left: 18px; }
  .md li { margin-bottom: 4px; }
  .md h1, .md h2, .md h3, .md h4 { font-size: 13px; font-weight: 700; margin: 10px 0 4px; }
  .md strong { font-weight: 700; color: ${BRAND.ink}; }
  .md em { font-style: italic; }
  .md a { color: ${BRAND.red}; text-decoration: none; }
  .md code { font-family: Consolas, monospace; font-size: 11px; background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  .md blockquote { margin: 0 0 6px; padding-left: 10px; border-left: 3px solid ${BRAND.redLight}; color: #555; }
  .md table { width: 100%; font-size: 11px; margin-bottom: 6px; }
  .md th, .md td { border: 1px solid ${BRAND.line}; padding: 4px 6px; text-align: left; }
  .md hr { border: none; border-top: 1px solid ${BRAND.line}; margin: 8px 0; }
`

/** Opens a standalone printable document for the given rendered HTML. */
export function openQuotePrintWindow(html, title = 'Quote') {
  if (!html) return
  const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`
  const blob = new Blob([full], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const w    = window.open(url, '_blank')
  if (!w) { URL.revokeObjectURL(url); return }

  let done = false
  const trigger = () => {
    if (done) return
    done = true
    w.focus()
    w.print()
    URL.revokeObjectURL(url)
  }
  w.addEventListener('load', trigger, { once: true })
  // Fallback in case the document finished loading before the listener attached
  setTimeout(() => { if (w.document?.readyState === 'complete') trigger() }, 1500)
}
