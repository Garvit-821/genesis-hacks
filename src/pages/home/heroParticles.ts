import { gsap } from '../../lib/motion'

/**
 * The hero's signature object: ~1,500 squares (the same squares that later count builders)
 * that assemble into the Genesis mark, flinch away from the pointer, and re-form as a
 * 36-hour dial and the figure "36h" on a timer. On scroll they scatter.
 */
type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; s: number; c: number; a: number }

const MARK = ['M84.8 28.3 A41 41 0 1 0 91 50', 'M65.7 40.2 A18.5 18.5 0 1 0 67.9 54.8', 'M50 50 H95.6']

function sample(draw: (ctx: CanvasRenderingContext2D, S: number) => void, count: number): Array<[number, number]> {
  const S = 240
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = ctx.strokeStyle = '#000'
  draw(ctx, S)
  const data = ctx.getImageData(0, 0, S, S).data
  const pts: Array<[number, number]> = []
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) pts.push([x / S - 0.5, y / S - 0.5])
  const out: Array<[number, number]> = []
  for (let i = 0; i < count; i++) {
    const p = pts[Math.floor((i / count) * pts.length + Math.random() * (pts.length / count)) % pts.length] || [0, 0]
    out.push([p[0] + (Math.random() - 0.5) * 0.008, p[1] + (Math.random() - 0.5) * 0.008])
  }
  return out
}

const SHAPES = [
  (ctx: CanvasRenderingContext2D, S: number) => {
    ctx.scale(S / 100, S / 100)
    ctx.lineWidth = 10
    MARK.forEach((d) => ctx.stroke(new Path2D(d)))
  },
  (ctx: CanvasRenderingContext2D, S: number) => {
    ctx.translate(S / 2, S / 2)
    ctx.lineWidth = S * 0.035
    ctx.beginPath()
    ctx.arc(0, 0, S * 0.36, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 36; i++) {
      ctx.save()
      ctx.rotate((i / 36) * Math.PI * 2)
      ctx.fillRect(-S * 0.008, -S * 0.47, S * 0.016, i % 6 === 0 ? S * 0.08 : S * 0.045)
      ctx.restore()
    }
    ctx.lineWidth = S * 0.04
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -S * 0.27)
    ctx.moveTo(0, 0)
    ctx.lineTo(S * 0.17, S * 0.06)
    ctx.stroke()
  },
  (ctx: CanvasRenderingContext2D, S: number) => {
    ctx.font = `800 ${S * 0.5}px "Bricolage Grotesque Variable", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('36h', S / 2, S / 2, S * 0.98)
  },
]

export function heroParticles(sec: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d')!
  const small = window.innerWidth < 860
  const N = small ? 650 : 1500
  const shapes = SHAPES.map((d) => sample(d, N))
  const css = getComputedStyle(document.documentElement)
  const colors = [css.getPropertyValue('--ink').trim() || '#0c0b10', css.getPropertyValue('--violet-deep').trim() || '#5a48e0', css.getPropertyValue('--amber-deep').trim() || '#e0891a']
  let W = 0, H = 0, cx = 0, cy = 0, size = 0, shape = 0, scatter = 0, on = true, px = -9999, py = -9999, idle = 0
  const ps: P[] = Array.from({ length: N }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, s: 2 + Math.random() * 2.6, c: i % 9 === 0 ? 2 : i % 3 === 0 ? 1 : 0, a: Math.random() * Math.PI * 2 }))

  const retarget = () => ps.forEach((p, i) => { p.tx = cx + shapes[shape][i][0] * size; p.ty = cy + shapes[shape][i][1] * size })
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = sec.clientWidth
    H = sec.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const narrow = W < 860
    size = narrow ? Math.min(W * 0.62, H * 0.3) : Math.min(W * 0.36, H * 0.66)
    cx = narrow ? W * 0.68 : W * 0.755
    cy = narrow ? H * 0.6 : H * 0.5
    retarget()
  }
  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    for (const p of ps) {
      ctx.fillStyle = colors[p.c]
      ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s)
    }
  }
  const tick = () => {
    if (!on) return
    if (++idle > 420) next()
    for (const p of ps) {
      const ox = Math.cos(p.a) * scatter * (W * 0.7 + p.s * 90)
      const oy = Math.sin(p.a) * scatter * (H * 0.7 + p.s * 90)
      let ax = (p.tx + ox - p.x) * 0.045
      let ay = (p.ty + oy - p.y) * 0.045
      const dx = p.x - px
      const dy = p.y - py
      const d2 = dx * dx + dy * dy
      if (d2 < 19600) {
        const f = (1 - Math.sqrt(d2) / 140) * 5.5
        const d = Math.sqrt(d2) || 1
        ax += (dx / d) * f
        ay += (dy / d) * f
      }
      p.vx = (p.vx + ax) * 0.84
      p.vy = (p.vy + ay) * 0.84
      p.x += p.vx
      p.y += p.vy
    }
    draw()
  }
  const next = () => {
    idle = 0
    shape = (shape + 1) % shapes.length
    retarget()
    // A kick so the change reads as a burst, not a slide.
    ps.forEach((p) => { p.vx += (Math.random() - 0.5) * 26; p.vy += (Math.random() - 0.5) * 26 })
  }
  const move = (e: PointerEvent) => {
    const r = sec.getBoundingClientRect()
    px = e.clientX - r.left
    py = e.clientY - r.top
  }
  const leave = () => (px = py = -9999)

  resize()
  if (reduced) {
    ps.forEach((p) => { p.x = p.tx; p.y = p.ty })
    draw()
    const ro = new ResizeObserver(() => { resize(); ps.forEach((p) => { p.x = p.tx; p.y = p.ty }); draw() })
    ro.observe(sec)
    return { setScatter: () => {}, start: () => {}, destroy: () => ro.disconnect() }
  }
  // Start scattered far outside the frame; start() lets them fall into the mark.
  ps.forEach((p) => { p.x = cx + Math.cos(p.a) * (W + Math.random() * W); p.y = cy + Math.sin(p.a) * (H + Math.random() * H) })
  on = false
  const ro = new ResizeObserver(resize)
  ro.observe(sec)
  const io = new IntersectionObserver(([e]) => (on = started && e.isIntersecting))
  let started = false
  io.observe(sec)
  sec.addEventListener('pointermove', move)
  sec.addEventListener('pointerleave', leave)
  gsap.ticker.add(tick)
  return {
    setScatter: (v: number) => (scatter = v),
    start: () => { started = true; on = true },
    destroy: () => {
      ro.disconnect(); io.disconnect(); gsap.ticker.remove(tick)
      sec.removeEventListener('pointermove', move); sec.removeEventListener('pointerleave', leave)
    },
  }
}
