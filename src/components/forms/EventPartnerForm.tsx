import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Field, Choices, Honeypot, FormAlert, FormDone } from '../ui/Form'
import { Button } from '../ui/Button'
import { useForm, submitForm, EMAIL_RE } from '../../lib/forms'
import { gsap, isReduced } from '../../lib/motion'
import { scrollToY } from '../../lib/scroll'

/**
 * Event Partner application: an organiser asks Genesis to partner on their event.
 * Structured like a member-event application (contact, basics, audience, venue, platforms,
 * budget, notes), adapted for student events in India. It posts through the existing
 * /api/submit-form contract as a "collaborate" submission, so no database change is needed.
 */

const EVENT_TYPES = ['Hackathon', 'Ideathon', 'Meetup or talk', 'Workshop or bootcamp', 'Conference', 'Other']
const FORMATS = ['In person', 'Online', 'Hybrid']
const OPEN = ['Yes, open to everyone', 'Mostly, with seats for outside students', 'No, our campus only']
const ELIGIBLE = ['College or university students', 'School students', 'Recent graduates (last 12 months)', 'Bootcamp or self-taught learners', 'Working professionals']
const FOCUS = ['Software', 'Hardware', 'AI', 'Web3', 'FinTech', 'Healthcare', 'Cybersecurity', 'Climate and sustainability', 'Social impact', 'Design', 'Beginner-friendly', 'Diversity']
const FEES = ['Free to attend', 'Paid entry', 'Not decided']
const STATES = [
  'Choose a state', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry', 'Outside India',
]
const REG_PLATFORMS = ['Choose a platform', 'Devfolio', 'Unstop', 'Luma', 'HackCulture', 'Devpost', 'Google Forms', 'Our own website', 'Other', 'Not decided']
const SUB_PLATFORMS = ['Devfolio', 'Unstop', 'HackCulture', 'Devpost', 'DoraHacks', 'HackerEarth', 'Other', 'Not decided']
const SUPPORT = ['Sponsors and funding', 'Judges', 'Mentors', 'Speakers', 'Swag', 'Platform or cloud credits', 'Outreach and promotion', 'Community partners']
const HEARD = ['Choose one', 'Instagram', 'LinkedIn', 'A friend or another organiser', 'A Genesis event', 'Search', 'Other']

const STEPS = [
  { key: 'contact', title: 'Contact', hint: 'Who we talk to' },
  { key: 'basics', title: 'Event basics', hint: 'What, when, how big' },
  { key: 'audience', title: 'Audience and focus', hint: 'Who it is for' },
  { key: 'venue', title: 'Venue and logistics', hint: 'Where, and where to ship' },
  { key: 'platforms', title: 'Platforms and budget', hint: 'Tools and money' },
  { key: 'notes', title: 'Anything else', hint: 'Questions and consent' },
] as const

const INITIAL = {
  firstName: '', lastName: '', email: '', phone: '', role: '', teamEmail: '', organization: '',
  eventName: '', edition: '', website: '', eventType: '', format: '', startDate: '', endDate: '', attendees: '', registrations: '', openOutside: '',
  eligibility: [] as string[], focus: [] as string[], exclusive: false, entryFee: '', description: '',
  venueName: '', address1: '', address2: '', city: '', state: '', pin: '',
  shipSame: true, shipName: '', shipAddress: '', shipCity: '', shipState: '', shipPin: '', shipPhone: '',
  organiserArrival: '', checkIn: '', closing: '',
  registrationPlatform: '', submissionPlatform: '', submissionUrl: '', chatUrl: '', budget: '', secured: '', support: [] as string[],
  questions: '', anythingElse: '', deckLink: '', howHeard: '', consent: false, honey: '',
}
type Values = typeof INITIAL
const DRAFT_KEY = 'gh-event-partner-draft'
const URL_RE = /^https?:\/\/\S+\.\S+/i
const PHONE_RE = /^[+\d][\d\s-]{8,}$/

