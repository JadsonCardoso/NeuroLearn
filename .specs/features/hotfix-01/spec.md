# HOTFIX-01 — Correções Críticas em Produção

**ID:** HOTFIX-01
**Status:** Done ✅
**Complexidade:** Large
**Data:** 2026-06-06
**Prioridade:** P0 — Produção instável

## Problem Statement

O NeuroLearn está em produção em `neurolearn.tech` com 4 falhas críticas que prejudicam diretamente a experiência do usuário: cadastro quebrado, página de privacidade ausente (404), erro 500 ao pontuar e raiz da aplicação redirecionando para arquivo HTML estático. Todos os 4 bugs bloqueiam a confiança do produto.

## Goals

- [x] Cadastro e login funcionando com mensagens claras em PT-BR
- [x] Página `/politica-de-privacidade` acessível e compliant com LGPD
- [x] Score/XP persistindo sem erro 500
- [x] Raiz `/` redirecionando para `/auth/login` sem expor `landing.html`

## Out of Scope

| Feature                       | Razão                    |
| ----------------------------- | ------------------------ |
| Novas features de gamificação | Fase posterior           |
| OAuth Google/GitHub           | Fase posterior           |
| Admin dashboard               | Fora do escopo           |
| Exportação de dados LGPD      | Backlog técnico separado |

---

## User Stories

### P1: [HF-01] Mensagens de erro específicas no cadastro ⭐ MVP

**User Story**: Como visitante, quero entender exatamente por que meu cadastro falhou para que eu possa corrigi-lo.

**Why P1**: O fluxo de cadastro é a porta de entrada do produto. Erro genérico = usuário abandona.

**Acceptance Criteria**:

1. WHEN usuário tenta cadastrar email já em uso THEN sistema SHALL exibir "Este email já recebeu um link de acesso. Verifique sua caixa de entrada ou spam."
2. WHEN usuário atinge rate limit do Supabase THEN sistema SHALL exibir "Muitos links enviados. Aguarde 60 segundos antes de tentar novamente."
3. WHEN middleware retorna 429 (rate limit da aplicação) THEN sistema SHALL exibir "Muitas tentativas. Aguarde alguns minutos e tente novamente."
4. WHEN há falha de rede/conexão THEN sistema SHALL exibir "Erro de conexão. Verifique sua internet e tente novamente."
5. WHEN cadastro é bem-sucedido THEN sistema SHALL exibir "Link enviado! Verifique seu email (e a pasta spam) para acessar."
6. WHEN usuário recebe magic link e clica THEN sistema SHALL criar sessão e redirecionar para `/dashboard`

**Independent Test**: Acessar `/auth/signup`, tentar cadastrar com email inválido, rate limit simulado → verificar mensagens específicas.

---

### P1: [HF-02] Página Política de Privacidade acessível ⭐ MVP

**User Story**: Como visitante, quero acessar a política de privacidade do NeuroLearn para entender como meus dados são tratados.

**Why P1**: ConsentBanner linka para `/privacy`; middleware já permite acesso sem auth; ausência da página é 404 em produção e viola LGPD art. 9º.

**Acceptance Criteria**:

1. WHEN usuário acessa `/politica-de-privacidade` THEN sistema SHALL renderizar página com conteúdo LGPD completo (status 200)
2. WHEN usuário acessa `/privacy` THEN sistema SHALL redirecionar 301 para `/politica-de-privacidade`
3. WHEN página é renderizada THEN sistema SHALL incluir: coleta de dados, uso, cookies, auth, IA, uploads, direitos do usuário (Art. 18 LGPD)
4. WHEN usuário está no ConsentBanner THEN link "Saiba mais" SHALL apontar para `/politica-de-privacidade`
5. WHEN crawlers indexam a página THEN metadata title e description SHALL ser corretos para SEO

**Independent Test**: Acessar `/politica-de-privacidade` sem estar autenticado → deve retornar 200 com conteúdo.

---

### P1: [HF-03] Score/XP persistindo sem erro 500 ⭐ MVP

**User Story**: Como aluno, quero que meu XP seja salvo corretamente após cada atividade para que meu progresso seja mantido.

**Why P1**: Erro 500 no update de XP quebra a persistência do progresso do usuário e pode causar loops de erro silenciosos.

**Acceptance Criteria**:

