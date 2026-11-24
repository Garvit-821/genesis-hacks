import { useMemo, useRef, useState } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, Kicker, NextUp, SectionHead, Tag } from '../components/ui/Bits'
import { useFx } from '../lib/fx'
import { gsap } from '../lib/motion'
import { PUNE_CATEGORIES, PUNE_FACTS, PUNE_SCHEDULE, PUNE_STORY } from '../data/site'

const HAPPENED = [
  ['Two tracks', 'Agentic AI and Web3 and blockchain. Problem statements went out at 15:00 on 22 Aug.'],
  ['3 mentoring rounds', 'At 18:00 (22 Aug), 23:00 (22 Aug) and 08:30 (23 Aug). Two mentors visited every team, about 5 minutes each.'],
  ['3 Logitech activities', 'Overnight at 01:15, 02:45 and 04:15. One person per team took part while the rest kept building.'],
  ['Creator challenges', '10 to 15 challenges released at 15:00 on 22 Aug. Submissions closed at 11:00 on 23 Aug.'],
  ['Salesforce session', 'Optional session with Salesforce engineers on 23 Aug, 13:45 to 15:00. E-certificates for those who attended.'],
  ['Food at the desks', 'Cornitos snacks and Red Bull at 17:00, dinner at 20:00, midnight snacks, then tea and breakfast at 08:00, all served at team tables.'],
]
const TYPES = Object.keys(PUNE_CATEGORIES)

