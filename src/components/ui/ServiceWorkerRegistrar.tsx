'use client'

import { useEffect } from 'react'

// Registra o Service Worker uma única vez após a montagem
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          // Novo SW disponível — o skipWaiting no install já ativa automaticamente
        })
      })
      .catch((err) => {
        console.error('[SW] Erro ao registrar:', err)
      })
  }, [])

  return null
}
