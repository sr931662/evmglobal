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
  name:  'Ease My Vacations',
  legal: 'Global Ease My Vacations (OPC) Private Limited',
  cin:   'U79110HR2026OPC146794',
  gst:   '06AANCG1457H1Z1',
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

  const pax = adults + children || Math.max(num(quote.pax), 0)

  return {
    adults, children, pax,
    perAdult, perChild,
    adultTotal, childTotal,
    extraItems, extras,
    subtotal,
    taxes, taxTotal,
    total: subtotal + taxTotal,
    perPerson: pax > 0 ? Math.round((subtotal + taxTotal) / pax) : 0,
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
  .md ul, .md ol { margin: 0 0 6px; padding-left: 18px; }
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
