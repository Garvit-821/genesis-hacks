import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV } from '../../data/routes'
import { Roll } from '../ui/Button'
import { getLenis } from '../../lib/scroll'
import { Menu } from './Menu'
import { LogoMark } from '../ui/Logo'

const DARK = new Set(['ink', 'night', 'violet'])

function istClock() {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: false }).format(new Date())
}

/**
 * Reads the theme of whatever section sits under the header, so the bar is always legible
 * without a background plate. Hides on the way down, returns on the way up.
 */
export function Header() {
  const [tone, setTone] = useState<'light' | 'dark'>('light')
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState(istClock)
  const ref = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const t = window.setInterval(() => setClock(istClock()), 15_000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const sample = () => {
      raf = 0
      const y = window.scrollY
      const dy = y - lastY
      if (Math.abs(dy) > 4) {
        setHidden(y > 160 && dy > 0)
        lastY = y
      }
      const stack = document.elementsFromPoint(window.innerWidth / 2, 34)
      const hit = stack.find((el) => !el.closest('.hdr, .curtain, .cursor, .menu, .pre, .clock'))
      const forced = hit?.closest<HTMLElement>('[data-header]')?.dataset.header
      const theme = hit?.closest<HTMLElement>('[data-theme]')?.dataset.theme ?? 'paper'
      setTone(forced ? (forced as 'dark' | 'light') : DARK.has(theme) ? 'dark' : 'light')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample)
    }
    const lenis = getLenis()
    lenis?.on('scroll', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    const t = window.setTimeout(sample, 50)
    const t2 = window.setTimeout(sample, 1400)
    return () => {
      lenis?.off('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [pathname])

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <header ref={ref} className={`hdr hdr--${open ? 'dark' : tone} ${hidden && !open ? 'is-hidden' : ''}`}>
        <div className="hdr__bar wrap">
          <Link to="/" className="hdr__logo" aria-label="Genesis Hacks, home">
            <LogoMark className="hdr__mark" />
            <span className="hdr__word">
              <Roll>Genesis</Roll>
            </span>
          </Link>
          <nav className="hdr__nav" aria-label="Primary">
            {NAV.primary.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `hdr__link ${isActive ? 'is-active' : ''}`}>
                <Roll>{l.label}</Roll>
              </NavLink>
            ))}
          </nav>
          <div className="hdr__right">
            <span className="hdr__clock mono" aria-label={`India time ${clock}`}>
              <span className="hdr__pulse" aria-hidden="true" />
              IST {clock}
            </span>
            <Link to="/events/hackers-occupied-delhi" className="hdr__cta mono" data-magnetic>
              <Roll>Delhi ’27</Roll>
            </Link>
            <button type="button" className="hdr__menu mono" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)} data-magnetic>
              <span className="hdr__burger" aria-hidden="true">
                <span />
                <span />
              </span>
              <Roll>{open ? 'Close' : 'Menu'}</Roll>
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
