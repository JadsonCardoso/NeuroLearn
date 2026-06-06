import { describe, it, expect } from 'vitest'
import { calcCardMasteryScore, calcContentMastery } from './masteryScore'
import type { FlashCard } from '@/types'

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c1', cid: 'cnt1', front: 'Q', back: 'A',
    ef: 2.5, interval: 10, reps: 3, mastery: 'review',
    nextReview: new Date(Date.now() + 10 * 86_400_000).toISOString(),
    lastReview: new Date().toISOString(),
    ...overrides,
  }
}

describe('calcCardMasteryScore', () => {
  it('mastery=new → score 0', () => {
    const card = makeCard({ mastery: 'new', lastReview: null })
    expect(calcCardMasteryScore(card)).toBe(0)
  })

  it('mastery=learning + alta retenção → ~25', () => {
    const card = makeCard({ mastery: 'learning', interval: 6, ef: 2.5 })
    const score = calcCardMasteryScore(card)
    expect(score).toBeGreaterThanOrEqual(20)
    expect(score).toBeLessThanOrEqual(25)
  })

  it('mastery=review + alta retenção → ~50', () => {
    const card = makeCard({ mastery: 'review', interval: 10, ef: 2.5 })
    const score = calcCardMasteryScore(card)
    expect(score).toBeGreaterThanOrEqual(45)
    expect(score).toBeLessThanOrEqual(50)
  })

  it('mastery=strong + alta retenção → ~75', () => {
    const card = makeCard({ mastery: 'strong', interval: 30, ef: 2.5 })
    const score = calcCardMasteryScore(card)
    expect(score).toBeGreaterThanOrEqual(70)
    expect(score).toBeLessThanOrEqual(75)
  })

  it('mastery=strong + baixa retenção → score reduzido', () => {
    const oldDate = new Date(Date.now() - 200 * 86_400_000).toISOString()
    const card = makeCard({ mastery: 'strong', lastReview: oldDate, interval: 10, ef: 2.5 })
    expect(calcCardMasteryScore(card)).toBeLessThan(10)
  })

  it('card sem lastReview + mastery≠new → score 0 (sem retenção)', () => {
    const card = makeCard({ mastery: 'review', lastReview: null })
    expect(calcCardMasteryScore(card)).toBe(0)
  })
})

describe('calcContentMastery', () => {
  it('sem cards → 0', () => {
    expect(calcContentMastery([])).toBe(0)
  })

  it('média dos scores dos cards', () => {
    const now = new Date().toISOString()
    const cardA = makeCard({ mastery: 'new', lastReview: null })
    const cardB = makeCard({ mastery: 'strong', interval: 30, ef: 2.5, lastReview: now })
    const score = calcContentMastery([cardA, cardB])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(75)
  })

  it('todos strong + alta retenção → score alto', () => {
    const now = new Date().toISOString()
    const cards = [
      makeCard({ mastery: 'strong', interval: 30, ef: 2.5, lastReview: now }),
      makeCard({ mastery: 'strong', interval: 30, ef: 2.5, lastReview: now }),
    ]
    expect(calcContentMastery(cards)).toBeGreaterThanOrEqual(70)
  })
})
