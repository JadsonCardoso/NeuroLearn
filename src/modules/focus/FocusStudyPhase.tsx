'use client'

interface Props {
  running: boolean
  notes: string
  highlights: string[]
  hiInput: string
  mm: string
  ss: string
  r: number
  circumference: number
  offset: number
  onToggleRunning: () => void
  onResetTimer: () => void
  onNotesChange: (v: string) => void
  onHiInputChange: (v: string) => void
  onAddHighlight: () => void
  onRemoveHighlight: (i: number) => void
  onNext: () => void
}

export function FocusStudyPhase({
  running,
  notes,
  highlights,
  hiInput,
  mm,
  ss,
  r,
  circumference,
  offset,
  onToggleRunning,
  onResetTimer,
  onNotesChange,
  onHiInputChange,
  onAddHighlight,
  onRemoveHighlight,
  onNext,
}: Props) {
  return (
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
          onClick={onToggleRunning}
        >
          {running ? '⏸ Pausar' : '▶ Iniciar'}
        </button>
        <button
          className="btn-secondary"
          style={{ width: '100%', fontSize: '12px' }}
          onClick={onResetTimer}
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
            onChange={(e) => onNotesChange(e.target.value)}
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
              onChange={(e) => onHiInputChange(e.target.value)}
              placeholder="Conceito importante..."
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && onAddHighlight()}
            />
            <button className="btn-primary" onClick={onAddHighlight}>
              +
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {highlights.map((h, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(245,158,11,.15)',
                  color: '#d97706',
                  border: '1px solid rgba(245,158,11,.3)',
                  borderRadius: '20px',
                  padding: '3px 4px 3px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {h}
                <button
                  onClick={() => onRemoveHighlight(i)}
                  aria-label={`Remover highlight "${h}"`}
                  style={{
                    background: 'rgba(239,68,68,.15)',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: '14px',
                    lineHeight: 1,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ alignSelf: 'flex-end', paddingLeft: '24px', paddingRight: '24px' }}
          onClick={onNext}
        >
          Finalizar Sessão →
        </button>
      </div>
    </div>
  )
}
