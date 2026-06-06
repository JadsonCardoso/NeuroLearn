// Componente reutilizável para estados vazios — transmite clareza, não abandono
interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-10) var(--space-6)',
        background: 'var(--card2)',
        border: '1px dashed var(--border2)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '40px', lineHeight: 1 }}>{icon}</div>

      <p
        style={{
          fontSize: 'var(--text-md)',
          fontWeight: '600',
          color: 'var(--text)',
          margin: 0,
        }}
      >
        {title}
      </p>

      {description && (
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text3)',
            maxWidth: '280px',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          className="btn-primary"
          onClick={action.onClick}
          style={{ marginTop: 'var(--space-1)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
