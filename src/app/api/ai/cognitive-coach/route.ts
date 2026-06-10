// POST /api/ai/cognitive-coach
// Gera mensagem de coaching personalizada com base nos dados cognitivos do usuário
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { logSecurityEvent } from '@/lib/security/logger'
import { callAI } from '@/lib/ai/client'
import { buildCoachPrompt } from '@/lib/ai/prompts'
import { cognitiveCoachSchema, coachOutputSchema } from '@/lib/ai/validation'
import type { CoachInput, CoachResponse, AIErrorResponse } from '@/types/ai'

const AI_RATE_LIMIT = 10
const AI_RATE_WINDOW_MS = 15 * 60 * 1000

// Fallback estático quando API de IA falha
function staticCoachMessage(input: CoachInput): string {
  if (input.cognitiveScore < 40) {
    return `Seus dados mostram que a retenção precisa de atenção. Você tem ${input.atRiskCount} cards em risco e ${input.daysSinceReview} dias sem revisar. Comece uma sessão de revisão agora — 10 minutos fazem diferença.`
  }
  if (input.cognitiveScore < 70) {
    return `Você está progredindo com score cognitivo de ${input.cognitiveScore}/100. Mantenha a regularidade. Revise os ${input.atRiskCount} cards em risco para evitar queda na retenção.`
  }
  return `Excelente desempenho com score ${input.cognitiveScore}/100 e retenção de ${input.retention}%. Continue com a consistência — esse é o segredo da consolidação de longo prazo.`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Não autenticado', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Rate limit
  const rl = await checkRateLimit(`ai:coach:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)
  if (!rl.allowed) {
    logSecurityEvent('rate_limit.exceeded', { userId: user.id, endpoint: 'cognitive-coach' })
    return NextResponse.json<AIErrorResponse>(
      {
        error: 'Limite de chamadas atingido. Tente novamente em instantes.',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil(rl.retryAfterMs / 1000),
      },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
    )
  }

  // Validação de input
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Body inválido', code: 'INVALID_INPUT' },
      { status: 422 }
    )
  }

  const parsed = cognitiveCoachSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<AIErrorResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Input inválido', code: 'INVALID_INPUT' },
      { status: 422 }
    )
  }

  const coachInput: CoachInput = parsed.data

  // Chamada IA com fallback
  let message: string
  let inputTokens = 0
  let outputTokens = 0

  try {
    const result = await callAI(buildCoachPrompt(coachInput), {
      maxTokens: 512,
    })
    const rawMessage = result.text.trim()
    const output = coachOutputSchema.safeParse({ message: rawMessage })
    message = output.success ? output.data.message : staticCoachMessage(coachInput)
    inputTokens = result.inputTokens
    outputTokens = result.outputTokens
  } catch {
    // Fallback estático garante que o usuário sempre receba uma resposta
    message = staticCoachMessage(coachInput)
  }

  // Log de uso
  await supabase.from('cognitive_events').insert({
    user_id: user.id,
    event_type: 'ai.coach.generated',
    payload: { inputTokens, outputTokens, hasFallback: inputTokens === 0 },
  })

  return NextResponse.json<CoachResponse>({ message })
}
