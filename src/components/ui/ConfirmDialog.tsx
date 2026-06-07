'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Diálogo de confirmação reutilizável — substitui window.confirm()
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Foca no botão confirmar ao abrir e fecha com ESC
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const confirmColor = variant === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'
  const confirmBg = variant === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Painel */}
      <div
        data-testid="confirm-dialog"
        style={{
          position: 'relative',
          background: 'var(--card)',
          border: `1px solid ${confirmColor}33`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${confirmColor}22`,
          animation: 'slideIn 0.2s ease',
        }}
      >
        {/* Ícone */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: `${confirmColor}18`,
              border: `1px solid ${confirmColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {variant === 'danger' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={confirmColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={confirmColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
        </div>

        <h2
          id="confirm-dialog-title"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-desc"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text3)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
          }}
        >
          {description}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            data-testid="confirm-dialog-cancel"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'var(--card2)',
              color: 'var(--text2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 18px',
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmRef}
            data-testid="confirm-dialog-confirm"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: confirmBg,
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 18px',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              minWidth: 100,
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Aguarde...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
