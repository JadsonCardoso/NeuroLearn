import { describe, it, expect } from 'vitest'
import { waitlistSchema } from './schemas'

describe('waitlistSchema', () => {
  it('aceita nome e email válidos', () => {
    const result = waitlistSchema.safeParse({ name: 'João Silva', email: 'joao@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = waitlistSchema.safeParse({ name: 'João', email: 'nao-e-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejeita nome vazio', () => {
    const result = waitlistSchema.safeParse({ name: '', email: 'joao@example.com' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejeita nome muito curto (1 char)', () => {
    const result = waitlistSchema.safeParse({ name: 'A', email: 'joao@example.com' })
    expect(result.success).toBe(false)
  })

  it('rejeita campos ausentes', () => {
    expect(waitlistSchema.safeParse({}).success).toBe(false)
    expect(waitlistSchema.safeParse({ name: 'João' }).success).toBe(false)
    expect(waitlistSchema.safeParse({ email: 'x@x.com' }).success).toBe(false)
  })

  it('rejeita email com espaços', () => {
    const result = waitlistSchema.safeParse({ name: 'João', email: 'joao @x.com' })
    expect(result.success).toBe(false)
  })
})
