import { useCallback, useEffect, useRef, useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { NextUp, SectionHead } from '../components/ui/Bits'
import { useFx } from '../lib/fx'
import { gsap } from '../lib/motion'
import { lockScroll } from '../lib/scroll'
import { GALLERY } from '../data/site'

const COLS = 4
const ROWS = 4

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useFx(ref, (root, reduced) => {
    // An endless contact sheet: drag (or use arrow keys) and the 16 frames wrap in every direction.
    const field = root.querySelector<HTMLElement>('.dragfield')!
    const tiles = Array.from(field.querySelectorAll<HTMLElement>('.dragfield__tile'))
    let cw = 0, ch = 0, x = 0, y = 0, tx = 0, ty = 0, vx = reduced ? 0 : -0.35, vy = reduced ? 0 : -0.12
    let drag = false, lx = 0, ly = 0, moved = 0, on = true
    const size = () => {
      const w = field.clientWidth
      cw = Math.max(260, w / 3.3)
      ch = cw * 0.72
      tiles.forEach((t) => gsap.set(t, { width: cw - 16, height: ch - 16 }))
    }
    const wrap = (v: number, max: number) => ((((v + max / 2) % max) + max) % max) - max / 2
    const render = () => {
      if (!on) return
      if (!drag) { tx += vx; ty += vy }
      x += (tx - x) * 0.09
      y += (ty - y) * 0.09
      const W = cw * COLS, H = ch * ROWS
      tiles.forEach((t, i) => {
        const c = i % COLS, r = Math.floor(i / COLS)
        const px = wrap(c * cw + x + (r % 2 ? cw / 2 : 0), W) + field.clientWidth / 2 - cw / 2
        const py = wrap(r * ch + y, H) + field.clientHeight / 2 - ch / 2
        t.style.transform = `translate3d(${px}px, ${py}px, 0)`
      })
    }
    const down = (e: PointerEvent) => { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; field.setPointerCapture(e.pointerId); field.classList.add('is-drag') }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - lx, dy = e.clientY - ly
      tx += dx * 1.4; ty += dy * 1.4; moved += Math.abs(dx) + Math.abs(dy)
      vx = gsap.utils.clamp(-1.2, 1.2, dx * 0.05) || vx; vy = gsap.utils.clamp(-1.2, 1.2, dy * 0.05) || vy
      lx = e.clientX; ly = e.clientY
    }
    const up = (e: PointerEvent) => {
      drag = false
      field.classList.remove('is-drag')
      if (reduced) { vx = 0; vy = 0 }
      if (moved < 6) {
        const tile = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('.dragfield__tile')
        if (tile) setOpen(Number(tile.dataset.i))
      }
    }
    const key = (e: KeyboardEvent) => {
      const step = 140
      if (e.key === 'ArrowLeft') tx += step
      else if (e.key === 'ArrowRight') tx -= step
      else if (e.key === 'ArrowUp') ty += step
      else if (e.key === 'ArrowDown') ty -= step
      else return
      e.preventDefault()
    }
    size()
    render()
    const ro = new ResizeObserver(size)
    ro.observe(field)
    const io = new IntersectionObserver(([en]) => (on = en.isIntersecting))
    io.observe(field)
    field.addEventListener('pointerdown', down)
    field.addEventListener('pointermove', move)
    field.addEventListener('pointerup', up)
    field.addEventListener('pointercancel', up)
    field.addEventListener('keydown', key)
    gsap.ticker.add(render)
    return () => {
      ro.disconnect(); io.disconnect(); gsap.ticker.remove(render)
      field.removeEventListener('pointerdown', down); field.removeEventListener('pointermove', move)
      field.removeEventListener('pointerup', up); field.removeEventListener('pointercancel', up); field.removeEventListener('keydown', key)
    }
  })

  const close = useCallback(() => setOpen(null), [])
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open !== null && !d.open) { d.showModal(); lockScroll(true) }
    if (open === null && d.open) { d.close(); lockScroll(false) }
  }, [open])
  useEffect(() => () => lockScroll(false), [])
  useEffect(() => {
    if (open === null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setOpen((o) => ((o ?? 0) + 1) % GALLERY.length)
      if (e.key === 'ArrowLeft') setOpen((o) => ((o ?? 0) - 1 + GALLERY.length) % GALLERY.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])
  const cur = open !== null ? GALLERY[open] : null

  return (
    <Page theme="ink">
      <div ref={ref}>
        <PageHero theme="ink" title={'*Gallery*'} lead="16 photos from Hackers Occupied Pune at VIT Pune. Drag the field to explore, or scroll for every frame with captions." />
        <section className="theme-ink" data-theme="ink">
          <div className="dragfield" tabIndex={0} role="group" aria-label="An interactive field of the same photos listed below. Drag, or use the arrow keys, to move around it." data-cursor="Drag" data-lenis-prevent>
            {GALLERY.map((p, i) => (
              <div key={p.file} className="dragfield__tile" data-i={i}>
                <img src={p.src} alt="" draggable={false} loading={i < 8 ? 'eager' : 'lazy'} />
                <span className="mono dragfield__cap">{String(i + 1).padStart(2, '0')} · {p.caption}</span>
              </div>
            ))}
            <span className="dragfield__hint mono" aria-hidden="true">Drag · Click a frame</span>
          </div>
        </section>
        <section className="section theme-paper" data-theme="paper">
          <div className="wrap">
            <SectionHead n="01" kicker="16 photos · VIT Pune" title="Every *frame*" intro="Shot across both days at VIT Pune. Select any photo to see it larger." />
            <ul className="grid-photos">
              {GALLERY.map((p, i) => (
                <li key={p.file} className={`gp gp--${i % 5}`}>
                  <button type="button" onClick={() => setOpen(i)} data-cursor="Open" aria-label={`Open photo: ${p.caption}`}>
                    <div className="frame" data-fx="img">
                      <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" />
                    </div>
                  </button>
                  <p className="frame__cap mono"><span>{p.caption}</span><span className="faint">{p.meta}</span></p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <NextUp to="/events/hackers-occupied-pune" kicker="Recap" title="Hackers Occupied Pune" meta="Schedule, facts and certificates" />
        <NextUp />
      </div>
      <dialog ref={dialog} className="lightbox" onClose={close} onClick={(e) => e.target === dialog.current && close()} aria-label="Photo viewer">
        {cur && (
          <figure>
            <img src={cur.src} alt={cur.alt} />
            <figcaption className="mono">
              <span>{String((open ?? 0) + 1).padStart(2, '0')} / {GALLERY.length} · {cur.caption} · {cur.meta}</span>
              <span className="lightbox__nav">
                <button type="button" onClick={() => setOpen(((open ?? 0) - 1 + GALLERY.length) % GALLERY.length)}>← Prev</button>
                <button type="button" onClick={() => setOpen(((open ?? 0) + 1) % GALLERY.length)}>Next →</button>
                <button type="button" onClick={close}>Close ✕</button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </Page>
  )
}
