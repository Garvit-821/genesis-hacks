import { useRef } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, NextUp, SectionHead } from '../components/ui/Bits'
import { stackFx } from '../components/blocks'
import { useFx } from '../lib/fx'
import { CONTACT } from '../data/site'

const RULES = [
  ['Working builds over slides', 'Judges at events we run score what a team built during the event. A demo that works beats a polished pitch deck.'],
  ['Build in public', 'We encourage teams to share their code, write up what broke, and keep their projects online after the event.'],
  ['Open to anyone who builds', 'You do not need a computer science degree or a famous college. First-timers, designers and self-taught developers are welcome at every event we run.'],
  ['Numbers we can back up', 'We only publish figures we can source, and we say when a number is a projection rather than a result.'],
  ['Help each other', 'Mentors, organisers and other teams are there to get you unstuck. Asking early is encouraged.'],
  ['Leave it better', "We respect venues, mentors' time and other people's work, and we clean up after ourselves."],
]
const CODE = [
  ["Credit other people's work", "Name the libraries, APIs and teammates you used. Submitting someone else's work as your own is not allowed."],
  ['Critique the work, not the person', 'Challenge ideas and code directly, and stay kind to the people behind them.'],
  ['Say when you do not know', 'Nobody knows everything at 3 AM. Asking is how teams finish.'],
  ['No harassment, ever', 'Harassment, discrimination and gatekeeping are not tolerated at any Genesis event, online or offline.'],
]
const TONES = ['var(--paper-2)', 'var(--ink)', 'var(--violet-deep)', 'var(--paper-3)', 'var(--amber)', 'var(--ink-3)']
const FG = ['var(--ink)', 'var(--paper)', '#f6f3ff', 'var(--ink)', 'var(--ink)', 'var(--paper)']

export default function Values() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, stackFx)
  return (
    <Page>
      <div ref={ref}>
        <PageHero title={'How we\nrun *events.*'} lead="The rules we hold ourselves to when we run a hackathon or partner on one. Hold us to them." />
        <section className="section">
          <div className="wrap">
            <SectionHead n="01" kicker="Read aloud at every kickoff" title="Our six *rules*" />
            <div className="stack">
              {RULES.map(([t, line], i) => (
                <article key={t} className="stack__card rule-card" style={{ '--i': i, '--card-bg': TONES[i], '--card-fg': FG[i] } as React.CSSProperties}>
                  <span className="stack__n mono">Rule 0{i + 1} / 06</span>
                  <h3 className="rule-card__title display">{t}</h3>
                  <p className="rule-card__line">{line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="02" kicker="At every event" title="Code of *conduct*" />
            <div className="rows" data-fx="stagger">
              {CODE.map(([t, line], i) => (
                <div key={t} className="row row--3">
                  <span className="row__n mono">0{i + 1}</span>
                  <h3 className="row__title">{t}</h3>
                  <p className="row__meta">{line}</p>
                </div>
              ))}
              <div className="row row--3">
                <span className="row__n mono">05</span>
                <h3 className="row__title">Report a problem</h3>
                <p className="row__meta">
                  At an event, tell any organiser straight away. Afterwards, email <a className="ul" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call <a className="ul" href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
                </p>
              </div>
            </div>
            <div className="endcta">
              <h2 className="display" data-fx="lines">
                See it in practice at Hackers Occupied <em className="serif">Delhi 2027.</em>
              </h2>
              <div className="actions" data-fx="fade">
                <Button to="/events/hackers-occupied-delhi" variant="accent">About Delhi 2027</Button>
                <Button to="/about" variant="ghost">About Genesis</Button>
              </div>
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
