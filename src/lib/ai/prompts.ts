// Templates de prompt centralizados para os serviços de IA Cognitiva
import type { CoachInput, GenerateFlashcardsInput } from '@/types/ai'

// ── Geração de Flashcards ──────────────────────────────────────────────────

export function buildFlashcardPrompt(input: GenerateFlashcardsInput): string {
  const { notes, highlights = [], title, count = 5 } = input
  const highlightsText = highlights.length > 0 ? highlights.join('\n- ') : 'Nenhum highlight.'

  return `Você é um especialista em ciência da aprendizagem com foco em recuperação espaçada.

Dado o seguinte conteúdo, gere ${count} flashcards usando atomicidade (1 conceito por card).

REGRAS OBRIGATÓRIAS:
- Frente: pergunta direta, máximo 15 palavras
- Verso: resposta concisa, máximo 60 palavras
- Proibido: perguntas sim/não, definições triviais, cópia literal do texto
- Priorize: aplicação prática, causa-efeito, exemplos concretos
- Idioma: português (Brasil)

CONTEÚDO — ${title}

NOTAS:
${notes}

HIGHLIGHTS:
- ${highlightsText}

Responda APENAS com objeto JSON válido, sem markdown, sem texto extra:
{"cards":[{"front":"...","back":"..."}]}`
}

// ── Análise do Modo Professor ──────────────────────────────────────────────

export function buildTeachingPrompt(teachText: string, topic: string): string {
  return `Você é um avaliador especialista em pedagogia cognitiva.

Analise a explicação abaixo sobre "${topic}" e avalie os seguintes critérios:

EXPLICAÇÃO DO APRENDIZ:
${teachText}

Retorne APENAS JSON válido sem markdown ou texto extra:
{
  "clarity_score": <0-100>,
  "coverage_score": <0-100>,
  "gaps": ["conceito não mencionado"],
  "strengths": ["ponto bem explicado"],
  "suggestions": ["melhoria específica e acionável"],
  "estimated_retention": <0-100>
}

Regras de avaliação:
- clarity_score: quão clara e compreensível é a explicação
- coverage_score: quão completa é a cobertura do tema
- gaps: conceitos importantes ausentes (máximo 5 itens)
- strengths: pontos bem explicados (máximo 5 itens)
- suggestions: melhorias concretas e acionáveis (máximo 5 itens)
- estimated_retention: % de retenção que este tipo de explicação gera
- Responda em português (Brasil)`
}

// ── Cognitive Coach ────────────────────────────────────────────────────────

const TREND_LABELS: Record<CoachInput['skillTrend'], string> = {
  accelerating: 'acelerando (positivo)',
  stable: 'estável',
  decelerating: 'desacelerando (atenção)',
  stalled: 'estagnado (crítico)',
}

export function buildCoachPrompt(input: CoachInput): string {
  return `Você é o Cognitive Coach do NeuroLearn — especialista em aprendizagem baseada em evidências.

DADOS COGNITIVOS DO USUÁRIO:
- Score cognitivo: ${input.cognitiveScore}/100
- Retenção média: ${input.retention}%
- Domínio médio: ${input.mastery}%
- Consistência de estudo: ${input.consistency}%
- Cards em risco de esquecimento: ${input.atRiskCount}
- Dias desde última revisão: ${input.daysSinceReview}
- Tendência de evolução: ${TREND_LABELS[input.skillTrend]}

INSTRUÇÕES:
- Seja direto, honesto e motivador — nunca evasivo ou condescendente
- Baseie-se APENAS nos dados fornecidos
- Se mastery < 30: declare explicitamente "Você ainda não domina este conteúdo"
- Se atRiskCount > 5: declare "Sua retenção caiu — revise agora"
- Se consistency < 40: mencione que a irregularidade prejudica a consolidação
- Se desempenho for bom (score > 70): reforce o comportamento positivo com dados específicos
- Máximo 3 parágrafos
- Termine SEMPRE com uma ação específica e concreta (ex: "Revise 10 cards agora")
- Responda em português (Brasil)`
}

// ── Quiz Adaptativo ────────────────────────────────────────────────────────

export function buildQuizPrompt(front: string, back: string, count: number): string {
  return `Você é um especialista em avaliação cognitiva adaptativa.

Para o flashcard abaixo, crie ${count} distratores (respostas incorretas mas plausíveis).

Frente: ${front}
Resposta correta: ${back}

REGRAS DOS DISTRATORES:
- Plausíveis para quem não domina o tema
- Não obviamente errados
- Comprimento similar à resposta correta
- Não sinônimos da resposta correta
- Idioma: português (Brasil)

Responda APENAS com JSON válido sem markdown:
{"distractors":["opção1","opção2","opção3"]}`
}
