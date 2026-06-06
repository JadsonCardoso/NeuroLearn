import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from '../rateLimit'

describe('checkRateLimit', () => {
  const KEY = 'test:127.0.0.1'

  beforeEach(() => resetRateLimit(KEY))

  it('primeira tentativa é sempre permitida', () => {
    const r = checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(4)
  })

  it('dentro do limite é permitido', () => {
    for (let i = 0; i < 4; i++) checkRateLimit(KEY, 5, 60000)
    const r = checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(0)
  })

  it('acima do limite é bloqueado', () => {
    for (let i = 0; i < 5; i++) checkRateLimit(KEY, 5, 60000)
    const r = checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(false)
    expect(r.remaining).toBe(0)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('janela expirada reseta o contador', async () => {
    for (let i = 0; i < 5; i++) checkRateLimit(KEY, 5, 1)
    // Garante que 1ms passou antes de checar novamente
    await new Promise((r) => setTimeout(r, 10))
    const result = checkRateLimit(KEY, 5, 1)
    expect(result.allowed).toBe(true)
  })

  it('IPs diferentes têm limites independentes', () => {
    const keyA = 'test:1.1.1.1'
    const keyB = 'test:2.2.2.2'
    resetRateLimit(keyA)
    resetRateLimit(keyB)

    for (let i = 0; i < 5; i++) checkRateLimit(keyA, 5, 60000)
    const blockedA = checkRateLimit(keyA, 5, 60000)
    const okB = checkRateLimit(keyB, 5, 60000)

    expect(blockedA.allowed).toBe(false)
    expect(okB.allowed).toBe(true)

    resetRateLimit(keyA)
    resetRateLimit(keyB)
  })

  it('resetRateLimit libera o limite imediatamente', () => {
    for (let i = 0; i < 5; i++) checkRateLimit(KEY, 5, 60000)
    resetRateLimit(KEY)
    expect(checkRateLimit(KEY, 5, 60000).allowed).toBe(true)
  })
})
