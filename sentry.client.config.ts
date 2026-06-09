import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  // Ignora erros causados por ad blockers (net::ERR_BLOCKED_BY_CLIENT)
  // para não poluir o Sentry com ruído de extensões do browser
  ignoreErrors: [
    'ERR_BLOCKED_BY_CLIENT',
    'Failed to fetch',
    'NetworkError',
    'Load failed',
  ],
})
