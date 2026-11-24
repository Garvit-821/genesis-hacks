import { useEffect, useRef } from 'react'
import { gsap, isFinePointer, isReduced } from '../../lib/motion'

/**
 * A ring that trails the pointer and grows into a label over anything marked data-cursor.
 * Also drives the magnetic pull on [data-magnetic]. The native cursor stays visible; this is
 * an accent, not a replacement. Off for touch and reduced motion.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isFinePointer() || isReduced()) return
    const el = ring.current!
    document.documentElement.classList.add('has-cursor')
    gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
    let magnet: HTMLElement | null = null
    let mx: gsap.QuickToFunc | null = null
    let my: gsap.QuickToFunc | null = null

    const release = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
      magnet = null
    }

    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const target = e.target as HTMLElement
      const labelled = target.closest<HTMLElement>('[data-cursor]')
      const interactive = target.closest('a, button, [role="button"], input, select, textarea, label')
      el.classList.toggle('is-label', !!labelled)
      el.classList.toggle('is-hover', !labelled && !!interactive)
      if (labelled && label.current) label.current.textContent = labelled.dataset.cursor || ''
      const m = target.closest<HTMLElement>('[data-magnetic]')
      if (m !== magnet) {
        release()
        magnet = m
        if (m) {
          mx = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3.out' })
          my = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3.out' })
        }
      }
      if (magnet && mx && my) {
        const r = magnet.getBoundingClientRect()
        mx((e.clientX - (r.left + r.width / 2)) * 0.28)
        my((e.clientY - (r.top + r.height / 2)) * 0.36)
      }
    }
    const leave = () => el.classList.add('is-gone')
    const enter = () => el.classList.remove('is-gone')
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={ring} className="cursor" aria-hidden="true">
      <span className="cursor__ring" />
      <span ref={label} className="cursor__label mono" />
    </div>
  )
}