function validate(step: number, v: Values): Record<string, string> {
  const e: Record<string, string> = {}
  const need = (k: keyof Values, msg: string) => {
    const val = v[k]
    if (Array.isArray(val) ? !val.length : typeof val === 'boolean' ? !val : !String(val).trim()) e[k] = msg
  }
  const url = (k: keyof Values) => String(v[k]).trim() && !URL_RE.test(String(v[k]).trim()) && (e[k] = 'Use a full link, starting with https://')
  if (step === 0) {
    need('firstName', 'Add your first name.')
    need('lastName', 'Add your last name.')
    if (!EMAIL_RE.test(v.email.trim())) e.email = 'Add an email we can reply to.'
    if (!PHONE_RE.test(v.phone.trim())) e.phone = 'Add a phone or WhatsApp number.'
    if (v.teamEmail.trim() && !EMAIL_RE.test(v.teamEmail.trim())) e.teamEmail = 'That email does not look right.'
    need('organization', 'Which college, club or community is running it?')
  }
  if (step === 1) {
    need('eventName', 'What is the event called?')
    url('website')
    need('eventType', 'Pick the type of event.')
    need('format', 'Pick a format.')
    need('startDate', 'Add a start date, even if it is tentative.')
    need('endDate', 'Add an end date.')
    if (v.startDate && v.endDate && v.endDate < v.startDate) e.endDate = 'The end date is before the start date.'
    if (!(Number(v.attendees) > 0)) e.attendees = 'Roughly how many people will attend?'
    need('openOutside', 'Tell us who can attend.')
  }
  if (step === 2) {
    need('eligibility', 'Pick at least one group.')
    need('entryFee', 'Tell us whether it is free.')
    if (v.description.trim().length < 60) e.description = 'Two or three sentences, please (at least 60 characters).'
  }
  if (step === 3) {
    need('city', 'Which city?')
    need('state', 'Which state?')
    if (v.format !== 'Online') need('venueName', 'Name the venue, or write "To be confirmed".')
  }
  if (step === 4) {
    url('submissionUrl')
    url('chatUrl')
    need('submissionPlatform', 'Pick a platform, or "Not decided".')
  }
  if (step === 5) {
    url('deckLink')
    need('consent', 'Please confirm before sending.')
  }
  return e
}

function digest(v: Values) {
  const line = (label: string, val: unknown) => {
    const s = Array.isArray(val) ? val.join(', ') : typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '').trim()
    return s ? `${label}: ${s}` : null
  }
  const venue = [v.venueName, v.address1, v.address2, v.city, v.state, v.pin].filter(Boolean).join(', ')
  const ship = v.shipSame ? 'Same as venue' : [v.shipName, v.shipAddress, v.shipCity, v.shipState, v.shipPin, v.shipPhone].filter(Boolean).join(', ')
  return [
    'EVENT PARTNER APPLICATION',
    '— Contact', line('Lead organiser', `${v.firstName} ${v.lastName}`), line('Email', v.email), line('Phone', v.phone), line('Role', v.role), line('Team email', v.teamEmail), line('Organisation', v.organization),
    '— Event', line('Name', v.eventName), line('Edition', v.edition), line('Website', v.website), line('Type', v.eventType), line('Format', v.format), line('Dates', `${v.startDate} to ${v.endDate}`),
    line('Attendees (estimate)', v.attendees), line('Registrations (expected)', v.registrations), line('Open to outside students', v.openOutside),
    '— Audience', line('Eligible', v.eligibility), line('Focus', v.focus), line('Exclusive to an under-represented group', v.exclusive), line('Entry', v.entryFee), line('Description', v.description),
    '— Venue', line('Venue', venue), line('Shipping', ship), line('Organisers arrive', v.organiserArrival), line('Check-in', v.checkIn), line('Closing', v.closing),
    '— Platforms and budget', line('Registration platform', v.registrationPlatform), line('Submission platform', v.submissionPlatform), line('Submission URL', v.submissionUrl), line('Chat invite', v.chatUrl),
    line('Cost to host (INR)', v.budget), line('Already secured (INR)', v.secured), line('Support wanted', v.support),
    '— Notes', line('Questions for Genesis', v.questions), line('Anything else', v.anythingElse), line('Deck', v.deckLink), line('Heard about us', v.howHeard),
  ].filter(Boolean).join('\n').slice(0, 4900)
}

