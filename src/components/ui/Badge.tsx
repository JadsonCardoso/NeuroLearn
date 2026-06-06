import { HTMLAttributes } from 'react'

type BadgeProps = HTMLAttributes<HTMLSpanElement>

export function Badge({ className = '', children, ...props }: BadgeProps) {
  return (
    <span className={`badge ${className}`} {...props}>
      {children}
    </span>
  )
}
