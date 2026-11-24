import { gsap, ScrollTrigger, isFinePointer } from '../../lib/motion'
import { LINEUP } from '../../data/site'
import type { NamesScene } from './namesScene'

type Cleanup = () => void
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T
const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as T[]

/* ------------------------------------------------------------------ 03 tally */
/**
 * 2,000 hand-drawn tally marks (one per ten builders), drawn stroke by stroke as you scroll.
 * Groups of five: four uprights and a diagonal. The first 35% (women) are drawn in vermilion.
 */
function tally(root: HTMLElement, reduced: boolean): Cleanup {
  const canvas = $<HTMLCanvasElement>(root, '.tallyfig__canvas')
  const ctx = canvas.getContext('2d')!
  const GROUPS = 400
  const WOMEN = 140
  const css = getComputedStyle(document.documentElement)
  const INK = css.getPropertyValue('--ink').trim() || '#0c0b10'
  const SPOT = css.getPropertyValue('--vermilion').trim() || '#e23b27'
  type Stroke = { x0: number; y0: number; x1: number; y1: number; spot: boolean }
  let strokes: Stroke[] = []
  let progress = reduced ? 1 : 0
  let lw = 1.6

  // Seeded jitter so the hand is the same on every visit.
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const layout = () => {
    seed = 7
    const w = canvas.parentElement!.clientWidth
    const small = w < 640
    const gw = small ? 15 : 21 // group width
    const gh = small ? 17 : 24 // group height
    const gap = small ? 6 : 9
    const cols = Math.max(1, Math.floor((w + gap) / (gw + gap)))
    const rows = Math.ceil(GROUPS / cols)
    const h = rows * (gh + gap)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    lw = small ? 1.25 : 1.6
    strokes = []
    for (let g = 0; g < GROUPS; g++) {
      const c = g % cols
      const r = Math.floor(g / cols)
      const ox = c * (gw + gap) + 2
      const oy = r * (gh + gap) + 2
      const spot = g < WOMEN
      const step = (gw - 4) / 4
      for (let k = 0; k < 4; k++) {
        const x = ox + k * step + (rnd() - 0.5) * 1.4
        strokes.push({ x0: x + (rnd() - 0.5) * 1.2, y0: oy + rnd() * 2, x1: x + (rnd() - 0.5) * 2.2, y1: oy + gh - rnd() * 2.5, spot })
      }
      strokes.push({ x0: ox - 2 + rnd() * 1.5, y0: oy + gh * (0.72 + rnd() * 0.1), x1: ox + gw + rnd() * 2, y1: oy + gh * (0.18 + rnd() * 0.12), spot })
    }
    draw()
  }
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineWidth = lw
    const n = progress * strokes.length
    const full = Math.floor(n)
    for (let i = 0; i < Math.min(full + 1, strokes.length); i++) {
      const s = strokes[i]
      const f = i < full ? 1 : n - full
      if (f <= 0) break
      ctx.strokeStyle = s.spot ? SPOT : INK
      ctx.globalAlpha = 0.82 + ((i * 37) % 17) / 100
      ctx.beginPath()
      ctx.moveTo(s.x0, s.y0)
      ctx.lineTo(s.x0 + (s.x1 - s.x0) * f, s.y0 + (s.y1 - s.y0) * f)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
  layout()
  const ro = new ResizeObserver(layout)
  ro.observe(canvas.parentElement!)
  if (!reduced) {
    ScrollTrigger.create({
      trigger: canvas,
      start: 'top 88%',
      end: 'bottom 55%',
      scrub: 0.6,
      onUpdate: (st) => {
        progress = st.progress
        draw()
      },
    })
  }
  return () => ro.disconnect()
}

/** Ledger lines: the leader dots run out to the figure, then the figure is stamped in. */
function ledger(root: HTMLElement, reduced: boolean) {
  if (reduced) return
  const rows = $$(root, '.ledger__row')
  const tl = gsap.timeline({ paused: true })
  rows.forEach((r, i) => {
    tl.fromTo($(r, '.ledger__dots'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.5, ease: 'power2.out' }, i * 0.14)
      .fromTo($(r, 'dd'), { scale: 1.5, autoAlpha: 0, rotate: -4 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.35, ease: 'back.out(3)' }, i * 0.14 + 0.38)
  })
  ScrollTrigger.create({ trigger: $(root, '.ledger'), start: 'top 82%', once: true, onEnter: () => tl.play() })
  gsap.from($$(root, '.where__list li'), {
    autoAlpha: 0,
    x: -14,
    duration: 0.5,
    stagger: 0.035,
    ease: 'power2.out',
    scrollTrigger: { trigger: $(root, '.where__list'), start: 'top 85%', once: true },
  })
}

/* ----------------------------------------------------------------- 04 plates */
function plates(root: HTMLElement, reduced: boolean): Cleanup | void {
  const sec = $(root, '.plates')
  const track = $(sec, '.plates__track')
  const prep = (card: HTMLElement) => {
    const paths = $$<SVGGeometryElement>(card, '.floorplan path, .floorplan rect')
    paths.forEach((p) => {
      const l = p.getTotalLength()
      p.style.strokeDasharray = `${l}`
      p.style.strokeDashoffset = reduced ? '0' : `${l}`
    })
    return paths
  }
  if (reduced) {
    $$(sec, '.plate').forEach(prep)
    return
  }
  const mm = gsap.matchMedia()
  // Each plate: the double frame is ruled, the plan is drawn, and the stamp lands with a thunk.
  const plateIn = (card: HTMLElement, st: ScrollTrigger.Vars) => {
    const paths = prep(card)
    const tl = gsap.timeline({ scrollTrigger: { ...st, toggleActions: 'play none none reverse' } })
    tl.fromTo(card.querySelector('.plate__frame'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut' })
    if (paths.length) tl.to(paths, { strokeDashoffset: 0, duration: 1.3, stagger: 0.012, ease: 'power2.inOut' }, 0.35)
    const stamp = card.querySelector('.stamp')
    if (stamp) tl.fromTo(stamp, { scale: 2.4, autoAlpha: 0, rotate: 8 }, { scale: 1, autoAlpha: 0.92, rotate: -9, duration: 0.32, ease: 'power4.in' }, 1.1).to(card, { x: '+=3', duration: 0.05, yoyo: true, repeat: 3 }, 1.42)
    return tl
  }
  mm.add('(min-width: 768px)', () => {
    sec.classList.add('plates--live')
    const dist = () => track.scrollWidth - window.innerWidth
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true },
    })
    const vw = window.innerWidth
    $$(sec, '.plate').forEach((card) => {
      // Plates already on screen when the pin begins are printed as the section arrives;
      // the rest are printed as the track carries them in from the right.
      const early = card.offsetLeft < vw * 0.8
      plateIn(card, early ? { trigger: sec, start: 'top 40%' } : { trigger: card, containerAnimation: tween, start: 'left 82%' })
      gsap.fromTo(card, { rotate: 2.5, y: 40 }, { rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 40%', scrub: true } })
    })
    return () => {
      sec.classList.remove('plates--live')
      gsap.set(track, { clearProps: 'transform' })
    }
  })
  mm.add('(max-width: 767px)', () => {
    $$(sec, '.plate').forEach((card) => plateIn(card, { trigger: card, start: 'top 82%' }))
  })
  return () => mm.revert()
}

/* ---------------------------------------------------------- 05 night edition */
function edition(root: HTMLElement, reduced: boolean) {
  if (reduced) return
  const sec = $(root, '.edition')
  const paper = $(sec, '.paper')
  // The old film montage: the front page spins up out of the dark and lands on the desk.
  gsap.fromTo(
    paper,
    { rotate: -620, scale: 0.12, autoAlpha: 0.2 },
    { rotate: -1.6, scale: 1, autoAlpha: 1, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 5%', scrub: 0.6 } },
  )
  gsap.fromTo(
    $(sec, '.strike__line'),
    { scaleX: 0 },
    { scaleX: 1, ease: 'none', scrollTrigger: { trigger: $(sec, '.paper__headline'), start: 'top 62%', end: 'top 30%', scrub: 0.5 } },
  )
  gsap.from($$(sec, '.paper__dek, .paper__lead, .paper__col, .paper__box, .paper__foot'), {
    autoAlpha: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.09,
    ease: 'power3.out',
    scrollTrigger: { trigger: $(sec, '.paper__cols'), start: 'top 78%', once: true },
  })
}

/* ------------------------------------------------------------- 06 call sheet */
function callsheet(root: HTMLElement, reduced: boolean) {
  const sec = $(root, '.callsheet')
  const ring = $<SVGPathElement>(sec, '.doc__ring path')
  const len = ring.getTotalLength()
  ring.style.strokeDasharray = `${len}`
  ring.style.strokeDashoffset = reduced ? '0' : `${len}`
  if (reduced) return
  // A vermilion highlighter is dragged across each hour as it reaches the middle of the screen.
  $$(sec, '.doc__row').forEach((row) => {
    gsap.fromTo(row, { '--hl': 0 }, { '--hl': 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 72%', end: 'top 46%', scrub: 0.4 } })
  })
  const marked = $(sec, '.doc__row.is-marked')
  gsap
    .timeline({ scrollTrigger: { trigger: marked, start: 'top 55%', once: true } })
    .to(ring, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
    .from($(sec, '.doc__margin'), { autoAlpha: 0, x: -10, rotate: -12, duration: 0.5, ease: 'back.out(2)' }, 0.6)
  gsap.fromTo(
    $(sec, '.stamp--doc'),
    { scale: 2.6, autoAlpha: 0, rotate: 14 },
    { scale: 1, autoAlpha: 0.9, rotate: 7, duration: 0.32, ease: 'power4.in', scrollTrigger: { trigger: $(sec, '.doc__notes'), start: 'top 80%', once: true } },
  )
}

/* ------------------------------------------------------------- 07 the lineup */
/**
 * Look closer: the stage pins and the room is typed out line by line like a line printer; the view
 * then pushes in on the crowd until the engraving's lines read as names, travels along them, and
 * pulls back to the full room. A loupe follows a fine pointer and lights up every place the name
 * under it is printed; on touch, a tap does the same. Reduced motion: the room is shown already
 * printed, with the loupe still available.
 */
function lineup(root: HTMLElement, reduced: boolean): Cleanup | void {
  const sec = $(root, '.lineup')
  const stage = $(sec, '.lineup__stage')
  const canvas = $<HTMLCanvasElement>(sec, '.lineup__gl')
  const head = $(sec, '.lineup__head')
  const reveal = $(sec, '.lineup__reveal')
  const hint = $(sec, '.lineup__hint')
  const zv = $(sec, '.lineup__zv')
  const loupeEl = $(sec, '.lineup__loupe')
  const tip = $(sec, '.lineup__tip')
  const entries = LINEUP.flatMap((t, tier) => t.names.map((name) => ({ name, tier })))
  const crop = (canvas.dataset.crop || '0,0,1,1').split(',').map(Number) as [number, number, number, number]
  const FOCUS = { cx: 0.47, cy: 0.5 }

  sec.classList.add('lineup--live')
  const view = { cx: 0.5, cy: 0.5, zoom: 1 }
  const st = { print: reduced ? 1 : 0, head: 1, reveal: 0, hint: reduced ? 1 : 0 }
  let scene: NamesScene | null = null
  let tl: gsap.core.Timeline | null = null
  if (!reduced) {
    tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${window.innerHeight * 3.2}`, pin: true, scrub: 1, invalidateOnRefresh: true },
    })
    tl.to(st, { print: 1, duration: 1.3, ease: 'none' }, 0)
      .to(st, { head: 0, duration: 0.35, ease: 'none' }, 1.15)
      .to(view, { zoom: 3.8, cx: FOCUS.cx, cy: FOCUS.cy, duration: 1.3 }, 1.3)
      .to(st, { reveal: 1, duration: 0.35, ease: 'none' }, 2.25)
      .to(view, { cx: FOCUS.cx + 0.14, duration: 1, ease: 'sine.inOut' }, 2.6)
      .to(st, { reveal: 0, duration: 0.3, ease: 'none' }, 3.45)
      .to(view, { zoom: 1, cx: 0.5, cy: 0.5, duration: 1.2 }, 3.55)
      .to(st, { hint: 1, duration: 0.35, ease: 'none' }, 4.4)
      .to({}, { duration: 0.45 })
  }

  // ---- the loupe (fine pointer) and tap-to-find (touch) ----
  const fine = isFinePointer()
  const lp = { x: 0, y: 0, tx: 0, ty: 0, on: false, shown: 0 }
  let tapId = -1
  let tapTimer = 0
  const local = (e: MouseEvent) => {
    const r = stage.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top] as const
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const [x, y] = local(e)
    lp.tx = x
    lp.ty = y
    if (!lp.on) {
      lp.x = x
      lp.y = y
    }
    lp.on = true
  }
  const onLeave = () => (lp.on = false)
  const onTap = (e: MouseEvent) => {
    if (!scene) return
    const [x, y] = local(e)
    tapId = scene.pick(x, y, view)
    lp.x = lp.tx = x
    lp.y = lp.ty = y
    window.clearTimeout(tapTimer)
    tapTimer = window.setTimeout(() => (tapId = -1), 2600)
  }
  if (fine) {
    stage.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerleave', onLeave)
  }
  // On touch a tap (a click, so starting a scroll does not count) finds the name under the finger.
  if (!fine) stage.addEventListener('click', onTap)
  sec.classList.toggle('lineup--fine', fine)

  let visible = false
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(stage)
  let lastZoom = -1
  let lastTip = ''
  const tick = () => {
    if (!visible || !scene) return
    head.style.opacity = String(st.head)
    reveal.style.opacity = String(st.reveal)
    reveal.style.transform = `translate(-50%, ${(1 - st.reveal) * 12}px)`
    hint.style.opacity = String(st.hint)
    const z = Math.round(view.zoom * 100)
    if (z !== lastZoom) {
      lastZoom = z
      zv.textContent = `${z}%`
    }
    lp.x += (lp.tx - lp.x) * 0.25
    lp.y += (lp.ty - lp.y) * 0.25
    lp.shown += ((lp.on && st.print > 0.98 ? 1 : 0) - lp.shown) * 0.2
    const size = Math.round(Math.min(230, stage.clientWidth * 0.32))
    const hi = lp.on ? scene.pick(lp.x, lp.y, view) : tapId
    scene.frame(view, st.print, lp.shown > 0.05 ? { x: lp.x, y: lp.y, size, mag: 3.2 } : null, hi)
    loupeEl.style.opacity = String(lp.shown)
    loupeEl.style.width = loupeEl.style.height = `${size}px`
    loupeEl.style.transform = `translate(${lp.x - size / 2}px, ${lp.y - size / 2}px)`
    let label = ''
    if (hi >= 0) {
      const e = entries[hi]
      const n = scene.counts[hi]
      label = `${e.name} · ${LINEUP[e.tier].label} · printed ${n} times`
    }
    if (label !== lastTip) {
      lastTip = label
      if (label) tip.textContent = label
      tip.classList.toggle('is-on', !!label)
    }
    const below = lp.on ? size / 2 + 12 : 18
    tip.style.transform = `translate(calc(${lp.x}px - 50%), ${lp.y + below}px)`
  }
  gsap.ticker.add(tick)

  let dead = false
  const fail = () => {
    if (dead) return
    tl?.scrollTrigger?.kill(true)
    tl?.kill()
    sec.classList.remove('lineup--live')
    sec.classList.add('lineup--still')
    ScrollTrigger.refresh()
  }
  import('./namesScene')
    .then((m) => m.namesScene(canvas, canvas.dataset.photo || '', entries, crop))
    .then((s) => {
      if (dead) return s?.destroy()
      if (!s) return fail()
      scene = s
      ScrollTrigger.refresh()
    })
    .catch(fail)

  return () => {
    dead = true
    gsap.ticker.remove(tick)
    io.disconnect()
    window.clearTimeout(tapTimer)
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerleave', onLeave)
    stage.removeEventListener('click', onTap)
    scene?.destroy()
    scene = null
  }
}

/* ------------------------------------------------------------- 08 admit one */
function admit(root: HTMLElement, reduced: boolean): Cleanup | void {
  if (reduced) return
  const sec = $(root, '.admit')
  const ticket = $(sec, '.ticket')
  const stub = $(sec, '.ticket__stub')
  // The ticket rises out of the fold, then tears at the perforation as you read on.
  gsap.fromTo(ticket, { yPercent: 38, rotate: 5, autoAlpha: 0 }, { yPercent: 0, rotate: -2, autoAlpha: 1, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 20%', scrub: 0.6 } })
  gsap.fromTo(stub, { rotate: 0, x: 0, y: 0 }, { rotate: 9, x: 34, y: 14, ease: 'power2.in', scrollTrigger: { trigger: sec, start: 'top 10%', end: 'bottom 70%', scrub: 0.6 } })
  const lines = $$<SVGPathElement>(sec, '.ticket__guilloche path')
  lines.forEach((p) => {
    const l = p.getTotalLength()
    p.style.strokeDasharray = `${l}`
    p.style.strokeDashoffset = `${l}`
  })
  gsap.to(lines, { strokeDashoffset: 0, duration: 2.2, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: ticket, start: 'top 85%', once: true } })
  if (!isFinePointer()) return
  // Hold it up to the light: the ticket tilts toward the pointer.
  const wrap = $(sec, '.ticket-wrap')
  const rx = gsap.quickTo(ticket, 'rotationX', { duration: 0.6, ease: 'power3.out' })
  const ry = gsap.quickTo(ticket, 'rotationY', { duration: 0.6, ease: 'power3.out' })
  const move = (e: PointerEvent) => {
    const r = wrap.getBoundingClientRect()
    ry(((e.clientX - r.left) / r.width - 0.5) * 14)
    rx(-((e.clientY - r.top) / r.height - 0.5) * 12)
  }
  const leave = () => {
    rx(0)
    ry(0)
  }
  wrap.addEventListener('pointermove', move)
  wrap.addEventListener('pointerleave', leave)
  return () => {
    wrap.removeEventListener('pointermove', move)
    wrap.removeEventListener('pointerleave', leave)
  }
}

/* --------------------------------------------------------------- 09 credits */
function credits(root: HTMLElement, reduced: boolean) {
  const sec = $(root, '.credits')
  const arc = $(sec, '.demo__arc')
  if (reduced) {
    arc.style.strokeDashoffset = '0'
    return
  }
  const hh = $(sec, '.demo__hh')
  const o = { h: 30 }
  gsap
    .timeline({ scrollTrigger: { trigger: sec, start: 'top 75%', end: 'top 10%', scrub: 0.6 } })
    .fromTo(arc, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }, 0)
    .to(o, { h: 36, ease: 'none', onUpdate: () => (hh.textContent = String(Math.round(o.h))) }, 0)
    .from($$(sec, '.demo__tick'), { opacity: 0.08, stagger: 0.01, ease: 'none' }, 0)
  // The roll: each credit rises out of the dark and fades as it leaves, like a film's end titles.
  $$(sec, '.endroll__head, .endroll__row, .endroll__end').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.3 })
      .to(el, { autoAlpha: 1, duration: 0.45 })
      .to(el, { autoAlpha: 0.15, ease: 'power1.in', duration: 0.25 })
  })
}

export function setupBack(root: HTMLElement, reduced: boolean): Cleanup {
  const cleanups: Array<Cleanup | void> = []
  cleanups.push(tally(root, reduced))
  ledger(root, reduced)
  cleanups.push(plates(root, reduced))
  edition(root, reduced)
  callsheet(root, reduced)
  cleanups.push(lineup(root, reduced))
  cleanups.push(admit(root, reduced))
  credits(root, reduced)
  return () => cleanups.forEach((c) => c && c())
}
