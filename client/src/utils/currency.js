// Single source of truth for rendering prices. All amounts must go through
// here instead of being printed raw, so a stray "40999" can never reach the UI.

const FULL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

// Picks the first usable numeric amount, preferring an explicit numeric
// value (e.g. priceValue) over a hand-typed display string (e.g. price).
export function resolveAmount(...candidates) {
  for (const candidate of candidates) {
    const n = toNumber(candidate)
    if (n && n > 0) return n
  }
  return null
}

// "₹40,999"
export function formatPrice(...candidates) {
  const n = resolveAmount(...candidates)
  return n === null ? null : FULL.format(n)
}

// "₹40k" / "₹1.2L" — for tight spaces like hover teasers.
export function formatPriceCompact(...candidates) {
  const n = resolveAmount(...candidates)
  if (n === null) return null
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return `₹${n}`
}
