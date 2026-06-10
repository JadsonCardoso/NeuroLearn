# QA-01 — Design da Infraestrutura de Testes

**Fase:** QA-01  
**Última atualização:** 2026-06-06

---

## Decisões Arquiteturais

### DA-01 — Dual Environment no Vitest

**Problema:** Engine/services rodam em Node; componentes React precisam de DOM (jsdom).  
**Decisão:** Configurar dois ambientes no Vitest usando `environmentMatchGlobs`.

```ts
// vitest.config.ts
environmentMatchGlobs: [
  ['src/components/**', 'jsdom'],
  ['src/hooks/**', 'jsdom'],
  ['src/store/**', 'jsdom'],
  // demais: node (padrão)
]
```

**Por quê:** Evita rodar jsdom em testes de engine/utils (overhead desnecessário); mantém testes rápidos.

---

### DA-02 — Mock Strategy para Supabase

**Problema:** Services chamam `createClient()` do Supabase — não podemos testar contra produção.  
**Decisão:** `vi.mock('@/lib/supabase/client')` retornando um objeto encadeável (builder pattern).

```ts
// padrão reutilizado em todos os service tests
const mockChain = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
}
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))
```

**Por quê:** Simples, sem deps extras (não precisa MSW); cobre os padrões de acesso usados nos services.

---

### DA-03 — E2E Auth: Global Setup com Supabase Admin

**Problema:** Magic Link não pode ser clicado automaticamente (requer acesso a email).  
**Decisão:** `global.setup.ts` usa Supabase Admin Client para gerar magic link URL, navega diretamente, salva `storageState`.

```ts
// tests/e2e/global.setup.ts
import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function globalSetup() {
  const { data } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: process.env.TEST_USER_EMAIL!,
  })
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(data.properties.action_link)
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' })
  await browser.close()
}
```

**Constraint:** `SERVICE_ROLE_KEY` usado APENAS no global setup (Node, nunca no browser).  
**Dependência:** Variável `TEST_USER_EMAIL` no `.env.local` (só em dev/test, nunca produção).

---

### DA-04 — Page Object Pattern

**Estrutura:**

```
tests/e2e/
├── pages/
│   ├── LoginPage.ts
│   ├── LibraryPage.ts
│   └── ReviewPage.ts
├── fixtures/
│   ├── contents.ts   # dados de teste para conteúdos
│   └── cards.ts      # dados de teste para flashcards
├── utils/
│   └── helpers.ts    # waitForToast, clearTestData, etc
├── global.setup.ts
└── .auth/
    └── user.json     # salvo pelo global setup (gitignored)
```

**Page Object Example:**

```ts
// tests/e2e/pages/LibraryPage.ts
export class LibraryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/library')
  }

  async openAddModal() {
    await this.page.click('[data-testid="add-content-btn"]')
  }

  async fillContentForm(data: { title: string; type?: string }) {
    await this.page.fill('#title', data.title)
    if (data.type) await this.page.selectOption('#type', data.type)
  }

  async submitForm() {
    await this.page.click('button[type="submit"]:has-text("Adicionar")')
  }

  async getContentCard(title: string) {
    return this.page.locator(`[data-testid="content-card"]:has-text("${title}")`)
  }
}
```

---

### DA-05 — AppContext Reducer como Função Pura

**Insight:** O reducer é uma função pura exportável — testável sem renderizar React.

```ts
// Extrair appReducer para arquivo separado para testar diretamente
import { appReducer } from '@/store/AppContext'

describe('appReducer', () => {
  it('ADD_CONTENT adiciona ao array', () => {
    const state = { ...EMPTY_STATE }
    const next = appReducer(state, { type: 'ADD_CONTENT', payload: mockContent })
    expect(next.contents).toHaveLength(1)
    expect(next).not.toBe(state) // imutabilidade
  })
})
```

**Risco:** appReducer pode não estar exportado. Se não estiver, precisa de pequena refatoração (exportar função).

---

## Estrutura de Pastas Final

```
tests/
├── e2e/
│   ├── pages/              ← Page Objects (novo)
│   ├── fixtures/           ← Dados de teste (novo)
│   ├── utils/
│   │   └── helpers.ts      ← (novo)
│   ├── .auth/
│   │   └── user.json       ← Auth state (gitignored, novo)
│   ├── global.setup.ts     ← (novo)
│   ├── landing.spec.ts     ← (existente)
│   ├── auth.spec.ts        ← (existente)
│   ├── app.spec.ts         ← (existente)
│   ├── ux-01-validation.spec.ts ← (existente)
│   ├── library.spec.ts     ← (novo)
│   ├── review.spec.ts      ← (novo)
│   └── accessibility.spec.ts ← (novo)
│
src/
├── services/
│   ├── contentsService.ts
│   ├── contentsService.test.ts   ← (novo)
│   ├── flashcardsService.ts
│   ├── flashcardsService.test.ts ← (novo)
│   └── reviewService.ts
├── store/
│   ├── AppContext.tsx
│   ├── AppContext.test.ts         ← (novo)
│   └── ToastContext.test.ts       ← (novo)
└── hooks/
    ├── useTheme.test.ts            ← (novo)
    └── useToast.test.ts            ← (novo)
```

---

## Impacto em Arquivos Existentes

| Arquivo                      | Mudança                                                                          | Motivo          |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------- |
| `vitest.config.ts`           | Adicionar environmentMatchGlobs + include de hooks/store/components + thresholds | DA-01, R01, R10 |
| `playwright.config.ts`       | Adicionar globalSetup, storageState, projeto autenticado                         | DA-03, R05      |
| `src/store/AppContext.tsx`   | Exportar `appReducer` e `EMPTY_STATE`                                            | DA-05, R03      |
| `.gitignore`                 | Adicionar `tests/e2e/.auth/`                                                     | DA-03           |
| `CLAUDE.md` (projeto)        | Adicionar qa-estrategico como mandatório                                         | R09             |
| `.specs/codebase/TESTING.md` | Atualizar com novos padrões e thresholds                                         | R10             |
