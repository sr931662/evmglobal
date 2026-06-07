const GA_ID    = 'G-B8MFTRL5SM'
const PIXEL_ID = '2533390780452728'
const KEY      = 'emv_cookie_consent'

export const hasConsent = () => localStorage.getItem(KEY) === 'all'

// ── GA4 ─────────────────────────────────────────────────────────────────────

export function trackGA(eventName, params = {}) {
  if (!hasConsent() || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackGAPageView(path = window.location.pathname + window.location.search) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path:     path,
    page_location: window.location.href,
    send_to:       GA_ID,
  })
}

// ── Meta Pixel ───────────────────────────────────────────────────────────────

export function initMetaPixel() {
  if (window.fbq) return
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID)
  // PageView is fired by trackPageView — not here — to avoid double-counting
}

export function trackFB(eventName, params = {}) {
  if (!hasConsent() || typeof window.fbq !== 'function') return
  window.fbq('track', eventName, params)
}

export function trackFBPageView() {
  if (!hasConsent() || typeof window.fbq !== 'function') return
  window.fbq('track', 'PageView')
}

// ── Combined helpers ─────────────────────────────────────────────────────────

export function trackPageView(path) {
  if (!hasConsent()) return
  trackGAPageView(path)
  trackFBPageView()
}

export function trackLead(params = {}) {
  trackGA('generate_lead', params)
  trackFB('Lead', params)
}

export function trackContact() {
  trackGA('contact')
  trackFB('Contact')
}

export function trackInitiateCheckout(params = {}) {
  trackGA('begin_checkout', params)
  trackFB('InitiateCheckout', params)
}