export default function Pune() {
  const ref = useRef<HTMLDivElement>(null)
  const [day, setDay] = useState(0)
  const [type, setType] = useState('')
  const [q, setQ] = useState('')

  useFx(ref, (root, reduced) => {
    if (reduced) return
    // Photo strip: nine frames travel sideways while the page is pinned; a counter keeps score.
    const sec = root.querySelector<HTMLElement>('.strip')!
    const track = sec.querySelector<HTMLElement>('.strip__track')!
    const num = sec.querySelector<HTMLElement>('.strip__num')!
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      sec.classList.add('strip--live')
      const dist = () => track.scrollWidth - window.innerWidth
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true,
          onUpdate: (s) => (num.textContent = String(Math.min(9, 1 + Math.floor(s.progress * 9))).padStart(2, '0')),
        },
      })
      sec.querySelectorAll<HTMLElement>('.strip__fig img').forEach((img) =>
        gsap.fromTo(img, { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }),
      )
      return () => {
        sec.classList.remove('strip--live')
        gsap.set(track, { clearProps: 'transform' })
      }
    })
    // Schedule spine fills as you read down it.
    gsap.fromTo(root.querySelector('.sched__spine i'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.querySelector('.sched__list'), start: 'top 60%', end: 'bottom 60%', scrub: true } })
    return () => mm.revert()
  })

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase()
    return PUNE_SCHEDULE.filter((a) => (!day || a.dayNum === day) && (!type || a.type === type) && (!n || `${a.activity} ${a.notes} ${a.type}`.toLowerCase().includes(n)))
  }, [day, type, q])

  return (
    <Page theme="ink">
      <div ref={ref}>
        <PageHero
          theme="ink"
          eyebrow="Concluded · 22–23.08.26"
          title={'Hackers Occupied\n*Pune*'}
          size="l"
          lead="Hackers Occupied Pune took place on 22–23 August 2026 at Vishwakarma Institute of Technology (VIT), Pune. The next Hackers Occupied is in Delhi."
          actions={
            <>
              <Button to="/certificates/hackers-occupied-pune" variant="accent">Download your certificate</Button>
              <Button to="/gallery" variant="ghost">See all photos</Button>
              <Button href="#schedule" variant="line" arrow="down">Jump to the schedule</Button>
            </>
          }
          aside={
            <>
              <div className="stat"><span className="stat__label mono">When</span><span className="stat__txt">22–23 August 2026</span></div>
              <div className="stat"><span className="stat__label mono">Where</span><span className="stat__txt">VIT Pune</span></div>
              <div className="stat"><span className="stat__label mono">Format</span><span className="stat__txt">On-site hackathon, 19 hours of hacking</span></div>
              <div className="stat"><span className="stat__label mono">Prize pool</span><span className="stat__txt">₹1,50,000+</span></div>
            </>
          }
        />
        <section className="strip theme-ink" data-theme="ink" aria-label="Photos from the event">
          <div className="strip__hud mono wrap" aria-hidden="true">
            <span><b className="strip__num">01</b> / 09</span>
            <span>22 Aug, 17:00 → 23 Aug, 13:45</span>
          </div>
          <div className="strip__track">
            {PUNE_STORY.map((p, i) => (
              <figure key={p.file} className={`strip__fig strip__fig--${i % 3}`}>
                <div className="frame">
                  <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading={i < 2 ? 'eager' : 'lazy'} />
                </div>
                <figcaption className="frame__cap mono">
                  <span>{String(i + 1).padStart(2, '0')} · {p.caption}</span>
                  <span className="faint">{p.meta}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="section theme-paper" data-theme="paper">
          <div className="wrap">
            <SectionHead n="01" kicker="What happened" title="Two days at *VIT Pune*" />
            <div className="happened" data-fx="stagger">
              {HAPPENED.map(([t, line], i) => (
                <article key={t} className="happened__card">
                  <span className="mono faint">0{i + 1}</span>
                  <h3 className="display">{t}</h3>
                  <p className="muted">{line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="schedule" className="section theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="02" kicker="Schedule" title="How the 28 hours *ran*" intro="From arrivals at 11:00 on 22 August to the close at 15:00 on 23 August. All 45 activities, as scheduled." />
            <div className="facts facts--4" data-fx="stagger">
              <div className="fact"><span className="display" data-count={PUNE_FACTS.activityCount}>{PUNE_FACTS.activityCount}</span><span className="mono faint">Scheduled activities</span></div>
              <div className="fact"><span className="display" data-count={PUNE_FACTS.hackingHours}>{PUNE_FACTS.hackingHours}</span><span className="mono faint">Hours of hacking</span></div>
              <div className="fact"><span className="display" data-count={PUNE_FACTS.mentoringRounds}>{PUNE_FACTS.mentoringRounds}</span><span className="mono faint">Mentoring rounds</span></div>
              <div className="fact"><span className="display" data-count={PUNE_FACTS.logitechActivities}>{PUNE_FACTS.logitechActivities}</span><span className="mono faint">Logitech activities</span></div>
            </div>
            <div className="sched__tools">
              <div className="filters__chips" role="group" aria-label="Day">
                {['Both days', 'Day 1 · 22 Aug', 'Day 2 · 23 Aug'].map((l, i) => (
                  <button key={l} type="button" className={`fchip ${day === i ? 'is-on' : ''}`} aria-pressed={day === i} onClick={() => setDay(i)}>{l}</button>
                ))}
              </div>
              <label className="search">
                <span className="sr-only">Search the schedule</span>
                <input type="search" placeholder="Search: mentoring, dinner, Logitech" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="filters__chips sched__types" role="group" aria-label="Activity type">
              <button type="button" className={`fchip ${!type ? 'is-on' : ''}`} aria-pressed={!type} onClick={() => setType('')}>All</button>
              {TYPES.map((t) => (
                <button key={t} type="button" className={`fchip ${type === t ? 'is-on' : ''}`} aria-pressed={type === t} onClick={() => setType(type === t ? '' : t)}>
                  <i className="swatch" style={{ background: PUNE_CATEGORIES[t].color }} />
                  {t}
                </button>
              ))}
            </div>
            <p className="mono faint" aria-live="polite" style={{ margin: '1.5rem 0' }}>Showing {rows.length} of {PUNE_SCHEDULE.length} activities</p>
            <div className="sched__list">
              <span className="sched__spine" aria-hidden="true"><i /></span>
              <ol>
                {rows.map((a) => (
                  <li key={a.id} className={`act ${a.milestone ? 'is-milestone' : ''}`} style={{ '--c': PUNE_CATEGORIES[a.type]?.color } as React.CSSProperties}>
                    <span className="act__time mono">
                      {a.startTime}
                      {a.endTime !== a.startTime && <span className="faint"> → {a.endTime}</span>}
                    </span>
                    <span className="act__dot" aria-hidden="true" />
                    <div className="act__body">
                      <p className="act__meta mono">
                        <span style={{ color: 'var(--c)' }}>{a.type}</span>
                        {a.milestone && <Tag tone="solid">Milestone</Tag>}
                        <span className="faint">{a.date}</span>
                      </p>
                      <h3 className="act__title">{a.activity}</h3>
                      <p className="muted">{a.notes}</p>
                      <p className="mono faint">{a.participantImpact} · {a.duration}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {!rows.length && <p className="lead">Nothing matches. Try another word or clear the filters.</p>}
            </div>
          </div>
        </section>
        <section className="section section--tight theme-amber" data-theme="amber">
          <div className="wrap endcta">
            <Kicker>Certificates</Kicker>
            <h2 className="display" data-fx="lines">Took part? Get your <em className="serif">certificate.</em></h2>
            <p className="lead" data-fx="fade">Use the email and phone number you registered with.</p>
            <div data-fx="fade"><Button to="/certificates/hackers-occupied-pune">Download certificate</Button></div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
