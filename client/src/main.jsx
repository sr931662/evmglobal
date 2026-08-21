// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasConsent, initMetaPixel } from './utils/analytics'

// Restore Meta Pixel immediately for returning visitors who already gave consent,
// so it's ready before any useEffect page-view hooks fire.
if (hasConsent()) initMetaPixel()

// Chrome/Edge/Firefox all change a focused <input type="number">'s value on
// mouse-wheel/trackpad scroll. Inside a scrollable form (every admin modal),
// a normal scroll gesture that happens to pass over a number field silently
// mutates it — e.g. "Children" ratcheting up to 40+ from a single scroll
// flick. Blur it the instant a wheel event arrives so the scroll passes
// through to the page instead of the input.
document.addEventListener('wheel', () => {
  const el = document.activeElement
  if (el instanceof HTMLInputElement && el.type === 'number') el.blur()
}, { passive: true })

// Every deploy gives lazy-loaded chunks new hashed filenames and removes the
// old ones. A tab left open across a deploy — or one that loaded index.html
// just before a new build went live — still asks for a chunk hash that no
// longer exists, and the fetch fails (some hosts even answer with the SPA's
// index.html instead of a 404, which is what a "MIME type text/html" console
// error on a .js request means). Vite fires this event for exactly that
// case; a full reload fetches the current index.html and the matching
// chunks. Guarded to once per session so a genuinely broken deploy shows the
// section's own error state (see Admin.jsx) instead of reloading forever.
window.addEventListener('vite:preloadError', () => {
  const key = 'emv_reloaded_after_preload_error'
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
