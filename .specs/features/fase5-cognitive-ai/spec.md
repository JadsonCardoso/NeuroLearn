# Spec — Fase 5: IA Cognitiva do NeuroLearn

**ID:** F-05x
**Status:** 🚧 In Progress
**Complexidade:** Complex
**Depende de:** Fase 3 (Cognitive Engine), Fase 4 (Security), Supabase Auth
**Provider IA:** Anthropic Claude (ANTHROPIC_API_KEY no .env.local)

---

## Princípio

> "A IA não substitui o aprendizado. Ela potencializa a retenção, detecta lacunas, gera prática e adapta dificuldade."

A IA do NeuroLearn é um co-piloto cognitivo. Nunca entrega respostas passivas. Sempre estimula esforço cognitivo e recuperação ativa.

---

## Requisitos

### IA-F01 — Geração de Flashcards

**Trigger:** Usuário clica "✨ Gerar com IA" na Sessão de Foco (Fase 2)

**Input:**

- `notes`: anotações da Fase 1 (obrigatório, min 50 chars)
- `highlights`: highlights criados pelo usuário (opcional)
- `title`: título do conteúdo
- `count`: número de cards desejados (1–20, default 5)

**Output:** Array de `{front: string, back: string}`

**Restrições:**

- Front: máximo 15 palavras
- Back: máximo 60 palavras
- Sem perguntas sim/não
- Sem definições triviais
- Foco em aplicação, causa-efeito, exemplos

**Done when:**

- Cards gerados em < 5s
- JSON válido retornado
- Usuário pode editar antes de salvar

---

### IA-F02 — Análise do Modo Professor

**Trigger:** Usuário salva texto na Fase 3 (Modo Professor) da Sessão de Foco

**Input:**

- `teachText`: texto da explicação (obrigatório, min 30 chars)
- `topic`: título do conteúdo

**Output:**

```typescript
interface TeachAnalysis {
  clarity_score: number // 0–100
  coverage_score: number // 0–100
  gaps: string[] // conceitos não mencionados
  strengths: string[] // pontos bem explicados
  suggestions: string[] // melhorias específicas
  estimated_retention: number // % estimada
}
```

**Done when:**

- Análise retornada em < 8s
- Scores entre 0–100
- Gaps e sugestões em português

---

### IA-F03 — Cognitive Coach

**Trigger:** Usuário acessa Dashboard ou clica "Coach Cognitivo"

**Input:**

```typescript
interface CoachInput {
  cognitiveScore: number // 0–100 (Phase 3 engine)
  retention: number // % retenção média
  mastery: number // % domínio médio
  consistency: number // % consistência
  atRiskCount: number // cards em risco
  daysSinceReview: number // dias desde última revisão
  skillTrend: string // 'accelerating'|'stable'|'decelerating'|'stalled'
}
```

**Output:** Mensagem textual personalizada (máximo 3 parágrafos)

**Regras:**

- Direto e honesto — nunca condescendente
- Quando mastery < 30%: "Você ainda não domina este conteúdo"
- Quando atRiskCount > 5: "Sua retenção caiu — revise agora"
- Termina com ação específica e concreta
- Em português

**Done when:**

- Coach responde em < 6s
- Mensagem baseada nos dados reais
- Ação concreta sempre presente

---

### IA-F04 — Geração de Quiz Adaptativo

**Trigger:** Usuário clica "🎯 Quiz Adaptativo" no módulo Revisão

**Input:**

- `front`: frente do flashcard
- `back`: resposta correta
- `count`: número de distratores (default 3)

**Output:** `{distractors: string[]}`

**Regras de distratores:**

- Plausíveis para quem não domina
- Não obviamente errados
- Comprimento similar à resposta correta
- Não sinônimos da resposta correta

**Done when:**

- Quiz gerado com 3 distratores por card
- Distratores não são obviamente errados (teste manual)
- Resposta em < 4s

---

### IA-F05 — Segurança e Rate Limiting

**Regras obrigatórias:**

- API key NUNCA no frontend (apenas no servidor)
- Auth obrigatória: usuário deve estar logado
- Rate limiting: 10 chamadas IA/endpoint/15min/usuário
- Validação de input via Zod
- Sanitização de inputs (stripHtml antes de enviar ao LLM)
- Response validada antes de retornar ao cliente

**Erros padronizados:**

- 401: não autenticado
- 429: rate limit excedido
- 422: input inválido
- 500: erro na API de IA (com fallback message)

---

### IA-F06 — Rastreamento de Uso

**Onde:** Tabela `cognitive_events` (já existe no Supabase)

**Eventos registrados:**

- `ai.flashcards.generated` — payload: `{count, inputTokens, outputTokens, cached}`
- `ai.teaching.analyzed` — payload: `{topicLength, inputTokens, outputTokens}`
- `ai.coach.generated` — payload: `{inputTokens, outputTokens}`
- `ai.quiz.generated` — payload: `{cardCount, inputTokens, outputTokens}`

**Estratégia de custo:**

- Modelo padrão: `claude-haiku-4-5-20251001` (barato, rápido)
- Haiku 4.5: $0.80/1M input tokens, $4.00/1M output tokens
- Estimativa por chamada: ~$0.0005
- Limite implícito: rate limiting previne abuso

---

## Não inclui nesta fase

- RAG com documentos (PDF parsing) — pós-v2.0
- Fine-tuning de modelo próprio — v3.0
- IA de voz / transcrição — v2.5
- Redis cache de respostas — próxima iteração
- Plano de uso (free/premium) — pós-v2.0
