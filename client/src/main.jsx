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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
