import { Link } from 'react-router-dom'
import type { ReactNode, MouseEventHandler } from 'react'

type Props = {
  to?: string
  href?: string
  children: ReactNode
  variant?: 'solid' | 'ghost' | 'line' | 'accent'
  arrow?: 'right' | 'down' | 'out' | 'none'
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler
  disabled?: boolean
  className?: string
  external?: boolean
}

export function Arrow({ dir = 'right' }: { dir?: 'right' | 'down' | 'out' | 'left' }) {
  const rot = dir === 'down' ? 90 : dir === 'out' ? -45 : dir === 'left' ? 180 : 0
  return (
    <svg className="arrow" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  )
}

/** Text that rolls to a duplicate on hover; used by every button and nav link. */
export function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="roll">
      <span className="roll__a">{children}</span>
      <span className="roll__b" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}

export function Button({ to, href, children, variant = 'solid', arrow = 'right', type = 'button', onClick, disabled, className = '', external }: Props) {
  const cls = `btn btn--${variant} ${className}`.trim()
  const inner = (
    <>
      <Roll>{children}</Roll>
      {arrow !== 'none' && (
        <span className="btn__icon">
          <Arrow dir={arrow} />
        </span>
      )}
    </>
  )
  if (to)
    return (
      <Link to={to} className={cls} data-magnetic onClick={onClick}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} data-magnetic onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    )
  return (
    <button type={type} className={cls} data-magnetic onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  )
}
