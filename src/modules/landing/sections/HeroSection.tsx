'use client'

export function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px clamp(20px, 5vw, 80px) 80px',
      position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      {/* Gradiente de fundo animado */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 60%)',
        animation: 'heroGlow 8s ease-in-out infinite alternate',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'float 6s ease-in-out infinite',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '100px', padding: '6px 14px', marginBottom: '28px',
          fontSize: '12px', fontWeight: '600', color: '#a78bfa',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Beta gratuito · Baseado em neurociência
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '900',
          color: '#fff', lineHeight: 1.05, letterSpacing: '-2px',
          margin: '0 0 20px',
        }}>
          Aprenda{' '}
          <span style={{
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            sem esquecer.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.65, marginBottom: '44px', maxWidth: '560px', margin: '0 auto 44px',
        }}>
          Uma plataforma de aprendizagem baseada em neurociência que transforma estudo em retenção, prática e habilidade real.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#waitlist"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', fontWeight: '700', fontSize: '15px',
              padding: '14px 28px', borderRadius: '12px', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(124,58,237,0.55)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.4)'
            }}
          >
            🚀 Entrar para o Beta
          </a>
          <a
            href="#como-funciona"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '15px',
              padding: '14px 24px', borderRadius: '12px', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#fff'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Conhecer o Método ↓
          </a>
        </div>
      </div>

      <style>{`
        @keyframes heroGlow {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
