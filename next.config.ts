import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Content-Security-Policy para Next.js 15 App Router
// unsafe-eval e unsafe-inline são necessários para o runtime do Next.js e React
// Futuro: migrar para nonces por request para eliminar unsafe-inline
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  [
    "connect-src 'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://accounts.google.com',
    // Sentry — ingestão de erros e traces
    'https://*.ingest.sentry.io',
    'https://*.ingest.us.sentry.io',
    // PostHog — analytics de eventos
    'https://app.posthog.com',
    'https://us.i.posthog.com',
    'https://eu.i.posthog.com',
  ].join(' '),
  "worker-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy', value: csp },
  // HSTS só em produção — não forçar HTTPS em localhost
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Obtido em: sentry.io → Settings → Auth Tokens
  authToken: process.env.SENTRY_AUTH_TOKEN,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silencia output do CLI Sentry fora do CI
  silent: !process.env.CI,

  // Upload de source maps mais amplo para erros em bundles divididos
  widenClientFileUpload: true,

  webpack: {
    // Remove logs do SDK Sentry do bundle de produção
    treeshake: { removeDebugLogging: true },
    // Desativa instrumentação automática — controlamos manualmente via instrumentation.ts
    autoInstrumentServerFunctions: false,
  },
})
