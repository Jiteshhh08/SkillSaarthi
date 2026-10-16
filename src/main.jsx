import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')
// Public pages ship a prerendered snapshot for crawlers; clear it before the
// client app mounts so React fully owns the tree.
if (container.hasChildNodes()) container.replaceChildren()

createRoot(container).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
