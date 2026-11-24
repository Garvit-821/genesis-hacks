import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, ContactLines, Kicker, NextUp, SectionHead } from '../components/ui/Bits'
import { InquiryForm } from '../components/forms/InquiryForm'
import { useFx } from '../lib/fx'

const WAYS = [
  ['Co-host a hackathon', 'Your campus or community runs the event; we help with sponsors, judges and mentors.'],
  ['Run a track', 'Set a challenge with its own brief, judging and prize inside a Genesis event.'],
  ['List your event', 'Running a student hackathon? Tell us about it and we will look at bringing partners in.'],
  ['Judge or mentor', 'Give a weekend to help teams get unstuck, then score what they built.'],
]

export default function Collaborate() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref)
  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'Collaborate\nwith *Genesis.*'}
          lead="Co-host a hackathon, run a track, list your event, or join as a judge or mentor."
          actions={<Button href="#collaborate-form" arrow="down">Send an idea</Button>}
        />
        <section className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="01" kicker="Four seats at the table" title="Ways to *collaborate*" />
            <div className="rows ways" data-fx="stagger">
              {WAYS.map(([t, line], i) => (
                <Link key={t} to={i < 3 ? '/partner?form=event#partner-form' : '/collaborate#collaborate-form'} className="row row--3 way" data-cursor={i < 3 ? 'Apply' : 'Pitch it'}>
                  <span className="row__n mono">0{i + 1}</span>
                  <h3 className="row__title way__title display">{t}</h3>
                  <p className="row__meta">{line}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section id="collaborate-form" className="section formsec">
          <div className="wrap formsec__grid">
            <aside className="formsec__side">
              <Kicker n="02">Start here</Kicker>
              <h2 className="display formsec__title" data-fx="lines">
                Tell us <em className="serif">the idea.</em>
              </h2>
              <p className="lead" data-fx="fade">A few lines is enough. Include dates and expected audience if you have them.</p>
              <p className="mono faint">Prefer to talk?</p>
              <ContactLines />
              <p className="muted">
                Organising a hackathon or meetup? The detailed <Link className="ul" to="/partner?form=event#partner-form">event partner application</Link> gets you a faster answer.
              </p>
              <p className="muted">
                Looking to sponsor instead? <Link className="ul" to="/partner">Partner with us</Link>
              </p>
            </aside>
            <div className="formsec__form">
              <InquiryForm kind="collaborate" />
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
