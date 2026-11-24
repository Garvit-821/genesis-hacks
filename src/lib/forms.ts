import { useState } from 'react'

export type FormType = 'contact' | 'partner' | 'collaborate' | 'work_with_us' | 'delhi_interest'

const ENDPOINT = import.meta.env.VITE_FORMS_ENDPOINT || '/api/submit-form'
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const HONEYPOT = 'company_website_confirm'

const MESSAGES: Record<string, string> = {
  network: 'We could not reach our server. Check your connection, or email partner@genesishacks.com.',
  rate_limited: 'Too many tries in a short time. Wait a few minutes, or email partner@genesishacks.com.',
  unavailable: 'The form is not connected yet. Email partner@genesishacks.com and we will reply within 2 business days.',
  attachment_too_large: 'That file is over 3 MB. Attach a smaller one or email it to us.',
  attachment_type: 'Attach a PDF, PPT or PPTX file.',
  default: 'Something went wrong on our side. Try again, or email partner@genesishacks.com.',
}

/**
 * Posts to the same /api/submit-form contract the previous site used (Supabase + Sheets +
 * Resend on Vercel), so the team's inbox and sheet keep working unchanged.
 */
export async function submitForm(formType: FormType, data: Record<string, unknown>) {
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, formType, page: window.location.pathname, submittedAt: new Date().toISOString() }),
    })
  } catch {
    return { ok: false as const, message: MESSAGES.network }
  }
  if (res.ok) return { ok: true as const }
  let code = res.status === 429 ? 'rate_limited' : res.status === 404 || res.status === 405 ? 'unavailable' : 'default'
  try {
    const body = await res.json()
    if (body?.error && MESSAGES[body.error]) code = body.error
  } catch {
    /* non-JSON error page */
  }
  return { ok: false as const, message: MESSAGES[code] }
}

export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] || '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export type Status = 'idle' | 'submitting' | 'success' | 'error'

/** Small form-state helper: values, per-field errors, status and the server message. */
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [alert, setAlert] = useState('')
  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const toggle = <K extends keyof T>(key: K, item: string) => {
    const list = (values[key] as unknown as string[]) || []
    set(key, (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]) as unknown as T[K])
  }
  return { values, set, toggle, errors, setErrors, status, setStatus, alert, setAlert, reset: () => setValues(initial) }
}
