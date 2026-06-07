export function DashboardMockupSection() {
  return (
    <section style={{ padding: '100px clamp(20px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#06b6d4', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Dashboard
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px' }}>
            Sua aprendizagem, visível.
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '440px', margin: '0 auto' }}>
            Veja exatamente o que está retendo, o que está em risco e o que consolidou.
          </p>
        </div>

        {/* Mockup do Dashboard */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Barra de título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <div style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>NeuroLearn — Dashboard</div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Retenção Média', value: '87%', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
              { label: 'Cards em Risco', value: '4', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: 'Skills Ativas', value: '12', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
              { label: 'Streak', value: '14d', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: stat.bg, borderRadius: '14px', padding: '16px',
                border: `1px solid ${stat.color}20`,
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de retenção fake */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>Curva de Retenção — 30 dias</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
              {[40, 55, 48, 70, 65, 80, 75, 85, 78, 88, 82, 90, 87, 92].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`,
                  background: `linear-gradient(180deg, rgba(124,58,237,${0.4 + (h / 100) * 0.4}), rgba(6,182,212,0.2))`,
                  borderRadius: '3px 3px 0 0',
                }} />
              ))}
            </div>
          </div>

          {/* Skills grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {[
              { name: 'JavaScript', pct: 82 }, { name: 'React', pct: 68 },
              { name: 'TypeScript', pct: 74 }, { name: 'Node.js', pct: 55 },
            ].map((skill) => (
              <div key={skill.name} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{skill.name}</div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.pct}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginTop: '6px' }}>{skill.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
