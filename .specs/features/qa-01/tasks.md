# QA-01 — Tasks

**Fase:** QA-01  
**Última atualização:** 2026-06-06  
**Total tasks:** 14  
**Sequência:** T-01 → T-02 → T-03 → T-04 → T-05 → [T-06 T-07 T-08 paralelos] → T-09 → T-10 → T-11 → T-12 → [T-13 T-14 paralelos]

---

## T-01 — Atualizar CLAUDE.md com qa-estrategico obrigatório

**What:** Adicionar `qa-estrategico` ao CLAUDE.md do projeto como etapa mandatória pós-implementação  
**Where:** `CLAUDE.md` (raiz do projeto)  
**Depends on:** —  
**Done when:**

- Skill qa-estrategico aparece no Fluxo Obrigatório (passo após gate técnico)
- Gate de Qualidade tem checklist item para QA estratégico
- Seção "Skills Disponíveis" menciona qa-estrategico com quando usar  
  **Tests:** Leitura visual  
  **Gate:** —  
  **Status:** ⬜ pending

---

## T-02 — Setup: Vitest com dual environment + Testing Library

**What:** Instalar @testing-library/react + @testing-library/user-event + @testing-library/jest-dom e configurar ambientes node/jsdom  
**Where:** `package.json`, `vitest.config.ts`  
**Depends on:** —  
**Done when:**

- Dependências instaladas sem conflitos
- `vitest.config.ts` com `environmentMatchGlobs` para components/hooks/store → jsdom
- Include expandido para `src/hooks/**/*.test.ts`, `src/store/**/*.test.ts`
- `setupFiles` com `@testing-library/jest-dom` para matchers extras  
  **Tests:** `npm run test:unit` passa sem erros  
  **Gate:** `npm run type-check`  
  **Status:** ⬜ pending

---

## T-03 — Testes unitários: AppContext reducer

**What:** Exportar `appReducer` do AppContext e criar testes para todas as actions  
**Where:** `src/store/AppContext.tsx`, `src/store/AppContext.test.ts` (novo)  
**Depends on:** T-02  
**Reuses:** Tipos de `@/types`  
**Done when:**

- `appReducer` exportado do AppContext
- `EMPTY_STATE` exportado
- Testes cobrem: LOAD_STATE, ADD_CONTENT, DELETE_CONTENT, UPDATE_CONTENT_PROGRESS, ADD_CARDS, RATE_CARD
- Testes verificam imutabilidade (next !== prev)
- Testes cobrem DELETE_CONTENT cascata (remove cards com mesmo cid)  
  **Tests:** 15+ assertions no arquivo  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-04 — Testes unitários: ToastContext

**What:** Criar testes para `ToastProvider` (addToast, removeToast, MAX_TOASTS, timer cleanup)  
**Where:** `src/store/ToastContext.test.ts` (novo)  
**Depends on:** T-02  
**Done when:**

- `renderWithProvider` helper criado localmente
- Testa addToast → toast aparece na lista
- Testa removeToast → toast é removido
- Testa MAX_TOASTS (3) → quarto toast remove o mais antigo
- Testa tipos: success/error/warning/info com durations corretas  
  **Tests:** 10+ assertions  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-05 — Testes unitários: useTheme + useToast hooks

**What:** Criar testes para hooks simples  
**Where:** `src/hooks/useTheme.test.ts` (novo), `src/hooks/useToast.test.ts` (novo)  
**Depends on:** T-02  
**Done when:**

- useTheme: toggle muda tema, valor inicial 'dark', persistência localStorage
- useToast: wrapper de useToastContext, assina toast.success/error/warning/info  
  **Tests:** 8+ assertions  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-06 — Testes unitários: contentsService [P]

**What:** Criar testes com Supabase mockado para todas as funções de contentsService  
**Where:** `src/services/contentsService.test.ts` (novo)  
**Depends on:** T-02  
**Reuses:** Mock pattern de DA-02  
**Done when:**

- listContents: sucesso retorna Content[], erro do Supabase lança throw
- createContent: sucesso retorna Content criado, erro lança throw
- updateContentProgress: chama .update().eq() com valores corretos
- removeContent: chama .delete().eq() com id correto
- toContent mapper: cobre conversão de DbContent → Content (incluindo nulls)  
  **Tests:** 15+ assertions  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-07 — Testes unitários: flashcardsService [P]

**What:** Criar testes com Supabase mockado para flashcardsService  
**Where:** `src/services/flashcardsService.test.ts` (novo)  
**Depends on:** T-02  
**Reuses:** Mock pattern de DA-02  
**Done when:**

- listFlashcardsByContent: filtra por content_id
- listDueFlashcards: filtra por next_review <= hoje
- createFlashcards: insere múltiplos, retorna array
- updateFlashcardSM2: atualiza ef, interval, repetitions, mastery
- toFlashCard mapper: conversão correta de DbFlashcard → FlashCard  
  **Tests:** 15+ assertions  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-08 — Testes unitários: reviewService [P]

**What:** Criar testes com Supabase mockado para reviewService  
**Where:** `src/services/reviewService.test.ts` (novo)  
**Depends on:** T-02  
**Done when:**

