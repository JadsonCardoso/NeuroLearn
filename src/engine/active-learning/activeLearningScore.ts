// Dimensões da Pirâmide de Glasser para calcular o score de aprendizagem ativa
export interface ActiveLearningInput {
  hasNotes: boolean          // 10%: anotações feitas
  hasHighlights: boolean     // 20%: destaques realizados
  teachingText: string       // 30%: texto de ensino (>50 chars = completo)
  activeRecallCount: number  // 40%: revisões ativas (≥3 = completo)
}

// Score 0–100 baseado na profundidade de engajamento com o conteúdo
export function calcActiveLearningScore(input: ActiveLearningInput): number {
  const notesScore = input.hasNotes ? 10 : 0
  const highlightScore = input.hasHighlights ? 20 : 0
  const teachingScore =
    input.teachingText.length > 50 ? 30 : (input.teachingText.length / 50) * 30
  const recallScore = Math.min(1, input.activeRecallCount / 3) * 40

  return Math.round(notesScore + highlightScore + teachingScore + recallScore)
}
