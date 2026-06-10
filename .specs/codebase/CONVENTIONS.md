# Code Conventions

**Updated:** 2026-06-09 — Reflete stack Next.js 15 + TypeScript atual

---

## Naming

### Arquivos e Pastas

| Tipo                 | Convenção                    | Exemplo                                  |
| -------------------- | ---------------------------- | ---------------------------------------- |
| Componentes React    | PascalCase                   | `ProfileView.tsx`, `LoadingButton.tsx`   |
| Hooks                | camelCase com `use` prefix   | `useAppData.ts`, `useTheme.ts`           |
| Services             | camelCase + `Service` suffix | `contentsService.ts`                     |
| API Routes           | `route.ts` dentro de pasta   | `app/api/ai/generate-quiz/route.ts`      |
| Testes unitários     | mesmo nome + `.test.ts`      | `cognitiveScore.test.ts`                 |
| Testes E2E           | `kebab-case.spec.ts`         | `profile.spec.ts`, `crud-01.spec.ts`     |
| Pastas de feature    | kebab-case                   | `spaced-repetition/`, `cognitive-score/` |
| Constantes de módulo | UPPER_SNAKE_CASE             | `EMPTY_STATE`, `NAV_ITEMS`               |

### Código

```typescript
// Componentes: PascalCase
export function ProfileView() { ... }
export function LoadingButton({ children, loading }: Props) { ... }

// Hooks: camelCase com use
export function useAppData() { ... }
export function useTheme() { ... }

// Services: camelCase, verbos descritivos
export async function createContent(userId, input) { ... }
export async function listDueFlashcards(userId) { ... }
export async function updateUserProfile(updates) { ... }

// Funções puras de engine: camelCase, prefixo calc/calculate/get
export function calculateStreak(lastDate, current) { ... }
export function calculateLevelUp(skill: Skill) { ... }
export function calcRetention(card: FlashCard) { ... }
```

---

## Estrutura de Componentes

### Client Components (módulos, interativos)

```typescript
'use client'

import { useEffect, useState } from 'react'
// ... outros imports

interface ComponentProps {
  // props tipadas
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // estado local primeiro
  const [state, setState] = useState(...)

  // hooks customizados
  const { state: appState, dispatch } = useAppData()
  const { toast } = useToast()

  // efeitos
  useEffect(() => {
    // ...
  }, [dep1, dep2])

  // handlers
  function handleAction() { ... }

  // early returns (loading, empty states)
  if (loading) return <Skeleton />

  // render
  return (
    <div>...</div>
  )
}
```

### Server Components (pages, layouts)

```typescript
import { Metadata } from 'next'
import { FeatureView } from '@/modules/feature/FeatureView'

export const metadata: Metadata = {
  title: 'Título — NeuroLearn',
}

export default function FeaturePage() {
  return <FeatureView />
}
```

---

## Formulários

**Stack obrigatória:** React Hook Form + Zod + zodResolver

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  field: z.string().min(1, 'Campo obrigatório'),
})

type FormValues = z.infer<typeof schema>

export function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { field: '' },
  })

  async function onSubmit(data: FormValues) { ... }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate> {/* noValidate OBRIGATÓRIO */}
      <FormField label="Nome" htmlFor="field" error={errors.field?.message}>
        <Input id="field" {...register('field')} error={!!errors.field} />
      </FormField>
      <LoadingButton type="submit" loading={isSubmitting}>Salvar</LoadingButton>
    </form>
  )
}
```

**Regras:**

- `noValidate` sempre presente (desativa validação nativa do browser)
- Schemas Zod em `src/lib/validation/schemas.ts` (schemas globais) ou próximos ao componente (schemas locais)
- Mensagens de erro em PT-BR
- `LoadingButton` com `disabled` durante `isSubmitting`

---

## Serviços (Data Layer)

```typescript
// src/services/xyzService.ts

import { createClient } from '@/lib/supabase/client'
import type { XYZ } from '@/types'