- Lê reviewService para entender assinatura
- Cobre: sucesso + erro Supabase
- Cobre cálculo correto dos campos inseridos  
  **Tests:** 8+ assertions  
  **Gate:** `npm run test:unit`  
  **Status:** ⬜ pending

---

## T-09 — Playwright: global setup + auth fixture

**What:** Criar global.setup.ts com autenticação via Supabase Admin + storageState; configurar playwright.config.ts  
**Where:** `tests/e2e/global.setup.ts` (novo), `playwright.config.ts`  
**Depends on:** T-06, T-07  
**Done when:**

- `global.setup.ts` usa SUPABASE_SERVICE_ROLE_KEY para gerar magic link
- Salva auth state em `tests/e2e/.auth/user.json`
- `playwright.config.ts`: `globalSetup`, projeto `authenticated` com `storageState`
- `.gitignore` atualizado para ignorar `tests/e2e/.auth/`
- Variável `TEST_USER_EMAIL` documentada no `README` ou `.env.example`  
  **Tests:** Playwright com `--project=authenticated` não falha por auth  
  **Gate:** `npm run test:e2e` (pelo menos o setup executa sem erro)  
  **Status:** ⬜ pending

---

## T-10 — Playwright: Page Objects (LoginPage, LibraryPage)

**What:** Criar Page Objects base para os fluxos mais usados  
**Where:** `tests/e2e/pages/` (novo)  
**Depends on:** T-09  
**Done when:**

- `LoginPage.ts`: goto, fillEmail, submit, getErrorAlert
- `LibraryPage.ts`: goto, openAddModal, fillContentForm, submitForm, getContentCard, deleteContent
- `helpers.ts`: waitForToast(page, type), clearTestData helper  
  **Tests:** Usado pelos testes E2E de fluxo  
  **Gate:** TypeScript compila sem erros  
  **Status:** ⬜ pending

---

## T-11 — E2E: Fluxo Biblioteca (autenticado)

**What:** Testes E2E para o fluxo completo de biblioteca usando auth fixture  
**Where:** `tests/e2e/library.spec.ts` (novo)  
**Depends on:** T-09, T-10  
**Done when:**

- Adicionar conteúdo válido → aparece na lista
- Adicionar com título vazio → erro de validação (sem popup nativo)
- Excluir conteúdo → removido da lista
- Reload após adicionar → conteúdo persiste  
  **Tests:** 6+ testes  
  **Gate:** `npm run test:e2e`  
  **Status:** ⬜ pending

---

## T-12 — E2E: Fluxo Revisão (autenticado)

**What:** Testes E2E para fluxo de revisão espaçada  
**Where:** `tests/e2e/review.spec.ts` (novo)  
**Depends on:** T-09, T-10  
**Done when:**

- Página de revisão carrega sem erro
- Estado "sem revisões pendentes" quando fila vazia
- Se há cards, exibe front do card
- Responder card com botão de qualidade funciona  
  **Tests:** 5+ testes  
  **Gate:** `npm run test:e2e`  
  **Status:** ⬜ pending

---

## T-13 — E2E: Acessibilidade [P]

**What:** Testes de acessibilidade nas páginas principais  
**Where:** `tests/e2e/accessibility.spec.ts` (novo)  
**Depends on:** T-09  
**Done when:**

- Login/Signup: h1 presente, labels associadas, role="alert" funciona
- Dashboard: h1 presente, botões icon-only têm aria-label
- Library: modal fecha com Escape, foco retorna ao trigger  
  **Tests:** 8+ testes  
  **Gate:** `npm run test:e2e`  
  **Status:** ⬜ pending

---

## T-14 — Coverage threshold + TESTING.md update [P]

**What:** Adicionar thresholds de cobertura ao Vitest + atualizar TESTING.md  
**Where:** `vitest.config.ts`, `.specs/codebase/TESTING.md`  
**Depends on:** T-03..T-08 completos  
**Done when:**

- `thresholds` no coverage: statements 80%, branches 70%, functions 80%
- TESTING.md atualizado: novos padrões (dual env, service mocks, page objects), thresholds, total de testes
- CLAUDE.md atualizado com qa-estrategico (se T-01 não fez)  
  **Tests:** `npm run test:coverage` mostra thresholds  
  **Gate:** `npm run test:unit && npm run build`  
  **Status:** ⬜ pending

---

## Ordem de Execução

```
T-01 (CLAUDE.md)     ← independente, executar primeiro
T-02 (setup deps)    ← base para T-03..T-08
   ├── T-03 (reducer)
   ├── T-04 (Toast)
   ├── T-05 (hooks)
   ├── T-06 (contents) [P com T-07, T-08]
   ├── T-07 (flashcards) [P]
   └── T-08 (review) [P]
T-09 (E2E auth setup)
T-10 (Page Objects)
   ├── T-11 (E2E library) [P com T-12, T-13]
   ├── T-12 (E2E review) [P]
   └── T-13 (E2E a11y) [P]
T-14 (thresholds + docs) ← após todos os testes criados
```
