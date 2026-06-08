'use client'

import { useState } from 'react'
import { ToastContainer } from '@/components/ui/Toast'
import { Sidebar } from '@/components/layout/Sidebar'
import { MigrationBanner } from '@/components/layout/MigrationBanner'
import { BottomNav } from '@/components/layout/BottomNav'

// Client Component separado — gerencia estado da sidebar mobile
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Barra de topo visível apenas em mobile */}
          <div className="mobile-topbar">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
            </button>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)' }}>
              NeuroLearn
            </span>
          </div>

          <main
            style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}
            className="app-main"
          >
            <MigrationBanner />
            {children}
          </main>
        </div>

        <ToastContainer />
      </div>

      <BottomNav />

      <style>{`
        .mobile-topbar {
          display: none;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 30;
        }
        @media (max-width: 767px) {
          .mobile-topbar { display: flex; }
          /* Espaço para a BottomNav fixa não cobrir o conteúdo */
          .app-main { padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  )
}
