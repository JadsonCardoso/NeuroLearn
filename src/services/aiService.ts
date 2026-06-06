// Serviço client-side para chamadas às rotas de IA Cognitiva
// Todas as requisições passam pelo servidor — API key nunca exposta
import type {
  GenerateFlashcardsInput,
  FlashcardGenerated,
  AnalyzeTeachingInput,
  TeachAnalysis,
  CoachInput,
  CoachResponse,
  GenerateQuizInput,
  QuizDistractors,
  AIErrorResponse,
} from '@/types/ai'

class AIServiceError extends Error {
  code: AIErrorResponse['code']
  retryAfter?: number

  constructor(response: AIErrorResponse) {
    super(response.error)
    this.code = response.code
    this.retryAfter = response.retryAfter
  }
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AIServiceError(data as AIErrorResponse)
  }

  return data as T
}

// Gera flashcards a partir de anotações e highlights
export async function generateFlashcards(
  input: GenerateFlashcardsInput,
): Promise<FlashcardGenerated[]> {
  const data = await post<{ cards: FlashcardGenerated[] }>('generate-flashcards', input)
  return data.cards
}

// Analisa explicação do Modo Professor e retorna feedback pedagógico
export async function analyzeTeaching(
  input: AnalyzeTeachingInput,
): Promise<TeachAnalysis> {
  const data = await post<{ analysis: TeachAnalysis }>('analyze-teaching', input)
  return data.analysis
}

// Obtém mensagem de coaching personalizada baseada nos dados cognitivos
export async function getCognitiveCoach(input: CoachInput): Promise<string> {
  const data = await post<CoachResponse>('cognitive-coach', input)
  return data.message
}

// Gera distratores para quiz adaptativo
export async function generateQuizDistractors(
  input: GenerateQuizInput,
): Promise<string[]> {
  const data = await post<QuizDistractors>('generate-quiz', input)
  return data.distractors
}

export { AIServiceError }
