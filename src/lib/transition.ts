/** Tiny bus that lets pages wait for the curtain (or the preloader) before playing their intro. */
let revealed = true
let waiting: Array<() => void> = []
const listeners = new Set<(covered: boolean) => void>()

export function markCovered() {
  revealed = false
  listeners.forEach((fn) => fn(true))
}

export function markRevealed() {
  revealed = true
  const list = waiting
  waiting = []
  list.forEach((fn) => fn())
  listeners.forEach((fn) => fn(false))
}

export function whenRevealed(): Promise<void> {
  return revealed ? Promise.resolve() : new Promise((resolve) => waiting.push(resolve))
}

export function isRevealed() {
  return revealed
}

export function onCoverChange(fn: (covered: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/* ---- page mount handshake (lets the curtain wait for lazily loaded pages) ---- */
let mountResolver: (() => void) | null = null

export function nextPageMount(timeout = 4000): Promise<void> {
  return new Promise((resolve) => {
    const t = window.setTimeout(() => {
      mountResolver = null
      resolve()
    }, timeout)
    mountResolver = () => {
      window.clearTimeout(t)
      mountResolver = null
      resolve()
    }
  })
}

export function pageMounted() {
  mountResolver?.()
}
