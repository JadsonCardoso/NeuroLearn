import { describe, it, expect } from 'vitest'
import { buildReviewQueue } from './scheduling'
import type { FlashCard } from '@/types'

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id, cid: 'cnt1', front: 'Q', back: 'A',
    ef: 2.5, interval: 30, reps: 5, mastery: 'strong',
    nextReview: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    lastReview: new Date().toISOString(),
    ...overrides,
  }
}

describe('buildReviewQueue', () => {
  it('retorna array vazio para input vazio', () => {
    expect(buildReviewQueue([])).toEqual([])
  })

  it('card de risco high vem antes de medium', () => {
    const overdueCard = makeCard('overdue', {
      nextReview: new Date(Date.now() - 86_400_000).toISOString(),
      lastReview: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      interval: 1, ef: 1.3, mastery: 'learning',
    })
    const okCard = makeCard('ok')
    const queue = buildReviewQueue([okCard, overdueCard])
    expect(queue[0].id).toBe('overdue')
  })

  it('card medium vem antes de low', () => {
    const nowIso = new Date().toISOString()
    const tomorrowIso = new Date(Date.now() + 12 * 3600 * 1000).toISOString()
    // medium: recém revisado mas vence em < 24h
    const mediumCard = makeCard('med', {
      lastReview: nowIso,
      nextReview: tomorrowIso,
      interval: 30, ef: 2.5,
    })
    const lowCard = makeCard('low', {
      lastReview: nowIso,
      nextReview: new Date(Date.now() + 60 * 86_400_000).toISOString(),
      interval: 60, ef: 3.0,
    })
    const queue = buildReviewQueue([lowCard, mediumCard])
    expect(queue[0].id).toBe('med')
  })

  it('cards de mesmo risco ordenados por data (mais atrasado primeiro)', () => {
    const nowIso = new Date().toISOString()
    const a = makeCard('A', {
      lastReview: nowIso,
      nextReview: new Date(Date.now() + 60 * 86_400_000).toISOString(),
      interval: 60, ef: 3.0,
    })
    const b = makeCard('B', {
      lastReview: nowIso,
      nextReview: new Date(Date.now() + 90 * 86_400_000).toISOString(),
      interval: 90, ef: 3.0,
    })
    const queue = buildReviewQueue([b, a])
    expect(queue[0].id).toBe('A')
  })

  it('não muta o array original', () => {
    const cards = [makeCard('x'), makeCard('y')]
    const original = [...cards]
    buildReviewQueue(cards)
    expect(cards[0].id).toBe(original[0].id)
  })

  it('todos high, ordena por data', () => {
    const older = makeCard('old', {
      nextReview: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      lastReview: new Date(Date.now() - 10 * 86_400_000).toISOString(),
      interval: 1, ef: 1.3, mastery: 'learning',
    })
    const newer = makeCard('new', {
      nextReview: new Date(Date.now() - 86_400_000).toISOString(),
      lastReview: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      interval: 1, ef: 1.3, mastery: 'learning',
    })
    const queue = buildReviewQueue([newer, older])
    expect(queue[0].id).toBe('old')
  })

  it('preserva todos os cards na saída', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c')]
    expect(buildReviewQueue(cards)).toHaveLength(3)
  })

  it('card único retorna com 1 elemento', () => {
    expect(buildReviewQueue([makeCard('solo')])).toHaveLength(1)
  })
})
