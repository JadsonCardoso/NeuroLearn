import { describe, it, expect } from 'vitest'
import { calcSkillEvolution } from './skillProgression'

describe('calcSkillEvolution', () => {
  it('sem ganhos → stalled, velocity=0, daysToLevelUp=-1', () => {
    const r = calcSkillEvolution({ xp: 50, level: 1, maxXp: 100, recentXpGains: [] })
    expect(r.velocity).toBe(0)
    expect(r.daysToLevelUp).toBe(-1)
    expect(r.trend).toBe('stalled')
  })

  it('ganhos uniformes → stable', () => {
    const r = calcSkillEvolution({
      xp: 50, level: 1, maxXp: 100,
      recentXpGains: [10, 10, 10, 10, 10, 10, 10],
    })
    expect(r.trend).toBe('stable')
    expect(r.velocity).toBeCloseTo(10)
  })

  it('ganhos crescentes → accelerating', () => {
    const r = calcSkillEvolution({
      xp: 50, level: 1, maxXp: 100,
      recentXpGains: [20, 20, 20, 5, 5, 5, 5], // recente alto, antigo baixo
    })
    expect(r.trend).toBe('accelerating')
  })

  it('ganhos decrescentes → decelerating', () => {
    const r = calcSkillEvolution({
      xp: 50, level: 1, maxXp: 100,
      recentXpGains: [2, 2, 2, 20, 20, 20, 20], // recente baixo, antigo alto
    })
    expect(r.trend).toBe('decelerating')
  })

  it('velocity calcula média diária corretamente', () => {
    const r = calcSkillEvolution({
      xp: 0, level: 1, maxXp: 100,
      recentXpGains: [10, 20, 30],
    })
    expect(r.velocity).toBeCloseTo(20, 1)
  })

  it('daysToLevelUp calculado com base na velocity', () => {
    const r = calcSkillEvolution({
      xp: 90, level: 1, maxXp: 100,
      recentXpGains: [5, 5, 5, 5],
    })
    expect(r.daysToLevelUp).toBe(2) // 10 XP faltando ÷ 5/dia = 2 dias
  })

  it('xp = maxXp → daysToLevelUp = 0', () => {
    const r = calcSkillEvolution({
      xp: 100, level: 1, maxXp: 100,
      recentXpGains: [10, 10, 10],
    })
    expect(r.daysToLevelUp).toBe(0)
  })
})
