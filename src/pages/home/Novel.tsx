import type { ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { DELHI, photo } from '../../data/site'

/**
 * "The Genesis Experience": one hackathon weekend told as a graphic novel in four plates.
 * Every panel is a real photograph engraved into ink (scripts/engrave.py); press and hold
 * a panel to develop it back into the photograph. Narration lives in caption boxes, the way a
 * comic narrates: short, present tense, one idea per box.
 */

type Cap = { text: ReactNode; at: 'tl' | 'tr' | 'bl' | 'br'; tilt?: number }
type Panel = { file: string; area: string; focus?: boolean; caps: Cap[]; pos?: string }
type Plate = { id: string; time: string; title: string; layout: string; panels: Panel[] }

const PLATES: Plate[] = [
  {
    id: 'doors',
    time: 'Sat 09:00',
    title: 'Doors open',
    layout: 'doors',
    panels: [
      { file: 'dsc09246', area: 'a', focus: true, caps: [{ at: 'tl', text: <>Sat 09:00. Two hundred strangers walk into <b>one room</b>.</>, tilt: -1.2 }] },
      { file: 'dsc09188', area: 'b', caps: [{ at: 'bl', text: <>Nobody knows anyone yet.</>, tilt: 1.4 }] },
      { file: 'dsc09197', area: 'c', caps: [{ at: 'br', text: <>Everybody brought <b>an idea</b>.</>, tilt: -1 }] },
    ],
  },
  {
    id: 'rounds',
    time: 'Sat 18:00',
    title: 'The rounds',
    layout: 'rounds',
    panels: [
      { file: 'dsc09243', area: 'a', caps: [{ at: 'tl', text: <>“Show me the error.”</>, tilt: 1.2 }] },
      { file: 'dsc09252', area: 'b', focus: true, caps: [{ at: 'bl', text: <>Sat 18:00. Mentors walk the rows, <b>desk by desk</b>.</>, tilt: -1 }] },
      { file: 'dsc09267', area: 'c', caps: [{ at: 'br', text: <>Somebody stays to <b>fix it</b>.</>, tilt: 1.5 }] },
    ],
  },
  {
    id: 'night',
    time: 'Sun 03:00',
    title: 'Nobody goes home',
    layout: 'night',
    panels: [
      { file: 'dsc09631', area: 'a', focus: true, caps: [{ at: 'tl', text: <>Sun 03:00. The building sleeps. <b>The room doesn't.</b></>, tilt: -1.4 }] },
      { file: 'dsc09397', area: 'b', caps: [{ at: 'bl', text: <>Cans, jokes, <b>one more commit</b>.</>, tilt: 1.6 }] },
    ],
  },
  {
    id: 'demo',
    time: 'Sun 21:00',
    title: 'Demo',
    layout: 'demo',
    panels: [
      { file: 'dsc09998', area: 'a', focus: true, pos: '50% 60%', caps: [{ at: 'tl', text: <>Sun 21:00. <b>Somebody ships.</b> Everybody starts.</>, tilt: -1 }] },
    ],
  },
]

function PanelView({ p, index }: { p: Panel; index: number }) {
  const ph = photo(p.file)
  return (
    <figure className={`npanel npanel--${p.area} ${p.focus ? 'is-focus' : ''}`} style={{ gridArea: p.area }} data-hold>
      <div className="npanel__frame">
        <img className="npanel__ink" src={`/story/${p.file}.png`} alt={ph.alt} width={1600} height={1066} loading={index < 3 ? 'eager' : 'lazy'} style={{ objectPosition: p.pos }} />
        <img className="npanel__photo" src={ph.src} alt="" aria-hidden="true" width={ph.width} height={ph.height} loading="lazy" style={{ objectPosition: p.pos }} />
      </div>
      {p.caps.map((c, i) => (
        <figcaption key={i} className={`ncap ncap--${c.at}`} style={{ '--tilt': `${c.tilt ?? 0}deg` } as React.CSSProperties}>
          {c.text}
        </figcaption>
      ))}
      {p.focus && (
        <button type="button" className="nhold mono" aria-pressed="false" aria-label={`Develop the photograph: ${ph.caption}`}>
          <span>Hold</span>
        </button>
      )}
    </figure>
  )
}

export function Novel() {
  return (
    <section className="novel theme-paper" data-theme="paper" data-chapter="The weekend" data-hour="1.5" aria-labelledby="novel-title">
      <canvas className="novel__press" aria-hidden="true" />
      <div className="novel__bar wrap" aria-hidden="true">
        <span className="mono">The Genesis Experience</span>
        <span className="novel__plate mono">
          Plate <b>01</b> / 0{PLATES.length}
        </span>
        <span className="novel__track">
          <i />
        </span>
      </div>
      <h2 id="novel-title" className="sr-only">
        The Genesis Experience: one hackathon weekend in four plates
      </h2>
      <div className="novel__stage">
        <div className="ntitle" aria-hidden="true">
          <p className="ntitle__kicker mono">Chapter 02 · One weekend, start to finish</p>
          <p className="ntitle__main display">
            The Genesis <em className="serif">Experience</em>
          </p>
          <p className="ntitle__sub mono">Four plates · Press and hold any panel to develop it</p>
        </div>
        {PLATES.map((pl, i) => (
          <article key={pl.id} className={`npage npage--${pl.layout}`} data-plate={i} aria-label={`${pl.time}: ${pl.title}`}>
            <header className="npage__head">
              <span className="mono npage__time">{pl.time}</span>
              <h3 className="npage__title display">{pl.title}</h3>
            </header>
            <div className="npage__grid">
              {pl.panels.map((p, k) => (
                <PanelView key={p.file} p={p} index={i * 3 + k} />
              ))}
              {pl.layout === 'demo' && (
                <div className="nend" style={{ gridArea: 'b' }}>
                  <p className="mono">The end of one weekend</p>
                  <p className="nend__title display">
                    The clock resets <em className="serif">in Delhi.</em>
                  </p>
                  <div className="actions">
                    <Button to={DELHI.path} variant="solid">
                      Hackers Occupied Delhi
                    </Button>
                    <Button to="/partner" variant="ghost">
                      Partner with Genesis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
        {PLATES.slice(1).map((pl) => (
          <div key={pl.id} className="nwipe" aria-hidden="true" />
        ))}
      </div>
      <p className="novel__hint mono" aria-hidden="true">
        Press and hold a panel to develop the photograph
      </p>
    </section>
  )
}
