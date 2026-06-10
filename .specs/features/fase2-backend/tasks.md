# Tasks — Fase 2: Backend e Persistência Real

**Status:** Planejado  
**Data:** 2026-06-05

---

## T1 — Criar projeto Supabase e configurar env

**O quê:** Criar projeto no Supabase Cloud, obter URL + anon key, criar `.env.local` e `.env.example`.  
**Onde:** Raiz do projeto + Supabase dashboard  
**Depende de:** —  
**Feito quando:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão no `.env.local`; app não crasha sem elas.  
**Status:** `[ ] pendente`

---

## T2 — Instalar dependências Supabase

**O quê:** `npm install @supabase/supabase-js @supabase/ssr`  
**Onde:** `package.json`  
**Depende de:** T1  
**Feito quando:** Imports de `@supabase/supabase-js` e `@supabase/ssr` resolvem sem erro.  
**Status:** `[ ] pendente`

---

## T3 — Criar cliente Supabase (browser + server)

**O quê:** `src/lib/supabase/client.ts` (browser singleton) + `src/lib/supabase/server.ts` (SSR).  
**Onde:** `src/lib/supabase/`  
**Depende de:** T2  
**Feito quando:** `createClient()` importável de ambos os arquivos; tipado com `Database`.  
**Status:** `[ ] pendente`

---

## T4 — Aplicar schema SQL no Supabase

**O quê:** Executar o SQL do `design.md` no Supabase SQL Editor — todas as 9 tabelas, índices, trigger de profile.  
**Onde:** Supabase Dashboard → SQL Editor  
**Depende de:** T1  
**Feito quando:** Todas as tabelas aparecem no Supabase Table Editor; trigger `on_auth_user_created` existe.  
**Status:** `[ ] pendente`

---

## T5 — Aplicar RLS em todas as tabelas

**O quê:** Habilitar RLS e criar policies (select/insert/update/delete) para cada tabela conforme `design.md`.  
**Onde:** Supabase Dashboard → SQL Editor  
**Depende de:** T4  
**Feito quando:** RLS habilitado em todas as 9 tabelas; policies visíveis no Supabase Auth Policies.  
**Status:** `[ ] pendente`

---

## T6 — Gerar tipos TypeScript do schema

**O quê:** Gerar `src/types/database.types.ts` via `supabase gen types typescript`.  
**Onde:** `src/types/database.types.ts`  
**Depende de:** T4  
**Feito quando:** Arquivo gerado com tipos para todas as 9 tabelas; `npm run build` sem erros.  
**Status:** `[ ] pendente`

---

## T7 — Criar middleware de proteção de rotas

**O quê:** `middleware.ts` na raiz — checa sessão em `/(app)/*`, redireciona para `/auth/login` se ausente.  
**Onde:** `middleware.ts`  
**Depende de:** T3  
**Feito quando:** Acesso a `/dashboard` sem sessão redireciona para `/auth/login`.  
**Status:** `[ ] pendente`

---

## T8 — Criar páginas de autenticação

**O quê:**

- `src/app/auth/login/page.tsx` — login com email/senha, magic link, botão Google OAuth
- `src/app/auth/signup/page.tsx` — cadastro com email/senha
- `src/app/auth/callback/route.ts` — handler do OAuth callback

**Onde:** `src/app/auth/`  
**Depende de:** T3, T7  
**Feito quando:** Login/signup funcionam; OAuth Google redireciona corretamente.  
**Status:** `[ ] pendente`

---

## T9 — Criar service layer (7 services)

**O quê:** Criar os 7 services tipados em `src/services/`:

- `contentsService.ts` — `list`, `create`, `update`, `remove`
- `flashcardsService.ts` — `listByContent`, `listDue`, `create`, `updateSM2`
- `reviewService.ts` — `recordCycle`
- `sessionsService.ts` — `create`
- `skillsService.ts` — `listGlobal`, `listUserSkills`, `gainXP`
- `retentionService.ts` — `saveSnapshot`
- `cognitiveEventsService.ts` — `log`

**Onde:** `src/services/`  
**Depende de:** T3, T6  
**Feito quando:** Todos os services exportam funções assíncronas tipadas; nenhum module chama `supabase` diretamente.  
**Status:** `[ ] pendente`

---

## T10 — Adaptar AppContext para usar services

**O quê:** Modificar `src/store/AppContext.tsx` — ao inicializar, carregar dados do Supabase em vez do localStorage (quando autenticado). Actions assíncronas chamam services + dispatch.  
**Onde:** `src/store/AppContext.tsx`  
**Depende de:** T9, T7  
**Feito quando:** Dashboard exibe dados reais do banco para usuário logado.  
**Status:** `[ ] pendente`

---

## T11 — Criar fluxo de migração localStorage → Supabase

**O quê:** Ao primeiro login, se `nl_v2` existir no localStorage, exibir banner "Importar dados locais?". Se confirmado, chamar services para criar todos os registros e limpar localStorage.  
**Onde:** `src/app/(app)/layout.tsx` ou hook dedicado `src/hooks/useMigration.ts`  
**Depende de:** T9, T10  
**Feito quando:** Dados do localStorage aparecem no banco após importação; localStorage limpo.  
**Status:** `[ ] pendente`

---

## T12 — Atualizar STATE.md e documentação

**O quê:** Marcar todas as tasks como concluídas, atualizar decisões e blockers no STATE.md, atualizar PDF do projeto.  
**Onde:** `.specs/project/STATE.md`, `gerar-pdf.js`  
**Depende de:** T1–T11  
**Feito quando:** STATE.md reflete estado atual; build passa.  
**Status:** `[ ] pendente`

---

## Ordem de execução

```
T1 → T2 → T3
          T3 → T4 → T5
                    T5 → T6
          T3 → T7 → T8
          T6 + T9 → T10 → T11 → T12
```

**Paralelos possíveis:** T4 e T7 podem rodar simultaneamente após T3.
