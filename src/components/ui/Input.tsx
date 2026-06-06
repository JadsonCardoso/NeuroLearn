import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className = '', error, ...props }: InputProps) {
  return (
    <input
      className={`input ${error ? 'input--error' : ''} ${className}`.trim()}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  )
}
