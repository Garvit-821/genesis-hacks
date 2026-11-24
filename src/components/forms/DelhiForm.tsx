import type { FormEvent } from 'react'
import { Field, Choices, Honeypot, PrivacyNote, FormAlert, FormDone } from '../ui/Form'
import { Button } from '../ui/Button'
import { useForm, submitForm, EMAIL_RE } from '../../lib/forms'
import { DELHI } from '../../data/site'

const TEAM = ['Yes, full team', 'Partly', 'Looking for one']

export function DelhiForm() {
  const f = useForm({ name: '', email: '', organization: '', phone: '', city: '', tracks: [] as string[], team: '', honey: '' })
  const v = f.values

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!v.name.trim()) errs.name = 'Add your name.'
    if (!EMAIL_RE.test(v.email.trim())) errs.email = 'Add an email we can write to when registration opens.'
    if (!v.organization.trim()) errs.organization = 'Add your college or organisation.'
    f.setErrors(errs)
    if (Object.keys(errs).length) return f.setAlert('Please fix the highlighted fields.')
    f.setStatus('submitting')
    f.setAlert('')
    const r = await submitForm('delhi_interest', {
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      organization: v.organization.trim(),
      city: v.city.trim(),
      tracks: v.tracks,
      team: v.team,
      message: `College or organisation: ${v.organization}\nCity: ${v.city}\nTracks: ${v.tracks.join(', ')}\nTeam: ${v.team}`,
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
      <FormDone title="You're on the list.">
        We email you when registration opens, with dates, venue and how team selection works. Registering interest does not guarantee a place.
      </FormDone>
    )

  const busy = f.status === 'submitting'
  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-label="Register interest">
      <p className="alert alert--ok">
        Registration is not open yet. Leave your details and we will email you when it opens. The event is planned for {DELHI.when}, {DELHI.where}.
      </p>
      <div className="form__grid">
        <Field label="Full name" name="name" required value={v.name} onChange={(x) => f.set('name', x)} error={f.errors.name} autoComplete="name" disabled={busy} />
        <Field label="Email" name="email" type="email" required value={v.email} onChange={(x) => f.set('email', x)} error={f.errors.email} autoComplete="email" disabled={busy} />
        <Field label="College or organisation" name="organization" required value={v.organization} onChange={(x) => f.set('organization', x)} error={f.errors.organization} autoComplete="organization" disabled={busy} />
        <Field label="Phone or WhatsApp" name="phone" type="tel" value={v.phone} onChange={(x) => f.set('phone', x)} autoComplete="tel" disabled={busy} />
        <Field className="full" label="City" name="city" value={v.city} onChange={(x) => f.set('city', x)} autoComplete="address-level2" disabled={busy} />
      </div>
      <Choices legend="Tracks you are interested in" help="Pick any. You can change your mind later." name="tracks" options={DELHI.tracks} value={v.tracks} onToggle={(x) => f.toggle('tracks', x)} />
      <Choices legend="Do you have a team? Teams are 3 to 5 people." name="team" type="radio" options={TEAM} value={v.team} onToggle={(x) => f.set('team', x)} />
      <Honeypot value={v.honey} onChange={(x) => f.set('honey', x)} />
      <FormAlert message={f.alert} />
      <div className="form__foot">
        <PrivacyNote />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? 'Sending…' : 'Keep me posted'}
        </Button>
      </div>
    </form>
  )
}
