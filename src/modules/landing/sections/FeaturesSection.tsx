'use client'

const FEATURES = [
  {
    color: '#7c3aed',
    title: 'Flashcards SM-2',
    desc: 'Algoritmo de repetição espaçada que agenda cada revisão no momento exato antes do esquecimento.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    color: '#06b6d4',
    title: 'Modo Professor',
    desc: 'Explique conceitos para a IA e receba feedback sobre lacunas de conhecimento em tempo real.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    color: '#10b981',
    title: 'Skill Tracker',
    desc: 'Visualize o progresso em cada área de conhecimento com score de mastery baseado em evidências.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    color: '#f59e0b',
    title: 'Foco Cognitivo',
    desc: 'Sessões de estudo adaptativas que respeitam seus limites cognitivos e maximizam a absorção.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Funcionalidades
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px' }}>
            Tudo que você precisa para aprender de verdade.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto' }}>
            Cada funcionalidade foi desenhada para atacar um ponto específico da cadeia do aprendizado.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', padding: '32px 24px',
                transition: 'transform 0.25s, border-color 0.25s, background 0.25s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.borderColor = `${f.color}40`
                el.style.background = `${f.color}08`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${f.color}22, ${f.color}0e)`,
                border: `1px solid ${f.color}30`,
                color: f.color,
                marginBottom: '22px',
              }}>
                {f.svg}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
