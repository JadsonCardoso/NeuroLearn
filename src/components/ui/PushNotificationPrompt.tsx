'use client'

import { useEffect, useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

// Chave para controle de "já foi dispensado"
const DISMISSED_KEY = 'nl_push_dismissed'

export function PushNotificationPrompt() {
  const { permission, isSubscribed, loading, subscribe } = usePushNotifications()
  const [visible, setVisible] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Mostra apenas se: suporte disponível, não negado, não subscrito, não dispensado
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (
      permission !== 'unsupported' &&
      permission !== 'denied' &&
      !isSubscribed &&
      !dismissed
    ) {
      // Aguarda 3s para não aparecer no carregamento inicial
      const timer = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [permission, isSubscribed])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function handleSubscribe() {
    const ok = await subscribe()
    if (ok) { setSuccess(true); setTimeout(() => setVisible(false), 2500) }
  }

  // Não renderiza se: não visível, já subscrito, permissão negada/sem suporte
  if (!visible || isSubscribed || permission === 'denied' || permission === 'unsupported') {
    return null
  }

  return (
    <div
      role="dialog"
      aria-label="Ativar notificações de revisão"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'min(400px, calc(100vw - 32px))',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: '0 8px 32px rgba(0,0,0,.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        animation: 'slideUp .3s ease',
      }}
    >
      {success ? (
        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-success)', margin: 0 }}>
          ✅ Notificações ativadas! Você será lembrado de revisar.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '24px', lineHeight: 1 }}>🔔</span>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
                Lembrete diário de revisão
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Posso te notificar quando tiver cards vencidos para revisar. 5 minutos por dia garantem sua retenção.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn-primary"
              onClick={handleSubscribe}
              disabled={loading}
              style={{ flex: 1, fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-3)' }}
            >
              {loading ? 'Ativando...' : '✅ Ativar notificações'}
            </button>
            <button
              onClick={dismiss}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                cursor: 'pointer',
              }}
            >
              Agora não
            </button>
          </div>
        </>
      )}
    </div>
  )
}
