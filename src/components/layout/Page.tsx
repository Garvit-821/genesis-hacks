import { useLayoutEffect, type ReactNode } from 'react'
import { pageMounted } from '../../lib/transition'

/** Every route renders inside this. It tells the curtain the new page is in the DOM. */
export function Page({ children, className = '', theme = 'paper' }: { children: ReactNode; className?: string; theme?: string }) {
  useLayoutEffect(() => {
    pageMounted()
  }, [])
  return (
    <main id="main" tabIndex={-1} className={`page ${className} theme-${theme}`} data-theme={theme}>
      {children}
    </main>
  )
}
