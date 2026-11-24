import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Cursor } from './components/layout/Cursor'
import { Preloader } from './components/layout/Preloader'
import { Curtain, type CurtainHandle } from './components/layout/Curtain'
import { metaFor, REDIRECTS } from './data/routes'
import { SITE_URL } from './data/site'
import { markCovered, markRevealed, nextPageMount } from './lib/transition'
import { initScroll, scrollToY } from './lib/scroll'
import { requestRefresh } from './lib/motion'
import Home from './pages/home/Home'

const About = lazy(() => import('./pages/About'))
const Values = lazy(() => import('./pages/Values'))
const Team = lazy(() => import('./pages/Team'))
const Careers = lazy(() => import('./pages/Careers'))
const Contact = lazy(() => import('./pages/Contact'))
const Partner = lazy(() => import('./pages/Partner'))
const Collaborate = lazy(() => import('./pages/Collaborate'))
const Events = lazy(() => import('./pages/Events'))
const Delhi = lazy(() => import('./pages/Delhi'))
const Pune = lazy(() => import('./pages/Pune'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Certificates = lazy(() => import('./pages/Certificates'))
const Guide = lazy(() => import('./pages/guide/Guide'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))

function setMeta(pathname: string) {
  const meta = metaFor(pathname)
  document.title = meta.title
  const set = (sel: string, attr: string, value: string) => {
    let el = document.head.querySelector<HTMLElement>(sel)
    if (!el) {
      const [tag, key, name] = sel.match(/^(\w+)\[(\w+)="([^"]+)"\]$/)!.slice(1)
      el = document.createElement(tag)
      el.setAttribute(key, name)
      document.head.appendChild(el)
    }
    el.setAttribute(attr, value)
  }
  set('meta[name="description"]', 'content', meta.description)
  set('meta[property="og:title"]', 'content', meta.title)
  set('meta[property="og:description"]', 'content', meta.description)
  set('link[rel="canonical"]', 'href', SITE_URL + (pathname === '/' ? '/' : pathname.replace(/\/+$/, '')))
  return meta
}

function scrollToHash(hash: string) {
  if (!hash) return
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (el) scrollToY(el, { offset: -90 })
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [shown, setShown] = useState<Location>(location)
  const [announce, setAnnounce] = useState('')
  const curtain = useRef<CurtainHandle>(null)
  const busy = useRef(false)
  const pending = useRef<Location | null>(null)
  const first = useRef(true)

  useEffect(() => {
    initScroll()
    setMeta(location.pathname)
    const r = REDIRECTS[location.pathname.replace(/\/+$/, '')]
    if (r) navigate(r, { replace: true })
    // On a fresh load with a hash, jump there once the page has laid out.
    if (location.hash) window.setTimeout(() => scrollToHash(location.hash), 600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (location.key === shown.key) return
    const redirect = REDIRECTS[location.pathname.replace(/\/+$/, '')]
    if (redirect) {
      navigate(redirect + location.search + location.hash, { replace: true })
      return
    }
    if (location.pathname === shown.pathname) {
      // Same page: query or hash changed. No curtain, just glide.
      setShown(location)
      scrollToHash(location.hash)
      return
    }
    pending.current = location
    if (!busy.current) void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  // In-page anchors glide instead of jumping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || e.metaKey || e.ctrlKey) return
      const id = a.getAttribute('href')!
      if (id.length < 2 || !document.getElementById(id.slice(1))) return
      e.preventDefault()
      scrollToHash(id)
      history.replaceState(history.state, '', id)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  async function run() {
    busy.current = true
    while (pending.current) {
      const next = pending.current
      pending.current = null
      const meta = metaFor(next.pathname)
      markCovered()
      await curtain.current!.cover(meta)
      scrollToY(0, { immediate: true })
      const mounted = nextPageMount()
      setShown(next)
      await mounted
      setMeta(next.pathname)
      setAnnounce(meta.title)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      requestRefresh()
      if (pending.current) continue
      await curtain.current!.reveal(() => markRevealed())
      document.getElementById('main')?.focus({ preventScroll: true })
      if (next.hash) scrollToHash(next.hash)
    }
    markRevealed()
    busy.current = false
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Preloader />
      <Header />
      <Suspense fallback={<div className="page-fallback" />}>
        <Routes location={shown}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/values" element={<Values />} />
          <Route path="/team" element={<Team />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/hackers-occupied-delhi" element={<Delhi />} />
          <Route path="/events/hackers-occupied-pune" element={<Pune />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/certificates/hackers-occupied-pune" element={<Certificates />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/guide/:category/:slug" element={<Guide />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer key={shown.pathname} />
      <Curtain ref={curtain} />
      <Cursor />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
    </>
  )
}
