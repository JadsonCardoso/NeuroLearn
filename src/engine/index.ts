// ── Spaced Repetition ─────────────────────────────────────────────────────
export { sm2, sm2Enhanced } from './spaced-repetition/sm2'
export type { SM2Input, SM2Output } from './spaced-repetition/sm2'
export { buildReviewQueue, isDue, addDays, relDate } from './spaced-repetition/scheduling'

// ── Retention ─────────────────────────────────────────────────────────────
export {
  calcStability,
  calcRetentionFromDays,
  calcRetention,
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
