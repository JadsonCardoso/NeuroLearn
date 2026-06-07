const STEPS = [
  {
    label: 'Consumir',
    desc: 'Adicione qualquer conteúdo: texto, vídeo, artigo, livro.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    label: 'Recordar',
    desc: 'Flashcards SM-2 ativam a recuperação ativa no momento certo.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    label: 'Explicar',
    desc: 'O Modo Professor força você a ensinar o que aprendeu.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Aplicar',
    desc: 'Exercícios práticos consolidam o conhecimento em habilidade.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    label: 'Revisar',
    desc: 'O algoritmo agenda revisões no pico do esquecimento.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
  },
  {
    label: 'Consolidar',
    desc: 'Retenção real. Habilidade que fica para sempre.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
]

export function CoreLoopSection() {
  return (
    <section id="como-funciona" style={{ padding: '100px clamp(20px, 5vw, 80px)', background: 'rgba(255,255,255,0.015)' }}>
      <style>{`
        @keyframes coreIconEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.75); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coreIconGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
          50%       { box-shadow: 0 0 18px 4px rgba(124,58,237,0.22); }
        }
        .core-step-icon {
          animation: coreIconEntrance 0.5s cubic-bezier(0.34,1.56,0.64,1) both,
                     coreIconGlow 3s ease-in-out infinite;
        }
        .core-step-icon:hover {
          transform: scale(1.12) translateY(-3px) !important;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1) !important;
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#06b6d4', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Como funciona
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px' }}>
            O Core Loop do NeuroLearn
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Cada ciclo reforça a memória e constrói habilidade real.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0' }}>
          {STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 8px' }}>
              {/* Conector animado */}
              {i < STEPS.length - 1 && (
                <div aria-hidden style={{
                  position: 'absolute', top: '27px', left: 'calc(50% + 30px)', right: '-8px',
                  height: '2px',
                  background: `linear-gradient(90deg, rgba(124,58,237,${0.3 + i * 0.1}), rgba(6,182,212,${0.2 + i * 0.05}))`,
                  zIndex: 0,
                }} />
              )}

              {/* Ícone com animação */}
              <div
                className="core-step-icon"
                style={{
                  width: '54px', height: '54px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, rgba(124,58,237,${0.15 + i * 0.04}), rgba(6,182,212,${0.08 + i * 0.02}))`,
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: `hsl(${262 - i * 12}, 70%, ${70 + i * 3}%)`,
                  marginBottom: '18px', position: 'relative', zIndex: 1,
                  animationDelay: `${i * 0.1}s, ${i * 0.4}s`,
                  cursor: 'default',
                }}
              >
                {step.svg}
              </div>

              {/* Número de etapa */}
              <div style={{
                fontSize: '10px', fontWeight: '800', color: 'rgba(124,58,237,0.6)',
                letterSpacing: '1px', marginBottom: '6px',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>{step.label}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.42)', textAlign: 'center', lineHeight: 1.55 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
