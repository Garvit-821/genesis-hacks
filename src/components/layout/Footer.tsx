import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, isReduced, setMotionPreference } from '../../lib/motion'
import { useFx } from '../../lib/fx'
import { scrollToY } from '../../lib/scroll'
import { CONTACT, SOCIALS } from '../../data/site'
import { Button } from '../ui/Button'

const COLS = [
  {
    title: 'Events',
    links: [
      { to: '/events', label: 'Events archive' },
      { to: '/events/hackers-occupied-delhi', label: "Hackers Occupied Delhi '27" },
      { to: '/gallery', label: 'Gallery' },
    ],
  },
  {
    title: 'Partner',
    links: [
      { to: '/partner', label: 'Sponsor an event' },
      { to: '/collaborate', label: 'Co-host, judge or mentor' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { to: '/about', label: 'About Genesis' },
      { to: '/values', label: 'How we run events' },
      { to: '/team', label: 'Team' },
      { to: '/careers', label: 'Join the crew' },
      { to: '/guide', label: 'Organiser guide' },
    ],
  },
]

/**
 * The footer is the last beat of every page: the ask, the people to ask, and a wordmark
 * that rises letter by letter as the page runs out.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const [reduced, setReduced] = useState(isReduced)

  useFx(ref, (root, red) => {
    if (red) return
    const letters = root.querySelectorAll('.ftr__letter')
    gsap.fromTo(
      letters,
      { yPercent: 100 },
      { yPercent: 0, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: root.querySelector('.ftr__mark'), start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } },
    )
    gsap.fromTo(root.querySelector('.ftr__inner'), { yPercent: -18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 30%', scrub: true } })
  })

  const toggleMotion = () => {
    const next = reduced ? 'full' : 'reduced'
    setMotionPreference(next)
    setReduced(!reduced)
    window.setTimeout(() => window.location.reload(), 120)
  }

  return (
    <footer ref={ref} className="ftr theme-ink" data-theme="ink">
      <div className="ftr__inner wrap">
        <div className="ftr__top">
          <p className="mono faint" data-fx="fade">
            Sponsoring Hackers Occupied Delhi 2027?
          </p>
          <h2 className="ftr__title display" data-fx="lines">
            Partner with <em className="serif">Genesis.</em>
          </h2>
          <div className="ftr__contact" data-fx="stagger">
            <a href={`mailto:${CONTACT.email}`} className="ftr__big" data-cursor="Write">
              {CONTACT.email}
            </a>
            <a href={CONTACT.phoneHref} className="ftr__big" data-cursor="Call">
              {CONTACT.phone}
            </a>
            <p className="mono faint">We reply {CONTACT.replyTime}.</p>
          </div>
          <div className="ftr__actions" data-fx="fade">
            <Button to="/partner" variant="accent">
              Sponsor an event
            </Button>
            <Button to="/events/hackers-occupied-delhi" variant="ghost">
              About Delhi 2027
            </Button>
          </div>
        </div>

        <div className="ftr__cols" data-fx="stagger">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title} className="ftr__col">
              <h3 className="mono faint">{c.title}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="ftr__link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Follow" className="ftr__col">
            <h3 className="mono faint">Follow</h3>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="ftr__link" target="_blank" rel="noopener noreferrer">
                    {s.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ftr__mark" aria-hidden="true">
          {'GENESIS'.split('').map((c, i) => (
            <span key={i} className="ftr__letter">
              {c}
            </span>
          ))}
        </div>

        <div className="ftr__bottom mono">
          <span>© 2026 Genesis Hacks</span>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <button type="button" onClick={toggleMotion} aria-pressed={reduced}>
            Reduce motion: {reduced ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            className="ftr__top-btn"
            onClick={() => {
              scrollToY(0)
              ScrollTrigger.refresh()
            }}
          >
            Back to hour zero ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
