'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 80px)',
        background: scrolled ? 'rgba(9,9,11,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          borderRadius: '10px', padding: '7px',
          display: 'flex', boxShadow: '0 4px 16px rgba(124,58,237,.4)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>
          NeuroLearn
        </span>
      </Link>

      <Link
        href="/auth/login"
        style={{
          fontSize: '13px', fontWeight: '600', color: '#fff',
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '10px', padding: '8px 18px',
          textDecoration: 'none', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.3)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.7)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'
        }}
      >
        Entrar
      </Link>
    </nav>
  )
}
