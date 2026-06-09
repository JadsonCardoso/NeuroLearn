import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Proxy via mesmo domínio para contornar bloqueio por ad blockers
  tunnel: '/api/sentry-tunnel',

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Suprime erros de rede causados por ad blockers / extensões de browser
  ignoreErrors: [
    'ERR_BLOCKED_BY_CLIENT',
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    'AbortError',
  ],

  debug: false,
})

// Necessário para o Sentry rastrear transições de rota no Next.js 15 App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
