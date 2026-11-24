import { useRef } from 'react'
import { Page } from '../../components/layout/Page'
import { Button } from '../../components/ui/Button'
import { Chars } from '../../components/ui/Chars'
import { useFx } from '../../lib/fx'
import { DELHI } from '../../data/site'
import { setupHome } from './homeFx'
import { setupBack } from './backFx'
import { Admit, CallSheetDoc, Credits, Edition, Lineup, Plates, Tally } from './Back'
import { ScrollClock } from './ScrollClock'
import { Novel } from './Novel'
import { MAP_R, VIEWS } from './angleViews'

/**
 * The manifesto is hidden in a WebGL sculpture of loose engraving strokes (angleScene.ts): each of
 * the three words reads from one camera angle only, and scrolling flies the camera to each angle.
 */
const WORDS = [
  { word: 'Unorthodox.', cap: 'Hackathons in rooms nobody expected.' },
  { word: 'Daring.', cap: 'We say the number out loud. Then we show up.' },
  { word: 'Fast.', cap: '36 hours. Not 36 weeks.' },
]
/** Plan view: world position on the floor → SVG units (sculpture centre at 0,0, front at the bottom). */
const plan = (az: number, r: number) => {
  const a = (az * Math.PI) / 180
  const k = 80 / MAP_R
  return [Math.sin(a) * r * k, Math.cos(a) * r * k]
}

function Hero() {
  return (
    <section className="hero theme-paper" data-theme="paper" data-chapter="Hour zero" data-hour="0" aria-labelledby="hero-title">
      <div className="hero__hours" aria-hidden="true">
        {Array.from({ length: 13 }, (_, i) => (
          <span key={i} className="hero__hour">
            <i className="mono">{String(i * 3).padStart(2, '0')}</i>
          </span>
        ))}
      </div>
      <canvas className="hero__field" aria-hidden="true" />
      <div className="hero__inner wrap">
        <div className="hero__meta mono hero__fade">
          <span>Genesis Hacks · India</span>
          <span>Hackathons, speaker sessions, builder events</span>
          <span>Sat 09:00 IST</span>
        </div>
        <h1 id="hero-title" className="hero__title display">
          <span className="hero__line">
            <Chars text="Everything" />
          </span>
          <span className="hero__line hero__line--2">
            <Chars text="starts at" />
          </span>
          <span className="hero__line hero__line--3">
            <Chars text="hour" />
            <span className="hero__zero">
              <em className="serif">zero</em>
              <svg className="hero__ring" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
                <ellipse cx="100" cy="62" rx="96" ry="54" />
              </svg>
            </span>
            <Chars text="." />
          </span>
        </h1>
        <div className="hero__foot">
          <p className="hero__lead lead hero__fade">Hackathons and builder events across India. Fast, unorthodox, in public.</p>
          <div className="hero__actions hero__fade">
            <Button to="/partner">Partner with Genesis</Button>
            <Button to={DELHI.path} variant="ghost">
              Hackers Occupied Delhi · Jan 2027
            </Button>
          </div>
          <a href="#three-words" className="hero__hint mono hero__fade">
            <span className="hero__hint-line" aria-hidden="true" />
            Scroll to start the clock
          </a>
        </div>
      </div>
      <div className="hero__disc" aria-hidden="true" />
    </section>
  )
}

function Manifesto() {
  return (
    <section id="three-words" className="mani theme-ink" data-theme="ink" data-chapter="Three words" data-hour="0.7" aria-labelledby="mani-title">
      <canvas className="mani__gl" aria-hidden="true" />
      <div className="mani__hud" aria-hidden="true">
        <div className="mani__top mono">
          <span>T+00:42 · Three words · Sat 09:42</span>
          <span>
            Viewpoint <b className="mani__vp">—</b> / 03
          </span>
        </div>
        <p className="mani__intro">
          Three words are hidden in here. <em className="serif">Each one reads from a single angle.</em>
        </p>
        <p className="mani__outro display">
          Same parts. <em className="serif">Different angle.</em>
        </p>
        <div className="mani__gauge">
          <div className="mani__meter mono">
            <span>Alignment</span>
            <b className="mani__pct">0%</b>
            <i className="mani__bar">
              <i />
            </i>
          </div>
          <svg className="mani__map" viewBox="-100 -100 200 200">
            <circle className="mani__map-orbit" r={(9 * 80) / MAP_R} />
            <circle className="mani__map-cloud" r="24" />
            {VIEWS.map((v, i) => {
              const [x, y] = plan(v.az, v.r)
              return (
                <g key={i} className="mani__map-vp" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                  <circle r="5" />
                  <text y="-11">0{i + 1}</text>
                </g>
              )
            })}
            <line className="mani__map-ray" />
            <circle className="mani__map-cam" r="6" />
          </svg>
        </div>
      </div>
      <h2 id="mani-title" className="sr-only">
        Unorthodox. Daring. Fast.
      </h2>
      <ol className="mani__list">
        {WORDS.map((w, i) => (
          <li key={w.word} className="mani__item">
            <span className="mani__word display" aria-hidden="true">
              {w.word}
            </span>
            <span className="mani__cap">
              <span className="mono">0{i + 1} — </span>
              {w.cap}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Home() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, (root, reduced) => {
    const front = setupHome(root, reduced)
    const back = setupBack(root, reduced)
    return () => {
      front()
      back()
    }
  })
  return (
    <Page theme="ink" className="home">
      <div ref={ref}>
        <Hero />
        <Manifesto />
        <Novel />
        <Tally />
        <Plates />
        <Edition />
        <CallSheetDoc />
        <Lineup />
        <Admit />
        <Credits />
      </div>
      <ScrollClock />
    </Page>
  )
}
