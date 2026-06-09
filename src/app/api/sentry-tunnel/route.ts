import { NextRequest, NextResponse } from 'next/server'

// Tunnel Sentry para contornar bloqueio por ad blockers.
// O cliente envia envelopes para /api/sentry-tunnel (mesmo domínio),
// que repassa ao ingest real do Sentry no lado do servidor.
const SENTRY_HOST = 'o4511529522298880.ingest.us.sentry.io'
const SENTRY_PROJECT_ID = '4511529535995904'

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text()
    const firstLine = envelope.split('\n')[0]

    let dsn: string | undefined
    try {
      dsn = JSON.parse(firstLine)?.dsn
    } catch {
      return new NextResponse('Invalid envelope header', { status: 400 })
    }

    if (!dsn) {
      return new NextResponse('Missing DSN in envelope', { status: 400 })
    }

    // Valida que o envelope pertence ao projeto correto
    const dsnUrl = new URL(dsn)
    const projectId = dsnUrl.pathname.replace(/^\/+/, '')

    if (dsnUrl.hostname !== SENTRY_HOST || projectId !== SENTRY_PROJECT_ID) {
      return new NextResponse('Unauthorized DSN', { status: 403 })
    }

    const upstreamUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`

    const sentryResponse = await fetch(upstreamUrl, {
      method: 'POST',
      body: envelope,
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
    })

    return new NextResponse(null, { status: sentryResponse.status })
  } catch {
    // Nunca expõe detalhes de erro ao cliente
    return new NextResponse(null, { status: 200 })
  }
}
