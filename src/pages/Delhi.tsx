import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, Kicker, SectionHead, Tag } from '../components/ui/Bits'
import { Accordion } from '../components/ui/Accordion'
import { OutcomeStack, stackFx } from '../components/blocks'
import { DelhiForm } from '../components/forms/DelhiForm'
import { useFx } from '../lib/fx'
import { gsap } from '../lib/motion'
import { CONTACT, DELHI, DELHI_TRACKS } from '../data/site'

const TARGET = new Date(`${DELHI.startDate}T09:00:00+05:30`).getTime()
const two = (n: number) => String(n).padStart(2, '0')

function Countdown() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((TARGET - now) / 1000))
  const parts = [
    [Math.floor(s / 86400), 'days'],
    [Math.floor((s % 86400) / 3600), 'hours'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'sec'],
  ] as const
  return (
    <div className="cd" role="timer" aria-label={`${parts[0][0]} days to the tentative start date`}>
      {parts.map(([v, l]) => (
        <div key={l} className="cd__cell" aria-hidden="true">
          <span className="cd__v display">{two(v)}</span>
          <span className="mono">{l}</span>
        </div>
      ))}
      <p className="cd__note mono">
        <Tag tone="warn">Tentative date</Tag> Counting to 15 Jan 2027, a placeholder until dates are confirmed.
      </p>
    </div>
  )
}

const FAQ = [
  { q: 'When is it?', a: `${DELHI.when}. Dates are not confirmed yet.` },
  { q: 'Where is it?', a: `${DELHI.where}. ${DELHI.venue}.` },
  { q: 'How big are teams?', a: 'Teams of 3 to 5. We are planning for 100 teams across 6 tracks.' },
  { q: 'How do I hear when registration opens?', a: 'Register your interest below. We email registration details when they open. Registering interest does not guarantee a place.' },
  { q: 'How do we sponsor it?', a: 'Use the partner form or email partner@genesishacks.com. We reply within 2 business days.' },
]

export default function Delhi() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, (root, reduced) => {
    stackFx(root, reduced)
    if (reduced) return
    // The city name is the set piece: it scrubs from hairline to full weight as it crosses the screen.
    const word = root.querySelector('.delhi-word')
    gsap.fromTo(word, { fontWeight: 200, fontStretch: '75%', xPercent: 8 }, { fontWeight: 800, fontStretch: '100%', xPercent: -8, ease: 'none', scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  return (
    <Page theme="night">
      <div ref={ref}>
        <PageHero
          theme="night"
          eyebrow="Upcoming · Hackers Occupied"
          title={'Hackers Occupied\n*Delhi 2027*'}
          size="l"
          lead="Genesis's own hackathon series comes to Delhi NCR. 100 teams build across AI, Web3, FinTech, Agro, Healthcare, CyberSecurity. Sponsor slots are open now. Student registration has not opened yet, so register interest to hear first."
          actions={
            <>
              <Button to="/partner?event=hackers-occupied-delhi" variant="accent">Sponsor Delhi 2027</Button>
              <Button href="#register" variant="ghost" arrow="down">Register interest</Button>
            </>
          }
        >
          <Countdown />
        </PageHero>
        <section className="theme-night delhi-band" data-theme="night" aria-hidden="true">
          <p className="delhi-word display">Delhi NCR</p>
        </section>
        <section className="section section--tight theme-night" data-theme="night">
          <div className="wrap facts" data-fx="stagger">
            <div className="fact"><span className="mono faint">Teams</span><span className="display" data-count={100}>100</span><span className="muted">planned for this edition</span></div>
            <div className="fact"><span className="mono faint">Builders per team</span><span className="display">3–5</span><span className="muted">bring your own or find one</span></div>
            <div className="fact"><span className="mono faint">Tracks</span><span className="display" data-count={6}>6</span><span className="muted">{DELHI.tracks.join(' · ')}</span></div>
            <div className="fact"><span className="mono faint">Registrations <Tag tone="warn">projection</Tag></span><span className="display">4,000+</span><span className="muted">projection, not a result</span></div>
          </div>
        </section>
        <section className="section theme-paper" data-theme="paper">
          <div className="wrap">
            <SectionHead n="01" kicker="Six ways in" title="Six *tracks*" intro="Sponsors can own a track: set the problem, judge the finalists and meet the teams who built for it." />
            <ol className="tracks" data-fx="stagger">
              {DELHI_TRACKS.map((t, i) => (
                <li key={t.name} className="track">
                  <span className="mono track__n">Track 0{i + 1}</span>
                  <h3 className="track__name display">{t.name}</h3>
                  <p className="track__line">{t.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="section theme-paper" data-theme="paper">
          <div className="wrap">
            <SectionHead n="02" kicker="Brands in the room with builders" title="Sponsor *Delhi 2027*" intro="Hackers Occupied is where Genesis puts brands in the room with the builders. Delhi 2027 is the next one." />
            <OutcomeStack />
            <div className="endcta">
              <p className="lead">
                Packages are sized on the first call. Email <a className="ul" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call <a className="ul" href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
              </p>
              <div><Button to="/partner?event=hackers-occupied-delhi" variant="accent">Start a sponsorship</Button></div>
            </div>
          </div>
        </section>
        <section className="section theme-paper" data-theme="paper">
          <div className="wrap faq">
            <SectionHead n="03" kicker="Before you ask" title="*Questions*" />
            <Accordion items={FAQ} />
          </div>
        </section>
        <section id="register" className="section theme-paper2 formsec">
          <div className="wrap formsec__grid">
            <aside className="formsec__side">
              <Kicker n="04">Students and builders</Kicker>
              <h2 className="display formsec__title" data-fx="lines">Register <em className="serif">interest</em></h2>
              <p className="lead" data-fx="fade">Leave your details and we will email you when registration opens, with dates, venue and how team selection works.</p>
              <p className="muted">
                Sponsoring instead? <Link className="ul" to="/partner?event=hackers-occupied-delhi">Use the partner form</Link>.
              </p>
            </aside>
            <div className="formsec__form">
              <DelhiForm />
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
