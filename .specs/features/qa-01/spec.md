# QA-01 — Engenharia de Qualidade, Correção Automática e Cobertura E2E

**Fase:** QA-01  
**Status:** Em especificação  
**Escopo:** Complex — infraestrutura nova + cobertura cross-module  
**Última atualização:** 2026-06-06

---

## Objetivo

Transformar a cobertura de testes do NeuroLearn de parcial (~30% fluxos críticos) para uma base sólida e preventiva, garantindo estabilidade como produto SaaS premium. Toda falha identificada deve resultar em correção + teste automatizado + prevenção de recorrência.

---

## Estado Atual (Baseline)

| Camada                                                 | Cobertura atual | Meta                 |
| ------------------------------------------------------ | --------------- | -------------------- |
| Engine cognitivo (SM-2, retenção, mastery, skills)     | 100% ✅         | Manter               |
| Security (validation, rateLimit, sanitize, rbac)       | 100% ✅         | Manter               |
| AI (prompts)                                           | 100% ✅         | Manter               |
| Validation (schemas Zod)                               | 100% ✅         | Manter               |
| **Services (contentsService, flashcardsService, etc)** | **0% ❌**       | 80%+                 |
| **AppContext / Reducer**                               | **0% ❌**       | 100%                 |
| **Hooks (useTheme, useToast, useAppData)**             | **0% ❌**       | 80%+                 |
| **E2E — Auth/Forms**                                   | ~60% ✅         | 100%                 |
| **E2E — Business flows (library, review, focus)**      | **~0% ❌**      | 100% fluxos críticos |
| **E2E — Accessibility**                                | ~30%            | 80%+                 |

---

## Requisitos

### QA-01-R01 — Infraestrutura de Testes (Testing Library + jsdom)

- **R01.1** — Instalar e configurar `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
- **R01.2** — Configurar ambiente `jsdom` no Vitest para testes de componentes e hooks
- **R01.3** — Manter ambiente `node` para testes de engine, services e utils (dual environment)
- **R01.4** — Adicionar `src/components/**/*.test.tsx` e `src/hooks/**/*.test.ts` e `src/store/**/*.test.ts` ao include do Vitest

### QA-01-R02 — Testes Unitários: Services

- **R02.1** — `contentsService.test.ts` — listContents, createContent, updateContentProgress, removeContent com Supabase mockado
- **R02.2** — `flashcardsService.test.ts` — listFlashcardsByContent, listDueFlashcards, createFlashcards, updateFlashcardSM2
- **R02.3** — `reviewService.test.ts` — recordReviewCycle (se existir)
- **R02.4** — Cobertura: casos de sucesso + erro do Supabase (throw)
- **R02.5** — Mock strategy: `vi.mock('@/lib/supabase/client')` retornando Supabase client falso encadeável

### QA-01-R03 — Testes Unitários: AppContext Reducer

- **R03.1** — `AppContext.test.ts` — testar appReducer puro (sem React) para todas as actions
- **R03.2** — Actions cobertas: LOAD_STATE, ADD_CONTENT, DELETE_CONTENT, UPDATE_CONTENT_PROGRESS, ADD_CARDS, RATE_CARD, ADD_SESSION, LOAD_SKILLS, ADD_SKILL, REMOVE_SKILL, GAIN_SKILL_XP, UPDATE_STREAK
- **R03.3** — Verificar imutabilidade: cada action retorna novo objeto sem mutar o anterior
- **R03.4** — Testar edge cases: DELETE_CONTENT também remove cards associados, RATE_CARD acumula XP

### QA-01-R04 — Testes Unitários: Hooks

- **R04.1** — `useTheme.test.ts` — toggle, persistência em localStorage, valor inicial
- **R04.2** — `useToast.test.ts` — toast.success, toast.error, toast.warning, toast.info com diferentes assinaturas
- **R04.3** — `ToastContext.test.ts` — addToast, removeToast, MAX_TOASTS (3), timer cleanup (BUG-01)

### QA-01-R05 — E2E: Infraestrutura Base

- **R05.1** — Criar `tests/e2e/utils/auth.fixture.ts` — fixture de autenticação via Supabase Admin API que gera magic link e navega
- **R05.2** — Criar `tests/e2e/pages/` — Page Objects para LoginPage, LibraryPage, ReviewPage
- **R05.3** — Criar `tests/e2e/fixtures/` — dados de teste reutilizáveis (content, flashcard)
- **R05.4** — Configurar `storageState` no Playwright para reutilizar sessão autenticada entre tests
- **R05.5** — Criar `tests/e2e/global.setup.ts` — authenticação única para sessão de testes

### QA-01-R06 — E2E: Fluxo Biblioteca (Library)

- **R06.1** — Adicionar conteúdo (título, tipo, autor) → verificar aparece na lista
- **R06.2** — Editar conteúdo → verificar atualização
- **R06.3** — Excluir conteúdo → verificar remoção da lista e dos cards associados
- **R06.4** — Tentar adicionar com título vazio → erro de validação sem popup nativo
- **R06.5** — Persistência: reload → conteúdo ainda presente

### QA-01-R07 — E2E: Fluxo Revisão (Review)

- **R07.1** — Fila de revisão exibe cards com next_review <= hoje
- **R07.2** — Responder card com qualidade ≥ 3 → intervalo aumenta
- **R07.3** — Responder card com qualidade < 3 → intervalo reseta para 1
- **R07.4** — Completar revisão → fila vazia → estado "sem revisões pendentes"
- **R07.5** — Métricas do dashboard atualizam após revisão

### QA-01-R08 — E2E: Acessibilidade

- **R08.1** — Todas as páginas: verificar presença de `<h1>`
- **R08.2** — Formulários: labels associados a inputs (htmlFor ↔ id)
- **R08.3** — Erros de validação: `role="alert"` presente e visível
- **R08.4** — Botões: `aria-label` em botões icon-only
- **R08.5** — Navegação por teclado: Tab order lógico nos formulários

### QA-01-R09 — Mandato de Qualidade no CLAUDE.md

- **R09.1** — Adicionar `qa-estrategico` como skill obrigatória no projeto (CLAUDE.md do projeto)
- **R09.2** — Documentar quando executar: após implementar cada feature, antes de considerar completa
- **R09.3** — Atualizar Fluxo Obrigatório: incluir passo de QA após gate técnico
- **R09.4** — Atualizar Gate de Qualidade: incluir checklist item para QA estratégico

### QA-01-R10 — Coverage Threshold

- **R10.1** — Vitest: configurar `thresholds` no coverage (statements 80%, branches 70%, functions 80%)
- **R10.2** — Documentar no `TESTING.md` os thresholds e como verificar

---

## Fora do Escopo (QA-01)

- Integração com Sentry/PostHog (adiado — sem projeto Sentry configurado)
- Testes de contrato de API com Supertest (adiado — APIs simples, baixa prioridade)
- Testes de performance/load (adiado para v2.5+)
- Testes de responsividade mobile automatizados (adiado)
- MSW (Mock Service Worker) — substituído por vi.mock para simplicidade nesta fase

---

## Critério de Aceitação

- [ ] `npm run test:unit` — 250+ testes passando (era 193)
- [ ] `npm run test:e2e` — todos os novos testes passando
- [ ] `npm run type-check` — zero erros
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — build limpo
- [ ] CLAUDE.md do projeto menciona qa-estrategico como obrigatório
- [ ] TESTING.md atualizado com thresholds e novos padrões
