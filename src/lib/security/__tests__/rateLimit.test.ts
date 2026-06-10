import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from '../rateLimit'

describe('checkRateLimit', () => {
  const KEY = 'test:127.0.0.1'

  beforeEach(() => resetRateLimit(KEY))

  it('primeira tentativa é sempre permitida', async () => {
    const r = await checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(4)
  })

  it('dentro do limite é permitido', async () => {
    for (let i = 0; i < 4; i++) await checkRateLimit(KEY, 5, 60000)
    const r = await checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(0)
  })

  it('acima do limite é bloqueado', async () => {
    for (let i = 0; i < 5; i++) await checkRateLimit(KEY, 5, 60000)
    const r = await checkRateLimit(KEY, 5, 60000)
    expect(r.allowed).toBe(false)
    expect(r.remaining).toBe(0)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('janela expirada reseta o contador', async () => {
    for (let i = 0; i < 5; i++) await checkRateLimit(KEY, 5, 1)
    await new Promise((r) => setTimeout(r, 10))
    const result = await checkRateLimit(KEY, 5, 1)
    expect(result.allowed).toBe(true)
  })

  it('IPs diferentes têm limites independentes', async () => {
    const keyA = 'test:1.1.1.1'
    const keyB = 'test:2.2.2.2'
    resetRateLimit(keyA)
    resetRateLimit(keyB)

    for (let i = 0; i < 5; i++) await checkRateLimit(keyA, 5, 60000)
    const blockedA = await checkRateLimit(keyA, 5, 60000)
    const okB = await checkRateLimit(keyB, 5, 60000)

    expect(blockedA.allowed).toBe(false)
    expect(okB.allowed).toBe(true)

    resetRateLimit(keyA)
    resetRateLimit(keyB)
  })

  it('resetRateLimit libera o limite imediatamente', async () => {
    for (let i = 0; i < 5; i++) await checkRateLimit(KEY, 5, 60000)
    resetRateLimit(KEY)
    expect((await checkRateLimit(KEY, 5, 60000)).allowed).toBe(true)
  })
})
