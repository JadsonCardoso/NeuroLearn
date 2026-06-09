// POST /api/ai/generate-quiz
// Gera distratores para quiz adaptativo baseado em flashcards
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { stripHtml } from '@/lib/security/sanitize'
import { logSecurityEvent } from '@/lib/security/logger'
import { callAI } from '@/lib/ai/client'
import { buildQuizPrompt } from '@/lib/ai/prompts'
import { generateQuizSchema, generateQuizOutputSchema } from '@/lib/ai/validation'
import type { QuizDistractors, AIErrorResponse } from '@/types/ai'

const AI_RATE_LIMIT = 10
const AI_RATE_WINDOW_MS = 15 * 60 * 1000

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Não autenticado', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // Rate limit
  const rl = checkRateLimit(`ai:quiz:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)
  if (!rl.allowed) {
    logSecurityEvent('rate_limit.exceeded', { userId: user.id, endpoint: 'generate-quiz' })
    return NextResponse.json<AIErrorResponse>(
      { error: 'Limite de chamadas atingido. Tente novamente em instantes.', code: 'RATE_LIMITED', retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  // Validação de input
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Body inválido', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const parsedInput = generateQuizSchema.safeParse(body)
  if (!parsedInput.success) {
    return NextResponse.json<AIErrorResponse>(
      { error: parsedInput.error.issues[0]?.message ?? 'Input inválido', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const { front, back, count } = parsedInput.data
  const safeFront = stripHtml(front)
  const safeBack = stripHtml(back)

  // Chamada IA
  let result
  try {
    result = await callAI(buildQuizPrompt(safeFront, safeBack, count), {
      maxTokens: 256,
      jsonMode: true,
    })
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Erro ao processar com IA. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Parse e validação da resposta
  let quiz: QuizDistractors
  try {
    const text = result.text.trim()
    const jsonText = text.startsWith('```') ? text.replace(/```json?\n?/g, '').replace(/```$/g, '').trim() : text
    const rawParsed = JSON.parse(jsonText)
    const output = generateQuizOutputSchema.safeParse(rawParsed)
    if (!output.success) {
      return NextResponse.json<AIErrorResponse>(
        { error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' },
        { status: 422 },
      )
    }
    quiz = { distractors: output.data.distractors.slice(0, count) }
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Resposta da IA em formato inesperado. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Log de uso
  await supabase.from('cognitive_events').insert({
    user_id: user.id,
    event_type: 'ai.quiz.generated',
    payload: {
      distractorCount: quiz.distractors.length,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    },
  })

  return NextResponse.json(quiz)
}
