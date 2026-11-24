import { photo } from '../../data/site'

/**
 * A photograph shown as its engraved ink plate (public/story), developing into the real
 * photo on hover. The plate carries the alt text; the colour layer is decorative.
 */
export function InkPhoto({ file, className = '', fx = true, delay }: { file: string; className?: string; fx?: boolean; delay?: string }) {
  const p = photo(file)
  return (
    <div className={`frame inkp ${className}`} data-fx={fx ? 'img' : undefined} data-delay={delay} data-develop>
      <img className="inkp__ink" src={`/story/${file}.png`} alt={p.alt} loading="lazy" width={1600} height={1066} />
      <img className="inkp__photo" src={p.src} alt="" aria-hidden="true" loading="lazy" width={p.width} height={p.height} />
    </div>
  )
}
