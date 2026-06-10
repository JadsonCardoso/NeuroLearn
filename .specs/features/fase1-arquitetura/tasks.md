# Tasks — Fase 1: Reestruturação Arquitetural

## T1 — Scaffold Next.js 15

**Depends:** nothing
**Done when:** `next build` sem erros após scaffold
**Files:** package.json, tsconfig.json, next.config.ts, tailwind.config.ts, .eslintrc.json

## T2 — Configurar Tailwind + Prettier

**Depends:** T1
**Done when:** tokens CSS vars mapeados no tailwind.config.ts; .prettierrc presente
**Files:** tailwind.config.ts, .prettierrc

## T3 — Criar tipos TypeScript (src/types/index.ts)

**Depends:** T1
**Done when:** Content, FlashCard, Skill, StudySession, AppState, AppAction todos definidos

## T4 — Criar engine (src/engine/)

**Depends:** T3
**Done when:** sm2.ts, retention.ts, scheduling.ts — tipados, sem any, lógica idêntica ao v1.0

## T5 — Criar lib (src/lib/)

**Depends:** T3
**Done when:** utils.ts (uid, addDays, relDate), seed.ts (SEED data)

## T6 — Criar services + store + hooks

**Depends:** T3, T4, T5
**Done when:**

- localStorageService.ts (load/save)
- AppContext.tsx (Context + useReducer + Provider)
- useAppData.ts, useTheme.ts

## T7 — Criar componentes UI (src/components/)

**Depends:** T1, T2
**Done when:** Button, Card, Badge, Ring, Input, Textarea, ProgressBar, Icons, Sidebar, ThemeToggle

## T8 — Criar módulos de página (src/modules/)

**Depends:** T3, T4, T5, T6, T7
**Done when:** DashboardView, LibraryView, AddContentModal, FocusView, ReviewView, ActiveView, SkillsView, HelpView

## T9 — Criar App Router (src/app/)

**Depends:** T6, T7, T8
**Done when:** globals.css, layout.tsx, page.tsx (redirect), (app)/layout.tsx, todas as 7 page.tsx

## T10 — Verificar compilação

**Depends:** T1-T9
**Done when:** `npx tsc --noEmit` sem erros; `next build` conclui
