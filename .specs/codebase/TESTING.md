# Testing Infrastructure

**Atualizado:** 2026-06-06

## Test Frameworks

| Framework                  | Tipo                      | Comando                 |
| -------------------------- | ------------------------- | ----------------------- |
| **Vitest**                 | Unit/Integration          | `npm run test:unit`     |
| **Playwright**             | E2E (browser)             | `npm run test:e2e`      |
| **@testing-library/react** | Componentes React (jsdom) | via `npm run test:unit` |

## Cobertura Atual

- **Testes unitários:** 259+ passando (Vitest)
- **Testes E2E:** 7 specs (auth, app, ux-01, library, review, accessibility + global.setup)
- **Coverage:** `npm run test:coverage` (via @vitest/coverage-v8)
- **Thresholds:** statements 80%, branches 70%, functions 80%, lines 80%

## Organização dos Testes

### Unitários — `src/**/*.test.{ts,tsx}`

```
src/engine/spaced-repetition/sm2.test.ts
src/engine/retention/retentionModel.test.ts
src/engine/retention/forgettingRisk.test.ts
src/engine/spaced-repetition/scheduling.test.ts
src/engine/mastery/masteryScore.test.ts
src/engine/skill-evolution/skillProgression.test.ts
src/engine/active-learning/activeLearningScore.test.ts
src/engine/cognitive-score/cognitiveScore.test.ts
src/lib/security/__tests__/validation.test.ts
src/lib/security/__tests__/rateLimit.test.ts
src/lib/security/__tests__/sanitize.test.ts
src/lib/security/__tests__/rbac.test.ts
src/lib/ai/__tests__/prompts.test.ts
src/lib/validation/schemas.test.ts          ← UX-01: emailSchema, nameSchema, contentSchema
src/services/contentsService.test.ts        ← QA-01: mock Supabase builder
src/services/flashcardsService.test.ts      ← QA-01: mock Supabase builder
src/services/reviewService.test.ts          ← QA-01: recordReviewCycle
src/store/AppContext.test.ts                ← QA-01: todos os reducers (jsdom)
src/store/ToastContext.test.ts              ← QA-01: addToast/removeToast/MAX_TOASTS (jsdom)
src/hooks/useTheme.test.ts                  ← QA-01: toggle, localStorage, data-theme (jsdom)
src/hooks/useToast.test.ts                  ← QA-01: métodos success/error/warning/info (jsdom)
```

### E2E — `tests/e2e/*.spec.ts`

```
tests/e2e/global.setup.ts                   # Auth setup: Supabase Admin API → storageState
tests/e2e/auth.spec.ts                      # Login, Signup, rotas protegidas
tests/e2e/app.spec.ts                       # Landing, proteção de rotas
tests/e2e/ux-01-validation.spec.ts          # Validação UX-01 (formulários, toasts, a11y)
tests/e2e/library.spec.ts                   # QA-01: Fluxo biblioteca (autenticado)
tests/e2e/review.spec.ts                    # QA-01: Fluxo revisão (autenticado)
tests/e2e/accessibility.spec.ts             # QA-01: A11y (auth + app autenticado)
```

### Page Objects — `tests/e2e/pages/`

```
tests/e2e/pages/LibraryPage.ts              # goto, openAddModal, fillTitle, selectType, submit...
tests/e2e/pages/ReviewPage.ts               # goto, hasEmptyState, hasCardVisible, rateCard...
```

### Helpers — `tests/e2e/utils/helpers.ts`

```
waitForToast(page, pattern)
waitForRoute(page, urlPattern)
assertNoNativeBrowserValidation(page)
fillField(page, selector, value)
```

## Configuração Vitest

### Ambientes

- **Padrão:** `node` — engine, security, AI, services (sem DOM)
- **jsdom:** `// @vitest-environment jsdom` no topo do arquivo — store, hooks, componentes

### Setup Global

`src/test/setup.ts` — importa `@testing-library/jest-dom`

