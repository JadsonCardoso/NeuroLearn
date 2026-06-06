import { describe, it, expect } from 'vitest'
import { calcCognitiveScore } from './cognitiveScore'

describe('calcCognitiveScore', () => {
  it('todos inputs = 100 e consistência perfeita → score 100', () => {
    const r = calcCognitiveScore({
      retention: 100, mastery: 100,
      reviewsLast30Days: 10, expectedReviews: 10,
      activeLearning: 100,
    })
    expect(r.score).toBe(100)
    expect(r.consistency).toBe(100)
  })

  it('todos zeros → score 0', () => {
    const r = calcCognitiveScore({
      retention: 0, mastery: 0,
      reviewsLast30Days: 0, expectedReviews: 10,
      activeLearning: 0,
    })
    expect(r.score).toBe(0)
    expect(r.consistency).toBe(0)
  })

  it('expectedReviews = 0 → consistency = 0 (sem divisão por zero)', () => {
    const r = calcCognitiveScore({
      retention: 100, mastery: 100,
      reviewsLast30Days: 5, expectedReviews: 0,
      activeLearning: 100,
    })
    expect(r.consistency).toBe(0)
  })

  it('pesos corretos: apenas retenção=100 → score = 35', () => {
    const r = calcCognitiveScore({
      retention: 100, mastery: 0,
      reviewsLast30Days: 0, expectedReviews: 10,
      activeLearning: 0,
    })
    expect(r.score).toBe(35)
    expect(r.breakdown.retention).toBe(35)
    expect(r.breakdown.mastery).toBe(0)
    expect(r.breakdown.consistency).toBe(0)
    expect(r.breakdown.activeLearning).toBe(0)
  })

  it('pesos corretos: apenas mastery=100 → score = 30', () => {
    const r = calcCognitiveScore({
      retention: 0, mastery: 100,
      reviewsLast30Days: 0, expectedReviews: 10,
      activeLearning: 0,
    })
    expect(r.score).toBe(30)
  })

  it('consistência limitada a 100 mesmo com reviews acima do esperado', () => {
    const r = calcCognitiveScore({
      retention: 0, mastery: 0,
      reviewsLast30Days: 100, expectedReviews: 10,
      activeLearning: 0,
    })
    expect(r.consistency).toBe(100)
    expect(r.score).toBe(20) // só consistency×0.20 = 100×0.20 = 20
  })

  it('breakdown soma = score (arredondamento pode ter 1 de diferença)', () => {
    const r = calcCognitiveScore({
      retention: 80, mastery: 70,
      reviewsLast30Days: 8, expectedReviews: 10,
      activeLearning: 60,
    })
    const sumBreakdown = r.breakdown.retention + r.breakdown.mastery +
      r.breakdown.consistency + r.breakdown.activeLearning
    expect(Math.abs(r.score - sumBreakdown)).toBeLessThanOrEqual(2)
  })

  it('score nunca ultrapassa 100', () => {
    const r = calcCognitiveScore({
      retention: 100, mastery: 100,
      reviewsLast30Days: 999, expectedReviews: 10,
      activeLearning: 100,
    })
    expect(r.score).toBeLessThanOrEqual(100)
  })
})
