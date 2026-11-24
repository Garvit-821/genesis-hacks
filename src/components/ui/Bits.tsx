import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { DELHI, daysToDelhi } from '../../data/site'

/** Mono eyebrow with an index, the way every section introduces itself. */
export function Kicker({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`kicker mono ${className}`} data-fx="fade">
      {n && <span className="kicker__n">({n})</span>}
      <span>{children}</span>
    </p>
  )
}

/** Parses *italic serif* segments inside display headings: "hour *zero*." */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('*') ? (
          <em key={i} className="serif">
            {p.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function SectionHead({ n, kicker, title, intro, as = 'h2', className = '' }: { n?: string; kicker?: string; title: string; intro?: ReactNode; as?: 'h2' | 'h3'; className?: string }) {
  const H = as
  return (
    <header className={`shead ${className}`}>
      {kicker && <Kicker n={n}>{kicker}</Kicker>}
      <H className="shead__title display" data-fx="lines">
        <Rich text={title} />
      </H>
      {intro && (
        <div className="shead__intro lead" data-fx="fade" data-delay="0.15">
          {intro}
        </div>
      )}
    </header>
  )
}

export function Tag({ children, tone = 'line' }: { children: ReactNode; tone?: 'line' | 'solid' | 'accent' | 'warn' }) {
  return <span className={`tag tag--${tone} mono`}>{children}</span>
}

/** "Next up" band that closes most pages and points at the next action. */
export function NextUp({ to = DELHI.path, kicker = 'Next up', title = "Hackers Occupied Delhi '27", meta = `${DELHI.where} · ${DELHI.when} · ${DELHI.teams} teams` }: { to?: string; kicker?: string; title?: string; meta?: string }) {
  return (
    <section className="nextup theme-violet" data-theme="violet">
      <Link to={to} className="nextup__link wrap" data-cursor="Go">
        <span className="mono nextup__kicker">
          {kicker} · {daysToDelhi()} days to go <span className="faint">(tentative date)</span>
        </span>
        <span className="nextup__title display">{title}</span>
        <span className="nextup__meta mono">{meta}</span>
        <span className="nextup__arrow" aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

export function ContactLines({ className = '' }: { className?: string }) {
  return (
    <div className={`contact-lines ${className}`}>
      <a href="mailto:partner@genesishacks.com" className="contact-lines__big" data-cursor="Write">
        partner@genesishacks.com
      </a>
      <a href="tel:+917043388006" className="contact-lines__big" data-cursor="Call">
        +91 70433 88006
      </a>
      <p className="mono faint">We reply within 2 business days.</p>
    </div>
  )
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="actions">{children}</div>
}

export { Button }
