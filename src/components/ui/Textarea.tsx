import { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ className = '', error, ...props }: TextareaProps) {
  return (
    <textarea
      className={`textarea ${error ? 'textarea--error' : ''} ${className}`.trim()}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  )
}
