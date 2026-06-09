import { describe, it, expect } from 'vitest'
import {
  generateQuizSchema,
  generateFlashcardsOutputSchema,
  generateQuizOutputSchema,
  analyzeTeachingOutputSchema,
  coachOutputSchema,
} from '../validation'

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

// ── generateFlashcardsOutputSchema ────────────────────────────────────────────

describe('generateFlashcardsOutputSchema', () => {
  it('aceita output válido com 1 card', () => {
    const result = generateFlashcardsOutputSchema.safeParse({
      cards: [{ front: 'O que é DNA?', back: 'Ácido desoxirribonucleico' }],
    })
    expect(result.success).toBe(true)
  })

  it('aceita output com 20 cards (contagem típica)', () => {
    const cards = Array.from({ length: 20 }, (_, i) => ({ front: `P${i}`, back: `R${i}` }))
    const result = generateFlashcardsOutputSchema.safeParse({ cards })
    expect(result.success).toBe(true)
  })

  it('aceita output com 21 cards (AI pode retornar ligeiramente acima do count)', () => {
    const cards = Array.from({ length: 21 }, (_, i) => ({ front: `P${i}`, back: `R${i}` }))
    const result = generateFlashcardsOutputSchema.safeParse({ cards })
    expect(result.success).toBe(true)
  })

  it('rejeita array vazio de cards', () => {
    const result = generateFlashcardsOutputSchema.safeParse({ cards: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita mais de 30 cards (limite de segurança anti-resposta malformada)', () => {
    const cards = Array.from({ length: 31 }, (_, i) => ({ front: `P${i}`, back: `R${i}` }))
    const result = generateFlashcardsOutputSchema.safeParse({ cards })
    expect(result.success).toBe(false)
  })

  it('rejeita card com front vazio', () => {
    const result = generateFlashcardsOutputSchema.safeParse({
      cards: [{ front: '', back: 'resposta' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita card com back vazio', () => {
    const result = generateFlashcardsOutputSchema.safeParse({
      cards: [{ front: 'pergunta', back: '' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita output sem campo cards', () => {
    const result = generateFlashcardsOutputSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejeita cards sem campo back', () => {
    const result = generateFlashcardsOutputSchema.safeParse({
      cards: [{ front: 'pergunta' }],
    })
    expect(result.success).toBe(false)
  })
})

// ── generateQuizOutputSchema ──────────────────────────────────────────────────

describe('generateQuizOutputSchema', () => {
  it('aceita 1 distrator (mínimo)', () => {
    const result = generateQuizOutputSchema.safeParse({ distractors: ['resposta errada'] })
    expect(result.success).toBe(true)
  })

  it('aceita 5 distratores', () => {
    const result = generateQuizOutputSchema.safeParse({
      distractors: ['d1', 'd2', 'd3', 'd4', 'd5'],
    })
    expect(result.success).toBe(true)
  })

  it('aceita 6 distratores (slicing feito pela rota após validação)', () => {
    const result = generateQuizOutputSchema.safeParse({
      distractors: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita array vazio de distratores', () => {
    const result = generateQuizOutputSchema.safeParse({ distractors: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita distrator com string vazia', () => {
    const result = generateQuizOutputSchema.safeParse({ distractors: ['válido', ''] })
    expect(result.success).toBe(false)
  })

  it('rejeita output sem campo distractors', () => {
    const result = generateQuizOutputSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ── analyzeTeachingOutputSchema ───────────────────────────────────────────────

describe('analyzeTeachingOutputSchema', () => {
  const validAnalysis = {
    clarity_score: 85,
    coverage_score: 70,
    gaps: ['Faltou mencionar mitocôndrias'],
    strengths: ['Boa estrutura'],
    suggestions: ['Adicionar exemplos'],
    estimated_retention: 75,
  }

  it('aceita análise válida', () => {
    const result = analyzeTeachingOutputSchema.safeParse(validAnalysis)
    expect(result.success).toBe(true)
  })

  it('clampeia clarity_score acima de 100 para 100', () => {
    const result = analyzeTeachingOutputSchema.safeParse({ ...validAnalysis, clarity_score: 115 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.clarity_score).toBe(100)
  })

  it('clampeia coverage_score abaixo de 0 para 0', () => {
    const result = analyzeTeachingOutputSchema.safeParse({ ...validAnalysis, coverage_score: -10 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.coverage_score).toBe(0)
  })

  it('clampeia estimated_retention fora do range', () => {
    const result = analyzeTeachingOutputSchema.safeParse({ ...validAnalysis, estimated_retention: 200 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.estimated_retention).toBe(100)
  })

  it('aceita arrays vazios para gaps, strengths, suggestions', () => {
    const result = analyzeTeachingOutputSchema.safeParse({
      ...validAnalysis, gaps: [], strengths: [], suggestions: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita output sem clarity_score', () => {
    const result = analyzeTeachingOutputSchema.safeParse({
      coverage_score: 70,
      gaps: ['lacuna'],
      strengths: ['ponto forte'],
      suggestions: ['sugestão'],
      estimated_retention: 75,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita clarity_score como string', () => {
    const result = analyzeTeachingOutputSchema.safeParse({ ...validAnalysis, clarity_score: 'alto' })
    expect(result.success).toBe(false)
  })

  it('rejeita output sem campo strengths', () => {
    const result = analyzeTeachingOutputSchema.safeParse({
      clarity_score: 85,
      coverage_score: 70,
      gaps: ['lacuna'],
      suggestions: ['sugestão'],
      estimated_retention: 75,
    })
    expect(result.success).toBe(false)
  })
})

// ── coachOutputSchema ─────────────────────────────────────────────────────────

describe('coachOutputSchema', () => {
  it('aceita mensagem válida', () => {
    const result = coachOutputSchema.safeParse({ message: 'Continue com a consistência!' })
    expect(result.success).toBe(true)
  })

  it('aceita mensagem de 1 caractere (mínimo)', () => {
    const result = coachOutputSchema.safeParse({ message: 'A' })
    expect(result.success).toBe(true)
  })

  it('aceita mensagem de 2000 caracteres (máximo)', () => {
    const result = coachOutputSchema.safeParse({ message: 'x'.repeat(2000) })
    expect(result.success).toBe(true)
  })

  it('rejeita mensagem vazia', () => {
    const result = coachOutputSchema.safeParse({ message: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita mensagem acima de 2000 caracteres', () => {
    const result = coachOutputSchema.safeParse({ message: 'x'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('rejeita output sem campo message', () => {
    const result = coachOutputSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejeita message como número', () => {
    const result = coachOutputSchema.safeParse({ message: 42 })
    expect(result.success).toBe(false)
  })
})
