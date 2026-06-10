# HOTFIX-01 Tasks

**Spec**: `.specs/features/hotfix-01/spec.md`
**Status**: Done ✅ — 2026-06-06
**Data**: 2026-06-06

---

## Execution Plan

### Phase 1: Foundation — Utilitário de erros + fix landing (Paralelo OK)

Tarefas independentes entre si. Podem rodar em paralelo.

```
T1 [P] ──→ (usado por T3, T4)
T2 [P] ──→ (independente)
```

### Phase 2: Auth UX + Privacy Page (Paralelo OK)

Dependem apenas de T1 (error utils). Podem rodar em paralelo.

```
T1 complete, então:
  ├── T3 [P]  (signup page)
  └── T4 [P]  (login page)
T2 complete, então:
  └── T5 [P]  (privacy page + redirect)
```

### Phase 3: Score Fix + Middleware (Sequencial)

T6 (score) é independente. T7 (middleware) reúne tudo.

```
T3, T4, T5, T6 complete, então:
  T7 ──→ T8 (gate final)
```

---

## Task Breakdown

### T1: Criar utilitário de mapeamento de erros Supabase Auth [P]

**What**: Criar `src/lib/auth/errors.ts` com função `mapAuthError(error)` que traduz erros Supabase Auth para mensagens PT-BR
**Where**: `src/lib/auth/errors.ts` (arquivo novo)
**Depends on**: Nenhum
**Reuses**: Padrões existentes em `src/lib/security/`
**Requirement**: HF-01-C

**Done when**:

- [ ] Função `mapAuthError(error: AuthError | null): string` exportada
- [ ] Mapeia `over_email_send_rate_limit` → "Muitos links enviados. Aguarde 60 segundos antes de tentar novamente."
- [ ] Mapeia `error.status === 429` → "Muitas tentativas. Aguarde alguns minutos."
- [ ] Mapeia mensagem contendo "rate limit" → mesmo fallback de rate limit
- [ ] Mapeia erro de rede → "Erro de conexão. Verifique sua internet e tente novamente."
- [ ] Mapeia `null` error → "Conta criada! Verifique seu email (e a pasta spam) para acessar."
- [ ] Fallback genérico mantém mensagem original do Supabase para facilitar debug (dev) ou mensagem amigável (prod)
- [ ] Testes unitários Vitest com todos os casos cobertos
- [ ] Gate check passa: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `fix(auth): add Supabase error mapper with PT-BR messages`

---

### T2: Remover landing.html e corrigir raiz [P]

**What**: Remover `public/landing.html` e atualizar `src/app/page.tsx` para redirecionar para `/auth/login`
**Where**: `src/app/page.tsx` (modificar) + `public/landing.html` (remover)
**Depends on**: Nenhum
**Reuses**: padrão `redirect()` do Next.js
**Requirement**: HF-04-A, HF-04-B

**Done when**:

- [ ] `public/landing.html` removido
- [ ] `src/app/page.tsx` redireciona para `/auth/login` (usuários não autenticados) ou `/dashboard` (autenticados)
- [ ] `npm run build` passa sem referência a `landing.html`
- [ ] Acesso a `/landing.html` retorna 404
- [ ] Gate check passa: `npm run type-check`

**Tests**: e2e (app.spec.ts — verificar que `/` redireciona)
**Gate**: build
**Commit**: `fix(routing): remove landing.html, redirect root to auth/login`

---

### T3: Atualizar signup page com mensagens específicas [P]

**What**: Atualizar `src/app/auth/signup/page.tsx` para usar `mapAuthError()` e exibir mensagens claras
**Where**: `src/app/auth/signup/page.tsx` (modificar)
**Depends on**: T1
**Reuses**: `mapAuthError` de `src/lib/auth/errors.ts`
**Requirement**: HF-01-A

**Done when**:

- [ ] `setServerError` usa `mapAuthError(error)` ao invés de string hardcoded genérica
- [ ] Mensagem de sucesso melhorada: inclui instrução de verificar spam
- [ ] Formulário desabilitado durante loading (não duplo-submit)
- [ ] TypeScript sem erros
- [ ] Gate check passa: `npm run type-check`

**Tests**: e2e (auth.spec.ts — signup com email inválido, signup bem-sucedido)
**Gate**: quick
**Commit**: `fix(auth): improve signup error messages using mapAuthError`

---

### T4: Atualizar login page com mensagens específicas [P]

