'use client'

import { useAppData } from '@/hooks/useAppData'
import { useMigration } from '@/hooks/useMigration'

// Banner exibido quando existem dados locais (localStorage) para migrar para o Supabase
export function MigrationBanner() {
  const { userId } = useAppData()
  const { hasPendingData, migrating, done, migrate, dismiss } = useMigration(userId)

  if (!hasPendingData && !done) return null

  if (done) {
    return (
      <div
        style={{
          background: 'rgba(16,185,129,.15)',
          border: '1px solid rgba(16,185,129,.3)',
          borderRadius: '8px',
          padding: '10px 16px',
          margin: '12px 16px 0',
          fontSize: '12px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        ✅ Dados locais importados com sucesso para sua conta!
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(124,58,237,.15)',
        border: '1px solid rgba(124,58,237,.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '12px 16px 0',
        fontSize: '12px',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span>
        📦 <strong>Dados locais detectados.</strong> Importar conteúdos, flashcards e habilidades
        para sua conta?
      </span>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--text3)',
            cursor: 'pointer',
          }}
        >
          Ignorar
        </button>
        <button
          onClick={migrate}
          disabled={migrating}
          style={{
            background: 'var(--purple)',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '11px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {migrating ? 'Importando...' : 'Importar'}
        </button>
      </div>
    </div>
  )
}
