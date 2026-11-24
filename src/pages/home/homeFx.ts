import { gsap, ScrollTrigger, SplitText, isFinePointer } from '../../lib/motion'
import { createPress, type Press, type PressPanel } from './novelPress'
import { heroParticles } from './heroParticles'
import { whenRevealed } from '../../lib/transition'
import { END, MAP_R, START, THROUGH, VIEWS, type CamState } from './angleViews'
import type { AngleScene } from './angleScene'

type Cleanup = () => void
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T
const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)) as T[]


/**
 * The 3D mark lives in its own chunk (three.js is heavy), so the hero paints first and the
 * object arrives a beat later. If WebGL or the chunk fails, the 2D square field stands in.
 */
function lazyHeroField(sec: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean) {
  let inner: { start: () => void; setScatter: (v: number) => void; destroy: () => void } | null = null
  let dead = false
  let started = false
  let scatter = 0
  const fallback = () => {
    if (dead || inner) return
    inner = heroParticles(sec, canvas, reduced)
    if (started) inner.start()
  }
  import('./heroScene')
    .then((m) => {
      if (dead) return
      inner = m.heroScene(sec, canvas, reduced)
      if (!inner) return fallback()
      sec.classList.add('has-3d')
      if (started) inner.start()
      inner.setScatter(scatter)
    })
    .catch(fallback)
  return {
    start: () => {
      started = true
      inner?.start()
    },
    setScatter: (v: number) => {
      scatter = v
      inner?.setScatter(v)
    },
    destroy: () => {
      dead = true
      inner?.destroy()
    },
  }
}

/* ------------------------------------------------------------------ hero */
function hero(root: HTMLElement, reduced: boolean): Cleanup | void {
  const sec = $(root, '.hero')
  const title = $(sec, '.hero__title')
  const chars = $$(title, '.ch')
  const ring = $<SVGEllipseElement>(sec, '.hero__ring ellipse')
  const len = ring.getTotalLength()
  ring.style.strokeDasharray = `${len}`
  const field = lazyHeroField(sec, $<HTMLCanvasElement>(sec, '.hero__field'), reduced)
  if (reduced) {
    ring.style.strokeDashoffset = '0'
    return field.destroy
  }

  const stop = () => field.destroy()

  // Intro: the 3-hour grid drops in, letters rise through their line masks, the ring is drawn round "zero".
  const intro = gsap.timeline({ paused: true })
  intro
    .from($$(sec, '.hero__hour'), { scaleY: 0, transformOrigin: '50% 0%', duration: 1.6, stagger: 0.03, ease: 'expo.inOut' }, 0)
    .from(chars, { yPercent: 118, duration: 1.25, stagger: 0.028, ease: 'expo.out' }, 0.1)
    .from($(sec, '.hero__zero em'), { yPercent: 118, duration: 1.25, ease: 'expo.out' }, 0.55)
    .fromTo(ring, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.3, ease: 'power3.inOut' }, 0.9)
    .from($$(sec, '.hero__fade'), { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.75)
  whenRevealed().then(() => {
    intro.play()
    field.start()
  })

  // Scroll: the pinned headline thins out and drifts apart while an ink disc grows out of "zero"
  // until it swallows the screen. The next chapter is already ink underneath: a match cut.
  const disc = $(sec, '.hero__disc')
  const zero = $(sec, '.hero__zero')
  const placeDisc = () => {
    const hr = sec.getBoundingClientRect()
    const zr = zero.getBoundingClientRect()
    const cx = zr.left + zr.width / 2 - hr.left
    const cy = zr.top + zr.height / 2 - hr.top
    gsap.set(disc, { left: cx, top: cy })
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(hr.width - cx, cy), Math.hypot(cx, hr.height - cy), Math.hypot(hr.width - cx, hr.height - cy))
    return (far * 2.05) / 100
  }
  const scroll = gsap.timeline({
    scrollTrigger: {
      trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: 0.6, invalidateOnRefresh: true,
      // The disc is ink: tell the header once it covers the bar.
      onUpdate: (self) => {
        if (self.progress > 0.86) sec.dataset.header = 'dark'
        else delete sec.dataset.header
        field.setScatter(Math.min(1, self.progress * 1.6))
      },
    },
  })
  scroll
    .to(title, { '--base-w': 230, duration: 0.6, ease: 'none' }, 0)
    .to($$(sec, '.hero__line')[0], { xPercent: -14, duration: 1, ease: 'none' }, 0)
    .to($$(sec, '.hero__line')[1], { xPercent: 10, duration: 1, ease: 'none' }, 0)
    .to($$(sec, '.hero__line')[2], { xPercent: -4, duration: 1, ease: 'none' }, 0)
    .to($(sec, '.hero__ring'), { rotate: 200, scale: 1.4, duration: 1, ease: 'none' }, 0)
    .to($(sec, '.hero__foot'), { autoAlpha: 0, y: -40, duration: 0.25, ease: 'none' }, 0)
    .to($(sec, '.hero__hours'), { yPercent: -30, autoAlpha: 0.2, duration: 1, ease: 'none' }, 0)
    .fromTo(disc, { scale: 0 }, { scale: () => placeDisc(), duration: 0.62, ease: 'power2.in' }, 0.38)

  // Pointer: each letter near the cursor thins and widens, like the type is breathing.
  if (!isFinePointer()) return stop
  let px = -9999
  let py = -9999
  let raf = 0
  const update = () => {
    raf = 0
    for (const ch of chars) {
      const r = ch.getBoundingClientRect()
      const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py)
      const k = Math.max(0, 1 - d / 300)
      ch.style.setProperty('--pw', (k * k * (3 - 2 * k)).toFixed(3))
    }
  }
  const move = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    if (!raf) raf = requestAnimationFrame(update)
  }
  const leave = () => {
    px = py = -9999
    if (!raf) raf = requestAnimationFrame(update)
  }
  sec.addEventListener('pointermove', move)
  sec.addEventListener('pointerleave', leave)
  return () => {
    sec.removeEventListener('pointermove', move)
    sec.removeEventListener('pointerleave', leave)
    cancelAnimationFrame(raf)
    stop()
  }
}