**What**: Atualizar `src/app/auth/login/page.tsx` para usar `mapAuthError()` e melhorar mensagem de callback_failed
**Where**: `src/app/auth/login/page.tsx` (modificar)
**Depends on**: T1
**Reuses**: `mapAuthError` de `src/lib/auth/errors.ts`
**Requirement**: HF-01-B, HF-01-D

**Done when**:

- [ ] `setServerError` usa `mapAuthError(error)`
- [ ] Parâmetro `?error=callback_failed` mostra mensagem: "Link expirado ou inválido. Solicite um novo link abaixo."
- [ ] TypeScript sem erros
- [ ] Gate check passa: `npm run type-check`

**Tests**: e2e (auth.spec.ts — login com magic link expirado)
**Gate**: quick
**Commit**: `fix(auth): improve login error messages and callback_failed handling`

---

### T5: Criar página Política de Privacidade + redirect /privacy [P]

**What**: Criar `src/app/politica-de-privacidade/page.tsx` com conteúdo LGPD e `src/app/privacy/route.ts` com redirect 301
**Where**: `src/app/politica-de-privacidade/page.tsx` (novo) + `src/app/privacy/route.ts` (novo)
**Depends on**: T2 (sem dependência real, paralelo com T2)
**Reuses**: Padrões de `src/app/auth/` para layout sem sidebar
**Requirement**: HF-02-A, HF-02-B, HF-02-C, HF-02-D

**Done when**:

- [ ] `src/app/politica-de-privacidade/page.tsx` existe e renderiza conteúdo LGPD completo
- [ ] Conteúdo cobre: coleta de dados, autenticação, cookies, IA, uploads, direitos (Art. 18 LGPD), contato DPO
- [ ] Metadata (`title`, `description`) correto para SEO
- [ ] `src/app/privacy/route.ts` retorna `NextResponse.redirect` 301 para `/politica-de-privacidade`
- [ ] `src/components/lgpd/ConsentBanner.tsx` link atualizado para `/politica-de-privacidade`
- [ ] `middleware.ts` inclui `/politica-de-privacidade` na lista de rotas públicas
- [ ] Acesso sem autenticação retorna 200
- [ ] Responde ao tema dark/light (usa `var(--bg)` e `var(--text)`)
- [ ] Gate check passa: `npm run type-check && npm run build`

**Tests**: e2e (app.spec.ts — verificar que `/politica-de-privacidade` retorna 200 sem auth)
**Gate**: build
**Commit**: `feat(lgpd): add privacy policy page at /politica-de-privacidade`

---

### T6: Corrigir updateUserTotalXP — usar maybeSingle + upsert

**What**: Corrigir `updateUserTotalXP` em `src/services/skillsService.ts` para evitar erro 500 com `.single()` em resultado vazio
**Where**: `src/services/skillsService.ts` (modificar)
**Depends on**: Nenhum
**Reuses**: padrão `maybeSingle()` já usado em outros services
**Requirement**: HF-03-A

**Done when**:

- [ ] `.single()` substituído por `.maybeSingle()` no SELECT de `total_xp`
- [ ] Lógica de UPDATE convertida para `upsert` com `onConflict: 'id'` para garantir criação da linha se não existir
- [ ] Operação é atômica ou pelo menos safe (sem throw em resultado vazio)
- [ ] Adicionada verificação de `userId` no início da função (return early se null/undefined)
- [ ] Testes unitários atualizados para cobrir: usuário existente, usuário não existente (upsert), userId nulo
- [ ] Gate check passa: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `fix(score): use maybeSingle + upsert in updateUserTotalXP to prevent 500`

---

### T7: Limpar middleware — remover exceção landing.html + adicionar /politica-de-privacidade

**What**: Atualizar `middleware.ts` para remover exceção `/landing.html` e adicionar `/politica-de-privacidade` às rotas públicas
**Where**: `middleware.ts` (modificar)
**Depends on**: T2 (landing.html removido), T5 (privacy page criada)
**Reuses**: lógica existente de `isAppRoute`
**Requirement**: HF-04-C, HF-02-D

**Done when**:

- [ ] `pathname !== '/landing.html'` removido de `isAppRoute`
- [ ] `pathname !== '/politica-de-privacidade'` adicionado a `isAppRoute`
- [ ] `pathname !== '/privacy'` adicionado a `isAppRoute` (para o redirect 301 funcionar sem auth)
- [ ] TypeScript sem erros
- [ ] Gate check passa: `npm run type-check`

