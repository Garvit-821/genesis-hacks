import { PARTNER_STEPS, PROOF_EVENTS, SPONSOR_OUTCOMES } from '../data/site'
import { gsap } from '../lib/motion'
import { Tag } from './ui/Bits'

const CARD_THEMES = [
  { bg: 'var(--ink)', fg: 'var(--paper)' },
  { bg: 'var(--violet-deep)', fg: '#f6f3ff' },
  { bg: 'var(--amber)', fg: 'var(--ink)' },
]

/** Reach, Talent, Adoption as cards that stack: each one sticks, and shrinks as the next covers it. */
export function OutcomeStack() {
  return (
    <div className="stack">
      {SPONSOR_OUTCOMES.map((o, i) => (
        <article key={o.key} className="stack__card" style={{ '--i': i, '--card-bg': CARD_THEMES[i].bg, '--card-fg': CARD_THEMES[i].fg } as React.CSSProperties}>
          <span className="stack__n mono">0{i + 1} / 03</span>
          <h3 className="stack__title display">{o.title}</h3>
          <p className="stack__line">{o.line}</p>
          <ul className="stack__formats">
            {o.formats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

/** Call inside a useFx setup. Works for any .stack__card list on the page. */
export function stackFx(root: HTMLElement, reduced: boolean) {
  if (reduced) return
  const cards = Array.from(root.querySelectorAll<HTMLElement>('.stack__card'))
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next || next.parentElement !== card.parentElement) return
    gsap.to(card, { scale: 0.9, filter: 'brightness(0.6)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true } })
  })
}

export function Steps() {
  return (
    <ol className="steps">
      <span className="steps__line" data-fx="rule" aria-hidden="true" />
      {PARTNER_STEPS.map((s) => (
        <li key={s.n} className="step" data-fx="fade" data-delay={String((Number(s.n) - 1) * 0.12)}>
          <span className="step__dot" aria-hidden="true" />
          <span className="step__n display">{s.n}</span>
          <h3 className="step__title">{s.title}</h3>
          <p className="step__line">{s.line}</p>
        </li>
      ))}
    </ol>
  )
}

export function ProofRows() {
  return (
    <div className="rows" data-fx="stagger">
      {PROOF_EVENTS.map((p, i) => (
        <div key={p.name} className="row row--hover">
          <span className="row__n mono">0{i + 1}</span>
          <h3 className="row__title">{p.name}</h3>
          <p className="row__meta">
            {p.venue}
            <br />
            <span className="faint">{p.fact}</span>
          </p>
          <Tag>{p.role}</Tag>
        </div>
      ))}
    </div>
  )
}
