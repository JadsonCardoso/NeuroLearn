# Design — Fase 5: IA Cognitiva

## Decisões de Arquitetura

| Decisão          | Escolha                        | Motivo                                                   |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| Provider IA      | Anthropic Claude               | ANTHROPIC_API_KEY já no .env.local; modelos state-of-art |
| Modelo primário  | claude-haiku-4-5-20251001      | Rápido, barato, structured outputs, JSON confiável       |
| Modelo análise   | claude-haiku-4-5-20251001      | Suficiente para análise pedagógica                       |
| Fluxo de chamada | Client → API Route → Anthropic | API key nunca no browser                                 |
| Rate limiting    | checkRateLimit() da Fase 4     | Infraestrutura já existente                              |
| Tracking         | cognitive_events (Supabase)    | Tabela já existe, schema flexível                        |
| Streaming        | Não nesta fase                 | Reduz complexidade; latência aceitável                   |

---

## Estrutura de Arquivos

```
src/
├── types/
│   └── ai.ts                          ← Tipos AI (TeachAnalysis, CoachInput, etc.)
├── lib/
│   └── ai/
│       ├── client.ts                  ← Anthropic client (server-only)
│       ├── prompts.ts                 ← Templates de prompt centralizados
│       ├── validation.ts              ← Zod schemas para inputs AI
│       └── __tests__/
│           └── prompts.test.ts        ← Testes dos prompt builders
├── app/
│   └── api/
│       └── ai/
│           ├── generate-flashcards/
│           │   └── route.ts           ← POST /api/ai/generate-flashcards
│           ├── analyze-teaching/
│           │   └── route.ts           ← POST /api/ai/analyze-teaching
│           ├── cognitive-coach/
│           │   └── route.ts           ← POST /api/ai/cognitive-coach
│           └── generate-quiz/
│               └── route.ts           ← POST /api/ai/generate-quiz
└── services/
    └── aiService.ts                   ← Client-side: chama as API Routes
```

---

## Fluxo de Dados

```
[Browser] → POST /api/ai/[endpoint]
              ↓ Auth check (Supabase getUser)
              ↓ Rate limit check (10/15min/user)
              ↓ Zod validation + sanitizeHtml
              ↓ Build prompt (prompts.ts)
              ↓ Anthropic API call (claude-haiku-4-5-20251001)
              ↓ Parse + validate response
              ↓ Log to cognitive_events
              ↓ Return JSON to client
[Browser] ← { data } | { error }
```

---

## Prompts

### IA-F01: Flashcard Generation

```
Você é um especialista em ciência da aprendizagem com foco em recuperação espaçada.

Dado o seguinte conteúdo, gere {count} flashcards usando atomicidade (1 conceito por card).

REGRAS OBRIGATÓRIAS:
- Frente: pergunta direta, máximo 15 palavras
- Verso: resposta concisa, máximo 60 palavras
- Proibido: perguntas sim/não, definições triviais, cópia literal do texto
- Priorize: aplicação prática, causa-efeito, exemplos concretos
- Idioma: português (Brasil)

CONTEÚDO — {title}
NOTAS: {notes}
HIGHLIGHTS: {highlights}

Responda APENAS com array JSON válido, sem markdown:
[{"front":"...","back":"..."}]
```

### IA-F02: Teaching Analysis

```
Você é um avaliador especialista em pedagogia cognitiva.

Analise a explicação abaixo sobre "{topic}" e avalie os seguintes critérios:

EXPLICAÇÃO DO APRENDIZ:
{teachText}

Retorne APENAS JSON válido sem markdown:
{
  "clarity_score": <0-100>,
  "coverage_score": <0-100>,
  "gaps": ["conceito não mencionado"],
  "strengths": ["ponto bem explicado"],
  "suggestions": ["melhoria específica e acionável"],
  "estimated_retention": <0-100>
}

Regras:
- clarity_score: quão clara e compreensível é a explicação
- coverage_score: quão completa é a cobertura do tema
- gaps: conceitos importantes ausentes (máximo 5)
- strengths: pontos bem explicados (máximo 5)
- suggestions: melhorias concretas (máximo 5)
- estimated_retention: % de retenção que esta explicação gera
- Responda em português (Brasil)
```

