// Schemas Zod para validação de inputs das rotas de IA
import { z } from 'zod'

export const generateFlashcardsSchema = z.object({
  notes: z.string().min(50, 'Anotações precisam ter ao menos 50 caracteres').max(10000),
  highlights: z.array(z.string().max(500)).max(50).default([]),
  title: z.string().min(1, 'Título obrigatório').max(200),
  count: z.number().int().min(1).max(20).default(5),
})

export const analyzeTeachingSchema = z.object({
  teachText: z.string().min(30, 'Explicação precisa ter ao menos 30 caracteres').max(5000),
  topic: z.string().min(1, 'Tópico obrigatório').max(200),
})

export const cognitiveCoachSchema = z.object({
  cognitiveScore: z.number().min(0).max(100),
  retention: z.number().min(0).max(100),
  mastery: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  atRiskCount: z.number().int().min(0),
  daysSinceReview: z.number().min(0),
  skillTrend: z.enum(['accelerating', 'stable', 'decelerating', 'stalled']),
})

export const generateQuizSchema = z.object({
  front: z.string().min(1, 'Frente do card obrigatória').max(1000),
  back: z.string().min(1, 'Verso do card obrigatório').max(1000),
  count: z.number().int().min(1).max(5).default(3),
})

export type GenerateFlashcardsPayload = z.infer<typeof generateFlashcardsSchema>
export type AnalyzeTeachingPayload = z.infer<typeof analyzeTeachingSchema>
export type CognitiveCoachPayload = z.infer<typeof cognitiveCoachSchema>
export type GenerateQuizPayload = z.infer<typeof generateQuizSchema>

// ── Output schemas — validam resposta da IA antes de retornar ao cliente ──

export const generateFlashcardsOutputSchema = z.object({
  cards: z.array(z.object({
    front: z.string().min(1),
    back: z.string().min(1),
  })).min(1).max(30),
})

export const generateQuizOutputSchema = z.object({
  distractors: z.array(z.string().min(1)).min(1),
})

export const analyzeTeachingOutputSchema = z.object({
  clarity_score: z.number().transform(v => Math.max(0, Math.min(100, v))),
  coverage_score: z.number().transform(v => Math.max(0, Math.min(100, v))),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
  estimated_retention: z.number().transform(v => Math.max(0, Math.min(100, v))),
})

export const coachOutputSchema = z.object({
  message: z.string().min(1).max(2000),
})
