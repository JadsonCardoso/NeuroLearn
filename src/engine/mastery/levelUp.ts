import type { Skill } from '@/types'

type LevelUpFields = Pick<Skill, 'xp' | 'level' | 'maxXp'>

export function calculateLevelUp<T extends LevelUpFields>(skill: T): T {
  if (skill.xp >= skill.maxXp && skill.level < 5) {
    return {
      ...skill,
      xp: skill.xp - skill.maxXp,
      level: skill.level + 1,
      maxXp: skill.maxXp + 100,
    }
  }
  return skill
}