**Tests**: e2e (app.spec.ts)
**Gate**: quick
**Commit**: `fix(middleware): remove landing.html exception, add privacy routes as public`

---

### T8: Gate final — full check + E2E

**What**: Executar o gate completo e todos os testes E2E para garantir zero regressões
**Where**: N/A (verificação)
**Depends on**: T1, T2, T3, T4, T5, T6, T7
**Requirement**: Todos HF-0x

**Done when**:

- [ ] `npm run type-check` — zero erros
- [ ] `npm run lint` — zero warnings
- [ ] `npm run test:unit` — todos passando (259+ testes)
- [ ] `npm run build` — build limpo
- [ ] `npm run test:e2e` — auth.spec.ts + app.spec.ts passando
- [ ] `/` → redireciona para `/auth/login` (sem auth)
- [ ] `/politica-de-privacidade` → 200 sem auth
- [ ] `/privacy` → 301 para `/politica-de-privacidade`
- [ ] `/landing.html` → 404
- [ ] Cadastro com email novo → mensagem de sucesso clara
- [ ] `progress.md` atualizado

**Tests**: e2e + unit
**Gate**: full
**Commit**: N/A (verificação — cada task já commitou)

---

## Parallel Execution Map

```
Phase 1 (Paralelo — iniciam ao mesmo tempo):
  T1 [P]  criar errors.ts
  T2 [P]  remover landing.html

Phase 2 (Paralelo — após T1 e T2 completarem):
  T1 ──┬── T3 [P]  signup page
       └── T4 [P]  login page
  T2 ──── T5 [P]  privacy page + redirect

  T6 [P]  (independente — pode rodar em paralelo com Phase 2)

Phase 3 (Sequencial):
  T3+T4+T5+T6 ──→ T7 ──→ T8
```

---

## Task Granularity Check

| Task                                 | Escopo                                       | Status                    |
| ------------------------------------ | -------------------------------------------- | ------------------------- |
| T1: criar errors.ts                  | 1 arquivo                                    | ✅ Granular               |
| T2: remover landing.html + page.tsx  | 2 arquivos (arquivo remove + 1 linha change) | ✅ OK (coesos)            |
| T3: signup page                      | 1 arquivo                                    | ✅ Granular               |
| T4: login page                       | 1 arquivo                                    | ✅ Granular               |
| T5: privacy page + redirect + banner | 3 arquivos (novos) + 1 modificação           | ✅ OK (coesos, 1 feature) |
| T6: skillsService                    | 1 função, 1 arquivo                          | ✅ Granular               |
| T7: middleware                       | 1 arquivo, 3 linhas                          | ✅ Granular               |
| T8: gate                             | verificação pura                             | ✅ Granular               |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body)                 | Diagrama Mostra  | Status   |
| ---- | --------------------------------- | ---------------- | -------- |
| T1   | None                              | Phase 1 paralelo | ✅ Match |
| T2   | None                              | Phase 1 paralelo | ✅ Match |
| T3   | T1                                | T1 → T3          | ✅ Match |
| T4   | T1                                | T1 → T4          | ✅ Match |
| T5   | T2 (implícito, pode ser paralelo) | T2 → T5          | ✅ Match |
| T6   | None                              | Phase 2 paralelo | ✅ Match |
| T7   | T2, T5                            | T3+T4+T5+T6 → T7 | ✅ Match |
| T8   | T1..T7                            | T7 → T8          | ✅ Match |

---

## Test Co-location Validation

| Task                   | Camada Criada/Modificada | Matrix Requer | Task Diz           | Status |
| ---------------------- | ------------------------ | ------------- | ------------------ | ------ |
| T1: errors.ts          | nova função util         | unit          | unit               | ✅ OK  |
| T2: page.tsx + rm html | routing change           | e2e           | e2e (app.spec.ts)  | ✅ OK  |
| T3: signup page        | componente UI            | e2e           | e2e (auth.spec.ts) | ✅ OK  |
| T4: login page         | componente UI            | e2e           | e2e (auth.spec.ts) | ✅ OK  |
| T5: privacy page       | página nova + routing    | e2e           | e2e (app.spec.ts)  | ✅ OK  |
| T6: skillsService      | service Supabase         | unit          | unit               | ✅ OK  |
| T7: middleware         | infra/routing            | e2e           | e2e (app.spec.ts)  | ✅ OK  |
| T8: gate               | verificação              | full + e2e    | full + e2e         | ✅ OK  |

Nenhuma violação ❌ detectada.
