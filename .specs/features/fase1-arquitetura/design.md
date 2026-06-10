# Design — Fase 1: Reestruturação Arquitetural

## Padrão arquitetural: Vertical Slice + Domain Engine

```
┌─────────────────────────────────────────────────────────────┐
│                        App Router                           │
│  /dashboard  /library  /focus/[id]  /review  /active  ...  │
└──────────────────────────┬──────────────────────────────────┘
                           │ page.tsx (thin — só monta View)
┌──────────────────────────▼──────────────────────────────────┐
│                       Modules                               │
│  DashboardView  LibraryView  FocusView  ReviewView  ...     │
│  (Client Components — consomem hooks, renderizam UI)        │
└──────────────────────────┬──────────────────────────────────┘
                           │ useAppData()
┌──────────────────────────▼──────────────────────────────────┐
│                    Store / Context                          │
│  AppContext → useReducer → AppState                         │
│  ↕ sync                                                     │
│  localStorageService.ts (load / save)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ pure functions
┌──────────────────────────▼──────────────────────────────────┐
│                       Engine                                │
│  sm2.ts  retention.ts  scheduling.ts                        │
│  (zero deps — puras, testáveis, sem React)                  │
└─────────────────────────────────────────────────────────────┘
```

## Decisões arquiteturais

### 1. State: React Context + useReducer

**Por quê:** Zero dependências extras, TypeScript nativo, fácil upgrade para Zustand/Supabase em fases futuras.
**Trade-off:** Menos performático que Zustand para updates granulares, mas aceitável para a escala atual.

### 2. Routing: Next.js App Router com grupo `(app)`

**Por quê:** Permite layout compartilhado (Sidebar) sem repetição. Focus usa `/focus/[contentId]` para navegação direta.
**Trade-off:** Quebra o fluxo de `startSession(c)` → navegação, que agora vira `router.push('/focus/id')`.

### 3. Server vs Client Components

- **Server:** `app/layout.tsx`, `(app)/layout.tsx` (sem estado)
- **Client:** Todos os módulos (usam localStorage, hooks, interação)
- **Regra:** `'use client'` em qualquer componente que usa `useState`, `useEffect`, `useRouter`

### 4. Theming: CSS Custom Properties (mantido igual ao v1.0)

```css
/* globals.css */
:root { --bg: #0a0b0f; --card: #13141a; ... }
[data-theme="light"] { --bg: #f8fafc; --card: #ffffff; ... }
```

Tailwind usa as vars como `bg-[var(--bg)]` ou via `tailwind.config.ts` extend.

### 5. Engine: módulo puro sem React

Os algoritmos `sm2`, `calcRetention`, `isDue` vivem em `src/engine/` — sem imports React, sem efeitos colaterais. Prontamente testáveis com Vitest (Fase futura).

## Data flow: Revisão de um card

```
ReviewView (Client Component)
  → rate(quality: 1|2|3|4)
    → sm2(quality, card.ef, card.interval, card.reps)  [engine]
    → calcRetention(card)                               [engine]
    → dispatch({ type: 'RATE_CARD', payload: {...} })   [store]
      → AppContext reducer
        → novo state com card atualizado
        → useEffect → localStorageService.save(state)
```

## Focus Session routing

```
Library:
  <button onClick={() => router.push(`/focus/${content.id}`)}>Estudar</button>

/focus/[contentId]/page.tsx:
  const { contentId } = useParams()
  const { state } = useAppData()
  const content = state.contents.find(c => c.id === contentId)
  return <FocusView content={content} />

FocusView.onFinish({ session, cards }):
  dispatch({ type: 'FINISH_SESSION', payload: { session, cards } })
  router.push('/dashboard')
```

## Tailwind token mapping

| CSS var        | Tailwind class                           |
| -------------- | ---------------------------------------- |
| `var(--bg)`    | `bg-[var(--bg)]` ou `theme('colors.bg')` |
| `var(--card)`  | `bg-[var(--card)]`                       |
| `#7c3aed`      | `bg-purple-600` ou `bg-[#7c3aed]`        |
| `var(--text3)` | `text-[var(--text3)]`                    |

Para evitar classes extensas, prefiro usar inline style com CSS vars quando há muita granularidade visual, mantendo a UX idêntica ao v1.0.
