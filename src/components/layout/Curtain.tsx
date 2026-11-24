import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { gsap, isReduced } from '../../lib/motion'
import type { RouteMeta } from '../../data/routes'

export type CurtainHandle = {
  cover: (meta: RouteMeta) => Promise<void>
  reveal: (onMid: () => void) => Promise<void>
}

const N = 64
const wobble = (i: number, seed: number) => Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 2.3 + seed * 1.7) * 0.3 + Math.sin(i * 5.1 + seed * 0.4) * 0.2

/** The leading lip of a rising panel: a ragged arch of wet ink that flattens as it lands (k: 1 to 0). */
function lip(k: number, seed: number) {
  let d = 'M0,100'
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const h = k * (Math.sin(u * Math.PI) * 84 + wobble(i, seed) * 14)
    d += ` L${(u * 100).toFixed(2)},${(100 - Math.max(0, h)).toFixed(2)}`
  }
  return `${d} L100,100 Z`
}

/** The trailing edge as the panel lifts away: the ink sags and drips stretch off it (p: 0 to 1). */
function drips(p: number, seed: number) {
  const M = 140
  const drops = Array.from({ length: 9 }, (_, j) => ({
    x: ((j + 0.5) / 9 + Math.sin(seed + j * 3.1) * 0.035) * 100,
    w: 1.4 + Math.abs(Math.sin(seed * 2 + j)) * 1.6,
    len: 30 + Math.abs(Math.sin(seed + j * 1.9)) * 66,
  }))
  let d = 'M0,0'
  for (let i = 0; i <= M; i++) {
    const x = (i / M) * 100
    let y = p * (Math.sin((i / M) * Math.PI) * 9 + wobble(i, seed) * 3)
    for (const dr of drops) {
      const t = (x - dr.x) / dr.w
      if (Math.abs(t) < 1) y = Math.max(y, p * dr.len * Math.sqrt(1 - t * t))
    }
    d += ` L${x.toFixed(2)},${Math.max(0, y).toFixed(2)}`
  }
  return `${d} L100,0 Z`
}
const DIGITS = '0123456789'

/** Scrambles the digits of a clock stamp before it settles, like a split-flap board. */
function scramble(el: HTMLElement, final: string, ms = 520) {
  const start = performance.now()
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / ms)
    const settled = Math.floor(final.length * p)
    el.textContent = final
      .split('')
      .map((ch, i) => (i < settled || !/\d/.test(ch) ? ch : DIGITS[Math.floor(Math.random() * 10)]))
      .join('')
    if (p < 1) requestAnimationFrame(tick)
  }
  tick()
}

/**
 * The page transition. A violet leading edge and an ink panel rise with a curved lip that
 * flattens as it lands; the destination's clock stamp, name and one line of narration show
 * while the next page mounts underneath; then the panel lifts off the top. Reduced motion: a
 * 200 ms crossfade with the same words.
 */
export const Curtain = forwardRef<CurtainHandle>(function Curtain(_, ref) {
  const root = useRef<HTMLDivElement>(null)
  const accent = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const topEdge = useRef<SVGPathElement>(null)
  const accentEdge = useRef<SVGPathElement>(null)
  const bottomEdge = useRef<SVGPathElement>(null)
  const stamp = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const line = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const seed = useRef(0)

  useLayoutEffect(() => {
    gsap.set([accent.current, panel.current], { yPercent: 100 })
  }, [])

  useImperativeHandle(ref, () => ({
    cover(meta) {
      return new Promise<void>((resolve) => {
        const r = root.current!
        stamp.current!.textContent = meta.stamp
        label.current!.textContent = meta.label
        line.current!.textContent = meta.line
        r.classList.add('is-active')
        if (isReduced()) {
          gsap.set([accent.current, panel.current], { yPercent: 0 })
          gsap.fromTo(r, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', onComplete: resolve })
          return
        }
        gsap.set(r, { opacity: 1 })
        seed.current = Math.random() * 100
        const sd = seed.current
        const edge = { a: 1, m: 1 }
        const tl = gsap.timeline({ onComplete: resolve })
        tl.set([accent.current, panel.current], { yPercent: 100 })
          .set(accentEdge.current, { attr: { d: lip(1, sd) } })
          .set(topEdge.current, { attr: { d: lip(1, sd + 3) } })
          .set(bottomEdge.current, { attr: { d: drips(0, sd) } })
          .set([label.current, line.current], { yPercent: 110, opacity: 1 })
          .set(stamp.current, { opacity: 0 })
          .set(bar.current, { scaleX: 0 })
          .to(accent.current, { yPercent: 0, duration: 0.75, ease: 'expo.inOut' }, 0)
          .to(edge, { a: 0, duration: 0.75, ease: 'expo.inOut', onUpdate: () => accentEdge.current!.setAttribute('d', lip(edge.a, sd)) }, 0)
          .to(panel.current, { yPercent: 0, duration: 0.8, ease: 'expo.inOut' }, 0.07)
          .to(edge, { m: 0, duration: 0.8, ease: 'expo.inOut', onUpdate: () => topEdge.current!.setAttribute('d', lip(edge.m, sd + 3)) }, 0.07)
          .to(stamp.current, { opacity: 1, duration: 0.2, onStart: () => scramble(stamp.current!, meta.stamp) }, 0.45)
          .to(label.current, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 0.5)
          .to(line.current, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 0.58)
          .to(bar.current, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, 0.5)
      })
    },
    reveal(onMid) {
      return new Promise<void>((resolve) => {
        const r = root.current!
        const done = () => {
          r.classList.remove('is-active')
          gsap.set([accent.current, panel.current], { yPercent: 100 })
          resolve()
        }
        if (isReduced()) {
          onMid()
          gsap.to(r, { opacity: 0, duration: 0.2, ease: 'none', onComplete: done })
          return
        }
        const drip = { p: 0 }
        const tl = gsap.timeline({ onComplete: done })
        tl.to([label.current, line.current, stamp.current], { yPercent: -60, opacity: 0, duration: 0.45, ease: 'power3.in', stagger: 0.03 }, 0)
          .to(panel.current, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, 0.1)
          .to(drip, { p: 1, duration: 0.95, ease: 'power2.in', onUpdate: () => bottomEdge.current!.setAttribute('d', drips(drip.p, seed.current)) }, 0.1)
          .to(accent.current, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, 0.16)
          .call(onMid, [], 0.42)
      })
    },
  }))

  return (
    <div ref={root} className="curtain" aria-hidden="true">
      <div ref={accent} className="curtain__panel curtain__panel--accent">
        <svg className="curtain__edge curtain__edge--top" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={accentEdge} d={lip(1, 0)} />
        </svg>
      </div>
      <div ref={panel} className="curtain__panel curtain__panel--main">
        <svg className="curtain__edge curtain__edge--top" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={topEdge} d={lip(1, 3)} />
        </svg>
        <div className="curtain__content">
          <span ref={stamp} className="curtain__stamp mono">
            T+00:00
          </span>
          <span className="curtain__mask">
            <span ref={label} className="curtain__label display">
              Genesis
            </span>
          </span>
          <span className="curtain__mask">
            <span ref={line} className="curtain__line serif">
              Doors open.
            </span>
          </span>
          <span ref={bar} className="curtain__bar" />
        </div>
        <svg className="curtain__edge curtain__edge--bottom" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={bottomEdge} d={drips(0, 0)} />
        </svg>
      </div>
    </div>
  )
})
