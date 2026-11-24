import { useId, type ReactNode, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { HONEYPOT } from '../../lib/forms'

type FieldProps = {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  error?: string
  help?: string
  autoComplete?: string
  as?: 'input' | 'textarea' | 'select'
  options?: string[]
  className?: string
  disabled?: boolean
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'numeric'
  /** Extra attributes for the input itself, such as min, max or step. */
  inputProps?: Record<string, string | number>
}

const ALWAYS_FLOATED = new Set(['date', 'datetime-local', 'time', 'number'])

/** Underlined field with a floating label, an accent bar on focus and inline errors. */
export function Field({ label, name, value, onChange, type = 'text', required, error, help, autoComplete, as = 'input', options = [], className = '', disabled, inputMode, inputProps }: FieldProps) {
  const id = useId()
  const describedBy = [help ? `${id}-help` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name,
    value,
    required,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: 'field__input',
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value),
  }
  return (
    <div className={`field ${as === 'select' || ALWAYS_FLOATED.has(type) ? 'field--select' : ''} ${error ? 'has-error' : ''} ${className}`}>
      {as === 'textarea' ? (
        <textarea {...common} placeholder=" " rows={5} />
      ) : as === 'select' ? (
        <select {...common}>
          {options.map((o, i) => (
            <option key={o} value={i === 0 && o.startsWith('Choose') ? '' : o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input {...common} {...inputProps} type={type} placeholder=" " autoComplete={autoComplete} inputMode={inputMode} />
      )}
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <span className="field__bar" aria-hidden="true" style={{ top: as === 'textarea' ? 'auto' : undefined, bottom: 0 }} />
      {help && (
        <span id={`${id}-help`} className="field__help">
          {help}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export function Choices({ legend, help, name, options, value, onToggle, type = 'checkbox', error }: { legend: string; help?: string; name: string; options: string[]; value: string[] | string; onToggle: (v: string) => void; type?: 'checkbox' | 'radio'; error?: string }) {
  const id = useId()
  return (
    <fieldset className="choices" aria-describedby={error ? `${id}-err` : undefined}>
      <legend>{legend}</legend>
      {help && <p className="choices__help">{help}</p>}
      {options.map((o) => (
        <label key={o} className="chip">
          <input type={type} name={name} value={o} checked={Array.isArray(value) ? value.includes(o) : value === o} onChange={() => onToggle(o)} />
          <span>{o}</span>
        </label>
      ))}
      {error && (
        <span id={`${id}-err`} className="field__error" role="alert" style={{ width: '100%' }}>
          {error}
        </span>
      )}
    </fieldset>
  )
}

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="honey" aria-hidden="true">
      <label>
        Leave this empty
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}

export function Legend({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h4 className="form__legend">
      <span className="mono">{n}</span>
      {children}
    </h4>
  )
}

export function PrivacyNote() {
  return (
    <p className="form__note">
      We use these details only to reply to you. See our <Link to="/privacy">Privacy policy</Link>.
    </p>
  )
}

export function FormAlert({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  )
}

export function FormDone({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="form-done" role="status">
      <p className="mono" style={{ color: 'var(--accent)' }}>
        Sent · {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())} IST
      </p>
      <h3 className="form-done__title display">{title}</h3>
      <div className="lead">{children}</div>
    </div>
  )
}
