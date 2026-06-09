// POST /api/ai/generate-flashcards
// Gera flashcards a partir de anotações e highlights usando Claude
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { stripHtml } from '@/lib/security/sanitize'
import { logSecurityEvent } from '@/lib/security/logger'
import { callAI } from '@/lib/ai/client'
import { buildFlashcardPrompt } from '@/lib/ai/prompts'
import { generateFlashcardsSchema } from '@/lib/ai/validation'
import type { FlashcardGenerated, AIErrorResponse } from '@/types/ai'

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

  // Rate limit por userId
  const rl = checkRateLimit(`ai:flashcards:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)
  if (!rl.allowed) {
    logSecurityEvent('rate_limit.exceeded', { userId: user.id, endpoint: 'generate-flashcards' })
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

  const parsed = generateFlashcardsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<AIErrorResponse>(
      { error: parsed.error.issues[0]?.message ?? 'Input inválido', code: 'INVALID_INPUT' },
      { status: 422 },
    )
  }

  const { notes, highlights, title, count } = parsed.data

  // Sanitizar inputs antes de enviar ao LLM
  const safeNotes = stripHtml(notes)
  const safeHighlights = highlights.map(stripHtml)
  const safeTitle = stripHtml(title)

  // Chamada IA
  let result
  try {
    result = await callAI(buildFlashcardPrompt({ notes: safeNotes, highlights: safeHighlights, title: safeTitle, count }), {
      maxTokens: 1024,
      jsonMode: true,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Distingue ausência de chave de erros de API — facilita triagem em produção
    if (msg.includes('OPENAI_API_KEY')) {
      console.error('[generate-flashcards] OPENAI_API_KEY não configurada nas variáveis de ambiente da Vercel')
      return NextResponse.json<AIErrorResponse>(
        { error: 'Serviço de IA temporariamente indisponível.', code: 'AI_ERROR' },
        { status: 503 },
      )
    }
    console.error('[generate-flashcards] callAI error:', msg)
    return NextResponse.json<AIErrorResponse>(
      { error: 'Erro ao processar com IA. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Parse e validação da resposta
  // O modelo retorna {"cards":[...]} — formato objeto exigido pelo JSON mode da OpenAI
  let cards: FlashcardGenerated[]
  try {
    const text = result.text.trim()
    const jsonText = text.startsWith('```') ? text.replace(/```json?\n?/g, '').replace(/```$/g, '').trim() : text
    const parsed: unknown = JSON.parse(jsonText)
    // Aceita tanto {"cards":[...]} quanto array direto (fallback)
    const raw = Array.isArray(parsed)
      ? parsed
      : (parsed as Record<string, unknown>).cards
    if (!Array.isArray(raw) || raw.some((c) => typeof (c as Record<string, unknown>).front !== 'string' || typeof (c as Record<string, unknown>).back !== 'string')) {
      throw new Error('Estrutura inválida')
    }
    cards = raw as FlashcardGenerated[]
  } catch {
    return NextResponse.json<AIErrorResponse>(
      { error: 'Resposta da IA em formato inesperado. Tente novamente.', code: 'AI_ERROR' },
      { status: 500 },
    )
  }

  // Log de uso em cognitive_events
  await supabase.from('cognitive_events').insert({
    user_id: user.id,
    event_type: 'ai.flashcards.generated',
    payload: {
      count: cards.length,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    },
  })

  return NextResponse.json({ cards })
}
