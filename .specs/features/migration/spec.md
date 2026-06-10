# Feature Spec — Migração Técnica (SPA → Next.js + Supabase)

**ID:** F-020
**Status:** 🔜 Planned (v1.2)
**Complexidade:** Grande — 3–5 semanas

## Overview

Migrar o NeuroLearn de uma SPA single-file (index.html com React CDN) para uma stack moderna: Next.js 14 + TypeScript + TailwindCSS + Supabase. Manter 100% de paridade funcional com v1.0 durante a migração. Zero downtime para usuários (o v1.0 continua funcionando até a v1.2 estar estável).

## Princípio de migração

**Strangler Fig Pattern** — construir o novo ao lado do antigo, feature a feature, sem big bang rewrite.

```
v1.0 (index.html) ──── continua funcional
v1.2 (Next.js)    ──── construído em paralelo, substitui quando completo
```

---

## Requirements

### R-020-01 — Setup do projeto Next.js

**Done when:**

- `npx create-next-app@latest neurolearn --typescript --tailwind --app --src-dir`
- App Router configurado com layout raiz (sidebar + main)
- TailwindCSS com design tokens mapeados dos CSS vars atuais
- ESLint + Prettier configurados
- Vitest instalado e rodando `npm test`

---

### R-020-02 — Estrutura de diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # grupo: rotas autenticadas
│   │   ├── dashboard/
│   │   ├── library/
│   │   ├── focus/
│   │   ├── review/
│   │   ├── active/
│   │   ├── skills/
│   │   └── help/
│   ├── (public)/           # grupo: rotas públicas
│   │   ├── page.tsx        # landing page
│   │   └── login/
│   ├── layout.tsx          # layout raiz
│   └── globals.css
├── components/
│   ├── ui/                 # atoms: Button, Card, Badge, Ring, Input
│   ├── layout/             # Sidebar, Navbar, ThemeToggle
│   └── features/           # componentes por feature
├── lib/
│   ├── supabase/           # client, server, middleware
│   ├── algorithms/         # sm2.ts, retention.ts, scheduling.ts
│   ├── hooks/              # useAuth, useData, useTheme
│   └── utils/              # formatters, validators
├── types/                  # tipos TypeScript globais
└── tests/                  # Vitest unit tests
```

**Done when:** Estrutura criada, importações funcionando, sem erros de TypeScript.

---

### R-020-03 — Extração dos algoritmos core

**Migrar para `src/lib/algorithms/`:**

```typescript
// sm2.ts
export function sm2(quality: 1 | 2 | 3 | 4, ef: number, interval: number, reps: number): SM2Result

// retention.ts
export function calcRetention(card: FlashCard): number

// scheduling.ts
export function isDue(card: FlashCard): boolean
export function addDays(days: number, from?: Date): Date
```

**Done when:** Funções tipadas + testes unitários passando (≥10 casos por função).

---

### R-020-04 — Design System com TailwindCSS

Mapear os CSS vars atuais para tokens Tailwind:

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)',
      card: 'var(--card)',
      border: 'var(--border)',
      text: { DEFAULT: 'var(--text)', muted: 'var(--text3)' },
      purple: { DEFAULT: '#7c3aed', light: '#a78bfa' },
      cyan: '#06b6d4',
    }
  }
}
```

**Done when:** Componentes `Button`, `Card`, `Badge`, `Ring`, `Input`, `Textarea` criados como componentes React tipados com Tailwind.

---

### R-020-05 — Migração de dados localStorage → Supabase

**Estratégia de migração do usuário:**

1. Na primeira abertura do app migrado: detectar dados no localStorage
2. Oferecer botão "Migrar meus dados para a nuvem"
3. Após autenticação: `POST /api/migrate` com o JSON exportado
4. Backend insere dados no PostgreSQL do usuário
5. Manter localStorage como fallback por 30 dias

**Done when:** Usuário com dados no localStorage consegue migrar sem perda; dados aparecem corretamente no novo app.

---

### R-020-06 — Deploy Vercel + Supabase Cloud

**Checklist:**

- [ ] Criar projeto no Supabase Cloud
- [ ] Configurar environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Preview deployments para cada PR
- [ ] Production domain configurado
- [ ] Health check endpoint: `GET /api/health`

**Done when:** App acessível em URL pública, login funcionando, dados persistindo no Supabase.

---

## Paridade funcional obrigatória (v1.0 → v1.2)

| Funcionalidade v1.0            | Status na migração                |
| ------------------------------ | --------------------------------- |
| Dashboard com métricas         | Deve manter todos os indicadores  |
| Biblioteca + CRUD de conteúdos | Dados no PostgreSQL               |
| Sessão de Foco 3 fases         | Preservar fluxo exato             |
| Revisão SM-2                   | Algoritmo idêntico ao v1.0        |
| Aprendizado Ativo              | Todos os 3 modos                  |
| Árvore de Habilidades + XP     | Level up automático               |
| Dark/Light mode                | CSS vars → Tailwind dark: classes |
| Central de Ajuda               | Conteúdo idêntico                 |

## Não inclui nesta fase

- Novas features (IA, notificações, blog)
- RBAC avançado (apenas auth básico)
- Motor cognitivo no backend (v1.3)
