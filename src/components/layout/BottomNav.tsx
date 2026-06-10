'use client'

import { memo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, Book, Timer, Refresh, Tree } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useFocusSession } from '@/store/FocusSessionContext'

// Itens principais exibidos na barra de navegação inferior (mobile ≤767px)
const BOTTOM_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Brain, href: '/dashboard' },
  { id: 'library', label: 'Biblioteca', Icon: Book, href: '/library' },
  { id: 'focus', label: 'Foco', Icon: Timer, href: '/focus' },
  { id: 'review', label: 'Revisão', Icon: Refresh, href: '/review' },
  { id: 'skills', label: 'Skills', Icon: Tree, href: '/skills' },
] as const

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isRunning } = useFocusSession()
  const [confirm, setConfirm] = useState<{ open: boolean; href: string }>({ open: false, href: '' })

  function handleNavClick(href: string) {
    // Se o timer está rodando, mostra aviso antes de navegar
    if (isRunning && !pathname.startsWith(href)) {
      setConfirm({ open: true, href })
      return
    }
    router.push(href)
  }

  function confirmNav() {
    const { href } = confirm
    setConfirm({ open: false, href: '' })
    router.push(href)
  }

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        variant="warning"
        title="Sessão em andamento"
        description="O timer está rodando. Se sair agora, o progresso desta sessão não será salvo. Deseja mesmo sair?"
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar estudando"
        onConfirm={confirmNav}
        onCancel={() => setConfirm({ open: false, href: '' })}
      />

      <nav className="bottom-nav" aria-label="Navegação principal mobile" data-testid="bottom-nav">
        {BOTTOM_NAV_ITEMS.map(({ id, label, Icon, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <button
              key={id}
              data-testid={`bottom-nav-${id}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => handleNavClick(href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                flex: 1,
                padding: '8px 4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? '#7c3aed' : 'var(--text3)',
                transition: 'color .2s',
                minWidth: 0,
                fontFamily: 'inherit',
              }}
            >
              <Icon />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '56px',
                  textAlign: 'center',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      <style>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          background: var(--bg2);
          border-top: 1px solid var(--border);
          height: 64px;
          align-items: stretch;
          /* Respeita safe-area do iPhone (notch inferior) */
          padding-bottom: env(safe-area-inset-bottom);
        }
        @media (max-width: 767px) {
          .bottom-nav { display: flex; }
        }
      `}</style>
    </>
  )
})
