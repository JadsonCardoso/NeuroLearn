'use client'

const CONCEPTS = [
  {
    icon: '📉',
    title: 'Curva do Esquecimento',
    desc: 'Hermann Ebbinghaus provou: sem reforço, esquecemos 70% em 24 horas. O NeuroLearn combate isso com revisões no momento exato.',
    color: '#ef4444',
  },
  {
    icon: '⏱️',
    title: 'Revisão Espaçada',
    desc: 'Revisar no intervalo certo multiplica a retenção. O algoritmo SM-2 calcula o momento ideal para cada flashcard.',
    color: '#7c3aed',
  },
  {
    icon: '💪',
    title: 'Aprendizado Ativo',
    desc: 'Sublinhar e assistir são ilusão. Recuperar ativamente da memória é o que consolida o conhecimento.',
    color: '#06b6d4',
  },
  {
    icon: '🎓',
    title: 'Efeito de Ensinar',
    desc: 'Quem ensina aprende duas vezes. O Modo Professor usa esse princípio para criar retenção profunda.',
    color: '#10b981',
  },
]

export function ScienceSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Base científica
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px' }}>
            Ciência, não teoria.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto' }}>
            Cada mecanismo do NeuroLearn é baseado em pesquisas de neurociência cognitiva.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {CONCEPTS.map((c) => (
            <div key={c.title} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', padding: '32px 24px',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.borderColor = `${c.color}40`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', fontSize: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${c.color}18`, marginBottom: '20px',
              }}>
                {c.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>{c.title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
