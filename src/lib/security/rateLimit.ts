// Rate limiter — Upstash Redis (produção) com fallback in-memory (local dev / testes).
//
// Para ativar Redis em produção, defina as variáveis de ambiente:
//   UPSTASH_REDIS_REST_URL   — URL REST da instância Upstash Redis
//   UPSTASH_REDIS_REST_TOKEN — token de autenticação
//
// Sem essas variáveis o módulo usa o Map in-memory (comportamento anterior).

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import type { Duration } from '@upstash/ratelimit'

const WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const MAX_ATTEMPTS = 5
const CLEANUP_INTERVAL = 100 // limpeza in-memory a cada 100 chamadas

// ── Tipagem pública ────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
  remaining: number
}

// ── Estratégia ativa ───────────────────────────────────────────────────────────

const useUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

// ── Implementação in-memory (local dev / testes) ───────────────────────────────

interface MemoryEntry {
  count: number
  resetAt: number
}

const store = new Map<string, MemoryEntry>()
let callCount = 0

function cleanupMemory() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

function checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  if (++callCount % CLEANUP_INTERVAL === 0) cleanupMemory()
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

// ── Implementação Upstash (produção) ──────────────────────────────────────────

// Converte milliseconds para o formato Duration do Upstash ("15 m", "1 h", etc.)
function msToDuration(ms: number): Duration {
  if (ms < 1_000) return `${ms} ms`
  const secs = Math.round(ms / 1_000)
  if (secs < 60) return `${secs} s`
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${mins} m`
  const hours = Math.round(ms / 3_600_000)
  if (hours < 24) return `${hours} h`
  return `${Math.round(ms / 86_400_000)} d`
}

// Redis e Ratelimit são lazy: inicializados apenas na primeira chamada com useUpstash=true.
let _redis: Redis | null = null
const _limiters = new Map<string, Ratelimit>()

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

// Cache de instâncias Ratelimit por (limit:windowMs) — evita recriar no cold start.
function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  if (!_limiters.has(cacheKey)) {
    _limiters.set(
      cacheKey,
      new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(limit, msToDuration(windowMs)),
        prefix: 'nl:rl', // namespace para identificar chaves NeuroLearn no Redis
      })
    )
  }
  return _limiters.get(cacheKey)!
}

// ── Interface pública ──────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  limit = MAX_ATTEMPTS,
  windowMs = WINDOW_MS
): Promise<RateLimitResult> {
  if (useUpstash) {
    const limiter = getLimiter(limit, windowMs)
    const { success, remaining, reset } = await limiter.limit(key)
    return {
      allowed: success,
      // reset é timestamp em ms — calcula quanto falta para a janela liberar
      retryAfterMs: success ? 0 : Math.max(0, reset - Date.now()),
      remaining,
    }
  }
  return checkMemory(key, limit, windowMs)
}

// resetRateLimit é síncrono e afeta apenas o store in-memory.
// Usado exclusivamente em testes — em produção com Redis as chaves expiram pelo TTL da janela.
export function resetRateLimit(key: string): void {
  store.delete(key)
}

export function getRateLimitKey(prefix: string, ip: string): string {
  return `${prefix}:${ip}`
}
