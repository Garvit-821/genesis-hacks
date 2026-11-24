import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Floorplan } from '../../components/ui/Floorplan'
import { InkPhoto } from '../../components/ui/InkPhoto'
import { LiveCount } from '../../components/ui/LiveCount'
import { CALL_SHEET, DELHI, EVENTS, EVENT_CITIES, EVENT_TOTALS, HEADLINE, LINEUP, LINEUP_TOTAL, PROOF_EVENTS, SOCIALS, SPONSOR_OUTCOMES, TEAM, daysToDelhi, photo } from '../../data/site'

/**
 * The second half of the home page is printed matter from the weekend, in the same ink, paper
 * and vermilion as the story above it: a ledger, architectural plates, a night edition of a
 * newspaper, a production call sheet, a festival-poster lineup of partners, an admission ticket and a roll of credits.
 */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
const pad2 = (n: number) => String(n).padStart(2, '0')

const CITY_COUNTS = (() => {
  const n: Record<string, number> = {}
  EVENTS.forEach((e) => {
    if (e.city && e.city !== 'Online') n[e.city] = (n[e.city] || 0) + 1
  })
  return Object.entries(n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})()

const FORMAT_ROWS = (() => {
  const n: Record<string, number> = {}
  EVENTS.forEach((e) => (n[e.category] = (n[e.category] || 0) + 1))
  const named: Array<[string, string]> = [
    ['Hackathon', 'Hackathons'],
    ['Meetup / Talk', 'Meetups and talks'],
    ['Workshop', 'Workshops'],
    ['Ideathon', 'Ideathons'],
  ]
  const rows = named.filter(([k]) => n[k]).map(([k, label]) => [label, n[k]] as [string, number])
  const other = Object.entries(n).filter(([k]) => !named.some(([m]) => m === k)).reduce((s, [, v]) => s + v, 0)
  if (other) rows.push(['Other formats', other])
  return rows
})()

/** A torn paper edge, drawn in the colour of the section it belongs to. */
export function TornEdge({ seed = 1 }: { seed?: number }) {
  const d = useMemo(() => {
    let s = seed * 9301 + 49297
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    let path = 'M0,12'
    for (let x = 0; x <= 100; x += 0.8 + rnd() * 1.6) path += ` L${x.toFixed(2)},${(3 + rnd() * 6 + (rnd() > 0.86 ? -2.5 : 0)).toFixed(2)}`
    return `${path} L100,${(3 + rnd() * 5).toFixed(2)} L100,12 Z`
  }, [seed])
  return (
    <svg className="torn" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function Masthead({ no, name, time }: { no: string; name: string; time: string }) {
  return (
    <header className="pmast">
      <span className="mono">No. {no}</span>
      <span className="mono pmast__name">{name}</span>
      <span className="mono">{time}</span>
    </header>
  )
}

/* ---------------------------------------------------------------- 03 the tally */
export function Tally() {
  const ledger: Array<[string, string]> = [
    ['Participants', HEADLINE.participantsLabel],
    ['Hackathons', HEADLINE.hackathonsLabel],
    ['Cities', String(EVENT_CITIES.length)],
    ['Women among builders', HEADLINE.womenShareLabel],
  ]
  return (
    <section className="tally theme-paper" data-theme="paper" data-chapter="Headcount" data-hour="6" aria-labelledby="tally-title">
      <div className="wrap">
        <Masthead no="03" name="The tally" time="T+06:00 · Sat 15:00" />
        <div className="prule" data-fx="rule" />
        <div className="tally__grid">
          <div className="tally__lead">
            <h2 id="tally-title" className="tally__title display" data-fx="lines">
              We kept <em className="serif">count.</em>
            </h2>
            <LiveCount value={HEADLINE.registrations} label="Registrations across Genesis and partner events" />
          </div>
          <div className="ledger">
            <p className="ledger__head mono">Ledger · to date</p>
            <dl>
              {ledger.map(([k, v]) => (
                <div key={k} className="ledger__row">
                  <dt>{k}</dt>
                  <span className="ledger__dots" aria-hidden="true" />
                  <dd className="display">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="ledger__note serif">Counted, not estimated. Figures as of November 2026.</p>
          </div>
        </div>
        <figure className="tallyfig">
          <canvas className="tallyfig__canvas" role="img" aria-label="Two thousand hand-drawn tally marks, one for every ten builders: more than 20,000 builders. The first 35 percent of the marks, for women, are drawn in red." />
          <figcaption className="tallyfig__cap">
            <span className="mono">Fig. 1</span>
            <span className="serif">Each mark is ten builders.</span>
            <span className="mono">
              <i className="sw sw--spot" /> Women · 35% <i className="sw" /> Men · 65%
            </span>
          </figcaption>
        </figure>
        <div className="where">
          <h3 className="where__head mono">Where the ink went · events by city</h3>
          <ol className="where__list">
            {CITY_COUNTS.map(([c, n]) => (
              <li key={c}>
                <span>{c}</span>
                <span className="where__dots" aria-hidden="true" />
                <span className="mono">{pad2(n)}</span>
              </li>
            ))}
          </ol>
          <Link to="/events" className="plink serif">
            Browse every event in the archive →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- 04 the plates */
function ScaleBar() {
  return (
    <svg className="plate__scale" viewBox="0 0 120 22" aria-hidden="true">
      <path d="M2 14 H118" />
      {[2, 31.5, 61, 90.5, 118].map((x) => (
        <path key={x} d={`M${x} 9 V19`} />
      ))}
      <rect x="2" y="12" width="29.5" height="4" />
      <rect x="61" y="12" width="29.5" height="4" />
      <text x="2" y="7">0</text>
      <text x="108" y="7">10 m</text>
    </svg>
  )
}

function North() {
  return (
    <svg className="plate__north" viewBox="0 0 30 40" aria-hidden="true">
      <path d="M15 4 L22 30 L15 24 L8 30 Z" />
      <path className="fill" d="M15 4 L15 24 L8 30 Z" />
      <text x="15" y="39">N</text>
    </svg>
  )
}

export function Plates() {
  return (
    <section className="plates theme-paper" data-theme="paper" data-chapter="Rooms" data-hour="12" aria-labelledby="plates-title">
      <div className="plates__track">
        <div className="plates__intro">
          <Masthead no="04" name="Rooms" time="T+12:00 · Sat 21:00" />
          <h2 id="plates-title" className="plates__title display" data-fx="lines">
            Rooms nobody <em className="serif">expected.</em>
          </h2>
          <p className="lead">Lecture halls, labs, a Google office. Genesis was Event Partner in each; every room was run by its own organisers.</p>
          <p className="plates__hint mono" aria-hidden="true">
            Plates I–IV, keep scrolling →
          </p>
        </div>
        {PROOF_EVENTS.map((p, i) => (
          <article key={p.name} className="plate">
            <div className="plate__frame">
              <header className="plate__top mono">
                <span>Plate {ROMAN[i]}</span>
                <span>Plan of the room</span>
              </header>
              <div className="plate__plan">
                <Floorplan seed={i + 3} fx={false} />
                <ScaleBar />
                <North />
              </div>
              <div className="plate__cart">
                <h3 className="plate__name display">{p.name}</h3>
                <p className="plate__venue serif">{p.venue}</p>
                <p className="plate__fact mono">{p.fact}</p>
              </div>
              <span className="stamp mono" aria-label={`Genesis role: ${p.role}`}>
                {p.role}
              </span>
            </div>
          </article>
        ))}
        <Link to="/events" className="plate plate--index" data-cursor="Archive">
          <div className="plate__frame">
            <header className="plate__top mono">
              <span>Index</span>
              <span>All plates</span>
            </header>
            <p className="plate__big display">
              {EVENT_TOTALS.events}
              <span className="serif"> rooms so far</span>
            </p>
            <p className="plate__fact mono">
              {EVENT_CITIES.length} cities · {EVENT_TOTALS.hackathons} hackathons · open the archive →
            </p>
          </div>
        </Link>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- 05 the night edition */
export function Edition() {
  const days = daysToDelhi()
  return (
    <section className="edition theme-ink" data-theme="ink" data-chapter="3 a.m." data-hour="18" aria-labelledby="edition-title">
      <TornEdge seed={5} />
      <div className="edition__desk wrap">
        <p className="edition__over mono">No. 05 · T+18:00 · Sun 03:00 · Somebody left this on the desk</p>
        <article className="paper">
          <header className="paper__mast">
            <p className="paper__ear mono">
              Vol. 1 · No. 18
              <br />
              Sun, 03:00
            </p>
            <p className="paper__name">The 3 a.m. Edition</p>
            <p className="paper__ear paper__ear--r mono">
              Printed while
              <br />
              the room built
            </p>
          </header>
          <div className="paper__rule" />
          <h2 id="edition-title" className="paper__headline display">
            Nobody remembers the{' '}
            <span className="strike">
              polite
              <span className="strike__line" aria-hidden="true" />
            </span>{' '}
            hackathons.
          </h2>
          <p className="paper__dek serif">So we occupy cities.</p>
          <div className="paper__cols">
            <figure className="paper__lead">
              <InkPhoto file="dsc09631" className="paper__photo" fx={false} />
              <figcaption className="mono">{photo('dsc09631').caption}. The night shift, as it happened.</figcaption>
            </figure>
            <div className="paper__col">
              <h3 className="paper__kicker display">Not one event. A calendar.</h3>
              <p className="paper__body">
                Hackathons, meetups, workshops and speaker sessions: {EVENT_TOTALS.events} of them across {EVENT_CITIES.length} cities since 2024. Some ran overnight. Most ran on someone else’s campus.
              </p>
              <table className="paper__table">
                <caption className="mono">Events by format</caption>
                <tbody>
                  {FORMAT_ROWS.map(([k, n]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td className="mono">{pad2(n)}</td>
                    </tr>
                  ))}
                  <tr className="paper__total">
                    <th scope="row">All events</th>
                    <td className="mono">{EVENT_TOTALS.events}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <aside className="paper__box">
              <p className="mono">Next stop</p>
              <p className="paper__city display">Delhi</p>
              <p className="paper__count">
                <span className="display" data-count={days}>
                  {days}
                </span>
                <span className="mono">
                  days to go
                  <br />
                  tentative date
                </span>
              </p>
              <ul className="paper__facts mono">
                <li>{DELHI.where}</li>
                <li>{DELHI.teams} teams</li>
                <li>{DELHI.tracks.length} tracks</li>
                <li>{DELHI.projectedRegistrations} registrations (projection)</li>
              </ul>
              <Link to={DELHI.path} className="plink serif">
                Read on: Delhi →
              </Link>
            </aside>
          </div>
          <footer className="paper__foot mono">
            <span>
              So far: {EVENT_TOTALS.events} events · {EVENT_TOTALS.hackathons} hackathons · {EVENT_CITIES.length} cities
            </span>
            <Link to="/events">Continued in the archive →</Link>
          </footer>
        </article>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- 06 the call sheet */
export function CallSheetDoc() {
  return (
    <section className="callsheet theme-paper" data-theme="paper" data-chapter="For sponsors" data-hour="24" aria-labelledby="callsheet-title">
      <TornEdge seed={9} />
      <div className="wrap">
        <Masthead no="06" name="For sponsors" time="T+24:00 · Sun 09:00" />
        <div className="prule" data-fx="rule" />
        <header className="callsheet__head">
          <h2 id="callsheet-title" className="callsheet__title display" data-fx="lines">
            Know the hour you <em className="serif">meet them.</em>
          </h2>
          <p className="lead" data-fx="fade">
            Not a logo on a banner. A call sheet.
          </p>
        </header>
        <div className="doc">
          <div className="doc__top">
            <div>
              <p className="mono">Production</p>
              <p>A Genesis hackathon</p>
            </div>
            <div>
              <p className="mono">Days</p>
              <p>1 and 2 of 2</p>
            </div>
            <div>
              <p className="mono">Crew call</p>
              <p>Sponsors</p>
            </div>
            <p className="doc__title display">Call sheet</p>
          </div>
          <table className="doc__table">
            <thead>
              <tr>
                <th scope="col" className="mono">Time</th>
                <th scope="col" className="mono">Scene</th>
                <th scope="col" className="mono">You get</th>
                <th scope="col" className="mono">Notes</th>
              </tr>
            </thead>
            <tbody>
              {CALL_SHEET.map((c) => (
                <tr key={c.hour} className={`doc__row ${c.hour === 18 ? 'is-marked' : ''}`}>
                  <td className="mono doc__time">
                    <span className="doc__mark">
                      H+{pad2(c.hour)}
                      {c.hour === 18 && (
                        <svg className="doc__ring" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
                          <path d="M10,34 C6,12 70,4 120,6 C178,9 196,22 190,36 C182,54 110,58 60,55 C24,52 4,44 14,24" />
                        </svg>
                      )}
                    </span>
                  </td>
                  <td className="doc__scene display">{c.moment}</td>
                  <td className="mono doc__get">{c.outcome}</td>
                  <td className="doc__note">
                    {c.line}
                    {c.hour === 18 && <span className="doc__margin serif">they really do</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="doc__notes">
            <p className="mono doc__notes-head">Department notes</p>
            {SPONSOR_OUTCOMES.map((o) => (
              <div key={o.key} className="doc__dept">
                <h3 className="display">{o.title}</h3>
                <p>{o.line}</p>
              </div>
            ))}
          </div>
          <span className="stamp stamp--doc mono" aria-hidden="true">
            Sponsor copy
          </span>
        </div>
        <div className="callsheet__end">
          <p className="callsheet__sign display" data-fx="lines">
            One partner. Every hackathon <em className="serif">worth being at.</em>
          </p>
          <div className="actions" data-fx="fade">
            <Button to="/partner">Book a 30-minute call</Button>
            <Button href="mailto:partner@genesishacks.com" variant="ghost">
              partner@genesishacks.com
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- 07 the lineup */
/** The room the partners helped fill, printed from their names (see namesScene.ts). */
const ROOM = { photo: 'dsc00002', crop: [0.03, 0.36, 0.97, 1] as [number, number, number, number] }

/**
 * Every partner, printed into a photograph of a Genesis room. From a distance it is the crowd; up
 * close every line of the engraving is a run of partner names. A loupe follows the pointer and
 * lights up every place a name appears. The full index sits underneath as plain text.
 */
export function Lineup() {
  const room = photo(ROOM.photo)
  const total = Math.floor(LINEUP_TOTAL / 10) * 10
  return (
    <section className="lineup theme-ink" data-theme="ink" data-chapter="The lineup" data-hour="27" aria-labelledby="lineup-title">
      <TornEdge seed={33} />
      <div className="lineup__stage">
        <canvas className="lineup__gl" data-photo={room.src} data-crop={ROOM.crop.join(',')} aria-hidden="true" />
        {/* Without WebGL: the same crowd as an engraved plate. */}
        <img className="lineup__still" src="/story/dsc09998.png" alt="" loading="lazy" />
        <div className="lineup__hud">
          <div className="lineup__mast mono">
            <span>No. 07 · The lineup · T+27:00 · Sun 12:00</span>
            <span>
              Zoom <b className="lineup__zv">100%</b>
            </span>
          </div>
          <div className="lineup__head">
            <h2 id="lineup-title" className="lineup__title display">
              Look <em className="serif">closer.</em>
            </h2>
            <p className="lineup__sub mono">A Genesis room, printed line by line</p>
          </div>
          <p className="lineup__reveal" aria-hidden="true">
            Every line is a name. <em className="serif">The brands, communities, clubs and campuses that filled this room.</em>
          </p>
          <p className="lineup__hint mono" aria-hidden="true">
            <span className="lineup__hint--fine">Move over the room to find a name</span>
            <span className="lineup__hint--touch">Tap the room to find a name</span>
          </p>
          <div className="lineup__loupe" aria-hidden="true">
            <i />
          </div>
          <p className="lineup__tip mono" aria-hidden="true" />
        </div>
      </div>
      <div className="lineup__after wrap">
        <div className="lineup__sum">
          <p className="lineup__big display">
            {total}+ names. <em className="serif">One room.</em>
          </p>
          <p className="lead">
            Brands, chains, communities, clubs and campuses that have put their name on a Genesis weekend. Every one of them is printed in the
            picture above.
          </p>
        </div>
        <div className="lineup__side">
          <ul className="lineup__tiers" aria-label="Partners by category">
            {LINEUP.map((t, i) => (
              <li key={t.id} className={`lineup__chip ${i === 0 ? 'lineup__chip--spot' : ''}`}>
                {t.label} <b>{t.names.length}</b>
              </li>
            ))}
          </ul>
          <div className="actions">
            <Button to="/partner" variant="accent">
              Get your name in the picture
            </Button>
          </div>
        </div>
        <details className="lineup__index">
          <summary className="mono">
            Index of every name <span>{LINEUP_TOTAL}</span>
          </summary>
          <div className="lineup__cols">
            {LINEUP.map((t) => (
              <section key={t.id} className="lineup__col">
                <h3 className="mono">
                  {t.label} <span>{t.names.length}</span>
                </h3>
                <ul>
                  {t.names.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- 08 admit one */
function Guilloche() {
  const paths = useMemo(() => {
    const out: string[] = []
    for (let k = 0; k < 16; k++) {
      let d = ''
      for (let x = 0; x <= 400; x += 2) {
        const y = 60 + Math.sin(x * 0.045 + k * 0.42) * (26 + 10 * Math.sin(x * 0.011 + k)) + Math.sin(x * 0.13 + k * 1.3) * 3
        d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `
      }
      out.push(d)
    }
    return out
  }, [])
  return (
    <svg className="ticket__guilloche" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export function Admit() {
  return (
    <section className="admit theme-spot" data-theme="spot" data-chapter="For builders" data-hour="30" aria-labelledby="admit-title">
      <TornEdge seed={13} />
      <div className="wrap admit__grid">
        <div className="admit__copy">
          <Masthead no="08" name="For builders" time="T+30:00 · Sun 15:00" />
          <h2 id="admit-title" className="admit__title display" data-fx="lines">
            Your genesis is a <em className="serif">weekend away.</em>
          </h2>
          <p className="lead" data-fx="fade">
            Ship something real with people you met that morning.
          </p>
          <p className="admit__follow mono" data-fx="fade">
            Follow along:{' '}
            {SOCIALS.map((s, i) => (
              <Fragment key={s.href}>
                {i > 0 && ' · '}
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Fragment>
            ))}
          </p>
        </div>
        <div className="ticket-wrap">
          <div className="ticket">
            <div className="ticket__main">
              <Guilloche />
              <div className="ticket__vignette">
                <img src="/story/dsc09267.png" alt={photo('dsc09267').alt} loading="lazy" width={1600} height={1066} />
              </div>
              <div className="ticket__body">
                <p className="ticket__series mono">Hackers Occupied · {DELHI.where}</p>
                <p className="ticket__admit display">
                  Admit one <em className="serif">builder</em>
                </p>
                <p className="ticket__when mono">{DELHI.when}</p>
                <ol className="ticket__terms">
                  <li>Mentors who’ve shipped.</li>
                  <li>Judges who hire.</li>
                  <li>A certificate you can share.</li>
                </ol>
                <p className="ticket__fine mono">Not a ticket yet: registration has not opened. Register interest to hear first.</p>
              </div>
            </div>
            <div className="ticket__stub">
              <p className="ticket__no mono">No. HO·27</p>
              <Link to={`${DELHI.path}#register`} className="ticket__cta" data-cursor="Register">
                <span className="display">Register interest</span>
                <span className="mono">Delhi 2027 →</span>
              </Link>
              <p className="ticket__keep mono" aria-hidden="true">
                Keep this stub
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- 09 credits */
export function Credits() {
  const roll: Array<[string, string[]]> = [
    ['Starring', [`${HEADLINE.participantsLabel} builders`]],
    ['With', ['Mentors who’ve shipped', 'Judges who hire']],
    ['On location in', EVENT_CITIES],
    ['Event Partner at', PROOF_EVENTS.map((p) => p.name)],
    ['Run by', TEAM.map((m) => m.name)],
  ]
  return (
    <section id="demo" className="credits theme-ink" data-theme="ink" data-chapter="Demo" data-hour="36" aria-labelledby="credits-title">
      <TornEdge seed={21} />
      <div className="credits__inner wrap">
        <div className="demo__dial" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            {Array.from({ length: 36 }, (_, i) => (
              <line key={i} className="demo__tick" x1="100" y1="6" x2="100" y2={i % 6 === 0 ? 20 : 13} transform={`rotate(${i * 10} 100 100)`} />
            ))}
            <circle className="demo__track" cx="100" cy="100" r="82" />
            <circle className="demo__arc" cx="100" cy="100" r="82" pathLength={1} />
          </svg>
          <span className="demo__time display">
            <span className="demo__hh">36</span>:00
          </span>
        </div>
        <p className="credits__kicker mono">No. 09 · Demo · T+36:00 · Sun 21:00</p>
        <h2 id="credits-title" className="credits__title display" data-fx="lines">
          Time. Hands off <em className="serif">keyboards.</em>
        </h2>
        <div className="endroll">
          <p className="endroll__head mono">The Genesis Experience</p>
          {roll.map(([role, names]) => (
            <div key={role} className="endroll__row">
              <span className="endroll__role mono">{role}</span>
              <span className={`endroll__names ${names.length > 6 ? 'endroll__names--cols' : ''}`}>
                {names.map((n) => (
                  <span key={n} className="serif">
                    {n}
                  </span>
                ))}
              </span>
            </div>
          ))}
          <p className="endroll__end display">
            See you at hour <em className="serif">zero.</em>
          </p>
          <div className="actions endroll__actions">
            <Button to="/partner" variant="accent">
              Partner with Genesis
            </Button>
            <Button to={DELHI.path} variant="ghost">
              See Delhi
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
