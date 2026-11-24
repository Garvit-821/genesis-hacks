import { useId, useState, type ReactNode } from 'react'

export function Accordion({ items, first = true }: { items: Array<{ q: string; a: ReactNode }>; first?: boolean }) {
  const [open, setOpen] = useState<number | null>(first ? 0 : null)
  const id = useId()
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div key={it.q} className="acc__item">
          <h3>
            <button type="button" className="acc__btn" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)}>
              <span>{it.q}</span>
              <span className="acc__icon" aria-hidden="true" />
            </button>
          </h3>
          <div id={`${id}-${i}`} className={`acc__panel ${open === i ? 'is-open' : ''}`} role="region" inert={open !== i}>
            <div>
              <div className="acc__body">{it.a}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
