// Hook de instrumentação do Next.js — inicializa Sentry no servidor e no edge
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Captura erros em Server Components e Route Handlers
export { captureRequestError as onRequestError } from '@sentry/nextjs'
