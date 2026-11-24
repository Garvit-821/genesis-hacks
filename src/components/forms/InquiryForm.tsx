import type { FormEvent } from 'react'
import { Field, Honeypot, PrivacyNote, FormAlert, FormDone } from '../ui/Form'
import { Button } from '../ui/Button'
import { useForm, submitForm, EMAIL_RE } from '../../lib/forms'

const COLLAB = ['Co-host a hackathon', 'Run a track or challenge', 'List my event with Genesis', 'Speak, judge or mentor']
const ROLES = ['Company / brand', 'Student or campus community', 'Organiser of a hackathon', 'Other']

/** Shared by /collaborate and /contact. Same keys as the old site's InquiryForm. */
export function InquiryForm({ kind }: { kind: 'collaborate' | 'contact' }) {
  const isCollab = kind === 'collaborate'
  const f = useForm({ name: '', email: '', organization: '', phone: '', role: isCollab ? COLLAB[0] : ROLES[0], website: '', message: '', honey: '' })
  const v = f.values

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!v.name.trim()) errs.name = 'Add your name.'
    if (!EMAIL_RE.test(v.email.trim())) errs.email = 'Add an email we can reply to.'
    if (v.message.trim().length < 10) errs.message = 'Tell us a little more.'
    f.setErrors(errs)
    if (Object.keys(errs).length) return f.setAlert('Please fix the highlighted fields.')
    f.setStatus('submitting')
    f.setAlert('')
    const data = isCollab
      ? { name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), organization: v.organization.trim(), collaborationType: v.role, website: v.website.trim(), message: v.message.trim(), company_website_confirm: v.honey }
      : { name: v.name.trim(), email: v.email.trim(), role: v.role, message: v.message.trim(), company_website_confirm: v.honey }
    const r = await submitForm(kind, data)
    if (r.ok) f.setStatus('success')
    else {
      f.setStatus('error')
      f.setAlert(r.message)
    }
  }

  if (f.status === 'success')
    return (
      <FormDone title={isCollab ? 'Idea received.' : 'Message received.'}>
        We reply within 2 business days. For anything urgent, call +91 70433 88006.
      </FormDone>
    )

  const busy = f.status === 'submitting'
  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-label={isCollab ? 'Collaboration request' : 'Send a message'}>
      <p className="mono faint">
        <span className="req">*</span> required
      </p>
      <div className="form__grid">
        <Field label={isCollab ? 'Full name' : 'Name'} name="name" required value={v.name} onChange={(x) => f.set('name', x)} error={f.errors.name} autoComplete="name" disabled={busy} />
        <Field label="Email" name="email" type="email" required value={v.email} onChange={(x) => f.set('email', x)} error={f.errors.email} autoComplete="email" disabled={busy} />
        {isCollab && (
          <>
            <Field label="Club, company or event" name="organization" value={v.organization} onChange={(x) => f.set('organization', x)} autoComplete="organization" disabled={busy} />
            <Field label="Phone or WhatsApp" name="phone" type="tel" value={v.phone} onChange={(x) => f.set('phone', x)} autoComplete="tel" disabled={busy} />
          </>
        )}
        <Field as="select" className="full" label={isCollab ? 'How would you like to collaborate?' : 'I am reaching out as'} name="role" options={isCollab ? COLLAB : ROLES} value={v.role} onChange={(x) => f.set('role', x)} disabled={busy} />
        {isCollab && <Field className="full" label="Website or social link" name="website" type="url" value={v.website} onChange={(x) => f.set('website', x)} inputMode="url" disabled={busy} />}
        <Field
          className="full"
          as="textarea"
          label={isCollab ? 'Tell us about the idea' : 'Your message'}
          name="message"
          required
          value={v.message}
          onChange={(x) => f.set('message', x)}
          error={f.errors.message}
          help={isCollab ? 'What you want to do together, expected dates and audience size.' : undefined}
          disabled={busy}
        />
      </div>
      <Honeypot value={v.honey} onChange={(x) => f.set('honey', x)} />
      <FormAlert message={f.alert} />
      <div className="form__foot">
        <PrivacyNote />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? 'Sending…' : isCollab ? 'Send request' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
