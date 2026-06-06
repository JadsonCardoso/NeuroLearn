'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
  duration: number
  leaving?: boolean
}

interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (type: ToastType, message: string, title?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 3
const LEAVE_ANIMATION_MS = 150

const DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info:    4000,
  warning: 6000,
  error:   6000,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // FIX BUG-01: limpar timer antes de iniciar animação de saída
  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, LEAVE_ANIMATION_MS)
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const duration = DURATIONS[type]

      setToasts((prev) => {
        const next = [{ id, type, message, title, duration }, ...prev]
        // FIX BUG-01: cancelar timers dos toasts que serão removidos por MAX_TOASTS
        if (next.length > MAX_TOASTS) {
          next.slice(MAX_TOASTS).forEach((t) => {
            const oldTimer = timers.current.get(t.id)
            if (oldTimer) {
              clearTimeout(oldTimer)
              timers.current.delete(t.id)
            }
          })
        }
        return next.slice(0, MAX_TOASTS)
      })

      const timer = setTimeout(() => removeToast(id), duration)
      timers.current.set(id, timer)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext deve ser usado dentro de ToastProvider')
  return ctx
}
