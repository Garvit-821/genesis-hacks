import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/layout/PageHero'
import { Button, NextUp } from '../components/ui/Bits'
import { Link } from 'react-router-dom'
import { Field, FormAlert } from '../components/ui/Form'
import { useFx } from '../lib/fx'
import { EMAIL_RE } from '../lib/forms'

const ENDPOINT = import.meta.env.VITE_CERT_ENDPOINT || '/api/certificate'
const TEMPLATE = '/certificates/hackers-occupied-pune.png'
const NAME = { x: 1000, baseline: 860, maxWidth: 1100, fontSize: 88, minFontSize: 48 }

async function draw(name: string): Promise<string> {
  const img = new Image()
  img.src = TEMPLATE
  await img.decode()
  await document.fonts.load(`600 ${NAME.fontSize}px "Bricolage Grotesque Variable"`).catch(() => null)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  let size = NAME.fontSize
  const font = () => (ctx.font = `600 ${size}px "Bricolage Grotesque Variable", sans-serif`)
  font()
  while (ctx.measureText(name).width > NAME.maxWidth && size > NAME.minFontSize) { size -= 2; font() }
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(name, NAME.x, NAME.baseline, NAME.maxWidth)
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))
  return URL.createObjectURL(blob)
}

export default function Certificates() {
  const ref = useRef<HTMLDivElement>(null)
  useFx(ref)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
  const [alert, setAlert] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter the email you registered with.'
    if (phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter the 10-digit phone number you registered with.'
    setErrors(errs)
    setAlert('')
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ event: 'hackers-occupied-pune', email: email.trim(), phone: phone.trim() }) })
      if (res.status === 429) setAlert('Too many tries. Wait a few minutes and try again.')
      else if (res.status === 404 || res.status === 405) setAlert('Certificate checks are not connected on this server yet. Email partner@genesishacks.com and we will send yours.')
      else {
        const body = await res.json().catch(() => null)
        if (body?.ok && body.name) setResult({ url: await draw(body.name), name: body.name })
        else setAlert('We could not verify those details. Check the email and phone you registered with, or email partner@genesishacks.com.')
      }
    } catch {
      setAlert('We could not reach our server. Check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <Page>
      <div ref={ref}>
        <PageHero size="l" title={'Download your\n*certificate*'} lead="Took part in Hackers Occupied Pune on 22–23 August 2026? Verify with the email and phone number you registered with." />
        <section className="section section--tight theme-ink" data-theme="ink">
          <div className="wrap cert">
            <div className="cert__preview frame" data-fx="img">
              <img src={result?.url ?? TEMPLATE} alt={result ? `Certificate for ${result.name}` : 'The Hackers Occupied Pune participation certificate, before a name is added'} />
            </div>
            <div className="cert__form">
              {result ? (
                <div className="form-done" role="status">
                  <p className="mono" style={{ color: 'var(--accent)' }}>Verified</p>
                  <h2 className="form-done__title display">Here it is, {result.name.split(' ')[0]}.</h2>
                  <div className="actions">
                    <Button href={result.url} variant="accent" arrow="down" onClick={(e) => { (e.currentTarget as HTMLAnchorElement).download = `hackers-occupied-pune-${result.name.replace(/\s+/g, '-').toLowerCase()}.png` }}>
                      Download PNG
                    </Button>
                    <Button variant="ghost" arrow="none" onClick={() => setResult(null)}>Check another</Button>
                  </div>
                </div>
              ) : (
                <form className="form" onSubmit={onSubmit} noValidate>
                  <Field label="Registered email" name="email" type="email" required value={email} onChange={setEmail} error={errors.email} autoComplete="email" disabled={busy} />
                  <Field label="Registered phone" name="phone" type="tel" required value={phone} onChange={setPhone} error={errors.phone} autoComplete="tel" inputMode="tel" disabled={busy} />

                  <FormAlert message={alert} />
                  <div className="form__foot">
                    <p className="form__note">We use these two details only to find your registration and put your name on the certificate. They are not saved. See the <Link to="/privacy">Privacy policy</Link>.</p>
                    <Button type="submit" variant="accent" disabled={busy}>{busy ? 'Checking…' : 'Verify and create certificate'}</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
        <NextUp />
      </div>
    </Page>
  )
}
