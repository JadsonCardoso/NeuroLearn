export function TeacherModeSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center' }}>
        {/* Texto */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Modo Professor
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.2, margin: '0 0 20px' }}>
            Você aprende{' '}
            <span style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ensinando.
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '32px' }}>
            A Técnica Feynman provou: explicar um conceito como se fosse para um iniciante é a maneira mais rápida de revelar lacunas e consolidar o entendimento.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                color: '#7c3aed',
                text: 'IA analisa sua explicação e identifica lacunas de conhecimento',
                svg: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  </svg>
                ),
              },
              {
                color: '#06b6d4',
                text: 'Feedback instantâneo sobre clareza e precisão conceitual',
                svg: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <line x1="9" y1="10" x2="15" y2="10"/>
                    <line x1="9" y1="14" x2="13" y2="14"/>
                  </svg>
                ),
              },
              {
                color: '#10b981',
                text: 'Pontuação de mastery que reflete compreensão real, não memorização',
                svg: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <li key={item.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}10)`,
                  border: `1px solid ${item.color}30`,
                  color: item.color, marginTop: '1px',
                }}>
                  {item.svg}
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, paddingTop: '7px' }}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup CSS */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '28px', fontFamily: 'monospace',
        }}>
          {/* Cabeçalho do mockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(124,58,237,0.6)' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>Modo Professor</span>
          </div>

          {/* Conceito */}
          <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Conceito</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Revisão Espaçada</div>
          </div>

          {/* Textarea mockup */}
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '16px', minHeight: '80px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
  &ldquo;A revisão espaçada é uma técnica onde você revisa informações em intervalos crescentes, aproveitando o momento em que está prestes a esquecer...&rdquo;
            </div>
          </div>

          {/* Feedback da IA */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#10b981', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Feedback da IA</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
              Boa explicação! Você capturou o princípio central. Considere mencionar o papel do esquecimento como mecanismo ativo...
            </div>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Mastery Score</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>72%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
