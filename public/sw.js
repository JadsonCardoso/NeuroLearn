// Service Worker — NeuroLearn PWA
// Estratégia: Network First para API, Cache First para shell estático

// Versionar o CACHE_NAME a cada deploy para forçar invalidação do cache nos clientes
const CACHE_NAME = 'neurolearn-v1-20260608'

const SHELL_URLS = [
  '/',
  '/dashboard',
  '/library',
  '/review',
  '/focus',
  '/active',
  '/skills',
  '/help',
  '/settings',
]

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {
        // Alguns URLs podem não estar disponíveis offline — ignora silenciosamente
      })
    )
  )
})

// ── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora: não-GET, chrome-extension, outros protocolos
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // API routes: network only (dados em tempo real)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Recursos Next.js /_next/static: cache first (imutáveis pelo hash)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // App shell e páginas: Network First → fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached ?? Response.error()))
  )
})

// ── Push Notifications ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'NeuroLearn', body: 'Você tem cards para revisar!', url: '/review' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch { /* payload inválido — usa defaults */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'neurolearn-review',
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: 'review', title: '📖 Revisar agora' },
        { action: 'later',  title: '⏰ Depois'       },
      ],
    })
  )
})

// ── Notification Click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'later') return

  // Garante que a URL seja relativa (evita Open Redirect via payload forjado)
  const rawUrl = event.notification.data?.url ?? '/review'
  const targetUrl = typeof rawUrl === 'string' && rawUrl.startsWith('/') ? rawUrl : '/review'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(targetUrl))
      if (existing) return existing.focus()
      return self.clients.openWindow(targetUrl)
    })
  )
})
