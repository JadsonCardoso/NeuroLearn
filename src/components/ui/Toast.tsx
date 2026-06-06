'use client'

import { useToastContext, type ToastItem, type ToastType } from '@/store/ToastContext'

const CONFIG: Record<ToastType, { icon: string; color: string }> = {
  success: { icon: '✓', color: 'var(--color-success)' },
  error:   { icon: '✕', color: 'var(--color-danger)'  },
  warning: { icon: '!', color: 'var(--color-warning)'  },
  info:    { icon: 'i', color: 'var(--color-info)'     },
}

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const cfg = CONFIG[toast.type]

  return (
    <div
      className={toast.leaving ? 'toast-leave' : 'toast-enter'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        background: 'var(--card)',
        border: '1px solid var(--border2)',
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        paddingBottom: 'calc(var(--space-3) + 4px)',
        boxShadow: '0 4px 20px var(--shadow)',
        width: '320px',
        minHeight: '52px',
        overflow: 'hidden',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Ícone */}
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: 'var(--radius-full)',
          background: cfg.color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: '800',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {cfg.icon}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 2px',
            lineHeight: '1.3',
          }}>
            {toast.title}
          </p>
        )}
        <p style={{
          fontSize: 'var(--text-base)',
          color: toast.title ? 'var(--text3)' : 'var(--text)',
          lineHeight: '1.5',
          margin: 0,
        }}>
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: 'var(--text-md)',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>

      {/* Barra de progresso */}
      <div
        className="toast-progress"
        style={{
          background: cfg.color,
          opacity: 0.5,
          animationDuration: `${toast.duration}ms`,
        }}
      />
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext()

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 'var(--space-2)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  )
}
