import { useEffect, useRef, useState } from 'react'
import { isReduced } from '../../lib/motion'

/**
 * An odometer for a running total. Each digit is a reel that spins up to its place when the
 * number scrolls into view; a pulsing LIVE tag and a scanning line say "still counting".
 * The figure shown is the rounded threshold passed so far; it never invents new increments.
 */
export function LiveCount({ value, label, size = 'xl', className = '' }: { value: number; label: string; size?: 'xl' | 'm'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const text = new Intl.NumberFormat('en-IN').format(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isReduced()) return setOn(true)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true)
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  let digit = 0
  return (
    <div ref={ref} className={`live live--${size} ${on ? 'is-on' : ''} ${className}`}>
      <span className="sr-only">
        {text}+ {label}, and still counting
      </span>
      <span className="live__tag mono" aria-hidden="true">
        <i />
        Live · still counting
      </span>
      <span className="live__num display" aria-hidden="true">
        {text.split('').map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i} className="live__sep">{ch}</span>
          const n = Number(ch)
          const d = digit++
          return (
            <span key={i} className="live__reel">
              <span className="live__strip" style={{ transform: `translateY(${on ? -(20 + n) : 0}em)`, transitionDelay: `${d * 110}ms` }}>
                {Array.from({ length: 30 }, (_, k) => (
                  <span key={k}>{k % 10}</span>
                ))}
              </span>
            </span>
          )
        })}
        <span className="live__plus">+</span>
      </span>
      <span className="live__label mono" aria-hidden="true">
        {label}
      </span>
      <span className="live__scan" aria-hidden="true" />
    </div>
  )
}
