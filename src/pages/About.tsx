import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero, Stat } from '../components/layout/PageHero'
import { LiveCount } from '../components/ui/LiveCount'
import { Kicker, NextUp, SectionHead } from '../components/ui/Bits'
import { ProofRows } from '../components/blocks'
import { useFx } from '../lib/fx'
import { BRAND, DELHI, GROUP_PHOTO, HEADLINE, shotDate } from '../data/site'

const DO = [
  { who: 'For companies', title: 'Sponsorships that fit', line: 'We find hackathons that match your audience, city and budget, then set up the sponsorship: tracks, judging, booths or workshops.', to: '/partner', cta: 'Sponsor an event' },
  { who: 'For organisers', title: 'Partners for your event', line: 'Student teams running independent hackathons get sponsors and support through Genesis. You keep running your event.', to: '/collaborate', cta: 'Collaborate with us' },
  { who: 'Our own series', title: 'Hackers Occupied', line: `Our own hackathon series, one city at a time. Next: ${DELHI.where}, ${DELHI.when}.`, to: DELHI.path, cta: 'See Hackers Occupied Delhi 2027' },
]

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref)
  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'About\n*Genesis.*'}
          lead={BRAND.description}
          aside={
            <>
              <Stat value={HEADLINE.participantsLabel} count={HEADLINE.participants} suffix="+" label="Participants" />
              <LiveCount value={HEADLINE.registrations} label="Registrations" size="m" className="stat--live" />
              <Stat value={HEADLINE.hackathonsLabel} count={HEADLINE.hackathons} suffix="+" label="Hackathons" />
            </>
          }
        />
        <section className="wide-photo">
          <div className="frame parallax-box" data-fx="img">
            <img src={GROUP_PHOTO.src} alt={GROUP_PHOTO.alt} width={GROUP_PHOTO.width} height={GROUP_PHOTO.height} data-parallax="0.16" />
          </div>
          <p className="wrap frame__cap mono">
            <span>{GROUP_PHOTO.caption}</span>
            <span>{shotDate(GROUP_PHOTO)}</span>
          </p>
        </section>
        <section className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <Kicker n="01">What we do</Kicker>
            <p className="bigtext display display--light" data-fx="scrub-words">
              Companies want to meet student developers. Student hackathons need sponsors. Genesis sits between the two, <em className="serif">and runs its own hackathons too.</em>
            </p>
            <div className="tri" data-fx="stagger">
              {DO.map((d, i) => (
                <Link key={d.title} to={d.to} className="tri__card" data-cursor="Open">
                  <span className="mono faint">
                    0{i + 1} · {d.who}
                  </span>
                  <h3 className="tri__title display">{d.title}</h3>
                  <p>{d.line}</p>
                  <span className="tri__cta mono">{d.cta} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <SectionHead n="02" kicker="Proof" title="Event Partner *at*" intro="Hackathons where Genesis was Event Partner. Each was run by its own organising team." />
            <ProofRows />
          </div>
        </section>
        <section className="section section--tight theme-paper2">
          <div className="wrap">
            <SectionHead n="03" kicker="Keep going" title="More about *Genesis*" />
            <div className="morelinks" data-fx="stagger">
              {[
                ['/team', 'Meet the team'],
                ['/values', 'How we run events'],
                ['/events', 'Events archive'],
                ['/gallery', 'Gallery'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="morelinks__a display">
                  {label} <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
