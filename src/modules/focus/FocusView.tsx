'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Content, FlashCard, StudySession } from '@/types'
import { useAppData } from '@/hooks/useAppData'
import { uid } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useFocusSession } from '@/store/FocusSessionContext'
import { useAnalytics } from '@/hooks/useAnalytics'

interface FocusViewProps {
  content: Content
}

export function FocusView({ content }: FocusViewProps) {
  const { dispatch } = useAppData()
  const router = useRouter()
  const { setIsRunning } = useFocusSession()
  const { track } = useAnalytics()

  // Impede rastrear session_started mais de uma vez por sessão
  const sessionStartedRef = useRef(false)

  const [phase, setPhase] = useState<'study' | 'extract' | 'teach'>('study')
  const [secs, setSecs] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [notes, setNotes] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [hiInput, setHiInput] = useState('')
  const [teach, setTeach] = useState('')
  const [qs, setQs] = useState({ imp: '', gap: '', apply: '' })
  const [newCards, setNewCards] = useState<FlashCard[]>([])
  const [cf, setCf] = useState({ front: '', back: '' })
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  // Mantém a fase atual acessível dentro do callback do Worker (evita stale closure)
  const phaseRef = useRef(phase)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Sincroniza o estado de running com o contexto global para que a BottomNav possa interceptar navegação
  useEffect(() => {
    setIsRunning(running)
  }, [running, setIsRunning])

  // Rastreia início da sessão de foco (apenas uma vez por montagem)
  useEffect(() => {
    if (running && !sessionStartedRef.current) {
      sessionStartedRef.current = true
      track('session_started', { content_id: content.id, phase, duration_secs: TOTAL })
    }
  // TOTAL e phase são derivados de estado — incluídos para precisão do evento, mas running é o gatilho
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Cria o Web Worker na montagem e destrói na desmontagem para evitar drift em background
  useEffect(() => {
    if (typeof Worker === 'undefined') return
    const worker = new Worker('/timer.worker.js')
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<{ type: string; secs?: number }>) => {
      const { type, secs: workerSecs } = e.data
      if (type === 'TICK' && workerSecs !== undefined) {
        setSecs(workerSecs)
      } else if (type === 'DONE') {
        setRunning(false)
        if (phaseRef.current === 'study') {
          setPhase('extract')
          setSecs(5 * 60)
        } else {
          setSecs(0)
        }
      }
    }

    return () => {
      worker.terminate()
      setIsRunning(false)
    }
  // setIsRunning é estável (vem de useState no provider) — não precisa de deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Envia START ou PAUSE ao Worker sempre que running muda
  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return
    if (running) {
      worker.postMessage({ type: 'START', payload: { secs } })
    } else {
      worker.postMessage({ type: 'PAUSE' })
    }
    // secs é capturado corretamente pelo render que disparou o efeito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // Intercepta refresh/fechamento do browser com sessão ativa
  useEffect(() => {
    if (!running) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      return ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [running])

  const TOTAL = phase === 'study' ? 25 * 60 : 5 * 60
  const pct = ((TOTAL - secs) / TOTAL) * 100
  const r = 44
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  function handleBack() {
    if (running) {
      setShowLeaveConfirm(true)
    } else {
      router.push('/focus')
    }
  }

  function confirmLeave() {
    setShowLeaveConfirm(false)
    setRunning(false)
    router.push('/focus')
  }

  function addHighlight() {
    if (!hiInput.trim()) return
    setHighlights((h) => [...h, hiInput.trim()])
    setHiInput('')
  }

  function addCard() {
    if (!cf.front || !cf.back) return
    const card: FlashCard = {
      ...cf,
      id: uid(),
      cid: content.id,
      ef: 2.5,
      interval: 1,
      reps: 0,
      nextReview: new Date().toISOString(),
      lastReview: null,
      mastery: 'new',
    }
    setNewCards((a) => [...a, card])
    setCf({ front: '', back: '' })
  }

  function finish() {
    const session: StudySession = {
      id: uid(),
      cid: content.id,
      date: new Date().toISOString(),
      duration: 25,
      highlights,
      notes,
      teach,
    }
    dispatch({
      type: 'FINISH_SESSION',
      payload: { session, cards: newCards, contentId: content.id },
    })
    track('session_completed', { content_id: content.id, phase, duration_secs: 25 * 60 })
    router.push('/dashboard')
  }

  const phases = [
    { id: 'study', l: '1. Sessão de Foco' },
    { id: 'extract', l: '2. Extração' },
    { id: 'teach', l: '3. Ensinar' },
  ] as const

  const TYPE_ICONS: Record<string, string> = {
    book: '📚',
    course: '🎓',
    video: '🎥',
    article: '📄',
    note: '📝',
  }

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '920px', margin: '0 auto' }}>
      {/* Diálogo de confirmação ao sair com sessão ativa */}
      <ConfirmDialog
        open={showLeaveConfirm}
        variant="warning"
        title="Sessão em andamento"
        description="O timer está rodando. Se sair agora, o progresso desta sessão não será salvo. Deseja mesmo sair?"
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar estudando"
        onConfirm={confirmLeave}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <button
        data-testid="btn-back-focus"
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        ← Voltar
      </button>

      {/* Phase tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '22px',
          background: 'var(--card)',
          borderRadius: '10px',
          padding: '4px',
          border: '1px solid var(--border)',
          width: 'fit-content',
        }}
      >
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            style={{
              padding: '7px 15px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Inter',
              background: phase === p.id ? '#7c3aed' : 'transparent',
              color: phase === p.id ? '#fff' : 'var(--text3)',
              transition: 'all .2s',
            }}
          >
            {p.l}
          </button>
        ))}
      </div>

      {/* Content pill */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderColor: content.color + '40',
        }}
      >
        <span style={{ fontSize: '16px' }}>{TYPE_ICONS[content.type] ?? '📚'}</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
            {content.title}
          </div>
          {content.author && (
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{content.author}</div>
          )}
        </div>
      </div>

      {/* STUDY */}
      {phase === 'study' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '22px' }}>
          <div
            className="card"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              minWidth: '190px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="55"
                  cy="55"
                  r={r}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'var(--text)',
                    fontFamily: 'monospace',
                  }}
                >
                  {mm}:{ss}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Pomodoro · 25 min</div>
            <button
              data-testid="btn-timer-toggle"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => setRunning(!running)}
            >
              {running ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button
              className="btn-secondary"
              style={{ width: '100%', fontSize: '12px' }}
              onClick={() => {
                setSecs(25 * 60)
                setRunning(false)
                workerRef.current?.postMessage({ type: 'RESET', payload: { secs: 25 * 60 } })
              }}
            >
              ↺ Resetar
            </button>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', width: '100%' }}>
              <p
                style={{
                  fontSize: '10px',
                  color: 'var(--text3)',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                💡 Foque em 1 coisa.
                <br />
                Sem celular. Sem abas.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card" style={{ padding: '18px' }}>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '10px',
                }}
              >
                ✏️ Anotações
              </h3>
              <textarea
                className="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva pontos principais, insights, dúvidas..."
                style={{ minHeight: '130px' }}
              />
            </div>
            <div className="card" style={{ padding: '18px' }}>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '10px',
                }}
              >
                🔖 Highlights
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  className="input"
                  value={hiInput}
                  onChange={(e) => setHiInput(e.target.value)}
                  placeholder="Conceito importante..."
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && addHighlight()}
                />
                <button className="btn-primary" onClick={addHighlight}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    className="badge"
                    style={{
                      background: 'rgba(124,58,237,.15)',
                      color: '#a78bfa',
                      cursor: 'pointer',
                    }}
                    onClick={() => setHighlights((p) => p.filter((_, j) => j !== i))}
                  >
                    {h} ×
                  </span>
                ))}
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ alignSelf: 'flex-end', paddingLeft: '24px', paddingRight: '24px' }}
              onClick={() => setPhase('extract')}
            >
              Finalizar Sessão →
            </button>
          </div>
        </div>
      )}

      {/* EXTRACT */}
      {phase === 'extract' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '14px',
              }}
            >
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
                  <label
                    style={{
                      fontSize: '11px',
                      color: '#a78bfa',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    {q}
                  </label>
                  <textarea
                    className="textarea"
                    value={qs[k]}
                    onChange={(e) => setQs({ ...qs, [k]: e.target.value })}
                    style={{ minHeight: '65px' }}
                    placeholder="Responda com suas palavras..."
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '14px',
              }}
            >
              🃏 Criar Flashcards
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '9px',
                marginBottom: '10px',
              }}
            >
              <input
                className="input"
                value={cf.front}
                onChange={(e) => setCf({ ...cf, front: e.target.value })}
                placeholder="Pergunta / Conceito"
              />
              <textarea
                className="textarea"
                value={cf.back}
                onChange={(e) => setCf({ ...cf, back: e.target.value })}
                placeholder="Resposta / Explicação"
                style={{ minHeight: '70px' }}
              />
              <button className="btn-primary" onClick={addCard}>
                + Adicionar Card
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>
                {newCards.length} card(s) criado(s)
              </div>
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                {newCards.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--card2)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text)' }}>
                      {c.front.slice(0, 38)}…
                    </span>
                    <button
                      onClick={() => setNewCards((p) => p.filter((_, j) => j !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text3)',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setPhase('teach')}
            >
              Próximo: Ensinar →
            </button>
          </div>
        </div>
      )}

      {/* TEACH */}
      {phase === 'teach' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            className="card"
            style={{
              padding: '22px',
              background: 'rgba(124,58,237,.06)',
              borderColor: 'rgba(124,58,237,.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '28px' }}>🎓</span>
              <div>
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: '800',
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Modo Professor
                </h2>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text4)',
                    lineHeight: '1.6',
                  }}
                >
                  Explique o que aprendeu como se ensinasse alguém que nunca viu o tema. Isso ativa
                  recuperação ativa e consolida memória de longo prazo (Glasser: 90% retenção).
                </p>
              </div>
            </div>
            {highlights.length > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,.15)',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '12px',
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    color: '#a78bfa',
                    marginBottom: '5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '.5px',
                  }}
                >
                  Você destacou:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {highlights.map((h, i) => (
                    <span
                      key={i}
                      className="badge"
                      style={{ background: 'rgba(124,58,237,.15)', color: '#a78bfa' }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <label
              style={{
                fontSize: '12px',
                color: 'var(--text4)',
                display: 'block',
                marginBottom: '7px',
              }}
            >
              Sua explicação (como professor):
            </label>
            <textarea
              className="textarea"
              value={teach}
              onChange={(e) => setTeach(e.target.value)}
              placeholder="Hoje aprendi que... O conceito funciona assim... Um exemplo real é..."
              style={{ minHeight: '160px' }}
            />
            {teach.split(' ').filter((w) => w).length > 30 && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '9px 12px',
                  background: 'rgba(16,185,129,.1)',
                  borderRadius: '7px',
                  borderLeft: '3px solid #10b981',
                }}
              >
                <span style={{ fontSize: '11px', color: '#10b981' }}>
                  ✓ {teach.split(' ').filter((w) => w).length} palavras — continue expandindo!
                </span>
              </div>
            )}
          </div>
          <div
            className="card"
            style={{
              padding: '18px',
              borderColor: 'rgba(6,182,212,.25)',
              background: 'rgba(6,182,212,.04)',
            }}
          >
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#06b6d4',
                marginBottom: '8px',
              }}
            >
              ⚡ Desafio de Aplicação
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
              Com base em <strong>&quot;{content.title}&quot;</strong>, crie 1 exemplo real ou ação
              que você aplicará nos próximos 7 dias.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setPhase('extract')}
            >
              ← Voltar
            </button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={finish}>
              ✓ Finalizar e Salvar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
