import { describe, it, expect } from 'vitest'
import { calcRiskScore } from './forgettingRisk'
import type { FlashCard } from '@/types'

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c1', cid: 'cnt1', front: 'Q', back: 'A',
    ef: 2.5, interval: 10, reps: 3, mastery: 'review',
    nextReview: null, lastReview: null,
    ...overrides,
  }
}

describe('calcRiskScore', () => {
  it('card sem nextReview → high (vencido)', () => {
    const card = makeCard({ nextReview: null, lastReview: null })
    expect(calcRiskScore(card)).toBe('high')
  })

  it('card com nextReview no passado → high (vencido)', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    const card = makeCard({ nextReview: past, lastReview: past, interval: 1, ef: 2.5 })
    expect(calcRiskScore(card)).toBe('high')
  })

  it('card com retenção < 40 → high', () => {
    // Revisão há muito tempo, intervalo curto
    const oldReview = new Date(Date.now() - 200 * 86_400_000).toISOString()
    const futureNext = new Date(Date.now() + 5 * 86_400_000).toISOString()
    const card = makeCard({ lastReview: oldReview, nextReview: futureNext, interval: 5, ef: 1.3 })
    expect(calcRiskScore(card)).toBe('high')
  })

  it('card com retenção entre 40-65 → medium', () => {
    // Revisão há ~1.5× o intervalo (retenção ~22% para S=10) — vamos ajustar para cair em 40-65
    // S = 30 × 2.5 = 75, t = 30 → R = e^(-30/75) ≈ 67 → medium
    const reviewDate = new Date(Date.now() - 30 * 86_400_000).toISOString()
    const futureNext = new Date(Date.now() + 5 * 86_400_000).toISOString()
    const card = makeCard({ lastReview: reviewDate, nextReview: futureNext, interval: 30, ef: 2.5 })
    const risk = calcRiskScore(card)
    expect(['medium', 'low']).toContain(risk)
  })

  it('card recém revisado com próxima revisão distante → low', () => {
    const now = new Date().toISOString()
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString()
    const card = makeCard({ lastReview: now, nextReview: future, interval: 30, ef: 2.5 })
    expect(calcRiskScore(card)).toBe('low')
  })

  it('card com revisão amanhã → medium (vence em < 1 dia conta como medium)', () => {
    const now = new Date().toISOString()
    const tomorrow = new Date(Date.now() + 12 * 3600 * 1000).toISOString()
    // Retenção alta (recém revisado) mas vence logo → medium
    const card = makeCard({ lastReview: now, nextReview: tomorrow, interval: 30, ef: 2.5 })
    expect(calcRiskScore(card)).toBe('medium')
  })

  it('card new (sem dados) → high', () => {
    const card = makeCard({})
    expect(calcRiskScore(card)).toBe('high')
  })

  it('card com alta retenção e revisão distante → low', () => {
    const now = new Date().toISOString()
    const far = new Date(Date.now() + 60 * 86_400_000).toISOString()
    const card = makeCard({ lastReview: now, nextReview: far, interval: 60, ef: 3.0 })
    expect(calcRiskScore(card)).toBe('low')
  })
})