// Sempre: async function, retorna dados ou lança erro
export async function listXYZItems(userId: string): Promise<XYZ[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('xyz')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
```

**Regras:**

- Services são stateless — recebem parâmetros, retornam dados
- `throw error` para propagar para o caller (AppContext catch)
- Sem `console.log` nos services (apenas `console.error` em casos de monitoramento)
- `createClient()` chamado dentro do service (não no caller)

---

## Hooks Customizados

```typescript
// src/hooks/useXYZ.ts

export function useXYZ() {
  const [data, setData] = useState<XYZ | null>(null)

  useEffect(() => {
    // efeito
  }, [])

  return { data, ... }
}
```

**Regras:**

- Sem lógica de negócio complexa — hooks coordenam estado/efeitos, não calculam
- Lógica pura → engine/ ou reducers/
- Prefixo `use` obrigatório
- Retornar objeto (não array) para clareza de props

---

## Testes

### Unitários (Vitest)

**Localização:** Junto ao arquivo testado  
**Naming:** `<nome>.test.ts`

```typescript
// cognitiveScore.test.ts
import { describe, it, expect } from 'vitest'
import { calcCognitiveScore } from './cognitiveScore'

describe('calcCognitiveScore', () => {
  it('retorna 0 quando todos os inputs são 0', () => {
    expect(
      calcCognitiveScore({ retention: 0, mastery: 0, consistency: 0, activeLearning: 0 })
    ).toBe(0)
  })

  it('retorna 100 quando todos os inputs são 100', () => {
    expect(
      calcCognitiveScore({ retention: 100, mastery: 100, consistency: 100, activeLearning: 100 })
    ).toBe(100)
  })

  // sempre testar: válido, inválido, limites
})
```

**Cobertura mínima por função:**

- Caso válido (happy path)
- Caso inválido / edge case
- Valor limite (0, máximo, null/undefined)

### E2E (Playwright)

**Localização:** `tests/e2e/`  
**Naming:** `<feature>.spec.ts`  
**Projects:**

- `chromium` — testes sem autenticação (landing, auth forms)
- `authenticated` — testes com sessão (dashboard, library, review, profile)

**Padrão de test ID:** `data-testid="<área>-<elemento>"` — ex: `data-testid="library-search"`, `data-testid="review-card-front"`

---

## Inline Styles vs Tailwind

| Contexto               | Abordagem                                            |
| ---------------------- | ---------------------------------------------------- |
| Novos componentes      | Tailwind utilities                                   |
| Theming (dark/light)   | CSS custom properties via `var(--color)`             |
| Animações dinâmicas    | Inline styles (valores calculados em JS)             |
| Componentes existentes | Manter o padrão do arquivo (não misturar sem motivo) |

**CSS vars de tema disponíveis:** `--bg`, `--bg2`, `--text`, `--text2`, `--text3`, `--text4`, `--border`, `--color-primary`, `--color-info`, `--color-success`, `--color-warning`, `--color-danger`, etc.

---

## Imports

**Ordem preferencial:**

```typescript
// 1. Externos (react, next, etc.)
import { useState, useEffect } from 'react'
import Link from 'next/link'

// 2. Internos com alias @/
import { useAppData } from '@/hooks/useAppData'
import { FormField } from '@/components/ui/FormField'

// 3. Tipos (sempre ao final)
import type { Content } from '@/types'
```

**Alias `@/`** sempre (nunca `../../`).

---

## Error Handling

```typescript
// Em API routes
try {
  const result = await operation()
  return NextResponse.json(result)
} catch (error) {
  console.error('[route-name] Erro:', error)
  return NextResponse.json({ error: 'Mensagem amigável' }, { status: 500 })
}

// Em services
const { data, error } = await supabase.from(...).select(...)
if (error) throw error  // propaga para o caller

// Em componentes
try {
  await action()
  toast.success('Sucesso!')
} catch {
  toast.error('Não foi possível concluir. Tente novamente.')
}
```

---

## Commits (Conventional Commits — enforçado via Husky)

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração sem mudança de comportamento
test: adição/atualização de testes
docs: documentação
chore: configuração, dependências
perf: otimização de performance
ci: configuração de CI/CD
hotfix: correção urgente em produção
build: mudanças no build system
```

**Formato:** `tipo(escopo?): descrição curta`  
**Exemplo:** `refactor(auth): extrair calculateStreak para função pura`  
**Máximo header:** 100 caracteres

---

## Comentários

**Quando escrever:**

- WHY não-óbvio (constraint oculta, invariante, workaround de bug específico)
- Algoritmos matemáticos (fórmula, paper de referência)

**Quando NÃO escrever:**

- WHAT o código faz (use nomes descritivos)
- "Adicionado para X feature" (pertence ao PR)
- TODO sem data/issue (use issues do GitHub)

```typescript
// ✅ Bom — explica WHY não-óbvio
// SECURITY DEFINER para evitar recursão infinita no RLS de public.users
CREATE OR REPLACE FUNCTION get_my_role() ...

// ✅ Bom — referência ao algoritmo
// R = e^(-t/S) — Ebbinghaus exponential decay
// S = intervalDays * easeFactor (estabilidade cognitiva)

// ❌ Ruim — descreve WHAT
// Calcula a retenção do card
function calcRetention(card: FlashCard) { ... }
```
