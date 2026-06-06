import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: string
}

export function Card({ className = '', style, children, ...props }: CardProps) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {children}
    </div>
  )
}
