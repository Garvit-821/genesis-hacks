import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, ContactLines, Kicker } from '../components/ui/Bits'
import { InquiryForm } from '../components/forms/InquiryForm'
import { useFx } from '../lib/fx'
import { DELHI, SOCIALS } from '../data/site'

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref)
  return (
    <Page>
      <div ref={ref}>
        <PageHero
          title={'Contact\n*Genesis.*'}
          lead="Sponsors and partners: email partner@genesishacks.com or call +91 70433 88006. Students and campus communities: use the form below. We reply within 2 business days."
          actions={
            <>
              <Button to="/partner">Sponsor an event</Button>
              <Button to={DELHI.path} variant="ghost">Hackers Occupied Delhi 2027</Button>
            </>
          }
        />
        <section className="section theme-ink formsec" data-theme="ink">
          <div className="wrap formsec__grid">
            <aside className="formsec__side">
              <Kicker n="01">Contact</Kicker>
              <h2 className="display formsec__title" data-fx="lines">
                Talk to <em className="serif">Genesis.</em>
              </h2>
              <div data-fx="fade">
                <h3 className="mono faint">Sponsors and partners</h3>
                <p className="muted" style={{ margin: '0.5rem 0 1rem' }}>Email or call us directly. If you are looking at Hackers Occupied Delhi 2027, say so and we will send the details.</p>
                <ContactLines />
              </div>
              <div data-fx="fade">
                <h3 className="mono faint">Students and campus communities</h3>
                <p className="muted" style={{ marginTop: '0.5rem' }}>Use the form. We reply within 2 business days.</p>
              </div>
              <div data-fx="fade">
                <h3 className="mono faint">Follow</h3>
                <div className="actions" style={{ marginTop: '0.75rem' }}>
                  {SOCIALS.map((s) => (
                    <Button key={s.href} href={s.href} variant="ghost" arrow="out" external>{s.label}</Button>
                  ))}
                </div>
              </div>
              <p className="muted">
                Planning a sponsorship? <Link className="ul" to="/partner">Use the partner form</Link> to share budget and timeline.
              </p>
            </aside>
            <div className="formsec__form">
              <InquiryForm kind="contact" />
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
