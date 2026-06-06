interface FormErrorProps {
  id: string
  message: string
}

// FIX BUG-02: role="alert" já implica aria-live="assertive" — não sobrescrever com "polite"
export function FormError({ id, message }: FormErrorProps) {
  return (
    <p id={id} className="form-error" role="alert">
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  )
}
