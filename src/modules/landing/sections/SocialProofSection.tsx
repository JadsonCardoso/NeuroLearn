'use client'

const TESTIMONIALS = [
  {
    text: 'Finalmente um sistema que me faz reter o conteúdo. Antes eu lia horas e esquecia tudo. Agora o conhecimento fica.',
    name: 'Mariana Costa',
    role: 'Estudante de Medicina, 4º ano',
    initials: 'MC',
    color: '#7c3aed',
    stars: 5,
  },
  {
    text: 'O Modo Professor é genial. Tentei explicar closures para a IA e percebi que não entendia metade do que pensava.',
    name: 'Rafael Mendes',
    role: 'Desenvolvedor Full Stack',
    initials: 'RM',
    color: '#06b6d4',
    stars: 5,
  },
  {
    text: 'A revisão espaçada transformou minha rotina de estudos. Estudo menos horas e aprendo muito mais.',
    name: 'Lucas Oliveira',
    role: 'Concurseiro — Área Fiscal',
    initials: 'LO',
    color: '#10b981',
    stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export function SocialProofSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Depoimentos
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px' }}>
            Quem já aprende de verdade.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                padding: '28px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'transform 0.25s, border-color 0.25s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.borderColor = `${t.color}35`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              {/* Barra lateral colorida */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
                background: `linear-gradient(180deg, ${t.color}, ${t.color}40)`,
                borderRadius: '20px 0 0 20px',
              }} />

              {/* Aspas decorativas */}
              <div style={{
                position: 'absolute', top: '16px', right: '20px',
                fontSize: '64px', lineHeight: 1, color: `${t.color}18`,
                fontFamily: 'Georgia, serif', fontWeight: '900', userSelect: 'none',
              }}>
                &ldquo;
              </div>

              <Stars count={t.stars} />

              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75,
                margin: '0 0 24px', position: 'relative', zIndex: 1,
              }}>
                &ldquo;{t.text}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '800', color: '#fff',
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Números de credibilidade */}
        <div style={{
          marginTop: '56px', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px', padding: '36px',
        }}>
          {[
            { value: '94%', label: 'de retenção após 30 dias' },
            { value: '3×', label: 'mais rápido que leitura passiva' },
            { value: '0', label: 'custo no período beta' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900',
                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
