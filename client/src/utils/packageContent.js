// Turns a stored package record into the pieces the package page needs to
// display. Everything here is *derived from data the package actually has* —
// nothing is invented. When a package lacks the source data, the helper
// returns null/empty and the caller hides that section rather than showing a
// plausible-looking placeholder.

const TITLE_SPLIT = /\s+[–—|:]\s+|\s+[-]\s+/

// "Escape to South Thailand – Krabi, Koh Samui & Phuket"
//   → { name: 'Escape to South Thailand', route: 'Krabi • Koh Samui • Phuket' }
// An admin-entered `subtitle` always wins over the parsed one.
export function splitTitle(pkg) {
  const title = (pkg?.displayTitle || pkg?.title || '').trim()
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []

  if (pkg?.subtitle) return { name: title, route: pkg.subtitle }
  // An admin-set display title is deliberate copy — never split it.
  if (pkg?.displayTitle) return { name: title, route: destinations.join(' • ') }

  const [first, ...rest] = title.split(TITLE_SPLIT)
  if (rest.length > 0) {
    const tail = rest.join(' ').replace(/\s*(?:,|&|and)\s*/gi, ' • ')
    return { name: first.trim(), route: tail.trim() }
  }

  return { name: title, route: destinations.join(' • ') }
}

// What to call the trip in headings ("Why You'll Love This *Thailand* Trip").
// Prefers the country from the matched destination record — for a multi-city
// itinerary, naming the last stop would be actively misleading.
export function tripLabel(pkg, destinationRecord) {
  if (destinationRecord?.country) return destinationRecord.country
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  // With several stops and no country on record, naming one of them would be
  // wrong — callers fall back to a place-less heading instead.
  return destinations.length === 1 ? destinations[0] : ''
}

// One-line emotional proposition under the title.
export function tagline(pkg) {
  if (pkg?.tagline) return pkg.tagline
  const desc = (pkg?.description || '').trim()
  if (!desc) return ''
  const firstSentence = desc.split(/(?<=[.!?])\s/)[0]
  return firstSentence.length > 180 ? `${firstSentence.slice(0, 177)}…` : firstSentence
}

// Route stops with nights at each, taken from the hotel list (which carries
// city + nights) and falling back to the destination list without nights.
export function routeStops(pkg) {
  const hotels = Array.isArray(pkg?.hotels) ? pkg.hotels : []

  const fromHotels = []
  for (const hotel of hotels) {
    const city = (hotel.city || hotel.location || '').trim()
    if (!city) continue
    const nights = Number(hotel.nights) || 0
    const existing = fromHotels.find(s => s.city.toLowerCase() === city.toLowerCase())
    if (existing) existing.nights += nights
    else fromHotels.push({ city, nights })
  }
  if (fromHotels.length > 0) return fromHotels

  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  return destinations.map(city => ({ city, nights: 0 }))
}

const LEISURE_WORDS = /leisure|free time|at your own|relax|own pace|rest|optional/i

// Trip pace read off the itinerary itself — activity density per day and how
// many days are explicitly leisure. Returns null when there's no itinerary to
// measure, so we never publish a made-up rating.
export function tripPace(pkg) {
  const itinerary = Array.isArray(pkg?.itinerary) ? pkg.itinerary : []
  if (itinerary.length === 0) return null

  const activityCounts = itinerary.map(day =>
    Array.isArray(day.activities) ? day.activities.length : 0
  )
  const totalActivities = activityCounts.reduce((a, b) => a + b, 0)
  if (totalActivities === 0) return null

  const avgPerDay = totalActivities / itinerary.length

  const leisureDays = itinerary.filter(day => {
    const text = [
      day.title,
      day.note,
      ...(Array.isArray(day.activities) ? day.activities.map(a => a.description) : []),
    ].filter(Boolean).join(' ')
    return LEISURE_WORDS.test(text)
  }).length
  const leisureRatio = leisureDays / itinerary.length

  const clamp = n => Math.max(1, Math.min(5, n))

  const sightseeing = clamp(Math.round(avgPerDay))
  const pace        = clamp(Math.round(avgPerDay))
  const freeTime    = clamp(Math.round(leisureRatio * 5) || 1)

  const label = (score, scale) => scale[Math.min(scale.length - 1, score - 1)]

  return [
    {
      key: 'Trip Pace',
      score: pace,
      label: label(pace, ['Very relaxed', 'Relaxed', 'Balanced', 'Active', 'Packed']),
    },
    {
      key: 'Sightseeing',
      score: sightseeing,
      label: label(sightseeing, ['Minimal', 'Light', 'Moderate', 'Extensive', 'Intensive']),
    },
    {
      key: 'Free Time',
      score: freeTime,
      label: label(freeTime, ['Low', 'Some', 'Moderate', 'High', 'Very high']),
    },
  ]
}

