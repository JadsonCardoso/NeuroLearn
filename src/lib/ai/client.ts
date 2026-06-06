// Cliente OpenAI — server-only (nunca importar em Client Components)
import OpenAI from 'openai'

const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_MAX_TOKENS = 1024

let _client: OpenAI | null = null

export function getAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY não configurada. Adicione a variável ao .env.local e reinicie o servidor.',
      )
    }
    _client = new OpenAI({ apiKey })
  }
  return _client
}

export interface AICallOptions {
  model?: string
  maxTokens?: number
  systemPrompt?: string
  /** Ativa JSON mode do OpenAI — apenas para rotas que retornam JSON estruturado */
  jsonMode?: boolean
}

export interface AICallResult {
  text: string
  inputTokens: number
  outputTokens: number
}

export async function callAI(
  userMessage: string,
  options: AICallOptions = {},
): Promise<AICallResult> {
  const client = getAIClient()
  const model = options.model ?? DEFAULT_MODEL
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    ...(options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }]
      : []),
    { role: 'user', content: userMessage },
  ]

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages,
    ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  })

  const text = response.choices[0]?.message?.content ?? ''

  return {
    text,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  }
}
