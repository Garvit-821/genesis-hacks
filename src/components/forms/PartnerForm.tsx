import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Field, Choices, Honeypot, Legend, PrivacyNote, FormAlert, FormDone } from '../ui/Form'
import { Button } from '../ui/Button'
import { useForm, submitForm, readAsBase64, EMAIL_RE } from '../../lib/forms'

const TYPES = ['Event sponsorship', 'Campus or college chapter', 'Community partnership', 'Product, credits or perks']
const BUDGETS = ['Choose a range', 'Under ₹1 lakh', '₹1–5 lakh', '₹5–15 lakh', '₹15 lakh+', 'Not decided']
const TIMELINES = ['Choose a timeline', 'This month', '1–3 months', '3–6 months', 'Exploring']
const EVENTS = ['Hackers Occupied Delhi 2027', 'Independent hackathons', 'Not sure yet']
const GOALS = ['Hiring', 'Developer adoption', 'Brand visibility', 'Other']
const MAX = 3 * 1024 * 1024

export function PartnerForm() {
  const [params] = useSearchParams()
  const preset = params.get('event') === 'hackers-occupied-delhi' ? EVENTS[0] : ''
  const f = useForm({ name: '', email: '', organization: '', phone: '', event: preset, goals: [] as string[], type: TYPES[0], budget: '', timeline: '', website: '', proposal: '', honey: '' })
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const v = f.values
  const showFile = v.type === 'Event sponsorship' || v.type === 'Community partnership'

  const pick = (fl: File | null) => {
    setFileError('')
    if (!fl) return setFile(null)
    const ok = /\.(pdf|pptx?)$/i.test(fl.name)
    if (!ok) return setFileError('Attach a PDF, PPT or PPTX file.')
    if (fl.size > MAX) return setFileError('That file is over 3 MB.')
    setFile(fl)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!v.name.trim()) errs.name = 'Add your name.'
    if (!EMAIL_RE.test(v.email.trim())) errs.email = 'Add a work email we can reply to.'
    if (!v.organization.trim()) errs.organization = 'Which company or college is this for?'
    if (v.proposal.trim().length < 10) errs.proposal = 'A line or two about what you have in mind.'
    f.setErrors(errs)
    if (Object.keys(errs).length) {
      f.setAlert('Please fix the highlighted fields.')
      return
    }
    f.setStatus('submitting')
    f.setAlert('')
    const data: Record<string, unknown> = {
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      organization: v.organization.trim(),
      website: v.website.trim(),
      proposal: v.proposal.trim(),
      partnershipType: v.type,
      eventOfInterest: v.event,
      goals: v.goals,
      budgetBand: v.budget,
      timeline: v.timeline,
      company_website_confirm: v.honey,
    }
    if (showFile && file) {
      try {
        data.attachmentName = file.name
        data.attachmentData = await readAsBase64(file)
      } catch {
        f.setStatus('error')
        f.setAlert('We could not read that file. Try again or remove it.')
        return
      }
    }
    const r = await submitForm('partner', data)
    if (r.ok) f.setStatus('success')
    else {
      f.setStatus('error')
      f.setAlert(r.message)
    }
  }

  if (f.status === 'success')
    return (
      <FormDone title="Request in. The clock is running.">
        We reply within 2 business days with a first shortlist or a time for a 30-minute call. If it is urgent, call +91 70433 88006.
      </FormDone>
    )

  const busy = f.status === 'submitting'
  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-label="Sponsorship request">
      <p className="mono faint">
        <span className="req">*</span> required
      </p>
      <div className="form__group">
        <Legend n="01">About you</Legend>
        <div className="form__grid">
          <Field label="Full name" name="name" required value={v.name} onChange={(x) => f.set('name', x)} error={f.errors.name} autoComplete="name" disabled={busy} />
          <Field label="Work email" name="email" type="email" required value={v.email} onChange={(x) => f.set('email', x)} error={f.errors.email} autoComplete="email" disabled={busy} />
          <Field label="Company or college" name="organization" required value={v.organization} onChange={(x) => f.set('organization', x)} error={f.errors.organization} autoComplete="organization" disabled={busy} />
          <Field label="Phone or WhatsApp" name="phone" type="tel" value={v.phone} onChange={(x) => f.set('phone', x)} autoComplete="tel" disabled={busy} />
        </div>
      </div>
      <div className="form__group">
        <Legend n="02">What you are after</Legend>
        <Choices legend="Event of interest" name="event" type="radio" options={EVENTS} value={v.event} onToggle={(x) => f.set('event', x)} />
        <Choices legend="Goals" help="Pick all that apply." name="goals" options={GOALS} value={v.goals} onToggle={(x) => f.toggle('goals', x)} />
        <div className="form__grid">
          <Field as="select" label="Type" name="type" options={TYPES} value={v.type} onChange={(x) => f.set('type', x)} className="full" disabled={busy} />
          <Field as="select" label="Budget band" name="budget" options={BUDGETS} value={v.budget} onChange={(x) => f.set('budget', x)} disabled={busy} />
          <Field as="select" label="Timeline" name="timeline" options={TIMELINES} value={v.timeline} onChange={(x) => f.set('timeline', x)} disabled={busy} />
        </div>
      </div>
      <div className="form__group">
        <Legend n="03">Details</Legend>
        <Field label="Website or social link" name="website" type="url" value={v.website} onChange={(x) => f.set('website', x)} inputMode="url" disabled={busy} />
        <Field as="textarea" label="What do you have in mind?" name="proposal" required value={v.proposal} onChange={(x) => f.set('proposal', x)} error={f.errors.proposal} help="Audience you want to reach, what you would offer (prizes, credits, mentors) and any dates." disabled={busy} />
        {showFile && (
          <div className="file">
            <span className="mono faint">Brochure or deck (optional)</span>
            <label className="file__box">
              <span>{file ? file.name : 'Drop a PDF or PowerPoint, or click to choose'}</span>
              <span className="mono">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Max 3 MB'}</span>
              <input type="file" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(e) => pick(e.target.files?.[0] ?? null)} aria-describedby="deck-help" />
            </label>
            {file && (
              <button type="button" className="mono faint" style={{ alignSelf: 'flex-start' }} onClick={() => setFile(null)}>
                Remove file
              </button>
            )}
            {fileError && <span className="field__error" role="alert">{fileError}</span>}
            <span id="deck-help" className="field__help">
              PDF or PowerPoint, up to 3 MB. Decks are stored privately, seen only by the Genesis team and used only to reply to you. We delete them after 12 months.
            </span>
          </div>
        )}
      </div>
      <Honeypot value={v.honey} onChange={(x) => f.set('honey', x)} />
      <FormAlert message={f.alert} />
      <div className="form__foot">
        <PrivacyNote />
        <Button type="submit" variant="accent" disabled={busy}>
          {busy ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </form>
  )
}
