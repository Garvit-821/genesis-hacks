/**
 * Renders text as one span per character (grouped by word so lines never break mid-word).
 * Screen readers get the plain sentence once; the spans are presentation only.
 */
export function Chars({ text, className = 'ch' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <span key={wi} className="wd">
            {w.split('').map((c, ci) => (
              <span key={ci} className={className}>
                {c}
              </span>
            ))}
            {wi < words.length - 1 && <span className={`${className} sp`}>&nbsp;</span>}
          </span>
        ))}
      </span>
    </>
  )
}
