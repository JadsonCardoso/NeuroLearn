'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention'
import { isDue } from '@/engine/scheduling'
import { sm2 } from '@/engine/sm2'
import { addDays } from '@/engine/scheduling'
import type { CardMastery } from '@/types'

export function ReviewView() {
  const { state, dispatch } = useAppData()
  const router = useRouter()

  const due = state.cards.filter(isDue)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [log, setLog] = useState<{ q: number }[]>([])
  const [done, setDone] = useState(false)

  const card = due[idx]
  const ct = card ? state.contents.find((c) => c.id === card.cid) : null
  const ret = card ? calcRetention(card) : 0

  function rate(q: 1 | 2 | 3 | 4) {
    if (!card) return
    const res = sm2(q, card.ef, card.interval, card.reps)
    const nextReview = addDays(res.interval)
    const mastery: CardMastery =
      res.interval >= 21 ? 'strong' : res.interval >= 6 ? 'review' : 'learning'
    const xpEarned = q >= 4 ? 15 : q >= 3 ? 10 : 5

    dispatch({
      type: 'RATE_CARD',
      payload: {
        cardId: card.id,
        quality: q,
        ef: res.ef,
        interval: res.interval,
        repetitions: res.repetitions,
        nextReview,
        lastReview: new Date().toISOString(),
        mastery,
        xpEarned,
      },
    })
    setLog((l) => [...l, { q }])
    setFlipped(false)
    if (idx + 1 >= due.length) setDone(true)
    else setIdx((i) => i + 1)
  }

  if (due.length === 0)
    return (
      <div
        className="slide-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '14px' }}>🎉</div>
          <h2
            style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '7px' }}
          >
            Nada para revisar hoje!
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '18px' }}>
            Todas as revisões em dia. Volte amanhã.
          </p>
          <button className="btn-primary" onClick={() => router.push('/dashboard')}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )

  if (done) {
    const perf = Math.round((log.filter((r) => r.q >= 4).length / log.length) * 100)
    const xpTotal = log.reduce((a, r) => a + (r.q >= 4 ? 15 : r.q >= 3 ? 10 : 5), 0)
    return (
      <div
        className="slide-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}
      >
        <div
          className="card"
          style={{ padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧠</div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: 'var(--text)',
              marginBottom: '6px',
            }}
          >
            Revisão Concluída!
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              margin: '18px 0',
            }}
          >
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#7c3aed' }}>
                {log.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Cards</div>
            </div>
            <div
              style={{
                background: 'var(--card2)',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>{perf}%</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Desempenho</div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '18px' }}>
            +{xpTotal} XP ganho nesta sessão
          </p>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => router.push('/dashboard')}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
            {idx + 1} / {due.length}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
            {Math.round((idx / due.length) * 100)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: '7px' }}>
          <div
            className="progress-fill"
            style={{
              width: (idx / due.length) * 100 + '%',
              background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
            }}
          />
        </div>
      </div>

      {ct && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>📚 {ct.title}</span>
          <span
            className="badge"
            style={{
              background:
                ret > 60
                  ? 'rgba(16,185,129,.15)'
                  : ret > 30
                    ? 'rgba(245,158,11,.15)'
                    : 'rgba(239,68,68,.15)',
              color: ret > 60 ? '#10b981' : ret > 30 ? '#f59e0b' : '#ef4444',
            }}
          >
            Retenção: {ret}%
          </span>
        </div>
      )}

      <div
        className="flashcard-wrap"
        style={{ marginBottom: '18px', minHeight: '210px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          <div className="fc-front">
            <div
              className="card"
              style={{
                padding: '32px',
                minHeight: '210px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text3)',
                  marginBottom: '14px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                PERGUNTA
              </div>
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  lineHeight: '1.6',
                  maxWidth: '480px',
                }}
              >
                {card?.front}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '18px' }}>
                Clique para revelar →
              </p>
            </div>
          </div>
          <div className="fc-back">
            <div
              className="card"
              style={{
                padding: '32px',
                minHeight: '210px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderColor: 'rgba(124,58,237,.4)',
                background: 'rgba(124,58,237,.05)',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#a78bfa',
                  marginBottom: '14px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                RESPOSTA
              </div>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--text2)',
                  lineHeight: '1.7',
                  maxWidth: '480px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {card?.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="slide-in">
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text3)',
              textAlign: 'center',
              marginBottom: '11px',
            }}
          >
            Como foi sua lembrança?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {(
              [
                { q: 1 as const, l: 'Esqueci', c: '#ef4444', bg: 'rgba(239,68,68,.12)', d: 'Não lembrei' },
                { q: 2 as const, l: 'Difícil', c: '#f59e0b', bg: 'rgba(245,158,11,.12)', d: 'Com muito esforço' },
                { q: 3 as const, l: 'Bom', c: '#06b6d4', bg: 'rgba(6,182,212,.12)', d: 'Lembrei razoável' },
                { q: 4 as const, l: 'Fácil', c: '#10b981', bg: 'rgba(16,185,129,.12)', d: 'Lembrei bem' },
              ] as const
            ).map((o) => (
              <button
                key={o.q}
                onClick={() => rate(o.q)}
                style={{
                  padding: '14px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${o.c}30`,
                  background: o.bg,
                  color: o.c,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  fontFamily: 'Inter',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{o.l}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>{o.d}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
