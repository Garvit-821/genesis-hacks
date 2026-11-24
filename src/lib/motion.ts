import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)
gsap.defaults({ ease: 'expo.out', duration: 1 })
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, Flip }

/** True when the visitor asked for less motion, in the OS or with the site toggle. */
export function isReduced(): boolean {
  if (typeof window === 'undefined') return true
  if (document.documentElement.dataset.motion === 'reduced') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setMotionPreference(mode: 'reduced' | 'full') {
  try {
    if (mode === 'reduced') localStorage.setItem('gh-motion', 'reduced')
    else localStorage.removeItem('gh-motion')
  } catch {
    /* storage blocked: the toggle still works for this page view */
  }
  if (mode === 'reduced') document.documentElement.dataset.motion = 'reduced'
  else delete document.documentElement.dataset.motion
}

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

let refreshQueued = 0
/** Sort triggers by page position and refresh once, after pins and splits settle. */
export function requestRefresh() {
  cancelAnimationFrame(refreshQueued)
  refreshQueued = requestAnimationFrame(() => {
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  })
}
