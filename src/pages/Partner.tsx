import { useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero, Stat } from '../components/layout/PageHero'
import { LiveCount } from '../components/ui/LiveCount'
import { Button, ContactLines, Kicker, SectionHead, Tag } from '../components/ui/Bits'
import { OutcomeStack, ProofRows, Steps, stackFx } from '../components/blocks'
import { PartnerForm } from '../components/forms/PartnerForm'
import { EventPartnerForm } from '../components/forms/EventPartnerForm'
import { useFx } from '../lib/fx'
import { DELHI, HEADLINE } from '../data/site'

export default function Partner() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, stackFx)
  const [params, setParams] = useSearchParams()
  const mode: 'sponsor' | 'event' = params.get('form') === 'event' ? 'event' : 'sponsor'
  const pick = (m: 'sponsor' | 'event') => {
    const next = new URLSearchParams(params)
    if (m === 'event') next.set('form', 'event')
    else next.delete('form')
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'Partner with\n*Genesis.*'}
          lead="Sponsor Hackers Occupied Delhi 2027 or independent student hackathons across India. Tell us your goal, budget and timeline and we shortlist events that fit."
          actions={
            <>
              <Button href="#partner-form" arrow="down">Start a sponsorship</Button>
              <Button to="/partner?form=event#partner-form" variant="ghost">Partner your event</Button>
            </>
          }
          aside={
            <>
              <Stat value={HEADLINE.participantsLabel} count={HEADLINE.participants} suffix="+" label="Participants" />
              <LiveCount value={HEADLINE.registrations} label="Registrations" size="m" className="stat--live" />
              <Stat value={HEADLINE.hackathonsLabel} count={HEADLINE.hackathons} suffix="+" label="Hackathons" />
            </>
          }
        />
        <section className="section section--tight theme-violet" data-theme="violet">
          <div className="wrap spec">
            <div className="spec__head">
              <Kicker>Next up · Sponsor slots open</Kicker>
              <h2 className="display spec__title" data-fx="lines">
                Hackers Occupied <em className="serif">Delhi 2027</em>
              </h2>
              <p className="lead" data-fx="fade">Put your API, hiring team or brand in front of 100 student teams for a weekend in Delhi NCR.</p>
              <div className="actions" data-fx="fade">
                <Button to="/partner?event=hackers-occupied-delhi#partner-form">Sponsor Delhi 2027</Button>
                <Button to={DELHI.path} variant="ghost">See the event page</Button>
              </div>
            </div>
            <dl className="spec__table" data-fx="stagger">
              <div><dt className="mono">When</dt><dd>Mid-January 2027 <Tag tone="warn">Dates to be confirmed</Tag></dd></div>
              <div><dt className="mono">Where</dt><dd>Delhi NCR <Tag tone="warn">Venue to be announced</Tag></dd></div>
              <div><dt className="mono">Format</dt><dd>100 teams of 3 to 5</dd></div>
              <div><dt className="mono">Registrations</dt><dd>4,000+ expected <Tag tone="warn">Projection, not a result</Tag></dd></div>
              <div><dt className="mono">Tracks</dt><dd className="spec__tracks">{DELHI.tracks.map((t) => <Tag key={t}>{t}</Tag>)}</dd></div>
            </dl>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <SectionHead n="01" kicker="For sponsors" title="What you *get*" intro="Three reasons companies sponsor student hackathons. Pick the one that matters to you and we build the sponsorship around it." />
            <OutcomeStack />
            <p className="mono faint" style={{ marginTop: '2rem' }}>Packages and pricing are shared on request.</p>
          </div>
        </section>
        <section className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="02" kicker="From first call to event day" title="How it *works*" />
            <Steps />
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <SectionHead n="03" kicker="Proof" title="Event Partner *at*" intro="Hackathons where Genesis was Event Partner. Each was run by its own organising team." />
            <ProofRows />
          </div>
        </section>
        <section id="partner-form" className="section theme-paper2 formsec">
          <div className="wrap">
            <div className="paths" role="tablist" aria-label="Who is applying">
              <button type="button" role="tab" id="tab-sponsor" aria-selected={mode === 'sponsor'} aria-controls="partner-panel" className={`paths__opt ${mode === 'sponsor' ? 'is-on' : ''}`} onClick={() => pick('sponsor')}>
                <span className="mono">01 · For companies</span>
                <span className="paths__title display">Sponsor an event</span>
                <span className="paths__line">Reach, hire or get your product used by student builders.</span>
              </button>
              <button type="button" role="tab" id="tab-event" aria-selected={mode === 'event'} aria-controls="partner-panel" className={`paths__opt ${mode === 'event' ? 'is-on' : ''}`} onClick={() => pick('event')}>
                <span className="mono">02 · For organisers</span>
                <span className="paths__title display">Partner your event</span>
                <span className="paths__line">Running a hackathon or meetup? Apply to have Genesis on board.</span>
              </button>
            </div>
          </div>
          <div id="partner-panel" role="tabpanel" aria-labelledby={mode === 'event' ? 'tab-event' : 'tab-sponsor'} className="wrap formsec__grid">
            {mode === 'sponsor' ? (
              <aside className="formsec__side">
                <Kicker n="04">Start here</Kicker>
                <h2 className="display formsec__title">
                  Tell us what <em className="serif">you need.</em>
                </h2>
                <p className="lead">Five minutes. The more you share about goals, budget and timing, the better the first shortlist.</p>
                <ol className="formsec__list">
                  <li><span className="mono">01</span>Hackers Occupied Delhi 2027: title, track and booth sponsorships</li>
                  <li><span className="mono">02</span>Independent hackathons matched to your audience and city</li>
                  <li><span className="mono">03</span>Campus chapters, community partnerships and in-kind credits</li>
                </ol>
                <p className="mono faint">Prefer to talk?</p>
                <ContactLines />
              </aside>
            ) : (
              <aside className="formsec__side">
                <Kicker n="04">Event partner application</Kicker>
                <h2 className="display formsec__title">
                  Partner your event <em className="serif">with Genesis.</em>
                </h2>
                <p className="lead">Six short steps, about 15 minutes. Fill in as much detail as you can: it helps us match sponsors, judges and mentors to your event.</p>
                <p className="mono faint">What we look for</p>
                <ol className="formsec__list">
                  <li><span className="mono">01</span>Open to anyone who builds, not only one campus</li>
                  <li><span className="mono">02</span>Judging on what teams build during the event</li>
                  <li><span className="mono">03</span>A published code of conduct, enforced on the day</li>
                </ol>
                <p className="muted">
                  These come from <Link className="ul" to="/values">how we run events</Link>. Your answers save on this device as you go.
                </p>
                <p className="mono faint">Questions first?</p>
                <ContactLines />
              </aside>
            )}
            <div className="formsec__form">
              <h3 className="sr-only">{mode === 'event' ? 'Event partner application' : 'Sponsorship request'}</h3>
              {mode === 'event' ? <EventPartnerForm /> : <PartnerForm />}
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
