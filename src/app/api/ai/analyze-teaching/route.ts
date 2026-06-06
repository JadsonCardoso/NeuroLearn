// POST /api/ai/analyze-teaching
// Analisa explicação do Modo Professor e retorna feedback pedagógico
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { stripHtml } from '@/lib/security/sanitize'
import { logSecurityEvent } from '@/lib/security/logger'
import { callAI } from '@/lib/ai/client'
import { buildTeachingPrompt } from '@/lib/ai/prompts'
import { analyzeTeachingSchema } from '@/lib/ai/validation'
import type { TeachAnalysis, AIErrorResponse } from '@/types/ai'

const AI_RATE_LIMIT = 10
const AI_RATE_WINDOW_MS = 15 * 60 * 1000

function isTeachAnalysis(obj: unknown): obj is TeachAnalysis {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.clarity_score === 'number' &&
    typeof o.coverage_score === 'number' &&
    Array.isArray(o.gaps) &&
    Array.isArray(o.strengths) &&
    Array.isArray(o.suggestions) &&
    typeof o.estimated_retention === 'number'
  )
}

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
  const rl = checkRateLimit(`ai:analyze:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)
  if (!rl.allowed) {
    logSecurityEvent('rate_limit.exceeded', { userId: user.id, endpoint: 'analyze-teaching' })
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

  const parsed = analyzeTeachingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<AIErrorResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Input inválido', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const { teachText, topic } = parsed.data
  const safeText = stripHtml(teachText)
  const safeTopic = stripHtml(topic)

  // Chamada IA
  let result
  try {
    result = await callAI(buildTeachingPrompt(safeText, safeTopic), {
      maxTokens: 1024,
      jsonMode: true,
    })
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Erro ao processar com IA. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Parse e validação da resposta
  let analysis: TeachAnalysis
  try {
    const text = result.text.trim()
    const jsonText = text.startsWith('```') ? text.replace(/```json?\n?/g, '').replace(/```$/g, '').trim() : text
    const parsed = JSON.parse(jsonText)
    if (!isTeachAnalysis(parsed)) throw new Error('Estrutura inválida')
    // Clampear scores 0–100
    analysis = {
      ...parsed,
      clarity_score: Math.max(0, Math.min(100, parsed.clarity_score)),
      coverage_score: Math.max(0, Math.min(100, parsed.coverage_score)),
      estimated_retention: Math.max(0, Math.min(100, parsed.estimated_retention)),
    }
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Resposta da IA em formato inesperado. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Log de uso
  await supabase.from('cognitive_events').insert({
    user_id: user.id,
    event_type: 'ai.teaching.analyzed',
    payload: {
      topicLength: safeTopic.length,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    },
  })

  return NextResponse.json({ analysis })
}
