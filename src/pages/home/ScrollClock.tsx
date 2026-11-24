import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../../lib/motion'
import { getLenis, scrollToY } from '../../lib/scroll'

type Chapter = { el: HTMLElement; label: string; hour: number; top: number }

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')

/** Hour on the story clock → the wall-clock time at the event (Saturday 09:00 is hour zero). */
function wall(hour: number) {
  const total = 9 * 60 + Math.round(hour * 60)
  const day = total >= 24 * 60 ? 'Sun' : 'Sat'
  const m = total % (24 * 60)
  const h = Math.floor(m / 60)
  const ampm = h >= 12 ? 'p.m.' : 'a.m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${day} ${pad(h12)}:${pad(m % 60)} ${ampm}`
}

/**
 * The home page is one 36-hour hackathon. This readout is the narrator: it turns scroll
 * position into story time, names the chapter, and doubles as chapter navigation.
 */
export function ScrollClock() {
  const [chapters, setChapters] = useState<Array<{ label: string; hour: number }>>([])
  const [active, setActive] = useState(0)
  const [hidden, setHidden] = useState(true)
  const stamp = useRef<HTMLSpanElement>(null)
  const time = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const list = useRef<Chapter[]>([])

  useEffect(() => {
    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.home [data-chapter]'))
      list.current = els.map((el) => {
        // A pinned section reports its fixed position; its spacer keeps the real one.
        const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
        return { el, label: el.dataset.chapter || '', hour: Number(el.dataset.hour || 0), top: box.getBoundingClientRect().top + window.scrollY }
      })
      setChapters(list.current.map(({ label, hour }) => ({ label, hour })))
      update()
    }
    let last = -1
    const update = () => {
      const L = list.current
      if (!L.length) return
      const y = window.scrollY + window.innerHeight * 0.5
      let i = 0
      while (i < L.length - 1 && y >= L[i + 1].top) i++
      const a = L[i]
      const b = L[i + 1]
      const frac = b ? Math.min(1, Math.max(0, (y - a.top) / (b.top - a.top))) : 1
      const hour = b ? a.hour + frac * (b.hour - a.hour) : a.hour
      const minutes = Math.round(hour * 60)
      if (stamp.current) stamp.current.textContent = `T+${pad(minutes / 60)}:${pad(minutes % 60)}`
      if (time.current) time.current.textContent = wall(hour)
      if (bar.current) bar.current.style.transform = `scaleY(${hour / 36})`
      if (i !== last) {
        last = i
        setActive(i)
      }
      const ftr = document.querySelector('.ftr')
      // The story has its own plate counter, so the clock steps aside while it plays.
      const inStory = a.el.classList.contains('novel--live') && a.el.getBoundingClientRect().top <= 1
      setHidden(inStory || window.scrollY < window.innerHeight * 0.25 || (!!ftr && ftr.getBoundingClientRect().top < window.innerHeight * 0.85))
    }
    ScrollTrigger.addEventListener('refresh', measure)
    const t = window.setTimeout(measure, 300)
    const lenis = getLenis()
    lenis?.on('scroll', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      ScrollTrigger.removeEventListener('refresh', measure)
      window.clearTimeout(t)
      lenis?.off('scroll', update)
      window.removeEventListener('scroll', update)
    }
  }, [])

  const go = (i: number) => {
    const c = list.current[i]
    if (c) scrollToY(c.top + 2)
  }

  return (
    <aside className={`clock ${hidden ? 'is-hidden' : ''}`} aria-label="Story clock and chapters">
      <span className="clock__rail" aria-hidden="true">
        <span ref={bar} className="clock__fill" />
      </span>
      <div className="clock__read">
        <span ref={stamp} className="clock__stamp mono" aria-hidden="true">
          T+00:00
        </span>
        <span className="clock__chapter">{chapters[active]?.label ?? 'Hour zero'}</span>
        <span ref={time} className="clock__time mono" aria-hidden="true">
          Sat 09:00 a.m.
        </span>
      </div>
      <nav className="clock__nav" aria-label="Chapters">
        <ol>
          {chapters.map((c, i) => (
            <li key={c.label}>
              <button type="button" className={i === active ? 'is-active' : ''} onClick={() => go(i)} aria-current={i === active ? 'step' : undefined}>
                <span className="sr-only">
                  Go to chapter {i + 1}: {c.label}
                </span>
                <span className="clock__dot mono" aria-hidden="true">
                  {pad(c.hour)}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <a className="clock__skip mono" href="#demo" onClick={(e) => (e.preventDefault(), scrollToY('#demo'))}>
          Skip the story
        </a>
      </nav>
    </aside>
  )
}
