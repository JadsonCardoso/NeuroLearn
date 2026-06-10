import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStreak } from './streakReducer'

describe('calculateStreak', () => {
  const TODAY = '2026-06-09'
  const YESTERDAY = '2026-06-08'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('estudou hoje → sem mudança no streak', () => {
    const result = calculateStreak(TODAY, 5)
    expect(result.streak).toBe(5)
    expect(result.lastStudyDate).toBe(TODAY)
  })

  it('estudou ontem → incrementa streak', () => {
    const result = calculateStreak(YESTERDAY, 3)
    expect(result.streak).toBe(4)
    expect(result.lastStudyDate).toBe(TODAY)
  })

  it('não estudou ontem → reset streak = 1', () => {
    const result = calculateStreak('2026-06-07', 7)
    expect(result.streak).toBe(1)
    expect(result.lastStudyDate).toBe(TODAY)
  })

  it('primeira vez (null) → streak = 1', () => {
    const result = calculateStreak(null, 0)
    expect(result.streak).toBe(1)
    expect(result.lastStudyDate).toBe(TODAY)
  })

  it('streak > 1, estudou ontem → incrementa corretamente', () => {
    const result = calculateStreak(YESTERDAY, 10)
    expect(result.streak).toBe(11)
  })

  it('estudou há 3 dias → reset streak = 1', () => {
    const result = calculateStreak('2026-06-06', 5)
    expect(result.streak).toBe(1)
  })
})
