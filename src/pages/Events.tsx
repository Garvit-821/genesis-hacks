import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero, Stat } from '../components/layout/PageHero'
import { Kicker, NextUp, SectionHead, Tag } from '../components/ui/Bits'
import { useFx } from '../lib/fx'
import { gsap, Flip, ScrollTrigger, isFinePointer, isReduced } from '../lib/motion'
import { DELHI, EVENTS, EVENT_CATEGORIES, EVENT_CITIES, EVENT_ROLES, EVENT_TOTALS, EVENT_YEARS, LATEST_EVENT, type EventRow } from '../data/site'

type Filters = { role: string; category: string; year: string; city: string }
const EMPTY: Filters = { role: '', category: '', year: '', city: '' }
const past = EVENTS.filter((e) => e.status !== 'upcoming')
const count = (fn: (e: EventRow) => boolean) => EVENTS.filter(fn).length
const groupOf = (e: EventRow) => e.year ?? 'Undated'

function FilterRow({ label, options, value, onPick, counts }: { label: string; options: string[]; value: string; onPick: (v: string) => void; counts: (o: string) => number }) {
  return (
    <div className="filters__row">
      <span className="mono faint">{label}</span>
      <div className="filters__chips">
        {options.map((o) => (
          <button key={o} type="button" className={`fchip ${value === o ? 'is-on' : ''}`} aria-pressed={value === o} onClick={() => onPick(value === o ? '' : o)}>
            {o}
            <sup className="mono">{counts(o)}</sup>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Events() {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const flip = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const [q, setQ] = useState('')
  const [f, setF] = useState<Filters>(EMPTY)
  const [open, setOpen] = useState(false)

  useFx(ref, (root, reduced) => {
    if (reduced || !isFinePointer()) return
    // A detail card trails the pointer over the index and shows what the row cannot fit.
    const list = root.querySelector<HTMLElement>('.archive')!
    const card = root.querySelector<HTMLElement>('.peek')!
    const xTo = gsap.quickTo(card, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const row = (e.target as HTMLElement).closest<HTMLElement>('.arow')
      if (row) {
        card.querySelector('.peek__cat')!.textContent = row.dataset.cat || ''
        card.querySelector('.peek__city')!.textContent = [row.dataset.city, row.dataset.org].filter(Boolean).join(' · ')
        card.querySelector('.peek__att')!.textContent = row.dataset.att || ''
        card.dataset.role = row.dataset.role
      }
      gsap.to(card, { scale: row ? 1 : 0, autoAlpha: row ? 1 : 0, duration: 0.35, overwrite: 'auto' })
    }
    const leave = () => gsap.to(card, { scale: 0, autoAlpha: 0, duration: 0.3, overwrite: 'auto' })
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    return () => {
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
    }
  })

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return past.filter(
      (e) =>
        (!f.role || e.role === f.role) &&
        (!f.category || e.category === f.category) &&
        (!f.year || e.year === f.year) &&
        (!f.city || e.city === f.city) &&
        (!needle || `${e.title} ${e.venue ?? ''} ${e.city ?? ''} ${e.organiser ?? ''}`.toLowerCase().includes(needle)),
    )
  }, [q, f])

  const groups = useMemo(() => {
    const order = [...EVENT_YEARS, 'Undated']
    return order.map((g) => ({ g, rows: shown.filter((e) => groupOf(e) === g) })).filter((x) => x.rows.length)
  }, [shown])

  // FLIP: rows that survive a filter glide to their new place; new ones rise in.
  const change = (fn: () => void) => {
    if (!isReduced() && listRef.current) flip.current = Flip.getState(listRef.current.querySelectorAll('.arow'))
    fn()
  }
  useLayoutEffect(() => {
    if (!flip.current) return
    Flip.from(flip.current, {
      targets: listRef.current!.querySelectorAll('.arow'),
      duration: 0.7,
      ease: 'expo.out',
      stagger: 0.008,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.01 }),
      onComplete: () => ScrollTrigger.refresh(),
    })
    flip.current = null
  }, [shown])

  const active = Object.values(f).filter(Boolean).length + (q ? 1 : 0)

  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'Events\n*archive*'}
          lead="Every event Genesis has run, co-organised, sponsored or partnered on, with the role Genesis played at each. Organised means Genesis ran it; every other label means another team organised it."
          aside={
            <>
              <Stat value={String(EVENT_TOTALS.events)} count={EVENT_TOTALS.events} label="Events listed here" note="and adding more" />
              <Stat value={String(EVENT_CITIES.length)} count={EVENT_CITIES.length} label="Cities" />
              <Stat value={String(EVENT_TOTALS.own)} count={EVENT_TOTALS.own} label="Organised or co-organised" />
              <Stat value={String(EVENT_TOTALS.hackathons)} count={EVENT_TOTALS.hackathons} label="Hackathons" />
            </>
          }
        />
        <section className="section section--tight theme-ink" data-theme="ink">
          <div className="wrap">
            <SectionHead n="01" kicker="Featured" title="Next up and *latest*" intro="The next event Genesis runs, and the latest one in the archive." />
            <div className="feat" data-fx="stagger">
              <Link to={DELHI.path} className="feat__card feat__card--delhi" data-cursor="Delhi">
                <div className="feat__top mono"><span>01 · Hackathon · 2027</span><Tag tone="accent">Upcoming</Tag></div>
                <h3 className="display feat__title">Hackers Occupied <em className="serif">Delhi 2027</em></h3>
                <p>{DELHI.when} · {DELHI.venue}</p>
                <p className="mono">Organiser · See the event →</p>
              </Link>
              {(() => {
                const e = LATEST_EVENT
                const inner = (
                  <>
                    <div className="feat__top mono"><span>02 · {e.category} · {e.year}</span><Tag tone="solid">Latest</Tag></div>
                    <h3 className="display feat__title">{e.title}</h3>
                    <p>{e.date} · {[e.venue, e.city].filter(Boolean).join(' · ')}</p>
                    <p className="mono">{e.role}{e.organiser ? ` · organised by ${e.organiser}` : ''}{e.link ? ' · Event page ↗' : ''}</p>
                  </>
                )
                return e.link ? (
                  <a href={e.link} target="_blank" rel="noopener noreferrer" className="feat__card feat__card--latest" data-cursor="Open">
                    {inner}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <div className="feat__card feat__card--latest">{inner}</div>
                )
              })()}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="wrap">
            <div className="archive__bar">
              <Kicker n="02">All events</Kicker>
              <h2 className="display archive__title" data-fx="lines">The <em className="serif">index</em></h2>
              <div className="archive__tools">
                <label className="search">
                  <span className="sr-only">Search events</span>
                  <input type="search" placeholder="Search by name, venue, city or organiser" value={q} onChange={(e) => change(() => setQ(e.target.value))} />
                </label>
                <button type="button" className="fchip" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                  Filters {active > 0 && <sup className="mono">{active}</sup>}
                </button>
                {active > 0 && (
                  <button type="button" className="mono ul" onClick={() => change(() => (setF(EMPTY), setQ('')))}>
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className={`acc__panel ${open ? 'is-open' : ''}`}>
              <div>
                <div className="filters">
                  <FilterRow label="Genesis role" options={EVENT_ROLES} value={f.role} onPick={(v) => change(() => setF({ ...f, role: v }))} counts={(o) => count((e) => e.role === o)} />
                  <FilterRow label="Format" options={EVENT_CATEGORIES} value={f.category} onPick={(v) => change(() => setF({ ...f, category: v }))} counts={(o) => count((e) => e.category === o)} />
                  <FilterRow label="Year" options={EVENT_YEARS} value={f.year} onPick={(v) => change(() => setF({ ...f, year: v }))} counts={(o) => count((e) => e.year === o)} />
                  <FilterRow label="City" options={EVENT_CITIES} value={f.city} onPick={(v) => change(() => setF({ ...f, city: v }))} counts={(o) => count((e) => e.city === o)} />
                </div>
              </div>
            </div>
            <p className="mono faint archive__count" aria-live="polite">
              Showing {shown.length} of {past.length} events
            </p>
            <div ref={listRef} className="archive">
              {groups.map(({ g, rows }) => (
                <div key={g} className="archive__group">
                  <h3 className="archive__year display">
                    {g} <sup className="mono">{rows.length}</sup>
                  </h3>
                  <ul>
                    {rows.map((e) => {
                      const inner = (
                        <>
                          <span className="arow__date mono">{e.date ?? '—'}</span>
                          <span className="arow__title">{e.title}</span>
                          <span className="arow__venue">{[e.venue, e.city && e.city !== e.venue && !e.venue?.includes(e.city) ? e.city : null].filter(Boolean).join(' · ') || '—'}</span>
                          <Tag tone={e.own ? 'accent' : 'line'}>{e.role}</Tag>
                        </>
                      )
                      const data = { 'data-flip-id': e.id, 'data-cat': e.category, 'data-city': e.city, 'data-role': e.own ? 'Organiser' : e.role, 'data-org': e.organiser ? `By ${e.organiser}` : '', 'data-att': [e.participants, e.prize ? `Prize pool ${e.prize}` : null].filter(Boolean).join(' · ') || 'Headcount not published' }
                      return (
                        <li key={e.id}>
                          {e.path ? (
                            <Link to={e.path} className="arow arow--link" {...data}>{inner}</Link>
                          ) : e.link ? (
                            <a href={e.link} target="_blank" rel="noopener noreferrer" className="arow arow--link" {...data}>
                              {inner}
                              <span className="sr-only"> (event page, opens in a new tab)</span>
                            </a>
                          ) : (
                            <div className="arow" {...data}>{inner}</div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              {!shown.length && <p className="lead">No events match. Clear a filter or try another city.</p>}
              <div className="peek" aria-hidden="true">
                <span className="peek__cat display" />
                <span className="peek__city mono" />
                <span className="peek__att mono" />
              </div>
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
