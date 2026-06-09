// Tipos do módulo de IA Cognitiva — Fase 5

// ── Geração de Flashcards ──────────────────────────────────────────────────

export interface GenerateFlashcardsInput {
  notes: string
  highlights?: string[]
  title: string
  count?: number
}

export interface FlashcardGenerated {
  front: string
  back: string
}

// ── Análise do Modo Professor ──────────────────────────────────────────────

export interface AnalyzeTeachingInput {
  teachText: string
  topic: string
}

export interface TeachAnalysis {
  clarity_score: number
  coverage_score: number
  gaps: string[]
  strengths: string[]
  suggestions: string[]
  estimated_retention: number
}

// ── Cognitive Coach ────────────────────────────────────────────────────────

export interface CoachInput {
  cognitiveScore: number
  retention: number
  mastery: number
  consistency: number
  atRiskCount: number
  daysSinceReview: number
  skillTrend: 'accelerating' | 'stable' | 'decelerating' | 'stalled'
}

export interface CoachResponse {
  message: string
}

// ── Quiz Adaptativo ────────────────────────────────────────────────────────

export interface GenerateQuizInput {
  front: string
  back: string
  count?: number
}

export interface QuizDistractors {
  distractors: string[]
}

// ── Erros ──────────────────────────────────────────────────────────────────

export type AIErrorCode = 'UNAUTHORIZED' | 'RATE_LIMITED' | 'INVALID_INPUT' | 'AI_ERROR' | 'AI_INVALID_OUTPUT'

export interface AIErrorResponse {
  error: string
  code: AIErrorCode
  retryAfter?: number
}

// ── Uso / Tracking ─────────────────────────────────────────────────────────

export interface AIUsageEvent {
  feature: 'flashcard_gen' | 'teach_analysis' | 'coach_gen' | 'quiz_gen'
  inputTokens: number
  outputTokens: number
  cached?: boolean
}
