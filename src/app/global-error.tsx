'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Captura erros de renderização React no App Router e reporta ao Sentry
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR" data-theme="dark">
      <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f14', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e8f0', marginBottom: '8px' }}>
            Algo deu errado
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
            O erro foi registrado automaticamente. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
