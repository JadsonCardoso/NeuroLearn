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
