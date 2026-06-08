import { describe, it, expect } from 'vitest'
import { generateQuizSchema } from '../validation'

// ── generateQuizSchema ─────────────────────────────────────────────────────
// Valida os inputs para /api/ai/generate-quiz

describe('generateQuizSchema', () => {
  // ── casos válidos ────────────────────────────────────────────────────────

  it('aceita input mínimo válido (count 1)', () => {
    const result = generateQuizSchema.safeParse({ front: 'O que é fotossíntese?', back: 'Processo de conversão de luz em energia', count: 1 })
    expect(result.success).toBe(true)
  })

  it('aceita input máximo válido (count 5)', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'back', count: 5 })
    expect(result.success).toBe(true)
  })

  it('aplica default 3 quando count é omitido', () => {
    const result = generateQuizSchema.safeParse({ front: 'f', back: 'b' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.count).toBe(3)
  })

  it('aceita strings longas até o limite (1000 chars)', () => {
    const longStr = 'a'.repeat(1000)
    const result = generateQuizSchema.safeParse({ front: longStr, back: longStr, count: 3 })
    expect(result.success).toBe(true)
  })

  // ── frente do card ────────────────────────────────────────────────────────

  it('rejeita front vazio', () => {
    const result = generateQuizSchema.safeParse({ front: '', back: 'back', count: 3 })
    expect(result.success).toBe(false)
  })

  it('rejeita front com mais de 1000 caracteres', () => {
    const result = generateQuizSchema.safeParse({ front: 'a'.repeat(1001), back: 'back', count: 3 })
    expect(result.success).toBe(false)
  })

  // ── verso do card ─────────────────────────────────────────────────────────

  it('rejeita back vazio', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: '', count: 3 })
    expect(result.success).toBe(false)
  })

  it('rejeita back com mais de 1000 caracteres', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'b'.repeat(1001), count: 3 })
    expect(result.success).toBe(false)
  })

  // ── count ─────────────────────────────────────────────────────────────────

  it('rejeita count 0 (abaixo do mínimo)', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'back', count: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita count 6 (acima do máximo 5)', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'back', count: 6 })
    expect(result.success).toBe(false)
  })

  it('rejeita count decimal (deve ser inteiro)', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'back', count: 2.5 })
    expect(result.success).toBe(false)
  })

  it('rejeita count negativo', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', back: 'back', count: -1 })
    expect(result.success).toBe(false)
  })

  // ── campos ausentes ───────────────────────────────────────────────────────

  it('rejeita payload sem front', () => {
    const result = generateQuizSchema.safeParse({ back: 'back', count: 3 })
    expect(result.success).toBe(false)
  })

  it('rejeita payload sem back', () => {
    const result = generateQuizSchema.safeParse({ front: 'front', count: 3 })
    expect(result.success).toBe(false)
  })

  it('rejeita payload completamente vazio', () => {
    const result = generateQuizSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
