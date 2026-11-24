import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/home.css'
import './styles/print.css'
import './styles/pages.css'
import App from './App'

/**
 * Type is split into masked lines for the reveals, so the real fonts must be in before the
 * first split. They are self-hosted and small; cap the wait at 1.2 s either way.
 */
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('700 1em "Bricolage Grotesque Variable"'),
    document.fonts.load('400 1em "Bricolage Grotesque Variable"'),
    document.fonts.load('italic 400 1em "Instrument Serif"'),
    document.fonts.load('400 1em "Geist Mono Variable"'),
  ]),
  new Promise((r) => setTimeout(r, 1200)),
]).catch(() => undefined)

fontsReady.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
})
