'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Brain, Book, Timer, Refresh, Zap, Tree, Help, Settings, User } from '@/components/icons'
import { ThemeToggle } from './ThemeToggle'
import { useAppData } from '@/hooks/useAppData'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',         icon: Brain,   href: '/dashboard' },
  { id: 'library',   label: 'Biblioteca',         icon: Book,    href: '/library'   },
  { id: 'focus',     label: 'Foco',               icon: Timer,   href: '/focus'     },
  { id: 'review',    label: 'Revisão',             icon: Refresh, href: '/review'    },
  { id: 'active',    label: 'Aprendizado Ativo',   icon: Zap,     href: '/active'    },
  { id: 'skills',    label: 'Habilidades',         icon: Tree,    href: '/skills'    },
  { id: 'help',      label: 'Ajuda',               icon: Help,    href: '/help'      },
  { id: 'settings',  label: 'Configurações',       icon: Settings, href: '/settings' },
  { id: 'profile',   label: 'Perfil',              icon: User,    href: '/profile'   },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, userId } = useAppData()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    createClient()
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.name) setUserName(data.name)
      })
  }, [userId])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <>
      {/* Overlay mobile */}
      {onClose && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.55)',
            zIndex: 39,
            display: 'none',
          }}
          className="sidebar-overlay"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-root${open ? '' : ' sidebar-hidden'}`}
        style={{
          width: '220px',
          minHeight: '100vh',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-4) var(--space-2)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: 'var(--space-1) var(--space-2) var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-1)',
              display: 'flex',
            }}
          >
            <Brain />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--text)' }}>
              NeuroLearn
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
              ⚡ {(state.totalXp ?? 0).toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={id}
                href={href}
                className={`nav-item${active ? ' active' : ''}`}
                onClick={onClose}
                style={{ position: 'relative', textDecoration: 'none' }}
              >
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      background: 'var(--color-primary)',
                      borderRadius: '0 var(--radius-full) var(--radius-full) 0',
                    }}
                  />
                )}
                <Icon />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Theme toggle + Logout */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-3)',
            marginTop: 'var(--space-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {/* Nome do usuário com link para o perfil */}
          {userName && (
            <Link
              href="/profile"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'background var(--duration-fast)',
              }}
              className="nav-item"
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {userName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')}
              </div>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text2)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </span>
            </Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>Tema</span>
            <ThemeToggle />
          </div>
          {userId && (
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background var(--duration-fast)',
              }}
            >
              🚪 Sair
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .sidebar-root {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 40;
            transform: translateX(0);
            transition: transform var(--duration-base) var(--ease-default);
          }
          .sidebar-root.sidebar-hidden {
            transform: translateX(-100%);
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}
