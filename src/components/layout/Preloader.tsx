import { useEffect, useRef, useState } from 'react'
import { gsap, isReduced } from '../../lib/motion'
import { markCovered, markRevealed } from '../../lib/transition'
import { lockScroll } from '../../lib/scroll'

const KEY = 'gh-intro'

function shouldPlay() {
  if (typeof window === 'undefined' || isReduced()) return false
  try {
    return !sessionStorage.getItem(KEY)
  } catch {
    return false
  }
}

// Decided once, before any page mounts, so page intros wait for the preloader to finish.
const PLAY = shouldPlay()
if (PLAY) markCovered()

const WORDS = ['Unorthodox.', 'Daring.', 'Fast.']

/**
 * First visit of a session only. The clock runs from 00 to 36 hours while the three brand
 * words flash past, then the frame splits along the horizon and the home page is already there.
 * Any key or click skips it. Never plays under reduced motion.
 */
export function Preloader() {
  const [on, setOn] = useState(PLAY)
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!on) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    lockScroll(true)
    const counter = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        lockScroll(false)
        setOn(false)
      },
    })
    tl.from('.pre__mono', { opacity: 0, y: 12, duration: 0.6, stagger: 0.08, ease: 'expo.out' }, 0)
      .to(counter, {
        v: 36,
        duration: 1.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(2, '0')
        },
      }, 0.1)
      .to(bar.current, { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0.1)
    WORDS.forEach((w, i) => {
      tl.call(() => {
        if (word.current) word.current.textContent = w
      }, [], 0.25 + i * 0.55)
        .fromTo(word.current, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' }, 0.25 + i * 0.55)
    })
    tl.to('.pre__inner', { opacity: 0, duration: 0.3, ease: 'power2.in' }, 2.1)
      .add(() => markRevealed(), 2.3)
      .to(top.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.2)
      .to(bottom.current, { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, 2.2)

    const skip = () => tl.progress() < 0.75 && tl.seek(2.15)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      tl.kill()
    }
  }, [on])

  if (!on) return null
  return (
    <div ref={root} className="pre" aria-hidden="true">
      <div ref={top} className="pre__half pre__half--top" />
      <div ref={bottom} className="pre__half pre__half--bottom" />
      <div className="pre__inner">
        <div className="pre__row">
          <span className="pre__mono mono">Genesis Hacks · India</span>
          <span className="pre__mono mono">Hackers Occupied Delhi · Jan 2027</span>
        </div>
        <div className="pre__center">
          <span className="pre__num display">
            <span ref={num}>00</span>
            <span className="pre__h serif">h</span>
          </span>
          <span className="pre__wordmask">
            <span ref={word} className="pre__word serif">
              &nbsp;
            </span>
          </span>
        </div>
        <div className="pre__row">
          <span className="pre__mono mono">Starting the clock</span>
          <span className="pre__track">
            <span ref={bar} className="pre__bar" />
          </span>
          <span className="pre__mono mono">36:00</span>
        </div>
      </div>
    </div>
  )
}
