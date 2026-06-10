# Feature Spec — Fase 1: Reestruturação Arquitetural

**ID:** F-FASE1
**Status:** 🔄 In Progress
**Complexidade:** Grande — arquitetura completa
**Blocker p/ Fase 2:** Sim (toda fase futura depende desta estrutura)

## Overview

Migrar o NeuroLearn de uma SPA monolítica (`index.html` com React CDN + Babel) para um projeto Next.js 15 profissional com TypeScript, TailwindCSS, App Router e Clean Architecture. Paridade funcional 100% com v1.0. Sem novas features.

## Restrições obrigatórias

- NÃO alterar regras de negócio (SM-2, retention, scheduling)
- NÃO criar novas funcionalidades
- NÃO refatorar UX (visual deve ser idêntico ao v1.0)
- NÃO adicionar IA ou microserviços
- NÃO usar `any` no TypeScript

---

## Requirements

### R-F1-01 — Scaffold Next.js 15

**Done when:**

- `npx create-next-app@15` com flags: `--typescript --tailwind --app --src-dir --eslint`
- Alias `@/*` configurado em `tsconfig.json`
- App compila sem erros: `next build`

### R-F1-02 — Estrutura de diretórios

```
src/
├── app/                  # Next.js App Router
│   ├── (app)/            # grupo: layout com sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── library/page.tsx
│   │   ├── focus/[contentId]/page.tsx
│   │   ├── review/page.tsx
│   │   ├── active/page.tsx
│   │   ├── skills/page.tsx
│   │   └── help/page.tsx
│   ├── layout.tsx
│   ├── page.tsx          # redirect → /dashboard
│   └── globals.css
├── components/
│   ├── ui/               # Button, Card, Badge, Ring, Input, Textarea, ProgressBar
│   ├── layout/           # Sidebar, ThemeToggle
│   └── icons/            # todos os ícones SVG
├── modules/              # views por feature (lógica + JSX acoplados ao domínio)
│   ├── dashboard/DashboardView.tsx
│   ├── library/LibraryView.tsx + AddContentModal.tsx
│   ├── focus/FocusView.tsx
│   ├── review/ReviewView.tsx
│   ├── active/ActiveView.tsx
│   ├── skills/SkillsView.tsx
│   └── help/HelpView.tsx
├── services/
│   └── localStorageService.ts
├── hooks/
│   ├── useAppData.ts
│   └── useTheme.ts
├── lib/
│   ├── utils.ts          # uid, addDays, relDate
│   └── seed.ts           # SEED data
├── store/
│   └── AppContext.tsx    # Context + useReducer
├── domain/
│   ├── content.ts        # ContentType config
│   └── skill.ts          # SkillCategory config
├── engine/
│   ├── sm2.ts            # SM-2 algorithm (tipado)
│   ├── retention.ts      # calcRetention
│   └── scheduling.ts     # isDue, addDays utils
└── types/
    └── index.ts          # todos os tipos TypeScript
```

**Done when:** Estrutura criada, sem erros de importação.

### R-F1-03 — Tipos TypeScript fortes

**Done when:**

- Todas as entidades tipadas: `Content`, `FlashCard`, `Skill`, `StudySession`
- `AppState` e `AppAction` definidos para o reducer
- Nenhum `any` no codebase
- Props de todos os componentes tipadas

### R-F1-04 — Engine algorithms extraídos e tipados

**Done when:**

- `sm2()` com tipos `SM2Input` e `SM2Result`
- `calcRetention(card: FlashCard): number`
- `isDue(card: FlashCard): boolean`
- Algoritmos idênticos ao v1.0 (sem mudança de lógica)

### R-F1-05 — Estado gerenciado via React Context

**Done when:**

- `AppContext` com `useReducer` gerencia todo o estado
- Actions tipadas para cada mutação (addContent, addCards, rateCard, etc.)
- `localStorage` sincronizado via `useEffect` no provider
- Hook `useAppData()` expõe estado e dispatch tipados

### R-F1-06 — Componentes UI reutilizáveis com Tailwind

**Done when:**

- `Button`, `Card`, `Badge`, `Ring`, `Input`, `Textarea`, `ProgressBar` criados
- CSS vars (`--bg`, `--card`, `--border`, etc.) integradas via `tailwind.config.ts`
- `Sidebar` e `ThemeToggle` funcionando com App Router

### R-F1-07 — App Router com layout e rotas

**Done when:**

- `(app)/layout.tsx` renderiza Sidebar + main
- Todas as 7 rotas mapeadas e compilando
- Root `page.tsx` redireciona para `/dashboard`
- Navegação via `next/navigation` funcionando

### R-F1-08 — Setup lint e prettier

**Done when:**

- ESLint configurado (next/core-web-vitals + typescript)
- `.prettierrc` configurado
- `next build` sem erros de lint
