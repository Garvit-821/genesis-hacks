import { Fragment, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { metaFor } from '../../data/routes'
import { Rich } from '../ui/Bits'

type Props = {
  title: string
  lead?: ReactNode
  eyebrow?: string
  actions?: ReactNode
  aside?: ReactNode
  theme?: 'paper' | 'ink' | 'night' | 'amber' | 'violet'
  size?: 'xl' | 'l' | 'm'
  children?: ReactNode
  className?: string
}

/**
 * Every inner page opens the same way: the clock stamp it lives at, a masked title that rises
 * line by line when the curtain lifts, and a hairline that draws across. Consistency here is what
 * lets the set pieces further down each page feel like chapters of one story.
 */
export function PageHero({ title, lead, eyebrow, actions, aside, theme = 'paper', size = 'xl', children, className = '' }: Props) {
  const { pathname } = useLocation()
  const meta = metaFor(pathname)
  const lines = title.split('\n')
  return (
    <section className={`phero phero--${size} theme-${theme} ${className}`} data-theme={theme}>
      <div className="wrap">
        <div className="phero__meta mono" data-fx="fade" data-intro>
          <span className="phero__stamp">
            <span className="phero__dot" aria-hidden="true" />
            {meta.stamp}
          </span>
          <span className="phero__eyebrow">{eyebrow ?? meta.label}</span>
          <span className="phero__line serif mono--lc">{meta.line}</span>
        </div>
        <h1 className="phero__title display" data-fx="lines" data-intro data-delay="0.05">
          {lines.map((l, i) => (
            <Fragment key={i}>
              <Rich text={l} />
              {i < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <hr className="rule rule--strong phero__rule" data-fx="rule" data-intro data-delay="0.2" />
        <div className="phero__foot">
          {lead && (
            <div className="phero__lead lead" data-fx="fade" data-intro data-delay="0.35">
              {lead}
            </div>
          )}
          {actions && (
            <div className="phero__actions" data-fx="fade" data-intro data-delay="0.45">
              {actions}
            </div>
          )}
          {aside && (
            <div className="phero__aside" data-fx="stagger" data-intro data-delay="0.5">
              {aside}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}

export function Stat({ value, count, suffix, label, note }: { value: string; count?: number; suffix?: string; label: string; note?: string }) {
  return (
    <div className="stat">
      <span className="stat__value display" {...(count ? { 'data-count': count, 'data-suffix': suffix ?? '' } : {})}>
        {value}
      </span>
      <span className="stat__label mono">{label}</span>
      {note && <span className="stat__note mono faint">{note}</span>}
    </div>
  )
}