1. WHEN usuário completa prática ativa (EARN_XP) THEN sistema SHALL persistir XP no Supabase sem erro
2. WHEN linha do usuário não existe na tabela `users` THEN sistema SHALL usar upsert para criar a linha e salvar XP
3. WHEN `updateUserTotalXP` é chamado THEN sistema SHALL usar `maybeSingle()` (não `single()`) para evitar throw em resultado vazio
4. WHEN operação de XP falha THEN sistema SHALL logar erro estruturado e NÃO silenciar a falha completamente
5. WHEN usuário avalia card (RATE_CARD) THEN XP SHALL persistir sem erro
6. WHEN usuário ganha XP em skill (GAIN_XP) THEN XP SHALL persistir sem erro

**Independent Test**: Fazer login, ir em Aprendizado Ativo, escrever 50+ palavras, salvar → XP deve aumentar e persistir após reload.

---

### P1: [HF-04] Remover landing.html — raiz aponta para login ⭐ MVP

**User Story**: Como visitante, quero que `neurolearn.tech/` me leve diretamente para o fluxo correto da aplicação.

**Why P1**: Redirecionar para `/landing.html` expõe a arquitetura interna, é frágil e desnecessário; `/landing.html` está acessível diretamente em produção.

**Acceptance Criteria**:

1. WHEN visitante não autenticado acessa `/` THEN sistema SHALL redirecionar para `/auth/login`
2. WHEN usuário autenticado acessa `/` THEN sistema SHALL redirecionar para `/dashboard`
3. WHEN alguém tenta acessar `/landing.html` THEN servidor SHALL retornar 404 (arquivo removido)
4. WHEN middleware processa `/` THEN SHALL não ter exceção especial para `/landing.html`
5. WHEN build é executado THEN `public/landing.html` NÃO SHALL existir mais

**Independent Test**: Acessar `neurolearn.tech/` sem autenticação → deve cair em `/auth/login`.

---

## Edge Cases

- WHEN Supabase está fora do ar THEN sistema SHALL mostrar mensagem de erro de conexão (não tela branca)
- WHEN usuário acessa `/politica-de-privacidade` com qualquer tema (dark/light) THEN página SHALL respeitar o tema atual
- WHEN `updateUserTotalXP` é chamado mas userId é null THEN função SHALL retornar sem tentar operação no banco
- WHEN rate limit do middleware (429) é atingido na rota `/auth/signup` THEN sistema SHALL mostrar mensagem amigável ao invés de tela branca
- WHEN magic link expirado é clicado THEN callback SHALL redirecionar para `/auth/login?error=callback_failed` com mensagem adequada

---

## Requirement Traceability

| Requirement ID | Story       | Arquivo(s) Principal(is)                          | Status  |
| -------------- | ----------- | ------------------------------------------------- | ------- |
| HF-01-A        | P1: Auth UX | `src/app/auth/signup/page.tsx`                    | Pending |
| HF-01-B        | P1: Auth UX | `src/app/auth/login/page.tsx`                     | Pending |
| HF-01-C        | P1: Auth UX | `src/lib/auth/errors.ts` (novo)                   | Pending |
| HF-01-D        | P1: Auth UX | `src/app/auth/callback/route.ts`                  | Pending |
| HF-02-A        | P1: Privacy | `src/app/politica-de-privacidade/page.tsx` (novo) | Pending |
| HF-02-B        | P1: Privacy | `src/app/privacy/route.ts` (novo)                 | Pending |
| HF-02-C        | P1: Privacy | `src/components/lgpd/ConsentBanner.tsx`           | Pending |
| HF-02-D        | P1: Privacy | `middleware.ts`                                   | Pending |
| HF-03-A        | P1: Score   | `src/services/skillsService.ts`                   | Pending |
| HF-03-B        | P1: Score   | `src/store/AppContext.tsx`                        | Pending |
| HF-04-A        | P1: Landing | `src/app/page.tsx`                                | Pending |
| HF-04-B        | P1: Landing | `public/landing.html` (remover)                   | Pending |
| HF-04-C        | P1: Landing | `middleware.ts`                                   | Pending |

**Coverage:** 13 total, 0 mapeados em tasks (pending tasks.md) ⚠️

---

## Success Criteria

- [x] Cadastro completo: email enviado, link funcional, sessão criada, redirect para dashboard
- [x] Zero mensagens genéricas nos fluxos de auth — 100% mapeadas para PT-BR
- [x] `/politica-de-privacidade` retorna 200 com conteúdo LGPD
- [x] `/privacy` redireciona 301 para `/politica-de-privacidade`
- [x] XP persiste após EARN_XP/RATE_CARD/GAIN_XP sem erro 500
- [x] `neurolearn.tech/` redireciona sem passar por arquivo .html estático
- [x] `npm run type-check && npm run lint && npm run test:unit && npm run build` passando
- [x] E2E de auth (`auth.spec.ts`) passando — 54/54 chromium ✅
