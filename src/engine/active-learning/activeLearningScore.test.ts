import { describe, it, expect } from 'vitest'
import { calcActiveLearningScore } from './activeLearningScore'

describe('calcActiveLearningScore', () => {
  it('todos zeros → score 0', () => {
    expect(calcActiveLearningScore({
      hasNotes: false, hasHighlights: false,
      teachingText: '', activeRecallCount: 0,
    })).toBe(0)
  })

  it('todos completos → score 100', () => {
    expect(calcActiveLearningScore({
      hasNotes: true, hasHighlights: true,
      teachingText: 'x'.repeat(51), activeRecallCount: 3,
    })).toBe(100)
  })

  it('hasNotes=true → +10', () => {
    const base = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    const withNotes = calcActiveLearningScore({ hasNotes: true, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    expect(withNotes - base).toBe(10)
  })

  it('hasHighlights=true → +20', () => {
    const base = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    const withHL = calcActiveLearningScore({ hasNotes: false, hasHighlights: true, teachingText: '', activeRecallCount: 0 })
    expect(withHL - base).toBe(20)
  })

  it('teachingText > 50 chars → +30', () => {
    const base = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    const withTeach = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: 'x'.repeat(51), activeRecallCount: 0 })
    expect(withTeach - base).toBe(30)
  })

  it('teachingText parcial (25 chars) → +15', () => {
    const base = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    const partial = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: 'x'.repeat(25), activeRecallCount: 0 })
    expect(partial - base).toBe(15)
  })

  it('activeRecallCount=3 → +40', () => {
    const base = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 0 })
    const withRecall = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 3 })
    expect(withRecall - base).toBe(40)
  })

  it('activeRecallCount > 3 → mesmos 40 (cap em 3)', () => {
    const at3 = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 3 })
    const at10 = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 10 })
    expect(at3).toBe(at10)
  })

  it('activeRecallCount=1 → 1/3 × 40 ≈ 13', () => {
    const r = calcActiveLearningScore({ hasNotes: false, hasHighlights: false, teachingText: '', activeRecallCount: 1 })
    expect(r).toBe(13)
  })
})
