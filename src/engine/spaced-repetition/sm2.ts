import type { CardMastery, SM2Result } from '@/types'

// Entradas do SM-2 aprimorado com bônus de tempo de resposta
export interface SM2Input {
  quality: 1 | 2 | 3 | 4
  easeFactor?: number
  intervalDays?: number
  repetitions?: number
  responseTimeMs?: number
}

export interface SM2Output {
  easeFactor: number
  intervalDays: number
  repetitions: number
  mastery: CardMastery
  nextReview: Date
}

// SM-2 aprimorado: bônus de +0.5 na qualidade para respostas < 5s
export function sm2Enhanced(input: SM2Input): SM2Output {
  const { quality, easeFactor = 2.5, intervalDays = 1, repetitions = 0, responseTimeMs } = input

  let q: number = quality
  if (responseTimeMs !== undefined && responseTimeMs < 5000) {
    q = Math.min(4, quality + 0.5)
  }

  const nef = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  let ni: number
  let nr: number

  if (q < 3) {
    nr = 0
    ni = 1
  } else {
    nr = repetitions + 1
    if (repetitions === 0) ni = 1
    else if (repetitions === 1) ni = 6
    else ni = Math.round(intervalDays * nef)
  }

  ni = Math.max(1, Math.min(365, ni))

  let mastery: CardMastery
  if (ni >= 21) mastery = 'strong'
  else if (ni >= 6) mastery = 'review'
  else mastery = 'learning'

  const nextReview = new Date(Date.now() + ni * 86_400_000)

  return { easeFactor: nef, intervalDays: ni, repetitions: nr, mastery, nextReview }
}

export function sm2(
  quality: 1 | 2 | 3 | 4,
  ef = 2.5,
  interval = 1,
  reps = 0
): SM2Result {
  const nef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  let ni: number
  let nr: number
  if (quality < 3) {
    nr = 0
    ni = 1
  } else {
    nr = reps + 1
    if (reps === 0) ni = 1
    else if (reps === 1) ni = 6
    else ni = Math.round(interval * nef)
  }
  return { ef: nef, interval: ni, repetitions: nr }
}
