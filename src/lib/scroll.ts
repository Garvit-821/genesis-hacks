import Lenis from 'lenis'
import { gsap, ScrollTrigger, isReduced } from './motion'

let lenis: Lenis | null = null

export function initScroll() {
  if (typeof window === 'undefined') return null
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (isReduced() || lenis) return lenis
  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true, anchors: false })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  document.documentElement.classList.add('lenis')
  return lenis
}

export const getLenis = () => lenis

export function scrollToY(y: number | HTMLElement | string, opts: { immediate?: boolean; offset?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(y, { immediate: opts.immediate, offset: opts.offset ?? 0, duration: 1.4, force: true })
    return
  }
  if (typeof y === 'number') window.scrollTo({ top: y, behavior: 'auto' })
  else {
    const el = typeof y === 'string' ? document.querySelector(y) : y
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
      window.scrollTo({ top, behavior: 'auto' })
    }
  }
}

export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.body.classList.toggle('is-locked', lock)
}
