'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention/retentionModel'
import { calcCognitiveScore } from '@/engine/cognitive-score/cognitiveScore'
import { isDue, addDays } from '@/engine/spaced-repetition/scheduling'
import { sm2 } from '@/engine/spaced-repetition/sm2'
import type { CardMastery, FlashCard } from '@/types'
import { MemoryView } from '@/modules/memory/MemoryView'
import { trackEvent } from '@/services/missionsService'

function computeCogScore(cards: FlashCard[]) {
  if (cards.length === 0) return { score: 0 }
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const avgRet = Math.round(cards.reduce((a, c) => a + calcRetention(c), 0) / cards.length)
  const avgMastery = Math.round(
    cards.reduce(
      (a, c) => a + (c.mastery === 'strong' ? 100 : c.mastery === 'review' ? 50 : 25),
      0
    ) / cards.length
  )
  const reviewsLast30Days = cards.filter(
    (c) => c.lastReview && new Date(c.lastReview) >= thirtyDaysAgo
  ).length
  const expectedReviews = Math.max(cards.length, reviewsLast30Days, 1)
  return calcCognitiveScore({
    retention: avgRet,
    mastery: avgMastery,
    reviewsLast30Days,
    expectedReviews,
    activeLearning: 0,
  })
}

export function ReviewView() {
  const { state, dispatch, userId } = useAppData()
  const router = useRouter()

  // Fila estável: calculada uma vez ao montar — evita que cards "somam" da fila após RATE_CARD
  const [queue] = useState<FlashCard[]>(() => state.cards.filter(isDue))
  // Cognitive score capturado antes da sessão para exibir o delta na tela de resultado
  const [scoreBefore] = useState(() => computeCogScore(state.cards))
  // Rastreia XP já ganho por card nesta sessão — evita double-XP ao re-avaliar após undo
  const ratedCards = useRef<Map<string, number>>(new Map())

  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [log, setLog] = useState<{ q: number }[]>([])
  const [done, setDone] = useState(false)
  // Histórico de índices para permitir voltar ao card anterior
  const [history, setHistory] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'review' | 'knowledge'>('review')

  const card = queue[idx]
  const ct = card ? state.contents.find((c) => c.id === card.cid) : null
  const ret = card ? calcRetention(card) : 0

  const rate = useCallback(
    (q: 1 | 2 | 3 | 4) => {
      const current = queue[idx]
      if (!current) return
      const res = sm2(q, current.ef, current.interval, current.reps)
      const nextReview = addDays(res.interval)
      const mastery: CardMastery =
        res.interval >= 21 ? 'strong' : res.interval >= 6 ? 'review' : 'learning'
      const xpEarned = q >= 4 ? 15 : q >= 3 ? 10 : 5

      // Se card já foi avaliado nesta sessão (undo + re-avaliação), passa o delta líquido
      // como xpEarned para que reducer e Supabase sejam atualizados na mesma operação,
      // evitando XP corrompido caso a rede falhe entre dois dispatches separados.
      // O Map é limpo ao desmontar o componente (unmount entre sessões), então não há leak.
      const prevXp = ratedCards.current.get(current.id)
      const xpDelta = prevXp !== undefined ? xpEarned - prevXp : xpEarned
      ratedCards.current.set(current.id, xpEarned)

      dispatch({
        type: 'RATE_CARD',
        payload: {
          cardId: current.id,
          quality: q,
          ef: res.ef,
          interval: res.interval,
          repetitions: res.repetitions,
          nextReview,
          lastReview: new Date().toISOString(),
          mastery,
          xpEarned: xpDelta,
        },
      })
      if (userId) {
        trackEvent(userId, 'card_reviewed', { cardCount: 1 }).catch(() => {})
      }
      setHistory((h) => [...h, idx])
      setLog((l) => [...l, { q }])
      setFlipped(false)
      if (idx + 1 >= queue.length) {
        setDone(true)
        dispatch({ type: 'UPDATE_STREAK' })
      } else {
        setIdx((i) => i + 1)
      }
    },
    [queue, idx, dispatch, userId]
  )

  const goBack = useCallback(() => {
    if (history.length === 0) return
    const prevIdx = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setIdx(prevIdx)
    setFlipped(false)
    setDone(false)
    setLog((l) => l.slice(0, -1))
  }, [history])

  // Atalhos de teclado: Space = virar, 1-4 = avaliar (só quando virado), Backspace = voltar
  // Guard activeTab: atalhos só funcionam no tab de Revisão — evita goBack/setFlipped silenciosos
  // quando o usuário interage com o MemoryView no tab "Meu Material"
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeTab !== 'review') return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (done) return

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        goBack()
      } else if (flipped) {
        if (e.key === '1') {
          e.preventDefault()
          rate(1)
        } else if (e.key === '2') {
          e.preventDefault()
          rate(2)
        } else if (e.key === '3') {
          e.preventDefault()
          rate(3)
        } else if (e.key === '4') {
          e.preventDefault()
          rate(4)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [done, flipped, rate, goBack, activeTab])

  const tabHeader = (
    <div style={{ padding: '8px 24px 0', maxWidth: '680px', margin: '0 auto' }}>
      <div
        style={{
          display: 'inline-flex',
          gap: '3px',
          background: 'var(--card2)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--border)',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => setActiveTab('review')}
          style={{
            background: activeTab === 'review' ? 'var(--card)' : 'transparent',
            border: activeTab === 'review' ? '1px solid var(--border2)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: activeTab === 'review' ? 600 : 400,
            color: activeTab === 'review' ? 'var(--text)' : 'var(--text3)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          📚 Revisão
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            background: activeTab === 'knowledge' ? 'var(--card)' : 'transparent',
            border:
              activeTab === 'knowledge' ? '1px solid var(--border2)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: activeTab === 'knowledge' ? 600 : 400,
            color: activeTab === 'knowledge' ? 'var(--text)' : 'var(--text3)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          📔 Meu Material
        </button>
      </div>
    </div>
  )

  // Variáveis do estado "done" — calculadas aqui para uso no return único abaixo
  const perf =
    done && log.length > 0 ? Math.round((log.filter((r) => r.q >= 4).length / log.length) * 100) : 0
  const xpTotal = done ? log.reduce((a, r) => a + (r.q >= 4 ? 15 : r.q >= 3 ? 10 : 5), 0) : 0
  const scoreAfter = done ? computeCogScore(state.cards) : { score: 0 }
  const delta = done ? scoreAfter.score - scoreBefore.score : 0
  const deltaColor = delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#6b7280'
  const deltaSign = delta > 0 ? '+' : ''

  return (
    <>
      {tabHeader}

      {/* MemoryView — sempre montado para preservar busca e accordions ao trocar de tab */}
      <div style={{ display: activeTab === 'knowledge' ? 'block' : 'none' }}>
        <MemoryView />
      </div>

      {/* ── Estado vazio ── */}
      {activeTab === 'review' && queue.length === 0 && (
        <div
          className="slide-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '14px' }}>🎉</div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--text)',
                marginBottom: '7px',
              }}
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
      )}

      {/* ── Estado "done" ── */}
      {activeTab === 'review' && queue.length > 0 && done && (
        <div
          className="slide-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <div
            className="card"
            style={{ padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}
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

            {/* Cognitive Score — destaque principal */}
            <div
              data-testid="result-cognitive-score"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,.12), rgba(6,182,212,.08))',
                border: '1px solid rgba(124,58,237,.25)',
                borderRadius: '12px',
                padding: '16px',
                margin: '16px 0 12px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#a78bfa',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Cognitive Score
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span
                  data-testid="result-score-value"
                  style={{ fontSize: '36px', fontWeight: '900', color: '#7c3aed' }}
                >
                  {scoreAfter.score}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text3)' }}>/100</span>
                {delta !== 0 && (
                  <span
                    data-testid="result-score-delta"
                    style={{ fontSize: '14px', fontWeight: '700', color: deltaColor }}
                  >
                    ({deltaSign}
                    {delta})
                  </span>
                )}
              </div>
              {delta !== 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  era {scoreBefore.score}/100 antes da sessão
                </div>
              )}
            </div>

            {/* Stats: cards + desempenho */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  background: 'var(--card2)',
                  borderRadius: '8px',
                  padding: '12px',
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
                  padding: '12px',
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
      )}

      {/* ── Revisão ativa ── */}
      {activeTab === 'review' && queue.length > 0 && !done && (
        <div className="slide-in" style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {idx + 1} / {queue.length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {Math.round((idx / queue.length) * 100)}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: '7px' }}>
              <div
                className="progress-fill"
                style={{
                  width: (idx / queue.length) * 100 + '%',
                  background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
                }}
              />
            </div>
          </div>

          {/* Barra de navegação: voltar ao card anterior */}
          {history.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <button
                onClick={goBack}
                data-testid="btn-go-back"
                style={{
                  background: 'none',
                  border: '1px solid var(--border2)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  color: 'var(--text3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {ct && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}
            >
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
                    Clique ou pressione{' '}
                    <kbd
                      style={{
                        background: 'var(--border)',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontSize: '10px',
                      }}
                    >
                      Space
                    </kbd>{' '}
                    para revelar
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
                Como foi sua lembrança?{' '}
                <span style={{ opacity: 0.5 }}>
                  (teclas{' '}
                  <kbd
                    style={{
                      background: 'var(--border)',
                      borderRadius: '3px',
                      padding: '1px 4px',
                      fontSize: '10px',
                    }}
                  >
                    1
                  </kbd>
                  –
                  <kbd
                    style={{
                      background: 'var(--border)',
                      borderRadius: '3px',
                      padding: '1px 4px',
                      fontSize: '10px',
                    }}
                  >
                    4
                  </kbd>
                  )
                </span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                {(
                  [
                    {
                      q: 1 as const,
                      l: 'Esqueci',
                      c: '#ef4444',
                      bg: 'rgba(239,68,68,.12)',
                      d: 'Não lembrei',
                      k: '1',
                    },
                    {
                      q: 2 as const,
                      l: 'Difícil',
                      c: '#f59e0b',
                      bg: 'rgba(245,158,11,.12)',
                      d: 'Com muito esforço',
                      k: '2',
                    },
                    {
                      q: 3 as const,
                      l: 'Bom',
                      c: '#06b6d4',
                      bg: 'rgba(6,182,212,.12)',
                      d: 'Lembrei razoável',
                      k: '3',
                    },
                    {
                      q: 4 as const,
                      l: 'Fácil',
                      c: '#10b981',
                      bg: 'rgba(16,185,129,.12)',
                      d: 'Lembrei bem',
                      k: '4',
                    },
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
                    <span style={{ fontSize: '10px', color: o.c, opacity: 0.6, fontWeight: '600' }}>
                      {o.k}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{o.l}</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>{o.d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
