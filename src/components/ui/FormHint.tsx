interface FormHintProps {
  id?: string
  message: string
}

export function FormHint({ id, message }: FormHintProps) {
  return (
    <p id={id} className="form-hint">
      {message}
    </p>
  )
}
