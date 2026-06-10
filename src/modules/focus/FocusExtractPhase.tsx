'use client'

import type { FlashCard } from '@/types'

interface QsState {
  imp: string
  gap: string
  apply: string
}

interface CfState {
  front: string
  back: string
}

interface Props {
  qs: QsState
  cf: CfState
  newCards: FlashCard[]
  onQsChange: (qs: QsState) => void
  onCfChange: (cf: CfState) => void
  onAddCard: () => void
  onRemoveCard: (i: number) => void
  onNext: () => void
}

export function FocusExtractPhase({
  qs, cf, newCards,
  onQsChange, onCfChange, onAddCard, onRemoveCard, onNext,
}: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>
          🧠 Reflexão Ativa
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(
            [
              { k: 'imp' as const, q: 'O que foi mais importante nessa sessão?' },
              { k: 'gap' as const, q: 'O que você ainda não entende completamente?' },
              { k: 'apply' as const, q: 'Como aplicaria isso na prática?' },
            ] as const
          ).map(({ k, q }) => (
            <div key={k}>
              <label style={{ fontSize: '11px', color: '#a78bfa', display: 'block', marginBottom: '5px' }}>
                {q}
              </label>
              <textarea
                className="textarea"
                value={qs[k]}
                onChange={(e) => onQsChange({ ...qs, [k]: e.target.value })}
                style={{ minHeight: '65px' }}
                placeholder="Responda com suas palavras..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>
          🃏 Criar Flashcards
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '10px' }}>
          <input
            className="input"
            value={cf.front}
            onChange={(e) => onCfChange({ ...cf, front: e.target.value })}
            placeholder="Pergunta / Conceito"
          />
          <textarea
            className="textarea"
            value={cf.back}
            onChange={(e) => onCfChange({ ...cf, back: e.target.value })}
            placeholder="Resposta / Explicação"
            style={{ minHeight: '70px' }}
          />
          <button className="btn-primary" onClick={onAddCard}>
            + Adicionar Card
          </button>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>
            {newCards.length} card(s) criado(s)
          </div>
          <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {newCards.map((c, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--card2)', borderRadius: '6px', padding: '7px 10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text)' }}>{c.front.slice(0, 38)}…</span>
                <button
                  onClick={() => onRemoveCard(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={onNext}>
          Próximo: Ensinar →
        </button>
      </div>
    </div>
  )
}
