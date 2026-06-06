import type { SM2Result } from '@/types'

/**
 * Algoritmo SM-2 de repetição espaçada.
 * quality: 1=esqueci, 2=difícil, 3=bom, 4=fácil
 * Lógica idêntica ao v1.0 — NÃO alterar sem testes.
 */
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
