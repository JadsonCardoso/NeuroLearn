'use client'

import type { Content } from '@/types'

interface Props {
  teach: string
  highlights: string[]
  content: Content
  onTeachChange: (v: string) => void
  onBack: () => void
  onFinish: () => void
}

export function FocusTeachPhase({ teach, highlights, content, onTeachChange, onBack, onFinish }: Props) {
  const wordCount = teach.split(' ').filter((w) => w).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="card" style={{ padding: '22px', background: 'rgba(124,58,237,.06)', borderColor: 'rgba(124,58,237,.3)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>
              Modo Professor
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text4)', lineHeight: '1.6' }}>
              Explique o que aprendeu como se ensinasse alguém que nunca viu o tema. Isso ativa
              recuperação ativa e consolida memória de longo prazo (Glasser: 90% retenção).
            </p>
          </div>
        </div>
        {highlights.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,.15)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', color: '#a78bfa', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Você destacou:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {highlights.map((h, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(124,58,237,.15)', color: '#a78bfa' }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
        <label style={{ fontSize: '12px', color: 'var(--text4)', display: 'block', marginBottom: '7px' }}>
          Sua explicação (como professor):
        </label>
        <textarea
          className="textarea"
          value={teach}
          onChange={(e) => onTeachChange(e.target.value)}
          placeholder="Hoje aprendi que... O conceito funciona assim... Um exemplo real é..."
          style={{ minHeight: '160px' }}
        />
        {wordCount > 30 && (
          <div style={{ marginTop: '10px', padding: '9px 12px', background: 'rgba(16,185,129,.1)', borderRadius: '7px', borderLeft: '3px solid #10b981' }}>
            <span style={{ fontSize: '11px', color: '#10b981' }}>
              ✓ {wordCount} palavras — continue expandindo!
            </span>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '18px', borderColor: 'rgba(6,182,212,.25)', background: 'rgba(6,182,212,.04)' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#06b6d4', marginBottom: '8px' }}>
          ⚡ Desafio de Aplicação
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
          Com base em <strong>&quot;{content.title}&quot;</strong>, crie 1 exemplo real ou ação
          que você aplicará nos próximos 7 dias.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          ← Voltar
        </button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={onFinish}>
          ✓ Finalizar e Salvar Sessão
        </button>
      </div>
    </div>
  )
}