### Vitest Config (`vitest.config.ts`)

```ts
plugins: [react()] // JSX em testes de componentes
globals: true // require para @testing-library/jest-dom matchers
environment: 'node' // padrão; sobrescrito por docblock por arquivo
```

## Configuração Playwright

### Projetos

| Projeto         | Tipo       | storageState                | testMatch                           |
| --------------- | ---------- | --------------------------- | ----------------------------------- |
| `setup`         | Auth setup | —                           | `**/global.setup.ts`                |
| `chromium`      | Sem auth   | —                           | ignora library/review/accessibility |
| `authenticated` | Com auth   | `tests/e2e/.auth/user.json` | library, review, accessibility      |

### Auth E2E (Magic Link)

`global.setup.ts` usa Supabase Admin API (`admin.generateLink`) para obter `action_link` diretamente, navega até o link e salva `storageState`. Requer variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (servidor apenas — nunca no browser)
- `TEST_USER_EMAIL`

O diretório `tests/e2e/.auth/` está no `.gitignore`.

## Padrões de Teste

### Unitários (Vitest)

- Funções puras: entrada → saída esperada
- Schemas Zod: casos válidos, inválidos, limites (0, 1, max, max+1)
- Services: mock Supabase builder chain via `vi.mock('@/lib/supabase/client')`
- Store/Context: exportar `appReducer` + `EMPTY_STATE`; testar como função pura
- Hooks com DOM: `// @vitest-environment jsdom` + `vi.useFakeTimers()` quando necessário

### Supabase Mock Pattern

```ts
const mockChain = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), ... }
// cada método retorna mockChain (fluent)
vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockChain }))
// override por teste:
mockChain.select.mockResolvedValueOnce({ data: [...], error: null })
// import dinâmico após mock:
const { listContents } = await import('./contentsService')
```

### E2E (Playwright)

- `baseURL`: `http://localhost:3003`
- `webServer`: `npm run dev:clean` (auto-start, `reuseExistingServer: true` em dev)
- `page.waitForLoadState('networkidle')` para aguardar carregamento completo
- `role="alert"` para verificar erros de validação
- Page Objects para lógica reutilizável por feature

## Gate Check Commands

| Gate  | Quando usar                     | Comando                                                                    |
| ----- | ------------------------------- | -------------------------------------------------------------------------- |
| Quick | Após mudanças em utils/engines  | `npm run test:unit`                                                        |
| Full  | Antes de qualquer entrega       | `npm run type-check && npm run lint && npm run test:unit && npm run build` |
| E2E   | Após mudanças em UI/formulários | `npm run test:e2e`                                                         |

## Mandato de Cobertura

| Tipo de mudança            | Teste obrigatório                    |
| -------------------------- | ------------------------------------ |
| Nova função/hook/schema    | Vitest unitário                      |
| Novo componente UI         | Playwright E2E                       |
| Formulário novo/refatorado | Playwright E2E com validação PT-BR   |
| Fluxo de auth              | `auth.spec.ts` atualizado            |
| Service Supabase           | Vitest com mock builder              |
| Store/Context reducer      | Vitest unitário (funções exportadas) |
| Fluxo de biblioteca        | `library.spec.ts` atualizado         |
| Fluxo de revisão           | `review.spec.ts` atualizado          |
| Acessibilidade             | `accessibility.spec.ts` atualizado   |

## Paralelismo

| Tipo                          | Paralelo?              | Motivo                                |
| ----------------------------- | ---------------------- | ------------------------------------- |
| Unit (engines, schemas)       | Sim                    | Funções puras, sem estado             |
| Unit (security, ai)           | Sim                    | Mocks isolados                        |
| Unit (services, store, hooks) | Sim                    | Mocks isolados por arquivo            |
| E2E (Playwright)              | Sim (por arquivo)      | `fullyParallel: true` no config       |
| E2E authenticated             | Sequencial por projeto | Depende de `setup` completar primeiro |
