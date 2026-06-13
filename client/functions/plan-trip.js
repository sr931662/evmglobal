import {
  buildHtmlResponse, isCrawler,
  renderPreviewHtml,
} from './_preview.js'

const PLAN_TRIP_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200&h=630'

export async function onRequestGet(context) {
  const userAgent = context.request.headers.get('user-agent') || ''
  if (!isCrawler(userAgent)) return context.next()

  const pageUrl = new URL(context.request.url)

  return buildHtmlResponse(renderPreviewHtml({
    title:       'Plan My Dream Trip | Ease My Vacations Global',
    description: 'Take our 2-minute travel quiz and get a personalised holiday itinerary. Tell us your dream destination, travel season, companions and budget — our concierge will do the rest.',
    url:         pageUrl.toString(),
    image:       PLAN_TRIP_IMAGE,
    type:        'website',
  }))
}
