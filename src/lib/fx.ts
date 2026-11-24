import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, SplitText, isReduced, requestRefresh } from './motion'
import { whenRevealed } from './transition'

/**
 * Declarative motion vocabulary. Markup opts in with data attributes; this file is the only
 * place that knows how each one moves. Content is always rendered in its final state, so
 * no-JS and reduced-motion visitors read the page as-is.
 *
 * data-fx="lines|words|chars"  masked type reveal          data-intro  play when the curtain lifts
 * data-fx="fade|stagger"        rise + fade (children)       data-delay  seconds
 * data-fx="rule"                hairline draws from left     data-fx="img"  clip wipe + settle
 * data-fx="scrub-words"         words light up with scroll   data-parallax="0.15"
 * data-count="21699"            number counts up             data-fx="draw"  SVG strokes draw on
 */

type Cleanup = () => void

function onEnter(el: Element, intro: boolean, play: () => gsap.core.Animation, start = 'clamp(top 88%)') {
  if (intro) {
    const anim = play()
    anim.pause()
    whenRevealed().then(() => anim.play())
    return
  }
  const anim = play()
  anim.pause()
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => anim.play() })
}

function delayOf(el: HTMLElement) {
  return Number(el.dataset.delay || 0)
}

export function applyFx(root: HTMLElement): Cleanup[] {
  const cleanups: Cleanup[] = []
  if (isReduced()) return cleanups
  const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T & HTMLElement>(sel))

  // ---- type reveals ------------------------------------------------------------
  q('[data-fx="lines"], [data-fx="words"], [data-fx="chars"]').forEach((el) => {
    const kind = el.dataset.fx as 'lines' | 'words' | 'chars'
    const intro = el.hasAttribute('data-intro')
    const type = kind === 'lines' ? 'lines' : kind === 'words' ? 'words,lines' : 'chars,words,lines'
    const split = SplitText.create(el, { type, mask: kind === 'lines' ? 'lines' : kind === 'words' ? 'words' : 'chars', linesClass: 'fx-line', aria: 'auto' })
    const targets = kind === 'lines' ? split.lines : kind === 'words' ? split.words : split.chars
    onEnter(el, intro, () =>
      gsap.from(targets, {
        yPercent: kind === 'chars' ? 115 : 108,
        rotate: kind === 'lines' ? 0 : 4,
        duration: kind === 'lines' ? 1.15 : 1,
        stagger: kind === 'lines' ? 0.085 : kind === 'words' ? 0.035 : 0.018,
        delay: delayOf(el),
        ease: 'expo.out',
        onComplete: () => split.revert(),
      }),
    )
    cleanups.push(() => split.revert())
  })

  q('[data-fx="fade"]').forEach((el) => {
    onEnter(el, el.hasAttribute('data-intro'), () =>
      gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, delay: delayOf(el), ease: 'expo.out', clearProps: 'transform' }),
    )
  })

  q('[data-fx="stagger"]').forEach((el) => {
    const kids = Array.from(el.children)
    onEnter(el, el.hasAttribute('data-intro'), () =>
      gsap.from(kids, { y: 40, autoAlpha: 0, duration: 1, stagger: 0.07, delay: delayOf(el), ease: 'expo.out', clearProps: 'transform' }),
      'clamp(top 90%)',
    )
  })

  q('[data-fx="rule"]').forEach((el) => {
    onEnter(el, el.hasAttribute('data-intro'), () =>
      gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.4, delay: delayOf(el), ease: 'expo.inOut' }),
      'clamp(top 95%)',
    )
  })

  q('[data-fx="img"]').forEach((el) => {
    const img = el.querySelector('img')
    onEnter(el, el.hasAttribute('data-intro'), () => {
      const tl = gsap.timeline({ delay: delayOf(el) })
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1)
      return tl
    }, 'clamp(top 92%)')
  })

  q('[data-fx="draw"]').forEach((el) => {
    const paths = Array.from(el.querySelectorAll<SVGGeometryElement>('path, line, rect, circle, polyline'))
    paths.forEach((p) => {
      const len = p.getTotalLength?.() || 0
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })
    onEnter(el, el.hasAttribute('data-intro'), () =>
      gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, stagger: 0.02, delay: delayOf(el), ease: 'power3.inOut' }),
    )
  })

  // ---- scrubbed --------------------------------------------------------------------
  q('[data-fx="scrub-words"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', aria: 'auto' })
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } },
    )
    cleanups.push(() => split.revert())
  })

  q('[data-parallax]').forEach((el) => {
    const v = Number(el.dataset.parallax || 0.15)
    gsap.fromTo(
      el,
      { yPercent: -v * 50 },
      { yPercent: v * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  })

  q('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count)
    const suffix = el.dataset.suffix || ''
    const fmt = new Intl.NumberFormat('en-IN')
    const obj = { v: 0 }
    const render = () => (el.textContent = fmt.format(Math.round(obj.v)) + suffix)
    // The real figure stays in the markup until the count actually starts.
    onEnter(el, el.hasAttribute('data-intro'), () => gsap.to(obj, { v: end, duration: 2.2, delay: delayOf(el), ease: 'expo.out', onUpdate: render }))
  })

  return cleanups
}

/**
 * Runs the declarative vocabulary plus an optional page-specific setup inside one gsap context,
 * then sorts and refreshes ScrollTrigger so pins and later triggers agree on positions.
 */
export function useFx(
  ref: RefObject<HTMLElement | null>,
  setup?: (root: HTMLElement, reduced: boolean) => void | Cleanup,
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    let extra: Cleanup[] = []
    let custom: void | Cleanup
    const ctx = gsap.context(() => {
      custom = setup?.(root, isReduced())
      extra = applyFx(root)
    }, root)
    requestRefresh()
    return () => {
      extra.forEach((fn) => fn())
      if (typeof custom === 'function') custom()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