/* ------------------------------------------------------------- manifesto */
/**
 * Three words: the words are hidden in one WebGL sculpture of engraving strokes (angleScene.ts),
 * each readable from one camera angle only. The section pins and scrolling flies the camera from a
 * far, noisy view to each word's angle in turn (diving through the middle on the way to Daring,
 * whipping across to Fast), then pulls back. Moving the pointer nudges the camera, and the word
 * shakes apart and springs back into register. The DOM keeps a plan of where the camera stands,
 * an alignment meter, and the caption of the word in view.
 */
function manifesto(root: HTMLElement, reduced: boolean): Cleanup | void {
  if (reduced) return
  const sec = $(root, '.mani')
  const canvas = $<HTMLCanvasElement>(sec, '.mani__gl')
  sec.classList.add('mani--live')
  const items = $$(sec, '.mani__item')
  const intro = $(sec, '.mani__intro')
  const outro = $(sec, '.mani__outro')
  const vp = $(sec, '.mani__vp')
  const pct = $(sec, '.mani__pct')
  const bar = $(sec, '.mani__bar i')
  const camDot = $<SVGCircleElement>(sec, '.mani__map-cam')
  const ray = $<SVGLineElement>(sec, '.mani__map-ray')
  const ticks = $$(sec, '.mani__map-vp')

  const cam: CamState = { ...START }
  const pre = { az: -36 }
  const ui = { intro: 1, outro: 0 }
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${window.innerHeight * 3.6}`, pin: true, scrub: 1, invalidateOnRefresh: true },
  })
  tl.to(ui, { intro: 0, duration: 0.7, ease: 'none' }, 0.35)
    .to(cam, { ...VIEWS[0], duration: 2.1, ease: 'power3.inOut' }, 0.35)
    .to({}, { duration: 0.9 })
    .to(cam, { ...THROUGH, duration: 0.95, ease: 'power2.in' })
    .to(cam, { ...VIEWS[1], duration: 1.15, ease: 'power3.out' })
    .to({}, { duration: 0.9 })
    .to(cam, { ...VIEWS[2], duration: 0.9, ease: 'expo.inOut' })
    .to({}, { duration: 0.9 })
    .to(cam, { ...END, duration: 1.6, ease: 'power2.inOut' })
    .to(ui, { outro: 1, duration: 0.7, ease: 'none' }, '-=0.8')
    .to({}, { duration: 0.45 })
  // The sculpture already turns as the section rises into view.
  gsap.fromTo(pre, { az: -36 }, { az: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: true } })

  // The pointer jogs the camera; a spring brings it back to the exact angle.
  const jog = { x: 0, y: 0, vx: 0, vy: 0 }
  let lx = -1
  let ly = -1
  const onMove = (e: PointerEvent) => {
    if (lx >= 0) {
      jog.vx += (e.clientX - lx) * 0.012
      jog.vy += (e.clientY - ly) * 0.01
    }
    lx = e.clientX
    ly = e.clientY
  }
  const onLeave = () => {
    lx = -1
    ly = -1
  }
  if (isFinePointer()) {
    sec.addEventListener('pointermove', onMove, { passive: true })
    sec.addEventListener('pointerleave', onLeave)
  }

  let visible = false
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(sec)

  let scene: AngleScene | null = null
  let dead = false
  let lastPct = -1
  let lastVp = ''
  const smooth = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }
  const tick = () => {
    if (!visible) return
    jog.vx = (jog.vx - jog.x * 0.09) * 0.84
    jog.vy = (jog.vy - jog.y * 0.09) * 0.84
    jog.x = Math.max(-3, Math.min(3, jog.x + jog.vx))
    jog.y = Math.max(-3, Math.min(3, jog.y + jog.vy))
    const s = { az: cam.az + pre.az + jog.x, el: cam.el + jog.y, r: cam.r }
    intro.style.opacity = String(ui.intro)
    outro.style.opacity = String(ui.outro)
    outro.style.transform = `translate(-50%, ${-50 + (1 - ui.outro) * 10}%)`
    const a = (s.az * Math.PI) / 180
    const k = 80 / MAP_R
    const x = (Math.sin(a) * Math.cos((s.el * Math.PI) / 180) * s.r * k).toFixed(1)
    const y = (Math.cos(a) * Math.cos((s.el * Math.PI) / 180) * s.r * k).toFixed(1)
    camDot.setAttribute('cx', x)
    camDot.setAttribute('cy', y)
    ray.setAttribute('x1', x)
    ray.setAttribute('y1', y)
    if (!scene) return
    const out = scene.frame(s, ui.outro)
    items.forEach((el, i) => (el.style.opacity = String(smooth(0.86, 0.985, out.act[i]))))
    const p = Math.round(out.align * 100)
    if (p !== lastPct) {
      lastPct = p
      pct.textContent = `${p}%`
      bar.style.transform = `scaleX(${out.align})`
    }
    const label = out.align > 0.82 ? `0${out.nearest + 1}` : '—'
    if (label !== lastVp) {
      lastVp = label
      vp.textContent = label
      ticks.forEach((t, i) => t.classList.toggle('is-on', label !== '—' && i === out.nearest))
    }
  }
  gsap.ticker.add(tick)

  // three.js arrives in its own chunk. Without WebGL the section falls back to plain type.
  const fail = () => {
    if (dead) return
    tl.scrollTrigger?.kill(true)
    tl.kill()
    sec.classList.remove('mani--live')
    ScrollTrigger.refresh()
  }
  import('./angleScene')
    .then((m) => m.angleScene(canvas, (bottoms) => items.forEach((el, i) => el.style.setProperty('--top', `${((bottoms[i] ?? 0.66) + 0.04) * 100}%`))))
    .then((s) => {
      if (dead) return s?.destroy()
      if (!s) return fail()
      scene = s
    })
    .catch(fail)

  return () => {
    dead = true
    gsap.ticker.remove(tick)
    io.disconnect()
    sec.removeEventListener('pointermove', onMove)
    sec.removeEventListener('pointerleave', onLeave)
    scene?.destroy()
    scene = null
  }
}

/* ------------------------------------------- the novel: four engraved plates */
/**
 * Digits flicker like a split-flap board, then settle on the real time. It runs in real time
 * (not scrubbed), so stopping the scroll mid-flicker can never leave an impossible time on screen.
 */
function scrambleOnce(el: HTMLElement, ms = 520) {
  const final = el.dataset.final || (el.dataset.final = el.textContent || '')
  const start = performance.now()
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / ms)
    const k = Math.floor(final.length * p)
    el.textContent = final
      .split('')
      .map((c, i) => (i < k || !/[0-9]/.test(c) ? c : String(Math.floor(Math.random() * 10))))
      .join('')
    if (p < 1) requestAnimationFrame(tick)
    else el.textContent = final
  }
  tick()
}

function novel(root: HTMLElement, reduced: boolean): Cleanup | void {
  const sec = $(root, '.novel')
  const stage = $(sec, '.novel__stage')
  const cleanups: Cleanup[] = []
  const pages = $$(sec, '.npage')
  const panelEls = $$(sec, '.npanel')

  // The press: one WebGL layer prints every panel. Off under reduced motion or without WebGL.
  let press: Press | null = null
  if (!reduced) {
    const canvas = $<HTMLCanvasElement>(sec, '.novel__press')
    const states: PressPanel[] = panelEls.map((el, i) => {
      const ink = $<HTMLImageElement>(el, '.npanel__ink')
      const ph = $<HTMLImageElement>(el, '.npanel__photo')
      const pos = (ink.style.objectPosition || '50% 50%').split(' ').map((v) => parseFloat(v) / 100)
      const inset = el.classList.contains('npanel--b') && !!el.closest('.npage--night')
      return {
        el, frame: $(el, '.npanel__frame'), page: el.closest('.npage') as HTMLElement,
        ink: ink.src, photo: ph.src, pos: [pos[0] ?? 0.5, pos[1] ?? 0.5],
        border: inset ? 7 : 4, shadow: inset, seed: i * 7.31 + 1.7,
        rule: 0, print: 0, blur: 0, dev: 0, dx: 0.5, dy: 0.5, tx: 0.5, ty: 0.5,
        inkTex: null, photoTex: null, imgW: 0, imgH: 0, photoState: 'none',
      }
    })
    press = createPress(sec, canvas, states)
    if (press) {
      sec.classList.add('novel--press')
      const pr = press
      cleanups.push(() => pr.destroy())
    }
  }

  // Hold and move: the photograph develops under a red safelight where you press, the patch
  // follows your pointer, and holding on develops the whole frame. HOLD toggles it for keyboards.
  $$(sec, '[data-hold]').forEach((panel) => {
    const frame = $(panel, '.npanel__frame')
    const btn = panel.querySelector<HTMLButtonElement>('.nhold')
    const st = press?.panels.find((p) => p.el === panel)
    let locked = false
    let holding = false
    let grow: gsap.core.Tween | null = null
    const at = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect()
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] as const
    }
    const open = (x: number, y: number, full = false) => {
      panel.classList.add('is-developed')
      if (st && press) {
        press.loadPhoto(st)
        st.tx = x
        st.ty = y
        if (!holding) {
          st.dx = x
          st.dy = y
        }
        gsap.to(st, { dev: full ? 2.2 : 0.3, duration: full ? 1.5 : 0.6, ease: full ? 'power2.inOut' : 'power3.out', overwrite: 'auto' })
        grow?.kill()
        if (!full) grow = gsap.delayedCall(1.3, () => holding && gsap.to(st, { dev: 2.2, duration: 1.8, ease: 'power2.inOut', overwrite: 'auto' }))
        return
      }
      frame.style.setProperty('--x', `${x * 100}%`)
      frame.style.setProperty('--y', `${y * 100}%`)
      gsap.to(frame, { '--r': '150%', duration: reduced ? 0 : 1.1, ease: 'power3.inOut', overwrite: 'auto' })
    }
    const close = () => {
      holding = false
      grow?.kill()
      if (locked) return
      panel.classList.remove('is-developed')
      if (st) gsap.to(st, { dev: 0, duration: 0.8, ease: 'power3.inOut', overwrite: 'auto' })
      else gsap.to(frame, { '--r': '0%', duration: reduced ? 0 : 0.7, ease: 'power3.out', overwrite: 'auto' })
    }
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.nhold, a, button')) return
      const [x, y] = at(e)
      open(x, y)
      holding = true
    }
    const move = (e: PointerEvent) => {
      if (!holding || !st) return
      const [x, y] = at(e)
      st.tx = x
      st.ty = y
    }
    const toggle = () => {
      locked = !locked
      btn?.setAttribute('aria-pressed', String(locked))
      if (locked) open(0.5, 0.5, true)
      else close()
    }
    panel.addEventListener('pointerdown', down)
    panel.addEventListener('pointermove', move)
    ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => panel.addEventListener(ev, close))
    btn?.addEventListener('click', toggle)
    cleanups.push(() => {
      panel.removeEventListener('pointerdown', down)
      panel.removeEventListener('pointermove', move)
      ;['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => panel.removeEventListener(ev, close))
      btn?.removeEventListener('click', toggle)
    })
  })
  if (reduced) return () => cleanups.forEach((c) => c())

  sec.classList.add('novel--live')
  const plateNo = $(sec, '.novel__plate b')
  const title = $(sec, '.ntitle')
  const canvas = $(sec, '.novel__press')
  const len = () => window.innerHeight * (pages.length * 1.6 + 0.7)
  gsap.set(pages, { autoAlpha: 0 })

  // Pin at the top, but start the title card while the chapter is still rising into view.
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: () => `+=${len()}`, pin: true, invalidateOnRefresh: true })
  const marks: number[] = []
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: sec, start: 'top 65%', end: () => `+=${len() + window.innerHeight * 0.65}`, scrub: 0.8, invalidateOnRefresh: true },
  })
  tl.eventCallback('onUpdate', () => {
    const t = tl.time()
    let i = 0
    marks.forEach((m, k) => t >= m - 0.01 && (i = k))
    plateNo.textContent = String(i + 1).padStart(2, '0')
  })
  const splits: SplitText[] = []
  const chars = (el: HTMLElement) => {
    const sp = SplitText.create(el, { type: 'chars,words', aria: 'auto' })
    splits.push(sp)
    return sp.chars
  }
  cleanups.push(() => splits.forEach((sp) => sp.revert()))
  // Where an ink splash starts: a point in canvas coordinates, measured on refresh.
  const pointOf = (el: HTMLElement) => () => {
    const c = canvas.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 }
  }
  const splashTo = (from: number, to: number, origin: () => { x: number; y: number }, duration: number, ease: string, position: number) => {
    if (!press) return
    tl.fromTo(
      press.splash,
      { v: from, x: () => origin().x, y: () => origin().y },
      { v: to, x: () => origin().x, y: () => origin().y, duration, ease, immediateRender: false },
      position,
    )
  }

  // Title card, like the opening of a printed graphic novel.
  tl.from(chars($(title, '.ntitle__main')), { yPercent: 110, autoAlpha: 0, rotate: 8, duration: 0.6, stagger: 0.03, ease: 'expo.out' }, 0)
    .from($$(title, '.ntitle__kicker, .ntitle__sub'), { autoAlpha: 0, y: 16, duration: 0.4, stagger: 0.1 }, 0.25)
    .to({}, { duration: 0.6 })
  let swapAt = tl.duration()
  if (press) {
    splashTo(0, 1, pointOf(stage), 0.7, 'power2.in', swapAt)
    tl.set(title, { autoAlpha: 0 }, swapAt + 0.7)
    splashTo(1, 2, pointOf(stage), 0.85, 'power2.out', swapAt + 0.7)
    swapAt += 0.7
  } else {
    tl.to(title, { autoAlpha: 0, yPercent: -12, duration: 0.5 }, swapAt)
    swapAt += 0.4
  }

  const wipes = $$(sec, '.nwipe')
  gsap.set(wipes, { x: 0, xPercent: -101 })
  pages.forEach((pg, i) => {
    const at = swapAt + 0.25
    marks.push(swapAt)
    const grid = $(pg, '.npage__grid')
    const head = $(pg, '.npage__head')
    const frames = $$(pg, '.npanel__frame')
    const caps = $$(pg, '.ncap')
    const hold = pg.querySelector<HTMLElement>('.nhold')
    const nend = pg.querySelector<HTMLElement>('.nend')
    const focus = pg.querySelector<HTMLElement>('.npanel.is-focus')
    const ps = press ? press.panels.filter((p) => p.page === pg) : []
    tl.set(pg, { autoAlpha: 1 }, swapAt)

    // The time stamp flickers into place; the title letters drop in.
    const stamp = $(pg, '.npage__time')
    tl.call(() => scrambleOnce(stamp), [], at)
      .from(chars($(pg, '.npage__title')), { yPercent: 120, skewY: 10, autoAlpha: 0, duration: 0.5, stagger: 0.025, ease: 'expo.out' }, at)
    if (press) {
      // Ruled, then printed: borders run clockwise, then the ink soaks in, panel after panel.
      tl.fromTo(ps, { rule: 0 }, { rule: 1, duration: 0.55, stagger: 0.16, ease: 'power1.inOut' }, at + 0.05)
        .fromTo(ps, { print: 0 }, { print: 1, duration: 1.5, stagger: 0.3, ease: 'power1.inOut' }, at + 0.4)
    } else {
      tl.fromTo($$(pg, '.npanel'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, stagger: 0.28, ease: 'power3.inOut' }, at + 0.1)
    }
    tl.fromTo(frames, { scale: 1.22 }, { scale: 1.02, duration: 2.0, stagger: 0.25, ease: 'none' }, at + 0.35)
    if (nend) tl.fromTo(nend, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, at + 1.1)
    // Captions: the box is drawn, then the narration types itself out.
    caps.forEach((cap, k) => {
      const c0 = at + 1.0 + k * 0.5
      tl.fromTo(cap, { autoAlpha: 0, clipPath: 'inset(-10% 104% -16% -6%)' }, { autoAlpha: 1, clipPath: 'inset(-10% -8% -16% -6%)', duration: 0.22, ease: 'power2.out' }, c0)
        .from(chars(cap), { autoAlpha: 0, duration: 0.01, stagger: 0.012, ease: 'none' }, c0 + 0.12)
    })
    if (hold) tl.fromTo(hold, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, at + 1.4)
    tl.to({}, { duration: 0.45 })
    // A slow camera drift across the whole plate, so the page never sits dead still.
    tl.fromTo(grid, { xPercent: -1.2, yPercent: 0.8 }, { xPercent: 1.2, yPercent: -0.8, duration: tl.duration() - at, ease: 'none' }, at)
    if (i === pages.length - 1 || !focus) return

    // Camera: push into the focus panel (with a zoom blur), then an ink splash cuts to the next plate.
    const t2 = tl.duration()
    tl.to(grid, { scale: 2.1, transformOrigin: () => `${focus.offsetLeft + focus.offsetWidth / 2}px ${focus.offsetTop + focus.offsetHeight / 2}px`, duration: 1.2, ease: 'power2.in' }, t2)
      .to([head, ...caps, ...(hold ? [hold] : [])], { autoAlpha: 0, duration: 0.35 }, t2)
    if (press) {
      const fs = ps.find((p) => p.el === focus)
      if (fs) tl.fromTo(fs, { blur: 0 }, { blur: 1, duration: 1.2, ease: 'power2.in' }, t2)
      splashTo(0, 1, pointOf(focus), 0.6, 'power2.in', t2 + 0.7)
      tl.set(pg, { autoAlpha: 0 }, t2 + 1.3)
      splashTo(1, 2, pointOf(focus), 0.85, 'power2.out', t2 + 1.3)
      swapAt = t2 + 1.3
    } else {
      tl.fromTo(wipes[i], { xPercent: -101 }, { xPercent: 101, duration: 1.1, ease: 'power1.inOut' }, t2 + 0.7).set(pg, { autoAlpha: 0 }, t2 + 1.25)
      swapAt = t2 + 1.25
    }
  })
  tl.fromTo($(sec, '.novel__track i'), { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: tl.duration() }, 0)
  return () => cleanups.forEach((c) => c())
}

/** Small photos elsewhere on the page: the engraving develops into the photograph on hover. */
function inkHover(root: HTMLElement, reduced: boolean) {
  if (reduced) return
  $$(root, '[data-develop]').forEach((el) => {
    const ph = el.querySelector('.inkp__photo')
    if (!ph) return
    el.addEventListener('pointerenter', () => gsap.to(ph, { clipPath: 'circle(150% at 50% 100%)', duration: 0.9, ease: 'power3.inOut', overwrite: true }))
    el.addEventListener('pointerleave', () => gsap.to(ph, { clipPath: 'circle(0% at 50% 100%)', duration: 0.6, ease: 'power3.out', overwrite: true }))
  })
}

export function setupHome(root: HTMLElement, reduced: boolean): Cleanup {
  const cleanups: Array<Cleanup | void> = []
  cleanups.push(hero(root, reduced))
  cleanups.push(manifesto(root, reduced))
  cleanups.push(novel(root, reduced))
  inkHover(root, reduced)
  return () => cleanups.forEach((c) => c && c())
}
