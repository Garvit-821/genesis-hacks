import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button } from '../components/ui/Bits'
import { useFx } from '../lib/fx'

const LINKS = [
  ['/events/hackers-occupied-delhi', 'Our next event', 'Hackers Occupied Delhi 2027'],
  ['/partner', 'For companies', 'Sponsor an event'],
  ['/events', 'Everything we have run or partnered on', 'Events archive'],
  ['/contact', 'Email, phone or the form', 'Contact'],
]

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  useFx(ref)
  return (
    <Page theme="ink">
      <div ref={ref}>
        <PageHero theme="ink" eyebrow="404" title={'Page not\n*found.*'} lead={<>Nothing lives at <code className="mono mono--lc">{pathname}</code>. It may have moved, or the link has a typo.</>} actions={<Button to="/" variant="accent">Back to home</Button>} />
        <section className="section section--tight theme-ink" data-theme="ink">
          <div className="wrap rows" data-fx="stagger">
            {LINKS.map(([to, note, label], i) => (
              <Link key={to} to={to} className="row row--3">
                <span className="row__n mono">0{i + 1}</span>
                <span className="row__title">{label}</span>
                <span className="row__meta">{note}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Page>
  )
}
