'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'nl_lgpd_consent'

type ConsentChoice = 'accepted' | 'minimal'

interface ConsentRecord {
  consent: ConsentChoice
  date: string
}

// Banner de consentimento LGPD — aparece apenas na primeira visita
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (!stored) setVisible(true)
    } catch {
      // localStorage indisponível (ex: iframe com restrições)
    }
  }, [])

  function handleConsent(choice: ConsentChoice) {
    const record: ConsentRecord = { consent: choice, date: new Date().toISOString() }
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
    } catch {
      // ignora falha silenciosa
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies e privacidade"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        boxShadow: '0 -4px 24px rgba(0,0,0,.15)',
      }}
    >
      <div style={{ flex: 1, minWidth: '280px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)', fontSize: '13px' }}>Privacidade e Cookies</strong>
          {' '}— Utilizamos armazenamento local (localStorage) para salvar seu progresso de
          aprendizagem, preferências de tema e sessão de autenticação. Nenhum dado é compartilhado
          com terceiros sem seu consentimento explícito, conforme a{' '}
          <strong>LGPD (Lei 13.709/2018)</strong>.{' '}
          <a
            href="/privacy"
            style={{ color: 'var(--purple)', textDecoration: 'underline', fontSize: '12px' }}
          >
            Política de Privacidade
          </a>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => handleConsent('minimal')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border2)',
            background: 'transparent',
            color: 'var(--text3)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Somente necessários
        </button>
        <button
          onClick={() => handleConsent('accepted')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Aceitar tudo
        </button>
      </div>
    </div>
  )
}
