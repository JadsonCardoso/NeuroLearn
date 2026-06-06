// Logger de eventos de segurança — formato JSON estruturado
// PRODUÇÃO: substituir por Datadog / Sentry / CloudWatch / Supabase Edge Function log

export type SecurityEvent =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.signup'
  | 'auth.logout'
  | 'rate_limit.exceeded'
  | 'rbac.violation'
  | 'session.invalid'
  | 'data.deletion'

export interface SecurityLogEntry {
  timestamp: string
  event: SecurityEvent
  meta?: Record<string, unknown>
}

export function logSecurityEvent(
  event: SecurityEvent,
  meta?: Record<string, unknown>,
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    meta,
  }

  // Sanitiza valores sensíveis do meta antes de logar
  const safe = sanitizeMeta(entry)

  if (process.env.NODE_ENV === 'production') {
    // Em produção: apenas eventos relevantes
    console.log(JSON.stringify(safe))
  } else {
    // Em dev: formato legível
    console.log(`[SECURITY] ${safe.timestamp} | ${safe.event}`, safe.meta ?? '')
  }
}

function sanitizeMeta(entry: SecurityLogEntry): SecurityLogEntry {
  if (!entry.meta) return entry
  // Remove campos sensíveis antes de logar
  const safeMeta = { ...(entry.meta as Record<string, unknown>) }
  delete safeMeta.password
  delete safeMeta.token
  return { ...entry, meta: safeMeta }
}
