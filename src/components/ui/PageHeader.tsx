// Header de página — padrão de consistência entre todos os módulos
import { ReactNode } from 'react'

interface PageHeaderProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {icon && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '800',
              color: 'var(--text)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                margin: '2px 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
