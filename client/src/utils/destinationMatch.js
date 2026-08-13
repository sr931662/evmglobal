// Scores destinations against what a traveller says they want.
//
// The whole thing runs on data an admin has actually entered — trip-type
// scores, a budget band, and the months a place is good to visit. A
// destination with no scores filled in is never recommended, because a
// recommendation nobody can stand behind is worse than no recommendation.

export const TRIP_TYPES = [
  { id: 'beach',     label: 'Beach & relaxation', icon: '🏖' },
  { id: 'honeymoon', label: 'Honeymoon',          icon: '❤️' },
  { id: 'family',    label: 'Family holiday',     icon: '👨‍👩‍👧' },
  { id: 'adventure', label: 'Adventure',          icon: '🏔' },
  { id: 'culture',   label: 'Culture & sightseeing', icon: '🛕' },
  { id: 'nightlife', label: 'Nightlife & city',   icon: '🏙' },
]

export const BUDGET_BANDS = [
  { id: 1, label: 'Under ₹1L per person',  symbol: '₹' },
  { id: 2, label: '₹1L – ₹2L per person',  symbol: '₹₹' },
  { id: 3, label: '₹2L+ per person',       symbol: '₹₹₹' },
]

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const SCOPES = [
  { id: 'any',           label: 'Either is fine' },
  { id: 'domestic',      label: 'Within India' },
  { id: 'international', label: 'International' },
]

const isDomestic = (dest) => (dest?.country || '').toLowerCase().trim() === 'india'

export const hasScores = (dest) =>
  Object.values(dest?.scores || {}).some(v => Number(v) > 0)

// Returns matches sorted best-first, each with the reasons it was picked so the
// result can explain itself rather than just asserting.
export function recommendDestinations(destinations, answers, limit = 3) {
  const { tripTypes = [], month = null, budget = null, scope = 'any' } = answers

  const eligible = (Array.isArray(destinations) ? destinations : [])
    .filter(hasScores)
    .filter(dest => {
      if (scope === 'domestic')      return isDomestic(dest)
      if (scope === 'international') return !isDomestic(dest)
      return true
    })

  const scored = eligible.map(dest => {
    const scores = dest.scores || {}
    const reasons = []
    let score = 0

    // Trip type is the strongest signal — a 5/5 beach score for someone who
    // asked for a beach holiday should dominate everything else.
    if (tripTypes.length > 0) {
      const perType = tripTypes.map(type => Number(scores[type]) || 0)
      const average = perType.reduce((a, b) => a + b, 0) / tripTypes.length
      score += average * 10

      tripTypes.forEach((type, i) => {
        if (perType[i] >= 4) {
          const label = TRIP_TYPES.find(t => t.id === type)?.label || type
          reasons.push(`Strong for ${label.toLowerCase()}`)
        }
      })
    } else {
      // No preference given — fall back to overall strength.
      const all = Object.values(scores).map(Number).filter(Boolean)
      score += (all.reduce((a, b) => a + b, 0) / (all.length || 1)) * 6
    }

    // Season: a hard preference, but only when we know the destination's months.
    const months = Array.isArray(dest.bestMonths) ? dest.bestMonths : []
    if (month && months.length > 0) {
      if (months.includes(month)) {
        score += 12
        reasons.push(`Great in ${MONTHS[month - 1]}`)
      } else {
        score -= 8
      }
    }

    // Budget: exact band is best, one band away is tolerable, further is not.
    if (budget && dest.budgetLevel) {
      const gap = Math.abs(dest.budgetLevel - budget)
      if (gap === 0) {
        score += 8
        reasons.push('Fits your budget')
      } else if (gap === 1) {
        score += 2
      } else {
        score -= 6
      }
    }

    return { dest, score, reasons: reasons.slice(0, 3) }
  })

  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Turns the stored 0–5 scores into rows for the at-a-glance bars, dropping
// anything unscored so a half-filled record doesn't display as all-zero.
export function scoreRows(dest) {
  const scores = dest?.scores || {}
  return TRIP_TYPES
    .map(type => ({ ...type, value: Number(scores[type.id]) || 0 }))
    .filter(row => row.value > 0)
}

export const budgetSymbol = (level) =>
  BUDGET_BANDS.find(b => b.id === Number(level))?.symbol || null