const CATEGORY_AUDIENCE = {
  Honeymoon: [{ icon: '❤️', label: 'Couples' }, { icon: '💑', label: 'Honeymooners' }],
  Family:    [{ icon: '👨‍👩‍👧', label: 'Families' }, { icon: '🧒', label: 'Kids welcome' }],
  Luxury:    [{ icon: '✨', label: 'Luxury seekers' }, { icon: '❤️', label: 'Couples' }],
  Wellness:  [{ icon: '🧘', label: 'Wellness travellers' }, { icon: '🌿', label: 'Slow travel' }],
  Domestic:  [{ icon: '👨‍👩‍👧', label: 'Families' }, { icon: '👯', label: 'Friends' }],
}

// Audience tags derived from the package's own category and shape. Admins can
// override with a `perfectFor` array on the package.
export function perfectFor(pkg) {
  if (Array.isArray(pkg?.perfectFor) && pkg.perfectFor.length) {
    return pkg.perfectFor.map(label => ({ icon: '✦', label }))
  }

  const tags = [...(CATEGORY_AUDIENCE[pkg?.category] || [])]
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations : []
  if (destinations.length >= 3) tags.push({ icon: '🗺', label: 'Multi-city explorers' })

  const nights = Number(pkg?.nights) || 0
  if (nights > 0 && nights <= 4) tags.push({ icon: '⚡', label: 'Short breaks' })
  if (nights >= 8) tags.push({ icon: '🧳', label: 'Slow, unhurried trips' })

  return tags
}

// Short "what happens today" line for a collapsed itinerary day.
export function daySummary(day) {
  const activities = Array.isArray(day?.activities) ? day.activities : []
  if (activities.length === 0) return day?.note || ''
  return activities
    .map(a => (a.description || '').split(/[.,]/)[0].trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(' → ')
}

// FAQs are built from what the package actually contains, so the answers stay
// true per package (e.g. flights only claimed as included when they are).
export function packageFaqs(pkg) {
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  const where   = destinations.length ? destinations.join(', ') : 'this destination'
  const nights  = Number(pkg?.nights) || 0
  const hotels  = Array.isArray(pkg?.hotels) ? pkg.hotels.filter(h => h.name) : []
  const flights = Array.isArray(pkg?.flights) ? pkg.flights.filter(f => f.airline || f.from) : []
  const inclusions = Array.isArray(pkg?.inclusions) ? pkg.inclusions : []
  const hasTransfers = inclusions.some(i => /transfer/i.test(i))

  const starRange = hotels
    .map(h => parseInt(h.stars) || 0)
    .filter(Boolean)
  const stars = starRange.length
    ? `${Math.min(...starRange)}★${Math.max(...starRange) !== Math.min(...starRange) ? `–${Math.max(...starRange)}★` : ''}`
    : null

  return [
    nights > 0 && {
      q: `How many days are enough for ${where}?`,
      a: `This itinerary runs ${nights} nights / ${nights + 1} days, which our travel experts consider a comfortable amount of time for ${where}. If you want longer or shorter, we can rebuild it around the dates you have.`,
    },
    {
      q: 'Can I customize this package?',
      a: 'Yes — every package is a starting point. Add or remove nights, upgrade hotels, add flights, sightseeing or island tours, change transfers, or extend your stay. Tell us what you want changed and we will requote it.',
    },
    {
      q: 'Are flights included?',
      a: flights.length
        ? 'Yes, this package includes the flights listed in the Flight Details section. We can also quote alternative routes or departure cities.'
        : 'Flights are not included in the quoted price by default, but we can add them to your quote from your preferred departure city.',
    },
    {
      q: 'Is visa assistance available?',
      a: 'Yes. Our team guides you through visa requirements, documentation and processing timelines for your destination as part of the booking.',
    },
    hotels.length > 0 && {
      q: 'What hotels are included?',
      a: `This package includes ${hotels.length} ${hotels.length === 1 ? 'property' : 'properties'}${stars ? ` in the ${stars} range` : ''}: ${hotels.map(h => h.name).join(', ')}. Hotel selection is subject to availability at the time of booking; where a named hotel is unavailable we substitute a similar property of the same category.`,
    },
    {
      q: 'Can I upgrade to 5-star hotels?',
      a: 'Yes. Tell us your preferred hotel category when you request a quote and we will price the upgrade for you.',
    },
    {
      q: 'Is airport transfer included?',
      a: hasTransfers
        ? 'Yes — airport transfers are part of this package. See the What’s Included section for the full list.'
        : 'Check the What’s Included section for this package. If transfers are not listed, we can add them to your quote.',
    },
    {
      q: 'How do I get a price for my dates?',
      a: 'Use Get My Personalised Quote on this page or message us on WhatsApp. Prices vary by travel dates, hotel category and availability, so we quote each trip individually and get back to you within 24 hours.',
    },
  ].filter(Boolean)
}
