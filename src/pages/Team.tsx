import { useRef } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, Kicker, NextUp } from '../components/ui/Bits'
import { useFx } from '../lib/fx'
import { gsap, isFinePointer } from '../lib/motion'
import { TEAM } from '../data/site'

export default function Team() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref, (root, reduced) => {
    if (reduced || !isFinePointer()) return
    // A monogram badge follows the pointer down the list and takes each member's colour.
    const list = root.querySelector<HTMLElement>('.people')!
    const badge = root.querySelector<HTMLElement>('.people__badge')!
    const xTo = gsap.quickTo(badge, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(badge, 'y', { duration: 0.6, ease: 'power3.out' })
    const rTo = gsap.quickTo(badge, 'rotate', { duration: 0.8, ease: 'power3.out' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      const r = list.getBoundingClientRect()
      xTo(e.clientX - r.left)
      yTo(e.clientY - r.top)
      rTo(gsap.utils.clamp(-18, 18, (e.clientX - lastX) * 1.2))
      lastX = e.clientX
      const row = (e.target as HTMLElement).closest<HTMLElement>('.person')
      if (row) {
        badge.textContent = row.dataset.initials || ''
        badge.style.background = row.dataset.color || ''
      }
      gsap.to(badge, { scale: row ? 1 : 0, duration: 0.4, overwrite: 'auto' })
    }
    const leave = () => gsap.to(badge, { scale: 0, duration: 0.3, overwrite: 'auto' })
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    return () => {
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
    }
  })
  return (
    <Page>
      <div ref={ref}>
        <PageHero size="l" title={'The people who\nrun *Genesis.*'} lead="Genesis is run by a small core team. These are the people you will talk to about sponsorships, events and partnerships." />
        <section className="section section--tight">
          <div className="wrap">
            <Kicker n="04 people">Core team · Who you will work with</Kicker>
            <div className="people">
              <ul>
              {TEAM.map((m) => (
                <li key={m.id} id={`member-${m.id}`} className="person" data-initials={m.initials} data-color={m.color}>
                  <span className="mono person__n">{m.id}</span>
                  <h2 className="person__name display" data-fx="chars">{m.name}</h2>
                  <span className="person__chip" style={{ background: m.color }} aria-hidden="true">{m.initials}</span>
                </li>
              ))}
              </ul>
              <span className="people__badge display" aria-hidden="true" />
            </div>
          </div>
        </section>
        <section className="section theme-ink" data-theme="ink">
          <div className="wrap endcta">
            <Kicker>Join the crew</Kicker>
            <h2 className="display" data-fx="lines">
              Want to help <em className="serif">run events?</em>
            </h2>
            <p className="lead" data-fx="fade">We need people for event operations, partnerships, design, engineering and campus work. See what is open and tell us what you want to do.</p>
            <div className="actions" data-fx="fade">
              <Button to="/careers" variant="accent">See open roles</Button>
              <Button href="mailto:partner@genesishacks.com" variant="ghost">Email the team</Button>
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
