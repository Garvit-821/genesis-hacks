import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { NAV } from '../../data/routes'
import { gsap, isReduced } from '../../lib/motion'
import { lockScroll } from '../../lib/scroll'
import { CONTACT, SOCIALS } from '../../data/site'

/** Full-screen index. Big type, three groups, and the two ways to reach a human. */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(el, { visibility: 'visible' })
        .fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
        .from('.menu__big', { yPercent: 110, duration: 0.9, stagger: 0.05, ease: 'expo.out' }, 0.35)
        .from('.menu__fade', { opacity: 0, y: 20, duration: 0.7, stagger: 0.04, ease: 'expo.out' }, 0.5)
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const t = tl.current
    if (!t) return
    lockScroll(open)
    if (open) {
      if (isReduced()) t.progress(1)
      else t.timeScale(1).play()
      const first = root.current?.querySelector<HTMLAnchorElement>('a')
      window.setTimeout(() => first?.focus(), 300)
    } else if (t.progress() > 0) {
      if (isReduced()) t.progress(0)
      else t.timeScale(1.8).reverse()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div ref={root} id="site-menu" className="menu theme-ink" data-theme="ink" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open} inert={!open}>
      <div className="menu__inner wrap">
        <ul className="menu__primary">
          {[
            { to: '/', label: 'Home' },
            { to: '/events', label: 'Events' },
            { to: '/partner', label: 'Partner' },
            { to: '/about', label: 'About' },
            { to: '/guide', label: 'Guide' },
          ].map((l, i) => (
            <li key={l.to} className="menu__item">
              <Link to={l.to} className="menu__primary-link" onClick={onClose}>
                <span className="menu__mask">
                  <span className="menu__big display">{l.label}</span>
                </span>
                <span className="menu__n mono menu__fade">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="menu__groups">
          {NAV.groups.map((g) => (
            <div key={g.title} className="menu__group menu__fade">
              <p className="mono faint">{g.title}</p>
              <ul>
                {g.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} onClick={onClose} className="menu__sub">
                      <span>{l.label}</span>
                      <span className="mono faint">{l.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="menu__group menu__fade">
            <p className="mono faint">Talk to a human</p>
            <a className="menu__sub" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            <a className="menu__sub" href={CONTACT.phoneHref}>
              {CONTACT.phone}
            </a>
            <div className="menu__socials">
              {SOCIALS.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="mono">
                  {s.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
