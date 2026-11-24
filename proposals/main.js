import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/instrument-serif/400-italic.css'
import '../src/styles/tokens.css'
import './proposals.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import media from '../src/data/media.json'
import pune from '../src/data/pune.json'
import eventsData from '../src/data/events.json'

gsap.registerPlugin(ScrollTrigger)
const $ = (s, r = document) => r.querySelector(s)
const photo = (f) => media.gallery.find((p) => p.file === f)
const visible = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0.05 }).observe(el)

/* ============ 01 · contact sheet ============ */
function contactSheet() {
  const track = $('.sheet__track')
  const picks = { 1: 'this one', 4: 'yes', 8: 'print big' }
  media.story.forEach((p, i) => {
    const f = document.createElement('figure')
    f.className = 'frame'
    f.style.margin = '0 10px'
    f.innerHTML = `
      <span class="frame__edge frame__edge--t"><span>Genesis 36H · safety film</span><span>▸ ${String(i + 11)}A</span></span>
      <img src="${p.src}" alt="${p.alt}" loading="lazy" />
      <span class="frame__edge frame__edge--b"><span>${p.meta}</span><span>${String(i + 11)}</span></span>
      ${picks[i] ? `<svg class="frame__ring" viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" vector-effect="non-scaling-stroke" d="M7,54 C3,20 38,3 62,5 C92,8 99,36 95,58 C90,88 52,98 30,94 C10,90 2,72 9,44"/></svg><span class="frame__note">${picks[i]}</span>` : ''}`
    track.appendChild(f)
  })
  const frames = [...track.children]
  const centre = (el) => el.offsetLeft + el.offsetWidth / 2
  let last = -1
  gsap.fromTo(track, { x: () => innerWidth / 2 - centre(frames[0]) }, {
    x: () => innerWidth / 2 - centre(frames[frames.length - 1]),
    ease: 'none',
    scrollTrigger: {
      trigger: '.sheet', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (s) => {
        const i = Math.round(s.progress * (frames.length - 1))
        if (i === last) return
        last = i
        frames.forEach((f, k) => f.classList.toggle('is-on', k === i))
        const p = media.story[i]
        $('.sheet__no').textContent = `Frame ${String(i + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`
        $('.sheet__meta').textContent = p.meta
        gsap.fromTo($('.sheet__line'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out', onStart: () => ($('.sheet__line').textContent = p.caption) })
      },
    },
  })
}

/* ============ 02 · through the clock ============ */
function throughTheClock() {
  // Hours are matched to the schedule (Red Bull break 17:00, mentoring 18:00 and 23:00, final photo 13:35).
  const moments = [
    { t: '17:00', when: 'Sat 17:00', file: 'dsc09188' },
    { t: '18:00', when: 'Sat 18:00', file: 'dsc09252' },
    { t: '23:00', when: 'Sat 23:00', file: 'dsc09397' },
    { t: '03:00', when: 'Sun 03:00', file: 'dsc09631' },
    { t: '13:35', when: 'Sun 13:35', file: 'dsc09998' },
  ]
  const stage = $('.win__stage')
  const time = $('.win__time')
  const digits = [...time.children]
  const back = $('.win__photo--back')
  const front = $('.win__photo--front')
  const chips = $('#hours')
  const base = document.createElement('i')
  base.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
  $('.win__colon').appendChild(base)

  const set = (m, animate = true) => {
    const p = photo(m.file)
    back.style.backgroundImage = front.style.backgroundImage = `url(${p.src})`
    $('.win__when').textContent = m.when
    $('.win__line').textContent = p.caption
    ;[...m.t].forEach((ch, i) => {
      if (digits[i].textContent === ch) return
      if (animate) gsap.fromTo(digits[i], { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out', delay: i * 0.04 })
      digits[i].textContent = ch
    })
    ;[...chips.children].forEach((b) => b.classList.toggle('is-on', b.textContent === m.t))
  }
  moments.forEach((m) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = m.t
    b.onclick = () => { set(m); ScrollTrigger.refresh() }
    chips.appendChild(b)
  })
  set(moments[3], false)

  // Where is the top dot of the colon? Measure the glyph once, then place it from the live baseline.
  const dotAboveBaseline = (() => {
    const c = document.createElement('canvas')
    c.width = 200; c.height = 400
    const x = c.getContext('2d', { willReadFrequently: true })
    x.font = '800 200px "Bricolage Grotesque Variable"'
    x.fillText(':', 60, 300)
    const d = x.getImageData(0, 0, 200, 400).data
    let y1 = -1, y2 = -1
    for (let y = 0; y < 400; y++) {
      let on = false
      for (let px = 0; px < 200; px++) if (d[(y * 200 + px) * 4 + 3] > 100) { on = true; break }
      if (on && y1 < 0) y1 = y
      if (!on && y1 >= 0) { y2 = y; break }
    }
    return y1 < 0 ? 0.42 : (300 - (y1 + y2) / 2) / 200
  })()
  const dot = () => {
    gsap.set(time, { scale: 1 })
    const s = stage.getBoundingClientRect()
    const c = $('.win__colon').getBoundingClientRect()
    const b = base.getBoundingClientRect()
    const fs = parseFloat(getComputedStyle(time).fontSize)
    const t = time.getBoundingClientRect()
    const x = c.left + c.width / 2
    const y = b.top - dotAboveBaseline * fs
    return { x: x - s.left, y: y - s.top, ox: x - t.left, oy: y - t.top }
  }
  let d = dot()
  ScrollTrigger.addEventListener('refreshInit', () => (d = dot()))
  const state = { r: 0 }
  gsap.timeline({ scrollTrigger: { trigger: '.win', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } })
    .to(time, { scale: 2.4, transformOrigin: () => `${d.ox}px ${d.oy}px`, ease: 'power2.in', duration: 1 }, 0.1)
    .to(state, { r: () => Math.hypot(innerWidth, innerHeight), ease: 'power2.in', duration: 0.9, onUpdate: () => (front.style.clipPath = `circle(${state.r}px at ${d.x}px ${d.y}px)`) }, 0.2)
    .fromTo('.win__cap', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.9)
    .to({}, { duration: 0.25 })
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect()
    const px = 50 + ((e.clientX - r.left) / r.width - 0.5) * 16
    const py = 50 + ((e.clientY - r.top) / r.height - 0.5) * 16
    gsap.to([back, front], { backgroundPosition: `${px}% ${py}%`, duration: 0.8, ease: 'power3.out' })
  })
}

/* ============ 03 · run-of-show board ============ */
function board() {
  const rowsEl = $('.board__rows')
  const ACT = innerWidth < 700 ? 20 : 30
  rowsEl.parentElement.style.setProperty('--act', ACT)
  const WIDTHS = [5, ACT, 14]
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&:+'
  const rows = Array.from({ length: 6 }, () => {
    const row = document.createElement('div')
    row.className = 'brow'
    const groups = WIDTHS.map((n) => {
      const g = document.createElement('div')
      g.className = 'bcells'
      const cells = Array.from({ length: n }, () => {
        const c = document.createElement('span')
        c.className = 'cell'
        c.innerHTML = '<i>&nbsp;</i>'
        g.appendChild(c)
        return { el: c.firstChild, cur: ' ', timer: 0 }
      })
      row.appendChild(g)
      return cells
    })
    rowsEl.appendChild(row)
    return { row, groups }
  })
  const flip = (cell, ch) => {
    if (cell.cur === ch) return
    clearInterval(cell.timer)
    let n = 2 + Math.floor(Math.random() * 6)
    cell.timer = setInterval(() => {
      const next = n-- > 0 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ch
      cell.el.textContent = next === ' ' ? ' ' : next
      cell.el.animate([{ transform: 'rotateX(-88deg)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 80 })
      if (n < 0) { cell.cur = ch; clearInterval(cell.timer) }
    }, 60)
  }
  const write = (cells, text) => [...text.toUpperCase().padEnd(cells.length).slice(0, cells.length)].forEach((ch, i) => setTimeout(() => flip(cells[i], ch), i * 14))
  let idx = 0
  let on = false
  const show = () => {
    rows.forEach((r, k) => {
      const a = pune.schedule[(idx + k) % pune.schedule.length]
      write(r.groups[0], a.startTime)
      write(r.groups[1], a.activity.replace(/[()]/g, ''))
      write(r.groups[2], a.type)
      r.row.classList.toggle('is-mile', a.milestone)
    })
    $('.board__day').textContent = pune.schedule[idx % pune.schedule.length].date
  }
  show()
  setInterval(() => { if (on) { idx = (idx + 1) % pune.schedule.length; show() } }, 2700)
  visible($('.board'), (v) => (on = v))
}

/* ============ 04 · field recording ============ */
function fieldRecording() {
  const GEO = {
    Gurugram: [28.46, 77.03], Ghaziabad: [28.67, 77.45], 'New Delhi': [28.61, 77.21], Noida: [28.54, 77.39], 'Greater Noida': [28.47, 77.5], Faridabad: [28.41, 77.31], Meerut: [28.98, 77.71],
    Jaipur: [26.91, 75.79], Mohali: [30.7, 76.72], Patiala: [30.34, 76.39], Lucknow: [26.85, 80.95], Bhopal: [23.26, 77.41], Ranchi: [23.34, 85.31], Rourkela: [22.26, 84.85], Asansol: [23.68, 86.95],
    Mumbai: [19.08, 72.88], Pune: [18.52, 73.86], Goa: [15.49, 73.83], Bengaluru: [12.97, 77.59],
  }
  const NCR = new Set(['Gurugram', 'Ghaziabad', 'New Delhi', 'Noida', 'Greater Noida', 'Faridabad', 'Meerut'])
  const events = [...eventsData.events].filter((e) => e.iso).sort((a, b) => a.iso.localeCompare(b.iso))
  const N = events.length
  const canvas = $('.atlas__canvas')
  const ctx = canvas.getContext('2d')
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let W = 0, H = 0, p = 0, hold = 0, on = false, lastIdx = -2, lens = { x: 0, y: 0, r: 0 }
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    lens = { x: W * 0.78, y: H * 0.33, r: Math.min(W * 0.2, H * 0.29) }
  }
  const main = (lat, lon) => [40 + ((lon - 71) / 17) * (W * 0.58 - 60), 40 + ((32 - lat) / 21) * (H - 90)]
  const inLens = (lat, lon) => [lens.x + ((lon - 77.36) / 0.52) * lens.r * 0.72, lens.y - ((lat - 28.66) / 0.38) * lens.r * 0.72]
  const node = (city) => {
    if (!city || city === 'Online' || !GEO[city]) return { key: 'Online', pos: [W * 0.78, H * 0.84], label: 'Online' }
    const [lat, lon] = GEO[city]
    return NCR.has(city) ? { key: city, pos: inLens(lat, lon), label: city, ncr: true } : { key: city, pos: main(lat, lon), label: city }
  }
  const OWN = '#8b7cff', PART = '#ffb648', INK = '242,238,230'
  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    // instrument grid
    ctx.fillStyle = `rgba(${INK},0.09)`
    for (let x = 30; x < W; x += 46) for (let y = 30; y < H; y += 46) ctx.fillRect(x, y, 2, 2)
    // lens
    const delhi = main(28.61, 77.21)
    ctx.strokeStyle = `rgba(${INK},0.22)`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(delhi[0], delhi[1]); ctx.lineTo(lens.x - lens.r * 0.92, lens.y + lens.r * 0.38); ctx.stroke(); ctx.setLineDash([])
    ctx.font = '500 10px "Geist Mono Variable", monospace'; ctx.fillStyle = `rgba(${INK},0.5)`
    ctx.fillText('DELHI NCR · MAGNIFIED', lens.x - lens.r, lens.y - lens.r - 10)
    const cur = p * N
    const counts = {}
    let ncrCount = 0
    for (let i = 0; i < Math.min(N, Math.floor(cur)); i++) {
      const n = node(events[i].city)
      counts[n.key] = (counts[n.key] || 0) + 1
      if (n.ncr) ncrCount++
    }
    // route of the last few events
    const start = Math.max(1, Math.floor(cur) - 7)
    for (let i = start; i < Math.min(N, Math.floor(cur)); i++) {
      const a = node(events[i - 1].city).pos, b = node(events[i].city).pos
      ctx.strokeStyle = `rgba(255,182,72,${0.08 + 0.4 * (1 - (cur - i) / 8)})`
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
    }
    // cities
    const cities = [...Object.keys(GEO), 'Online']
    cities.forEach((c) => {
      const n = node(c)
      const k = counts[n.key] || 0
      const r = 2 + Math.sqrt(k) * 3.6
      ctx.beginPath(); ctx.arc(n.pos[0], n.pos[1], r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${INK},${k ? 0.14 : 0.04})`; ctx.fill()
      ctx.strokeStyle = `rgba(${INK},${k ? 0.6 : 0.2})`; ctx.stroke()
      ctx.fillStyle = `rgba(${INK},${k ? 0.9 : 0.3})`
      ctx.fillRect(n.pos[0] - 1.5, n.pos[1] - 1.5, 3, 3)
      ctx.fillText(`${n.label.toUpperCase()}${k ? '  ' + k : ''}`, n.pos[0] + r + 6, n.pos[1] + 3)
    })
    // Delhi on the main map carries the NCR total
    const rr = 2 + Math.sqrt(ncrCount) * 3.6
    ctx.beginPath(); ctx.arc(delhi[0], delhi[1], rr, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${INK},0.14)`; ctx.fill(); ctx.strokeStyle = `rgba(${INK},0.6)`; ctx.stroke()
    ctx.fillStyle = `rgba(${INK},0.9)`; ctx.fillText(`DELHI NCR${ncrCount ? '  ' + ncrCount : ''}`, delhi[0] + rr + 6, delhi[1] + 3)
    // pulses
    for (let i = Math.max(0, Math.floor(cur) - 5); i < Math.min(N, Math.ceil(cur)); i++) {
      const age = cur - i
      const e = events[i]
      const n = node(e.city)
      const col = e.own ? OWN : PART
      const spots = n.ncr ? [n.pos, delhi] : [n.pos]
      spots.forEach((pos, s) => {
        ctx.globalAlpha = Math.max(0, 1 - age / 5) * (s ? 0.5 : 1)
        ctx.strokeStyle = col; ctx.lineWidth = e.own ? 2.5 : 1.5
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 6 + age * (e.own ? 22 : 15), 0, Math.PI * 2); ctx.stroke()
        if (age < 1.2) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(pos[0], pos[1], 5 * (1.2 - age), 0, Math.PI * 2); ctx.fill() }
      })
      ctx.globalAlpha = 1; ctx.lineWidth = 1
    }
    // side panel
    const idx = Math.min(N - 1, Math.floor(cur) - 1)
    if (idx !== lastIdx) {
      lastIdx = idx
      const e = events[Math.max(0, idx)]
      const [y, m] = e.iso.split('-')
      $('.atlas__date').textContent = `${MONTHS[+m - 1]} ${y}`
      $('.atlas__count').textContent = String(Math.max(0, idx + 1)).padStart(3, '0')
      $('.atlas__now').textContent = idx < 0 ? '' : e.title
      $('.atlas__log').innerHTML = idx < 0 ? '' : events.slice(Math.max(0, idx - 4), idx + 1).reverse().map((x) => `<li>${x.date} · ${x.city || 'Online'} · ${x.role}</li>`).join('')
    }
  }
  const scrub = $('.atlas__scrub')
  scrub.addEventListener('input', () => { p = scrub.value / 1000; hold = performance.now() + 3500 })
  let prev = performance.now()
  gsap.ticker.add(() => {
    const now = performance.now()
    const dt = now - prev
    prev = now
    if (!on) return
    if (now > hold) {
      p += dt / 30000
      if (p >= 1.02) { p = 0; hold = now + 800 }
      scrub.value = Math.min(1000, p * 1000)
    }
    draw()
  })
  size()
  new ResizeObserver(() => { size(); draw() }).observe(canvas)
  visible(canvas, (v) => (on = v))
}

Promise.all([document.fonts.load('800 1em "Bricolage Grotesque Variable"'), document.fonts.load('500 1em "Geist Mono Variable"'), document.fonts.load('italic 400 1em "Instrument Serif"')]).catch(() => null).then(() => {
  contactSheet()
  throughTheClock()
  board()
  fieldRecording()
  ScrollTrigger.refresh()
})
