'use client'

import type { SaveStatus } from '@/hooks/useAutoSave'

interface SaveIndicatorProps {
  status: SaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null

  const style: React.CSSProperties = { fontSize: '11px' }

  if (status === 'saving') {
    return (
      <span data-testid="save-indicator" style={{ ...style, color: 'var(--text3)', opacity: 0.7 }}>
        ● Salvando…
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span data-testid="save-indicator" style={{ ...style, color: '#10b981' }}>
        ✓ Salvo
      </span>
    )
  }

  return (
    <span data-testid="save-indicator" style={{ ...style, color: '#ef4444' }}>
      ⚠ Erro ao salvar
    </span>
  )
}
