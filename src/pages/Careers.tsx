import { useRef, useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, Kicker, SectionHead } from '../components/ui/Bits'
import { CrewForm } from '../components/forms/CrewForm'
import { useFx } from '../lib/fx'
import { gsap, isReduced } from '../lib/motion'
import { scrollToY } from '../lib/scroll'
import { CAREER_AREAS, DELHI } from '../data/site'

export default function Careers() {
  const ref = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [area, setArea] = useState<string | undefined>()
  useFx(ref)

  const pick = (i: number) => {
    if (i === active) return
    setActive(i)
    if (!isReduced() && panel.current) gsap.fromTo(panel.current.children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' })
  }
  const apply = (value: string) => {
    setArea(value)
    scrollToY('#apply', { offset: -80 })
  }
  const a = CAREER_AREAS[active]

  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'Join\n*the crew.*'}
          lead="Help run hackathons across India. Tell us what you want to work on and we reply within 2 business days."
          actions={
            <>
              <Button href="#apply" arrow="down">Apply now</Button>
              <Button href="#areas" variant="ghost" arrow="down">Areas of work</Button>
            </>
          }
        />
        <section id="areas" className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="01" kicker="Where you can help" title="Areas of *work*" intro="If there is a fit for an upcoming event, we set up a call and tell you what the work involves and how much time it takes." />
            <div className="areas">
              <div className="areas__tabs" role="tablist" aria-label="Areas of work">
                {CAREER_AREAS.map((c, i) => (
                  <button key={c.value} type="button" role="tab" id={`area-tab-${i}`} aria-selected={i === active} aria-controls="area-panel" className={`areas__tab display ${i === active ? 'is-active' : ''}`} onClick={() => pick(i)}>
                    <span className="mono">0{i + 1}</span>
                    {c.title}
                  </button>
                ))}
              </div>
              <div ref={panel} id="area-panel" role="tabpanel" aria-labelledby={`area-tab-${active}`} className="areas__panel">
                <p className="areas__line">{a.line}</p>
                <p className="mono faint">You might</p>
                <ul className="areas__list">
                  {a.youWill.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <div>
                  <Button variant="accent" onClick={() => apply(a.value)} arrow="down">
                    Apply for {a.title.toLowerCase()}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section section--tight theme-amber" data-theme="amber">
          <div className="wrap endcta">
            <Kicker>Next event</Kicker>
            <h2 className="display" data-fx="lines">
              Want to help at Hackers Occupied <em className="serif">Delhi 2027?</em>
            </h2>
            <p className="lead" data-fx="fade">{DELHI.where}, {DELHI.when}. Pick event operations in the form and mention Delhi.</p>
            <div data-fx="fade">
              <Button onClick={() => apply('Event operations')} arrow="down">Apply for Delhi</Button>
            </div>
          </div>
        </section>
        <section id="apply" className="section formsec">
          <div className="wrap formsec__grid">
            <aside className="formsec__side">
              <Kicker n="02">Apply</Kicker>
              <h2 className="display formsec__title" data-fx="lines">
                Tell us <em className="serif">about you.</em>
              </h2>
              <p className="lead" data-fx="fade">
                Questions first? Email <a className="ul" href="mailto:partner@genesishacks.com">partner@genesishacks.com</a>.
              </p>
            </aside>
            <div className="formsec__form">
              <CrewForm area={area} />
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
