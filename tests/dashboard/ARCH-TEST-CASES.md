# TC-ARCH — Fase 1: Migração Arquitetural (Next.js 15 + TypeScript + Tailwind)

Padrão AAA (Arrange-Act-Assert) · Google Testing Standards

---

## TC-ARCH-001 — Estrutura de diretórios obrigatória

**Prioridade:** P0  
**Categoria:** Arquitetura

**Arrange:** Projeto migrado para Next.js 15 com App Router.  
**Act:** Verificar existência das pastas exigidas na spec.  
**Assert:** Todas as pastas listadas abaixo devem existir em `src/`:

| Pasta | Esperado |
|-------|----------|
| `src/app/` | ✅ |
| `src/components/` | ✅ |
| `src/modules/` | ✅ |
| `src/services/` | ✅ |
| `src/hooks/` | ✅ |
| `src/lib/` | ✅ |
| `src/store/` | ✅ |
| `src/types/` | ✅ |
| `src/engine/` | ✅ |

---

## TC-ARCH-002 — Compilação TypeScript sem erros

**Prioridade:** P0  
**Categoria:** Build

**Arrange:** Código-fonte com tipagem TypeScript estrita.  
**Act:** `npm run build`  
**Assert:** Exit code 0, zero erros de compilação.

---

## TC-ARCH-003 — ESLint sem warnings ou erros

**Prioridade:** P1  
**Categoria:** Qualidade de código

**Arrange:** ESLint configurado com `eslint-config-next`.  
**Act:** `npm run lint`  
**Assert:** "No ESLint warnings or errors"

---

## TC-ARCH-004 — Sem uso de `any` explícito nos tipos de domínio

**Prioridade:** P1  
**Categoria:** Tipagem

**Arrange:** `src/types/index.ts` define todas as entidades do domínio.  
**Act:** `grep -r "any" src/types/`  
**Assert:** Nenhum `any` explícito nos arquivos de tipos de domínio.

---

## TC-ARCH-005 — App Router: todas as rotas públicas acessíveis

**Prioridade:** P0  
**Categoria:** Routing

**Arrange:** Next.js 15 App Router com estrutura `src/app/(app)/` e `src/app/auth/`.  
**Act:** `npm run build` lista as rotas geradas.  
**Assert:** Todas as rotas esperadas presentes na saída:
- `/` (root redirect)
- `/auth/login`
- `/auth/signup`
- `/auth/callback`
- `/dashboard`
- `/library`
- `/review`
- `/skills`
- `/focus`
- `/active`
- `/help`

---

## TC-ARCH-006 — Separação UI/Lógica: módulos não importam Supabase diretamente

**Prioridade:** P1  
**Categoria:** Arquitetura limpa

**Arrange:** Regra de arquitetura: componentes/módulos não devem acessar Supabase diretamente.  
**Act:** `grep -r "createBrowserClient\|createServerClient" src/modules/ src/components/`  
**Assert:** Nenhuma ocorrência — acesso ao DB exclusivo via `src/services/` e `src/store/`.

---

## TC-ARCH-007 — Algoritmo SM-2: lógica de easiness factor

**Prioridade:** P0  
**Categoria:** Engine / Algoritmo

**Arrange:** `sm2(quality, ef, interval, reps)` implementado em `src/engine/sm2.ts`.  
**Act:** Verificar saída para entradas conhecidas:
- `sm2(1, 2.5, 1, 0)` → quality < 3 → `nr=0, ni=1`, ef = max(1.3, 2.5 + 0.1 - (5-1)*(0.08+(5-1)*0.02)) = max(1.3, 2.5 + 0.1 - 4*0.16) = max(1.3, 2.5 - 0.54) = 1.96
- `sm2(4, 2.5, 1, 0)` → quality ≥ 3, reps=0 → `nr=1, ni=1`, ef = max(1.3, 2.5 + 0.1 - (5-4)*(0.08+(5-4)*0.02)) = max(1.3, 2.5 + 0.1 - 0.1) = 2.5
- `sm2(3, 2.5, 1, 1)` → reps=1 → `ni=6, nr=2`
- `sm2(4, 2.5, 6, 3)` → `ni=round(6*2.5)=15`
**Assert:** Valores calculados manualmente batem com a implementação.

---

## TC-ARCH-008 — Algoritmo Retenção: decaimento exponencial

**Prioridade:** P0  
**Categoria:** Engine / Algoritmo

**Arrange:** `calcRetention(card)` em `src/engine/retention.ts`.  
**Act:** Card com `lastReview = now`, `interval = 10`, `ef = 2.5`:
- days ≈ 0 → `exp(0) = 1` → retention = 100%
- Card sem `lastReview` → retention = 0
**Assert:** Comportamento correto nos limites (sem review → 0; recém revisado → 100).

---

## TC-ARCH-009 — Tailwind configurado e utilitários disponíveis

**Prioridade:** P1  
**Categoria:** CSS/Estilo

**Arrange:** `tailwind.config.js` e `postcss.config.js` presentes.  
**Act:** Build com sucesso (implica que Tailwind compilou).  
**Assert:** Build passa sem erros relacionados a Tailwind.

---

## TC-ARCH-010 — Aliases de importação configurados (`@/`)

**Prioridade:** P1  
**Categoria:** Configuração

**Arrange:** `tsconfig.json` com `paths: { "@/*": ["./src/*"] }`.  
**Act:** `grep -r "from '@/" src/` retorna múltiplos resultados válidos.  
**Assert:** Alias funciona — confirmado pelo build bem-sucedido.
