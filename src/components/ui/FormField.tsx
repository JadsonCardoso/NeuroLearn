import { ReactNode } from 'react'
import { FormError } from './FormError'
import { FormHint } from './FormHint'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, required, error, hint, children }: FormFieldProps) {
  const errorId = `${htmlFor}-error`
  const hintId  = `${htmlFor}-hint`

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="form-required" aria-hidden="true"> *</span>}
      </label>

      {children}

      {error && <FormError id={errorId} message={error} />}
      {!error && hint && <FormHint id={hintId} message={hint} />}
    </div>
  )
}