### IA-F03: Cognitive Coach

```
Você é o Cognitive Coach do NeuroLearn — especialista em aprendizagem baseada em evidências.

DADOS COGNITIVOS DO USUÁRIO:
- Score cognitivo: {cognitiveScore}/100
- Retenção média: {retention}%
- Domínio médio: {mastery}%
- Consistência de estudo: {consistency}%
- Cards em risco de esquecimento: {atRiskCount}
- Dias desde última revisão: {daysSinceReview}
- Tendência de evolução: {skillTrend}

INSTRUÇÕES:
- Seja direto, honesto e motivador — nunca evasivo ou condescendente
- Baseie-se APENAS nos dados fornecidos
- Se mastery < 30: declare "Você ainda não domina este conteúdo"
- Se atRiskCount > 5: declare "Sua retenção caiu — revise agora"
- Se consistency < 40: declare "A irregularidade prejudica a consolidação"
- Se desempenho for bom: reforce o comportamento positivo com dados específicos
- Máximo 3 parágrafos
- Termine SEMPRE com uma ação específica e concreta (ex: "Revise 10 cards agora")
- Responda em português (Brasil)
```

### IA-F04: Quiz Distractor Generation

```
Você é um especialista em avaliação cognitiva adaptativa.

Para o flashcard abaixo, crie {count} distratores (respostas incorretas mas plausíveis).

Frente: {front}
Resposta correta: {back}

REGRAS DOS DISTRATORES:
- Plausíveis para quem não domina o tema
- Não obviamente errados
- Comprimento similar à resposta correta
- Não sinônimos da resposta correta
- Idioma: português (Brasil)

Responda APENAS com JSON válido:
{"distractors":["opção1","opção2","opção3"]}
```

---

## Schemas Zod (validation.ts)

```typescript
export const generateFlashcardsSchema = z.object({
  notes: z.string().min(50).max(10000),
  highlights: z.array(z.string().max(500)).max(50).default([]),
  title: z.string().min(1).max(200),
  count: z.number().int().min(1).max(20).default(5),
})

export const analyzeTeachingSchema = z.object({
  teachText: z.string().min(30).max(5000),
  topic: z.string().min(1).max(200),
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
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(1000),
  count: z.number().int().min(1).max(5).default(3),
})
```

---

## Estratégia de Custo

| Endpoint             | Modelo    | Input tokens (est.) | Output tokens (est.) | Custo est. |
| -------------------- | --------- | ------------------- | -------------------- | ---------- |
| /generate-flashcards | haiku-4.5 | ~800                | ~300                 | ~$0.0009   |
| /analyze-teaching    | haiku-4.5 | ~600                | ~200                 | ~$0.0006   |
| /cognitive-coach     | haiku-4.5 | ~400                | ~250                 | ~$0.0006   |
| /generate-quiz       | haiku-4.5 | ~200                | ~100                 | ~$0.0002   |

Rate limit 10/15min/user garante máximo ~$0.09/usuário/hora no pior caso.

---

## Tratamento de Erros

```typescript
// Padrão de resposta de erro
interface AIErrorResponse {
  error: string
  code: 'UNAUTHORIZED' | 'RATE_LIMITED' | 'INVALID_INPUT' | 'AI_ERROR'
  retryAfter?: number // segundos, para RATE_LIMITED
}
```

### Fallback do Cognitive Coach

Se a chamada à API falhar, retornar mensagem estática baseada nos scores:

- score < 40: "Sua retenção precisa de atenção. Revise seus cards em atraso."
- score 40-70: "Você está progredindo. Mantenha a regularidade."
- score > 70: "Excelente desempenho! Continue com a consistência."

---

## Segurança

- `ANTHROPIC_API_KEY` apenas em variáveis de servidor (sem `NEXT_PUBLIC_` prefix)
- Auth check: `createClient().auth.getUser()` em toda rota
- Rate limit: `checkRateLimit(userId, 10, 15*60*1000)`
- Input: `stripHtml()` + Zod antes de enviar ao LLM
- Output: validação de estrutura antes de retornar ao cliente
- Sem logging de conteúdo sensível do usuário (apenas metadados de uso)
