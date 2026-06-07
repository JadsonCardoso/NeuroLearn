'use client'

const PAIN_POINTS = [
  {
    title: 'Lê muito, aprende pouco',
    desc: 'Consome horas de conteúdo sem transformar em conhecimento real.',
    color: '#7c3aed',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    title: 'Esquece em 24h',
    desc: 'Em 24h já perdeu 70% do que aprendeu. A curva do esquecimento é implacável.',
    color: '#ef4444',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    title: 'Acumula, não aprende',
    desc: 'Dezenas de cursos iniciados, poucos terminados, nenhum realmente internalizado.',
    color: '#f59e0b',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <path d="M7 7h.01"/>
      </svg>
    ),
  },
  {
    title: 'Aprende passivamente',
    desc: 'Assistir aulas e ler não é aprender. É ilusão de progresso.',
    color: '#06b6d4',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        <path d="M20 3v4"/>
        <path d="M22 5h-4"/>
      </svg>
    ),
  },
]

export function ProblemSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
          O problema real
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 20px' }}>
          Você não tem falta de conteúdo.
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
          O problema é transformar informação em memória e habilidade real.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '64px' }}>
        {PAIN_POINTS.map((p) => (
          <div
            key={p.title}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '28px 24px',
              transition: 'transform 0.25s, border-color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-4px)'
              el.style.background = 'rgba(255,255,255,0.05)'
              el.style.borderColor = `${p.color}40`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.background = 'rgba(255,255,255,0.03)'
              el.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Ícone SVG com fundo em gradiente */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${p.color}22, ${p.color}10)`,
              border: `1px solid ${p.color}30`,
              color: p.color,
              marginBottom: '20px',
            }}>
              {p.svg}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{p.title}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Transição emocional */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))',
        border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px',
        padding: '40px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: '700', color: '#fff', lineHeight: 1.4, margin: 0 }}>
          O NeuroLearn não é mais um app de estudos.{' '}
          <span style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            É um sistema que faz você reter o que aprende.
          </span>
        </p>
      </div>
    </section>
  )
}
