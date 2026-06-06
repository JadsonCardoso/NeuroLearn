// ── Legado — backward compat (imports existentes continuam funcionando) ────
export { sm2 } from './sm2'
export { calcRetention } from './retention'
export { isDue, addDays, relDate } from './scheduling'

// ── Spaced Repetition ─────────────────────────────────────────────────────
export { sm2Enhanced } from './spaced-repetition/sm2'
export type { SM2Input, SM2Output } from './spaced-repetition/sm2'
export { buildReviewQueue } from './spaced-repetition/scheduling'

// ── Retention ─────────────────────────────────────────────────────────────
export {
  calcStability,
  calcRetentionFromDays,
  calcRetention as calcRetentionModel,
} from './retention/retentionModel'
export { calcRiskScore } from './retention/forgettingRisk'
export type { RiskLevel } from './retention/forgettingRisk'

// ── Mastery ───────────────────────────────────────────────────────────────
export { calcCardMasteryScore, calcContentMastery } from './mastery/masteryScore'

// ── Skill Evolution ───────────────────────────────────────────────────────
export { calcSkillEvolution } from './skill-evolution/skillProgression'
export type {
  SkillSnapshot,
  SkillEvolution,
  SkillTrend,
} from './skill-evolution/skillProgression'

// ── Active Learning ───────────────────────────────────────────────────────
export { calcActiveLearningScore } from './active-learning/activeLearningScore'
export type { ActiveLearningInput } from './active-learning/activeLearningScore'

// ── Cognitive Score ───────────────────────────────────────────────────────
export { calcCognitiveScore } from './cognitive-score/cognitiveScore'
export type {
  CognitiveScoreInput,
  CognitiveScoreOutput,
} from './cognitive-score/cognitiveScore'
