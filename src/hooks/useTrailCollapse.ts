'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nl:trails:collapsed'

export function useTrailCollapse() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCollapsed(new Set(JSON.parse(raw) as string[]))
    } catch {
      // ignora parse errors
    }
  }, [])

  function toggle(trailId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(trailId)) {
        next.delete(trailId)
      } else {
        next.add(trailId)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // ignora erros de quota
      }
      return next
    })
  }

  return { collapsed, toggle }
}
