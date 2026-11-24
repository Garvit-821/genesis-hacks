/** The Genesis double-G, redrawn as strokes so it inherits colour and can draw itself on. */
export function LogoMark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg className={`logomark ${className}`} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="butt">
        <path d="M84.8 28.3 A41 41 0 1 0 91 50" />
        <path d="M65.7 40.2 A18.5 18.5 0 1 0 67.9 54.8" />
        <path d="M50 50 H95.6" />
      </g>
    </svg>
  )
}
