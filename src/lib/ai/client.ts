// Cliente Anthropic — server-only (nunca importar em Client Components)
import Anthropic from '@anthropic-ai/sdk'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_MAX_TOKENS = 1024

let _client: Anthropic | null = null

export function getAIClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY não configurada. Adicione a variável ao .env.local e reinicie o servidor.'
      )
    }
    _client = new Anthropic({ apiKey })
  }
  return _client
}

export interface AICallOptions {
  model?: string
  maxTokens?: number
  systemPrompt?: string
  /** Ativa prefill com '{' para forçar saída JSON — equivalente ao json_object mode do OpenAI */
  jsonMode?: boolean
}

export interface AICallResult {
  text: string
  inputTokens: number
  outputTokens: number
}

export async function callAI(
  userMessage: string,
  options: AICallOptions = {}
): Promise<AICallResult> {
  const client = getAIClient()
  const model = options.model ?? DEFAULT_MODEL
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  // Prefill com '{' força o modelo a continuar com JSON sem markdown
  if (options.jsonMode) {
    messages.push({ role: 'assistant', content: '{' })
  }

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
    messages,
  })

  const block = response.content[0]
  const rawText = block.type === 'text' ? block.text : ''

  // Restaura o '{' do prefill que o modelo não repete na resposta
  const text = options.jsonMode ? '{' + rawText : rawText

  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}
