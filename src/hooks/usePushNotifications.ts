'use client'

import { useState, useEffect, useCallback } from 'react'

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Detecta suporte e estado atual; reage a mudanças externas de permissão
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as PushPermission)

    // Verifica se já está subscrito
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    }).catch(() => {})

    // Reage quando o usuário altera a permissão fora do app (configurações do browser)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then((status) => {
        const handler = () => setPermission(status.state === 'prompt' ? 'default' : status.state as PushPermission)
        status.addEventListener('change', handler)
        return () => status.removeEventListener('change', handler)
      }).catch(() => {})
    }
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setPermission(permission as PushPermission)
      if (permission !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { console.error('VAPID public key não configurada'); return false }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (res.ok) { setIsSubscribed(true); return true }
      return false
    } catch (err) {
      console.error('[usePushNotifications] subscribe error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) { setIsSubscribed(false); return }
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
      setIsSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [])

  return { permission, isSubscribed, loading, subscribe, unsubscribe }
}

// Converte VAPID public key de base64url para Uint8Array com ArrayBuffer explícito
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}