export function EventPartnerForm() {
  const f = useForm<Values>(INITIAL)
  const v = f.values
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(0)
  const [saved, setSaved] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLFormElement>(null)

  // Draft autosave: a long form should survive a closed tab. This device only.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      ;(Object.keys(INITIAL) as Array<keyof Values>).forEach((k) => k in draft && k !== 'honey' && k !== 'consent' && f.set(k, draft[k]))
      setReached(Math.min(STEPS.length - 1, Number(draft._reached) || 0))
    } catch {
      /* storage blocked or corrupt: start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...v, honey: '', consent: false, _reached: reached }))
        setSaved(true)
      } catch {
        /* ignore */
      }
    }, 600)
    return () => window.clearTimeout(t)
  }, [v, reached])

  const go = (to: number) => {
    setStep(to)
    setReached((r) => Math.max(r, to))
    f.setAlert('')
    if (root.current) scrollToY(root.current, { offset: -100 })
    if (!isReduced() && panel.current) {
      requestAnimationFrame(() => gsap.fromTo(panel.current!.children, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out' }))
    }
  }
  const next = () => {
    const errs = validate(step, v)
    f.setErrors(errs)
    if (Object.keys(errs).length) {
      f.setAlert('A few answers need a look before you continue.')
      return
    }
    go(step + 1)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < STEPS.length - 1) return next()
    for (let s = 0; s < STEPS.length; s++) {
      const errs = validate(s, v)
      if (Object.keys(errs).length) {
        f.setErrors(errs)
        go(s)
        f.setAlert('A few answers need a look before you send.')
        return
      }
    }
    f.setStatus('submitting')
    f.setAlert('')
    const r = await submitForm('collaborate', {
      name: `${v.firstName.trim()} ${v.lastName.trim()}`,
      email: v.email.trim(),
      phone: v.phone.trim(),
      organization: v.organization.trim(),
      message: digest(v),
      collaborationType: 'Event partner application',
      application: 'event_partner',
      role: v.role, teamEmail: v.teamEmail, eventName: v.eventName, edition: v.edition, website: v.website,
      eventType: v.eventType, format: v.format, startDate: v.startDate, endDate: v.endDate,
      attendees: Number(v.attendees) || undefined, registrations: Number(v.registrations) || undefined, openOutside: v.openOutside,
      eligibility: v.eligibility, focus: v.focus, exclusive: v.exclusive, entryFee: v.entryFee, description: v.description,
      city: v.city, state: v.state, venue: [v.venueName, v.address1, v.address2, v.pin].filter(Boolean).join(', '),
      shipping: v.shipSame ? 'Same as venue' : [v.shipName, v.shipAddress, v.shipCity, v.shipState, v.shipPin, v.shipPhone].filter(Boolean).join(', '),
      dayOf: [v.organiserArrival && `Organisers ${v.organiserArrival}`, v.checkIn && `Check-in ${v.checkIn}`, v.closing && `Close ${v.closing}`].filter(Boolean).join(' · '),
      registrationPlatform: v.registrationPlatform, submissionPlatform: v.submissionPlatform, submissionUrl: v.submissionUrl, chatUrl: v.chatUrl,
      budgetInr: Number(v.budget) || undefined, securedInr: Number(v.secured) || undefined, support: v.support,
      questions: v.questions, anythingElse: v.anythingElse, deckLink: v.deckLink, howHeard: v.howHeard,
      company_website_confirm: v.honey,
    })
    if (r.ok) {
      f.setStatus('success')
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        /* ignore */
      }
    } else {
      f.setStatus('error')
      f.setAlert(r.message)
    }
  }

  const clear = () => {
    f.reset()
    f.setErrors({})
    setReached(0)
    go(0)
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
  }

  if (f.status === 'success')
    return (
      <FormDone title="Application in. Your clock starts now.">
        The Genesis team reads every application and replies within 2 business days, usually with a time for a short call. Questions in the meantime: partner@genesishacks.com.
      </FormDone>
    )

  const busy = f.status === 'submitting'
  const err = f.errors as Record<string, string | undefined>
  const fld = (k: keyof Values) => ({ name: k, value: String(v[k] ?? ''), onChange: (x: string) => f.set(k, x as never), error: err[k], disabled: busy })
  const isOnline = v.format === 'Online'

  return (
    <form ref={root} className="form epf" onSubmit={onSubmit} noValidate aria-label="Event partner application">
      <ol className="epf__steps" aria-label="Application steps">
        {STEPS.map((s, i) => (
          <li key={s.key}>
            <button type="button" className={`epf__step ${i === step ? 'is-current' : ''} ${i < reached || (i < step) ? 'is-done' : ''}`} onClick={() => i <= reached && go(i)} disabled={i > reached} aria-current={i === step ? 'step' : undefined}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="epf__step-title">{s.title}</span>
              <span className="epf__step-hint mono">{s.hint}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="epf__progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }} />
      </div>
      <p className="epf__status mono faint" aria-live="polite">
        Step {step + 1} of {STEPS.length} · {STEPS[step].title} · <span className="req">*</span> required{saved ? ' · Draft saved on this device' : ''}
      </p>

      <div ref={panel} className="epf__panel">
        {step === 0 && (
          <>
            <h3 className="epf__h display">Who is leading the event?</h3>
            <div className="form__grid">
              <Field label="First name" required autoComplete="given-name" {...fld('firstName')} />
              <Field label="Last name" required autoComplete="family-name" {...fld('lastName')} />
              <Field label="Email" type="email" required autoComplete="email" {...fld('email')} />
              <Field label="Phone or WhatsApp" type="tel" required autoComplete="tel" help="Include +91 if you can." {...fld('phone')} />
              <Field label="Your role in the team" help="For example: lead organiser, sponsorship lead." {...fld('role')} />
              <Field label="Shared team email" type="email" help="If your whole team shares an inbox, use it here." {...fld('teamEmail')} />
              <Field className="full" label="College, club or community running it" required autoComplete="organization" {...fld('organization')} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="epf__h display">The event, in numbers.</h3>
            <div className="form__grid">
              <Field label="Event name" required {...fld('eventName')} />
              <Field label="Edition" help="For example: 2.0, or leave blank for a first edition." {...fld('edition')} />
              <Field className="full" label="Event website" type="url" inputMode="url" help="A placeholder page is fine." {...fld('website')} />
            </div>
            <Choices legend="What type of event is it? *" name="eventType" type="radio" options={EVENT_TYPES} value={v.eventType} onToggle={(x) => f.set('eventType', x)} error={err.eventType} />
            <Choices legend="Format *" name="format" type="radio" options={FORMATS} value={v.format} onToggle={(x) => f.set('format', x)} error={err.format} />
            <div className="form__grid">
              <Field label="Start date" type="date" required {...fld('startDate')} />
              <Field label="End date" type="date" required inputProps={{ min: v.startDate }} {...fld('endDate')} />
              <Field label="Attendee estimate" type="number" required inputMode="numeric" inputProps={{ min: 1, step: 1 }} help="People expected on the day." {...fld('attendees')} />
              <Field label="Expected registrations" type="number" inputMode="numeric" inputProps={{ min: 0, step: 1 }} help="Leave blank if you do not know yet." {...fld('registrations')} />
            </div>
            <Choices legend="Can students from other colleges attend? *" name="openOutside" type="radio" options={OPEN} value={v.openOutside} onToggle={(x) => f.set('openOutside', x)} error={err.openOutside} />
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="epf__h display">Who is it for?</h3>
            <Choices legend="Who can take part? *" help="Pick all that apply." name="eligibility" options={ELIGIBLE} value={v.eligibility} onToggle={(x) => f.toggle('eligibility', x)} error={err.eligibility} />
            <Choices
              legend="What is the focus?"
              help="Only pick a focus if most projects are expected to use it. If hardware is allowed but not required, do not pick Hardware."
              name="focus"
              options={FOCUS}
              value={v.focus}
              onToggle={(x) => f.toggle('focus', x)}
            />
            <label className="epf__check">
              <input type="checkbox" checked={v.exclusive} onChange={(e) => f.set('exclusive', e.target.checked)} />
              <span className="epf__box" aria-hidden="true" />
              <span>The event is only for the under-represented group it serves, for example a women-only hackathon.</span>
            </label>
            <Choices legend="Is it free to attend? *" name="entryFee" type="radio" options={FEES} value={v.entryFee} onToggle={(x) => f.set('entryFee', x)} error={err.entryFee} />
            <Field
              className="full"
              as="textarea"
              label="Describe the event in two or three sentences"
              required
              help="We may use this when we promote the event. Fictional examples: “GreenByte is Jaipur's first climate hackathon. 200 students, 24 hours, one question: what would you build for a hotter city? 14–15 March.” · “CodeChai brings 30 first-time builders and 10 mentors into one room for an evening of shipping small things. Every second Saturday, Noida.”"
              {...fld('description')}
            />
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="epf__h display">{isOnline ? 'Where is your team based?' : 'Where is it happening?'}</h3>
            <div className="form__grid">
              {!isOnline && (
                <>
                  <Field className="full" label="Venue name" required help="Write “To be confirmed” if it is not booked yet." {...fld('venueName')} />
                  <Field className="full" label="Address line 1" autoComplete="address-line1" {...fld('address1')} />
                  <Field className="full" label="Address line 2" autoComplete="address-line2" {...fld('address2')} />
                </>
              )}
              <Field label="City" required autoComplete="address-level2" {...fld('city')} />
              <Field as="select" label="State or union territory" required options={STATES} {...fld('state')} />
              {!isOnline && <Field label="PIN code" inputMode="numeric" autoComplete="postal-code" {...fld('pin')} />}
            </div>

            <fieldset className="epf__sub">
              <legend className="mono">Shipping, for swag and badges</legend>
              <p className="choices__help">Use an address where someone can receive parcels one or two weeks before the event. Many organisers use their own address so nothing gets lost in campus mail. Leave it as “same as venue” if you are not sure.</p>
              <label className="epf__check">
                <input type="checkbox" checked={v.shipSame} onChange={(e) => f.set('shipSame', e.target.checked)} />
                <span className="epf__box" aria-hidden="true" />
                <span>Ship to the venue address</span>
              </label>
              {!v.shipSame && (
                <div className="form__grid">
                  <Field className="full" label="Receiver name" help="Add the event name too, for example “Asha Rao, GreenByte”." {...fld('shipName')} />
                  <Field className="full" label="Shipping address" {...fld('shipAddress')} />
                  <Field label="City" {...fld('shipCity')} />
                  <Field as="select" label="State or union territory" options={STATES} {...fld('shipState')} />
                  <Field label="PIN code" inputMode="numeric" {...fld('shipPin')} />
                  <Field label="Receiver phone" type="tel" {...fld('shipPhone')} />
                </div>
              )}
            </fieldset>

            <fieldset className="epf__sub">
              <legend className="mono">Day-of timings</legend>
              <p className="choices__help">If you are not sure yet, leave these blank.</p>
              <div className="form__grid epf__grid3">
                <Field label="Organisers arrive" type="datetime-local" {...fld('organiserArrival')} />
                <Field label="Check-in opens" type="datetime-local" {...fld('checkIn')} />
                <Field label="Closing ceremony ends" type="datetime-local" {...fld('closing')} />
              </div>
            </fieldset>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="epf__h display">Tools, money and what you need.</h3>
            <div className="form__grid">
              <Field as="select" className="full" label="Registration platform" options={REG_PLATFORMS} {...fld('registrationPlatform')} />
            </div>
            <Choices legend="Project submission platform *" name="submissionPlatform" type="radio" options={SUB_PLATFORMS} value={v.submissionPlatform} onToggle={(x) => f.set('submissionPlatform', x)} error={err.submissionPlatform} />
            <div className="form__grid">
              <Field label="Submission page link" type="url" inputMode="url" {...fld('submissionUrl')} />
              <Field label="Community chat invite link" type="url" inputMode="url" help="Discord, WhatsApp or Telegram." {...fld('chatUrl')} />
              <Field label="Cost to host the event (₹)" type="number" inputMode="numeric" inputProps={{ min: 0, step: 1000 }} help="Your best estimate in rupees." {...fld('budget')} />
              <Field label="Sponsorship already secured (₹)" type="number" inputMode="numeric" inputProps={{ min: 0, step: 1000 }} {...fld('secured')} />
            </div>
            <Choices
              legend="What would you like help with?"
              help="Picking these does not guarantee them. We match what we can, based on the event and what our partners are looking for."
              name="support"
              options={SUPPORT}
              value={v.support}
              onToggle={(x) => f.toggle('support', x)}
            />
          </>
        )}

        {step === 5 && (
          <>
            <h3 className="epf__h display">Last few things.</h3>
            <div className="form__grid">
              <Field className="full" as="textarea" label="What questions do you have for Genesis?" {...fld('questions')} />
              <Field className="full" as="textarea" label="Anything else we should know about your event?" help="Past editions, numbers you are proud of, what makes it different." {...fld('anythingElse')} />
              <Field label="Link to your brochure or deck" type="url" inputMode="url" help="Google Drive, Canva or Notion link. Make sure anyone with the link can view it." {...fld('deckLink')} />
              <Field as="select" label="How you heard about us" options={HEARD} {...fld('howHeard')} />
            </div>
            <label className={`epf__check ${err.consent ? 'has-error' : ''}`}>
              <input type="checkbox" checked={v.consent} onChange={(e) => f.set('consent', e.target.checked)} aria-describedby={err.consent ? 'consent-err' : undefined} />
              <span className="epf__box" aria-hidden="true" />
              <span>
                The details are accurate and I am allowed to share them. Genesis may contact me about this event. <Link to="/privacy">Privacy policy</Link>
              </span>
            </label>
            {err.consent && (
              <span id="consent-err" className="field__error" role="alert">
                {err.consent}
              </span>
            )}
          </>
        )}
      </div>

      <Honeypot value={v.honey} onChange={(x) => f.set('honey', x)} />
      <FormAlert message={f.alert} />
      <div className="epf__nav">
        <div className="epf__nav-left">
          {step > 0 && (
            <Button variant="ghost" arrow="none" onClick={() => go(step - 1)} disabled={busy}>
              ← Back
            </Button>
          )}
          <button type="button" className="mono faint epf__clear" onClick={clear} disabled={busy}>
            Clear form
          </button>
        </div>
        {step < STEPS.length - 1 ? (
          <Button type="submit" variant="solid" disabled={busy}>
            Continue to {STEPS[step + 1].title.toLowerCase()}
          </Button>
        ) : (
          <Button type="submit" variant="accent" disabled={busy}>
            {busy ? 'Sending…' : 'Send application'}
          </Button>
        )}
      </div>
    </form>
  )
}
