import { describe, it, expect } from 'vitest'
import { sm2Enhanced } from './sm2'

describe('sm2Enhanced', () => {
  it('quality=4 sem responseTime: incrementa reps e intervalo', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 2, intervalDays: 6, easeFactor: 2.5 })
    expect(r.repetitions).toBe(3)
    expect(r.intervalDays).toBeGreaterThan(6)
    expect(r.mastery).toBe('review')
  })

  it('quality=1: reseta reps para 0 e intervalo para 1', () => {
    const r = sm2Enhanced({ quality: 1, repetitions: 5, intervalDays: 30, easeFactor: 2.5 })
    expect(r.repetitions).toBe(0)
    expect(r.intervalDays).toBe(1)
    expect(r.mastery).toBe('learning')
  })

  it('quality=2: também reseta (< 3)', () => {
    const r = sm2Enhanced({ quality: 2, repetitions: 3, intervalDays: 10, easeFactor: 2.5 })
    expect(r.repetitions).toBe(0)
    expect(r.intervalDays).toBe(1)
  })

  it('quality=3: avança normalmente', () => {
    const r = sm2Enhanced({ quality: 3, repetitions: 0, intervalDays: 1 })
    expect(r.repetitions).toBe(1)
    expect(r.intervalDays).toBe(1)
  })

  it('primeira revisão (reps=0, q≥3): intervalo = 1', () => {
    const r = sm2Enhanced({ quality: 3, repetitions: 0, intervalDays: 1 })
    expect(r.intervalDays).toBe(1)
    expect(r.repetitions).toBe(1)
  })

  it('segunda revisão (reps=1, q≥3): intervalo = 6', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 1, intervalDays: 1 })
    expect(r.intervalDays).toBe(6)
    expect(r.repetitions).toBe(2)
  })

  it('intervalo alto → mastery=strong', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 5, intervalDays: 21, easeFactor: 2.5 })
    expect(r.mastery).toBe('strong')
  })

  it('intervalo entre 6-20 → mastery=review', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 2, intervalDays: 6, easeFactor: 1.5 })
    expect(r.mastery).toBe('review')
  })

  it('intervalo baixo → mastery=learning', () => {
    const r = sm2Enhanced({ quality: 3, repetitions: 0, intervalDays: 1 })
    expect(r.mastery).toBe('learning')
  })

  it('responseTimeMs < 5000: aplica bônus de +0.5 na qualidade', () => {
    // quality=2 + 0.5 = 2.5 → ainda < 3 → reseta
    const r = sm2Enhanced({ quality: 2, repetitions: 5, intervalDays: 20, responseTimeMs: 3000 })
    expect(r.repetitions).toBe(0)

    // quality=3 + 0.5 = 3.5 → maior EF vs sem bônus
    const withBonus = sm2Enhanced({ quality: 3, repetitions: 2, intervalDays: 10, easeFactor: 2.5, responseTimeMs: 4000 })
    const noBonus = sm2Enhanced({ quality: 3, repetitions: 2, intervalDays: 10, easeFactor: 2.5 })
    expect(withBonus.easeFactor).toBeGreaterThan(noBonus.easeFactor)
  })

  it('responseTimeMs ≥ 5000: sem bônus', () => {
    const with5s = sm2Enhanced({ quality: 3, repetitions: 2, intervalDays: 10, easeFactor: 2.5, responseTimeMs: 5000 })
    const noTime = sm2Enhanced({ quality: 3, repetitions: 2, intervalDays: 10, easeFactor: 2.5 })
    expect(with5s.easeFactor).toBeCloseTo(noTime.easeFactor, 5)
  })

  it('easeFactor mínimo nunca cai abaixo de 1.3', () => {
    const r = sm2Enhanced({ quality: 1, easeFactor: 1.3, intervalDays: 1, repetitions: 0 })
    expect(r.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('intervalDays máximo limitado a 365', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 20, intervalDays: 300, easeFactor: 3.0 })
    expect(r.intervalDays).toBeLessThanOrEqual(365)
  })

  it('intervalDays mínimo é 1', () => {
    const r = sm2Enhanced({ quality: 1 })
    expect(r.intervalDays).toBeGreaterThanOrEqual(1)
  })

  it('nextReview é uma data futura', () => {
    const r = sm2Enhanced({ quality: 4, repetitions: 2, intervalDays: 10 })
    expect(r.nextReview.getTime()).toBeGreaterThan(Date.now())
  })

  it('defaults: easeFactor=2.5, intervalDays=1, repetitions=0', () => {
    const r = sm2Enhanced({ quality: 4 })
    expect(r.repetitions).toBe(1)
    expect(r.intervalDays).toBe(1)
  })
})
