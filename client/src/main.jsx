// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasConsent, initMetaPixel } from './utils/analytics'

// Restore Meta Pixel immediately for returning visitors who already gave consent,
// so it's ready before any useEffect page-view hooks fire.
if (hasConsent()) initMetaPixel()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
