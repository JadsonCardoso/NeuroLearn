// Snapshot de estado de uma skill para cálculo de evolução
export interface SkillSnapshot {
  xp: number
  level: number
  maxXp: number
  recentXpGains: number[] // XP ganho nos últimos 7 dias (índice 0 = mais recente)
}

export type SkillTrend = 'accelerating' | 'stable' | 'decelerating' | 'stalled'

export interface SkillEvolution {
  velocity: number        // XP médio por dia
  daysToLevelUp: number   // dias estimados até próximo nível (-1 se velocity=0)
  trend: SkillTrend
}

// Calcula evolução da skill com base no histórico recente de XP
export function calcSkillEvolution(snapshot: SkillSnapshot): SkillEvolution {
  const gains = snapshot.recentXpGains.slice(0, 7)

  const velocity =
    gains.length > 0 ? gains.reduce((s, x) => s + x, 0) / gains.length : 0

  const xpNeeded = Math.max(0, snapshot.maxXp - snapshot.xp)
  const daysToLevelUp = velocity > 0 ? Math.ceil(xpNeeded / velocity) : -1

  let trend: SkillTrend
  if (velocity === 0) {
    trend = 'stalled'
  } else {
    const half = Math.floor(gains.length / 2)
    const recent = gains.slice(0, Math.max(1, half))
    const older = gains.slice(Math.max(1, half))
    const recentAvg = recent.reduce((s, x) => s + x, 0) / recent.length
    const olderAvg = older.length ? older.reduce((s, x) => s + x, 0) / older.length : recentAvg

    if (recentAvg > olderAvg * 1.2) trend = 'accelerating'
    else if (recentAvg < olderAvg * 0.8) trend = 'decelerating'
    else trend = 'stable'
  }

  return { velocity, daysToLevelUp, trend }
}
