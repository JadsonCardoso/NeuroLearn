// Entradas para o cálculo do score cognitivo global
export interface CognitiveScoreInput {
  retention: number          // 0–100: retenção média dos cards
  mastery: number            // 0–100: domínio médio dos conteúdos
  reviewsLast30Days: number  // revisões realizadas nos últimos 30 dias
  expectedReviews: number    // revisões esperadas no período (baseado na fila SM-2)
  activeLearning: number     // 0–100: score de aprendizagem ativa
}

export interface CognitiveScoreOutput {
  score: number
  consistency: number
  breakdown: {
    retention: number
    mastery: number
    consistency: number
    activeLearning: number
  }
}

// Score cognitivo = retenção×0.35 + domínio×0.30 + consistência×0.20 + aprendizagem ativa×0.15
export function calcCognitiveScore(input: CognitiveScoreInput): CognitiveScoreOutput {
  const consistency =
    input.expectedReviews > 0
      ? Math.min(100, Math.round((input.reviewsLast30Days / input.expectedReviews) * 100))
      : 0

  const score = Math.round(
    input.retention * 0.35 +
      input.mastery * 0.3 +
      consistency * 0.2 +
      input.activeLearning * 0.15,
  )

  return {
    score,
    consistency,
    breakdown: {
      retention: Math.round(input.retention * 0.35),
      mastery: Math.round(input.mastery * 0.3),
      consistency: Math.round(consistency * 0.2),
      activeLearning: Math.round(input.activeLearning * 0.15),
    },
  }
}
