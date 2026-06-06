import { describe, it, expect } from 'vitest'
import { calcRetention, calcStability, calcRetentionFromDays } from './retentionModel'
import type { FlashCard } from '@/types'

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c1', cid: 'cnt1', front: 'Q', back: 'A',
    ef: 2.5, interval: 10, reps: 3, mastery: 'review',
    nextReview: null, lastReview: null,
    ...overrides,
  }
}

describe('calcStability', () => {
  it('retorna intervalDays × easeFactor', () => {
    expect(calcStability(10, 2.5)).toBe(25)
    expect(calcStability(6, 2.0)).toBe(12)
  })

  it('com EF=1.3 retorna o mínimo esperado', () => {
    expect(calcStability(10, 1.3)).toBeCloseTo(13)
  })
})

describe('calcRetentionFromDays', () => {
  it('t=0 → retenção 100', () => {
    expect(calcRetentionFromDays(0, 25)).toBe(100)
  })

  it('decaimento exponencial: t=S → ~37%', () => {
    const r = calcRetentionFromDays(25, 25)
    expect(r).toBeCloseTo(37, 0)
  })

  it('t muito grande → retenção próxima de 0', () => {
    expect(calcRetentionFromDays(1000, 10)).toBe(0)
  })

  it('stability=0 → retenção 0', () => {
    expect(calcRetentionFromDays(5, 0)).toBe(0)
  })
})

describe('calcRetention (card)', () => {
  it('card sem lastReview → retenção 0', () => {
    const card = makeCard({ lastReview: null })
    expect(calcRetention(card)).toBe(0)
  })

  it('revisão agora (t≈0) → retenção próxima de 100', () => {
    const card = makeCard({ lastReview: new Date().toISOString(), ef: 2.5, interval: 10 })
    expect(calcRetention(card)).toBeGreaterThanOrEqual(99)
  })

  it('revisão há muito tempo → retenção baixa', () => {
    const oldDate = new Date(Date.now() - 365 * 86_400_000).toISOString()
    const card = makeCard({ lastReview: oldDate, ef: 2.5, interval: 10 })
    expect(calcRetention(card)).toBeLessThan(10)
  })

  it('EF alto mantém retenção melhor ao longo do tempo', () => {
    const lastReview = new Date(Date.now() - 15 * 86_400_000).toISOString()
    const lowEF = makeCard({ lastReview, ef: 1.3, interval: 10 })
    const highEF = makeCard({ lastReview, ef: 3.0, interval: 10 })
    expect(calcRetention(highEF)).toBeGreaterThan(calcRetention(lowEF))
  })

  it('intervalo maior mantém retenção melhor', () => {
    const lastReview = new Date(Date.now() - 5 * 86_400_000).toISOString()
    const shortInterval = makeCard({ lastReview, ef: 2.5, interval: 5 })
    const longInterval = makeCard({ lastReview, ef: 2.5, interval: 30 })
    expect(calcRetention(longInterval)).toBeGreaterThan(calcRetention(shortInterval))
  })
})
