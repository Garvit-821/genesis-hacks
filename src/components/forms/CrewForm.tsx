import { useEffect, type FormEvent } from 'react'
import { Field, Honeypot, PrivacyNote, FormAlert, FormDone } from '../ui/Form'
import { Button } from '../ui/Button'
import { useForm, submitForm, EMAIL_RE } from '../../lib/forms'

const AREAS = ['Event operations', 'Partnerships', 'Design', 'Engineering', 'Community and campus', 'Something else']
const EXPERIENCE = ['Student', '0–2 years working', '3–5 years working', '5+ years working']

export function CrewForm({ area }: { area?: string }) {
  const f = useForm({ name: '', email: '', area: area || AREAS[0], experience: EXPERIENCE[0], phone: '', city: '', portfolio: '', message: '', honey: '' })
  const v = f.values
  useEffect(() => {
    if (area) f.set('area', area)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!v.name.trim()) errs.name = 'Add your name.'
    if (!EMAIL_RE.test(v.email.trim())) errs.email = 'Add an email we can reply to.'
    if (v.message.trim().length < 10) errs.message = 'Tell us what you would like to work on.'
    f.setErrors(errs)
    if (Object.keys(errs).length) return f.setAlert('Please fix the highlighted fields.')
    f.setStatus('submitting')
    f.setAlert('')
    const r = await submitForm('work_with_us', {
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      areaOfWork: v.area,
      experience: v.experience,
      city: v.city.trim(),
      portfolio: v.portfolio.trim(),
      message: v.message.trim(),
      company_website_confirm: v.honey,
    })
    if (r.ok) f.setStatus('success')
    else {
      f.setStatus('error')
      f.setAlert(r.message)
    }
  }

  if (f.status === 'success')
    return (
      <FormDone title="Application in.">
        If there is a fit for an upcoming event, we set up a call and tell you what the work involves and how much time it takes.
      </FormDone>
    )

  const busy = f.status === 'submitting'
  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-label="Apply to the crew">
      <p className="mono faint">
        <span className="req">*</span> required
      </p>
      <div className="form__grid">
        <Field label="Full name" name="name" required value={v.name} onChange={(x) => f.set('name', x)} error={f.errors.name} autoComplete="name" disabled={busy} />
        <Field label="Email" name="email" type="email" required value={v.email} onChange={(x) => f.set('email', x)} error={f.errors.email} autoComplete="email" disabled={busy} />
        <Field as="select" label="Area of work" name="area" options={AREAS} value={v.area} onChange={(x) => f.set('area', x)} disabled={busy} />
        <Field as="select" label="Experience" name="experience" options={EXPERIENCE} value={v.experience} onChange={(x) => f.set('experience', x)} disabled={busy} />
        <Field label="Phone or WhatsApp" name="phone" type="tel" value={v.phone} onChange={(x) => f.set('phone', x)} autoComplete="tel" disabled={busy} />
        <Field label="City" name="city" value={v.city} onChange={(x) => f.set('city', x)} autoComplete="address-level2" disabled={busy} />
        <Field className="full" label="Portfolio, GitHub or LinkedIn" name="portfolio" type="url" value={v.portfolio} onChange={(x) => f.set('portfolio', x)} inputMode="url" disabled={busy} />
        <Field className="full" as="textarea" label="What would you like to work on?" name="message" required value={v.message} onChange={(x) => f.set('message', x)} error={f.errors.message} help="Events you have helped run, things you have built, and how much time you can give." disabled={busy} />
      </div>
      <Honeypot value={v.honey} onChange={(x) => f.set('honey', x)} />
      <FormAlert message={f.alert} />
      <div className="form__foot">
        <PrivacyNote />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? 'Sending…' : 'Send application'}
        </Button>
      </div>
    </form>
  )
}
