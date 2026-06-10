import { describe, it, expect } from 'vitest'
import { calculateLevelUp } from './levelUp'
import type { Skill } from '@/types'

function mkSkill(xp: number, level: number, maxXp: number): Skill {
  return { id: '1', name: 'Test', cat: 'tech', color: '#fff', xp, level, maxXp }
}

describe('calculateLevelUp', () => {
  it('XP abaixo do threshold → sem mudança', () => {
    const s = mkSkill(50, 1, 100)
    expect(calculateLevelUp(s)).toEqual(s)
  })

  it('XP exato no threshold → sobe de nível', () => {
    const result = calculateLevelUp(mkSkill(100, 1, 100))
    expect(result.level).toBe(2)
    expect(result.xp).toBe(0)
    expect(result.maxXp).toBe(200)
  })

  it('XP acima do threshold → sobe e mantém saldo', () => {
    const result = calculateLevelUp(mkSkill(150, 1, 100))
    expect(result.level).toBe(2)
    expect(result.xp).toBe(50)
    expect(result.maxXp).toBe(200)
  })

  it('nível 5 → não ultrapassa o máximo', () => {
    const s = mkSkill(500, 5, 100)
    const result = calculateLevelUp(s)
    expect(result.level).toBe(5)
    expect(result.xp).toBe(500)
  })

  it('nível 1 → 2 com XP correto', () => {
    const result = calculateLevelUp(mkSkill(100, 1, 100))
    expect(result.level).toBe(2)
    expect(result.xp).toBe(0)
    expect(result.maxXp).toBe(200)
  })

  it('XP acumulado requer 2 chamadas para nível 1 → 2 → 3', () => {
    const s2 = calculateLevelUp(mkSkill(100, 1, 100))
    const s3 = calculateLevelUp({ ...s2, xp: 200 })
    expect(s3.level).toBe(3)
    expect(s3.xp).toBe(0)
    expect(s3.maxXp).toBe(300)
  })
})
