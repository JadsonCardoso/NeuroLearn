# Tasks — Fase 5: IA Cognitiva

**Status:** 🚧 In Progress
**Total tasks:** 11

---

## T01 — Instalar @anthropic-ai/sdk

**What:** `npm install @anthropic-ai/sdk`
**Where:** package.json
**Depends on:** —
**Done when:** SDK listado em dependencies, sem erros de instalação
**Gate:** `npm run build` sem erros de import

---

## T02 — Tipos AI (src/types/ai.ts)

**What:** Interfaces TypeScript para todos os tipos AI da fase 5
**Where:** `src/types/ai.ts`
**Depends on:** T01
**Done when:** Todos os tipos exportados: GenerateFlashcardsInput, FlashcardGenerated, TeachAnalysis, CoachInput, CoachResponse, QuizDistractor, AIErrorResponse
**Gate:** `npm run type-check` passa

---

## T03 — AI Client (src/lib/ai/client.ts)

**What:** Wrapper server-only do Anthropic SDK com modelo configurável
**Where:** `src/lib/ai/client.ts`
**Depends on:** T01, T02
**Done when:** `createAIClient()` retorna instância Anthropic; `callAI()` lida com erros e retorna texto
**Gate:** `npm run type-check` passa

---

## T04 — Prompts centralizados (src/lib/ai/prompts.ts)

**What:** Funções que constroem os prompts para cada feature
**Where:** `src/lib/ai/prompts.ts`
**Depends on:** T02
**Done when:** Funções: `buildFlashcardPrompt()`, `buildTeachingPrompt()`, `buildCoachPrompt()`, `buildQuizPrompt()` exportadas
**Gate:** Testes unitários passam (`npm test`)

---

## T05 — Validation schemas AI (src/lib/ai/validation.ts)

**What:** Zod schemas para validar inputs de todas as rotas AI
**Where:** `src/lib/ai/validation.ts`
**Depends on:** T02
**Done when:** Schemas exportados: `generateFlashcardsSchema`, `analyzeTeachingSchema`, `cognitiveCoachSchema`, `generateQuizSchema`
**Gate:** `npm run type-check` passa

---

## T06 — API Route: /api/ai/generate-flashcards

**What:** POST handler que gera flashcards com Claude
**Where:** `src/app/api/ai/generate-flashcards/route.ts`
**Depends on:** T01, T02, T03, T04, T05
**Done when:**

- Auth check (401 se não logado)
- Rate limit (429 se excedido)
- Zod validation (422 se inválido)
- Retorna `FlashcardGenerated[]` JSON
- Loga evento em cognitive_events
  **Gate:** `npm run build` passa; teste manual retorna cards válidos

---

## T07 — API Route: /api/ai/analyze-teaching

**What:** POST handler que analisa explicação do Modo Professor
**Where:** `src/app/api/ai/analyze-teaching/route.ts`
**Depends on:** T01, T02, T03, T04, T05
**Done when:**

- Auth check + rate limit + validation
- Retorna `TeachAnalysis` JSON com todos os campos
- Scores entre 0–100
  **Gate:** `npm run build` passa

---

## T08 — API Route: /api/ai/cognitive-coach

**What:** POST handler que gera coaching personalizado
**Where:** `src/app/api/ai/cognitive-coach/route.ts`
**Depends on:** T01, T02, T03, T04, T05
**Done when:**

- Auth check + rate limit + validation
- Retorna `{message: string}` em português
- Fallback estático se API falhar
  **Gate:** `npm run build` passa

---

## T09 — API Route: /api/ai/generate-quiz

**What:** POST handler que gera distratores para quiz adaptativo
**Where:** `src/app/api/ai/generate-quiz/route.ts`
**Depends on:** T01, T02, T03, T04, T05
**Done when:**

- Auth check + rate limit + validation
- Retorna `{distractors: string[]}` com 3 itens
  **Gate:** `npm run build` passa

---

## T10 — Client Service (src/services/aiService.ts)

**What:** Funções client-side para chamar as API Routes AI
**Where:** `src/services/aiService.ts`
**Depends on:** T02
**Done when:** Funções: `generateFlashcards()`, `analyzeTeaching()`, `getCognitiveCoach()`, `generateQuiz()` com error handling
**Gate:** `npm run type-check` passa

---

## T11 — Testes + Build final

**What:** Testes unitários dos prompts; lint; type-check; build
**Where:** `src/lib/ai/__tests__/prompts.test.ts`
**Depends on:** T04
**Done when:**

- Testes de prompt builders passam
- `npm run lint` sem erros
- `npm run type-check` sem erros
- `npm run build` sem erros
  **Gate:** Todos os checks ✅
