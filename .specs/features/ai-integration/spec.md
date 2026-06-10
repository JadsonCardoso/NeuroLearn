# Feature Spec — Integração de IA

**ID:** F-050
**Status:** 🔜 Planned (v2.0)
**Complexidade:** Grande
**Depende de:** F-030 (motor cognitivo), F-022 (database schema)

## Princípio

> "A IA não substitui o aprendizado. Ela potencializa a retenção, identifica lacunas e adapta a dificuldade."

A IA no NeuroLearn é um co-piloto cognitivo — não faz o trabalho pelo usuário, amplifica a eficiência do ciclo de consolidação.

---

## Casos de uso

| ID    | Caso de uso                          | Prioridade | Modelo recomendado  |
| ----- | ------------------------------------ | ---------- | ------------------- |
| AI-01 | Gerar flashcards de conteúdo         | P0         | GPT-4o / Claude 3.5 |
| AI-02 | Analisar qualidade do Modo Professor | P1         | Claude 3.5 Haiku    |
| AI-03 | Detectar lacunas cognitivas          | P1         | GPT-4o              |
| AI-04 | Criar quizzes adaptativos            | P2         | GPT-4o mini         |
| AI-05 | Resumir conteúdo em highlights       | P2         | Claude 3.5 Haiku    |
| AI-06 | Recomendar reforço cognitivo         | P1         | Motor interno + IA  |

---

## Requirements

### R-050-01 — Geração de flashcards com IA (AI-01)

**Trigger:** Botão "✨ Gerar com IA" na Fase 2 da Sessão de Foco

**Input:**

- Texto das anotações da Fase 1
- Highlights criados pelo usuário
- Título e tipo do conteúdo

**Prompt:**

```
Você é um especialista em aprendizagem baseada em evidências.
Com base nas notas abaixo, gere {N} flashcards usando o princípio de atomicidade (1 conceito por card).

REGRAS:
- Frente: pergunta direta, não ambígua, máximo 15 palavras
- Verso: resposta completa mas concisa, máximo 60 palavras
- Evitar: perguntas com "sim/não", definições triviais
- Priorizar: aplicação, causa-efeito, exemplos concretos

NOTAS:
{notes}

HIGHLIGHTS:
{highlights}

Responda APENAS com JSON:
[{"front": "...", "back": "..."}]
```

**UI:** Cards gerados aparecem na lista de criação; usuário pode editar/remover antes de salvar.

**Done when:** Em 5 cliques do início das notas ao salvar os cards gerados.

---

### R-050-02 — Análise do Modo Professor (AI-02)

**Trigger:** Após salvar texto na Fase 3 (Modo Professor)

**Input:** `teach_text` + título do conteúdo

**Análise retornada:**

```typescript
interface TeachAnalysis {
  clarity_score: number // 0-100: quão clara é a explicação
  coverage_score: number // 0-100: quão completa é a cobertura
  gaps: string[] // tópicos não mencionados
  strengths: string[] // pontos bem explicados
  suggestions: string[] // melhorias específicas
  estimated_retention: number // % retenção estimada com esta explicação
}
```

**UI:** Exibido como card de feedback após salvar, com badges coloridos por score.

**Done when:** Feedback aparece em < 3s após salvar; gaps identificados corretamente em teste manual.

---

### R-050-03 — Detecção de lacunas cognitivas (AI-03)

**Quando executar:** Análise semanal (Edge Function cron) + sob demanda no Dashboard

**Input:** Histórico de review_cycles do usuário nos últimos 30 dias

**Output:**

```typescript
interface CognitiveGapAnalysis {
  weak_concepts: Array<{
    topic: string
    evidence: string // "Errou 4 de 6 vezes nas últimas 2 semanas"
    recommendation: string // "Revisar o conceito de X com foco em Y"
  }>
  learning_pattern: 'consistent' | 'cramming' | 'irregular'
  suggested_focus: string[] // próximos 3 tópicos a reforçar
}
```

**UI:** Seção "Lacunas detectadas pela IA" no Dashboard (colapsável).

**Done when:** Lacunas identificadas batem com o padrão de erros do usuário em teste manual.

---

### R-050-04 — Quizzes adaptativos (AI-04)

**Trigger:** Botão "🎯 Quiz Adaptativo" no módulo de Revisão

**Lógica:**

1. Buscar os 10 cards com menor retention_pct do usuário
2. Para cada card, gerar 3 opções incorretas plausíveis (IA)
3. Apresentar quiz de múltipla escolha cronometrado
4. Após quiz: mostrar score + impacto no retention_pct

**Done when:** Quiz gera 3 distratores que não são obviamente errados.

---

### R-050-05 — Arquitetura da integração IA

**Sem chamadas IA diretas no frontend:**

```
Cliente → API Route Next.js → Supabase Edge Function → OpenAI/Anthropic API
```

**Razões:**

- API keys protegidas no servidor
- Rate limiting centralizado
- Cache de respostas (evitar chamadas duplicadas)
- Logging de custo por usuário

**Cache de respostas:**

```typescript
// Cachear geração de flashcards por hash do conteúdo
const cacheKey = `ai:flashcards:${sha256(notes + highlights.join(''))}`
const cached = await redis.get(cacheKey)
if (cached) return cached
const result = await generateFlashcards(notes, highlights)
await redis.set(cacheKey, result, { ex: 3600 }) // 1h TTL
```

**Limite de custo:**

- Máximo 50 chamadas IA/usuário/mês no plano gratuito
- Sem limite no plano premium (a definir)

**Done when:** Nenhuma API key exposta no browser; custo por usuário trackado na tabela `ai_usage`.

---

### R-050-06 — Streaming de respostas

Para análises longas (AI-02, AI-03), usar streaming para UX melhor:

```typescript
// API Route com streaming
export async function POST(req: Request) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [...]
  });

  return new Response(
    ReadableStream.from(streamOpenAI(stream)),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}
```

**Done when:** Análise aparece palavra por palavra (streaming) sem timeout.

---

## Tabela de controle de uso IA

```sql
CREATE TABLE ai_usage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  feature     TEXT,              -- 'flashcard_gen', 'teach_analysis', etc.
  model       TEXT,              -- 'gpt-4o-mini', 'claude-3-haiku', etc.
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd    DECIMAL(10,6),
  cached      BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Não inclui

- Fine-tuning de modelo próprio (v3.0)
- IA de voz / transcrição de áudio (v2.5)
- Recomendação de conteúdos externos (v2.0)
