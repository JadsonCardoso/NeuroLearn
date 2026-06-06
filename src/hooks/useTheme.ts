'use client'

import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

function readAppliedTheme(): Theme {
  // Lê o atributo já definido pelo script inline do layout (anti-flash)
  // Fallback para localStorage e, por último, 'dark'
  if (typeof window === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme') as Theme | null
  if (attr === 'light' || attr === 'dark') return attr
  const stored = localStorage.getItem('nl_theme') as Theme | null
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sincroniza o estado React com o tema já aplicado pelo script inline
    setTheme(readAppliedTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('nl_theme', next)
  }

  return { theme, toggle }
}
