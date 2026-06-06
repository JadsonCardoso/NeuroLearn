// Rate limiter in-memory, compatível com Edge Runtime (sem Node.js APIs)
// PRODUÇÃO: substituir por Upstash Redis (@upstash/ratelimit @upstash/redis)

const WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const MAX_ATTEMPTS = 5
const CLEANUP_INTERVAL = 100 // limpa a cada 100 chamadas

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
let callCount = 0

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
  remaining: number
}

export function checkRateLimit(key: string, limit = MAX_ATTEMPTS, windowMs = WINDOW_MS): RateLimitResult {
  if (++callCount % CLEANUP_INTERVAL === 0) cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now, remaining: 0 }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0, remaining: limit - entry.count }
}

export function resetRateLimit(key: string): void {
  store.delete(key)
}

export function getRateLimitKey(prefix: string, ip: string): string {
  return `${prefix}:${ip}`
}
