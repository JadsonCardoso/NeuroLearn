'use client'

import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from '@/components/icons'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ color: 'var(--text3)' }}>{theme === 'dark' ? <Moon /> : <Sun />}</span>
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      />
    </div>
  )
}
