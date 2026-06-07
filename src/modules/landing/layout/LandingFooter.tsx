import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '40px clamp(20px, 5vw, 80px)',
      display: 'flex', flexWrap: 'wrap', gap: '20px',
      justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          borderRadius: '8px', padding: '5px', display: 'flex',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>NeuroLearn</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Sistema Operacional de Aprendizagem</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link href="/politica-de-privacidade" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          Política de Privacidade
        </Link>
        <Link href="/auth/login" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          Entrar
        </Link>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} NeuroLearn
        </span>
      </div>
    </footer>
  )
}
