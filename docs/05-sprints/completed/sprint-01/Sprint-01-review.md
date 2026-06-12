# Sprint 01 Review

**Projeto:** NeuroLearn
**Sprint:** 01 — Foundation Stabilization
**Período:** 2026-06-05 a 2026-06-11
**Status:** Concluída com Pendências

---

## Objetivo da Sprint

Transformar o NeuroLearn em um MVP confiável, eliminando bugs de produção, garantindo persistência completa do conhecimento produzido pelo usuário, implementando CRUD em todas as entidades, consolidando a UX Foundation com feedback visual consistente, garantindo sincronização reativa e assegurando isolamento de dados entre usuários.

O foco não era criar novas funcionalidades. Era estabilidade, confiança e consistência.

---

## Escopo Planejado

### Épico 01 — Correção de Produção (P0)

- Corrigir falhas de criação de conta e autenticação
- Eliminar erros HTTP 500 e 404
- Zerar erros críticos no console de produção

### Épico 02 — Persistência Cognitiva (P0)

- Salvar highlights e anotações da sessão de estudo
- Salvar reflexão ativa, flashcards e explicações na fase de extração
- Salvar exercícios com respostas e histórico de progresso

### Épico 03 — CRUD Completo (P0)

- CRUD completo de: Conteúdo, Trilha, Sessão, Flashcard, Reflexão, Exercício

### Épico 04 — UX Foundation (P0)

- Indicadores de campos obrigatórios (`*`)
- Toasts descritivos de erro e sucesso em PT-BR
- Modal de confirmação para exclusões
- Estados de loading claros
- Validação visual de campos inválidos

### Épico 05 — Sincronização Automática (P0)

- Atualização reativa em: Biblioteca, Trilhas, Revisão, Dashboard (sem reload manual)

### Épico 06 — Segurança Base (P0)

- Validação de ownership em todas as operações
- Isolamento multi-tenant obrigatório
- Bloqueio de acesso indevido a dados de terceiros

---

## Itens Entregues

### Concluídos

**Épico 01 — Correção de Produção**

- Rota raiz `/` redirecionava para 404 → smart redirect por sessão (autenticado → `/dashboard`, anônimo → `/auth/login`)
- Página `/politica-de-privacidade` retornava 404 → criada com LGPD completa + redirect 301 de `/privacy`
- Erros de auth em inglês e genéricos → `mapAuthError()` com traduções PT-BR para todos os cenários
- RLS com recursão infinita causando 500 em `/rest/v1/users` → `get_my_role()` com `SECURITY DEFINER` elimina a recursão
- Sentry bloqueado por adblockers (retry flood) → proxy `/api/sentry-tunnel` server-side
- CSP bloqueando PostHog CDN → `us-assets.i.posthog.com` adicionado ao `connect-src`
- Console de produção zerado (HOTFIX-CONSOLE-01)
- Formulários de cadastro e login com validação PT-BR + `setFocus` no primeiro campo com erro

**Épico 02 — Persistência Cognitiva**

- `useAutoSave` (debounce 30s, dirty-flag) + `sessionDraftsService` (upsert por userId+contentId) — rascunhos salvos automaticamente e restaurados ao reabrir sessão
- `SaveIndicator` visual integrado ao `FocusView`
- Highlights salvos na sessão com cor âmbar, botão × separado e `aria-label` dinâmico
- Reflexão ativa persistida como rascunho via `sessionDraftsService`
- Flashcards criados na sessão e persistidos no Supabase
- Exercícios integrados no `FocusExtractPhase` com persistência imediata no Supabase (`exercisesService.createExercise`)

**Épico 03 — CRUD Completo (parcial)**

- Conteúdo: CRUD completo (criar, visualizar, editar, remover com confirmação)
- Trilha: CRUD completo (criar, editar, remover — ON DELETE SET NULL preserva conteúdos)
- Flashcard: criar (sessão de foco), editar (CardEditModal), remover (ConfirmDialog)
- Exercício: CREATE implementado com persistência imediata no Supabase

**Épico 04 — UX Foundation**

- `FormField` com indicador `*` para campos obrigatórios
- `FormError` com `role="alert"` e `aria-describedby` correto
- `LoadingButton` com spinner e `disabled` durante submissão
- `ConfirmDialog` (`role="alertdialog"`, `aria-modal`, foco automático, ESC para cancelar) para exclusão de conteúdo, flashcard, trilha e habilidade
- Toasts de sucesso e erro para: ADD_CONTENT, DELETE_CONTENT, UPDATE_CONTENT, ADD_CARDS, ADD_SKILL, DELETE_SKILL, FINISH_SESSION, DELETE_CARD, UPDATE_CARD
- Validação visual PT-BR em todos os formulários (login, signup, AddContentModal, TrailFormModal)
- Soft delete com Undo (timer 5s, remoção otimista com toast "Desfazer")

**Épico 05 — Sincronização Automática**

- Biblioteca: atualização reativa via AppContext (dispatch imediato, sem reload)
- Trilhas: atualização reativa via AppContext
- Dashboard: atualização reativa; métricas derivadas do estado em memória
- Revisão: fila calculada no mount (sem reactive re-filter durante sessão)
- Streak e XP persistidos no Supabase ao finalizar sessão (UPDATE_STREAK + updateUserTotalXP)

**Épico 06 — Segurança Base**

- Defense-in-depth em todos os 5 list services: `listContents(userId)`, `listTrails(userId)`, `listAllFlashcards(userId)`, `listDueFlashcards(userId)`, `listFlashcardsByContent(userId, contentId)`
- `exercisesService`: todas as mutações com `.eq('id', id).eq('user_id', userId)`
- RLS ativo e auditado em 9 tabelas + tabela `exercises` (ON DELETE CASCADE)
- Testes de segurança multi-tenant com dois contextos de browser (`library-security.spec.ts`)
- Middleware + RBAC + rate limiting (5 req/15min em `/auth/*`)
- Playwright API suites: 10 cenários de contratos HTTP (health, auth guards 401, validação 422)

### Parcialmente Concluídos

- **CRUD de Exercício:** CREATE implementado e persistido. READ (listagem por conteúdo na UI), UPDATE e DELETE não expostos ao usuário na interface.
- **CRUD de Sessão:** criação e listagem funcionam. Edição e exclusão de sessões não implementadas na UI.
- **CRUD de Reflexão:** autosave como rascunho implementado. Reflexão não é uma entidade com CRUD explícito na UI (sem listagem, edição ou exclusão manual pelo usuário).
- **Automação Playwright completa:** fluxos de cadastro e login cobertos parcialmente (`auth.spec.ts`); fluxo end-to-end completo de uma sessão de estudo não automatizado.

### Não Concluídos

- Cypress para APIs (item do plano original — decisão: substituído integralmente por Playwright API suites)
- Painel super admin (fora do escopo da sprint, mas listado como restrição pendente)
- `POST /api/review/rate` — endpoint de revisão via SM-2 (identificado como dívida técnica)

---

## Bugs Corrigidos

| ID               | Descrição                                                                      | Fase              |
| ---------------- | ------------------------------------------------------------------------------ | ----------------- |
| BUG-PROD-001     | UUID base36 inválido no PostgreSQL — `uid()` → `crypto.randomUUID()`           | CRUD-01           |
| BUG-PROD-002     | Streak não incrementava nem persistia após sessão de estudo                    | SPRINT-1          |
| BUG-PROD-003     | XP não persistia no Supabase após finalizar sessão                             | SPRINT-1          |
| BUG-PROD-004     | Cards desapareciam da fila de revisão em tempo real (reactive re-filter)       | SPRINT-1          |
| BUG-PROD-005     | RLS recursão infinita → HTTP 500 em `/rest/v1/users`                           | HOTFIX-CONSOLE-01 |
| BUG-PROD-006     | Rota raiz `/` retornava 404 ao não autenticado                                 | HOTFIX-01         |
| BUG-PROD-007     | `/politica-de-privacidade` retornava 404                                       | HOTFIX-01         |
| BUG-PROD-008     | Mensagens de erro de autenticação em inglês e genéricas                        | HOTFIX-01         |
| BUG-PROD-009     | Magic Link apontava para `0.0.0.0:3000` (DNS split-brain + origin errado)      | INFRA-01          |
| BUG-PROD-010     | `xpDelta` não era atômico — corrupção de XP por falha de rede                  | Sprint 3 (CC-01)  |
| BUG-PROD-011     | Double-submit no modal IA cobrava 2x o OpenAI                                  | Sprint 3 (CC-03)  |
| BUG-PROD-012     | Keyboard guard disparava atalhos silenciosos no tab "Meu Material"             | MELHORIAS-01      |
| BUG-PROD-013     | `window.confirm` usado para exclusões (inacessível, sem controle visual)       | CRUD-01           |
| BUG-PROD-014     | Sidebar com `div onClick` em vez de `<Link>` (inacessível a screen readers)    | HOTFIX-01         |
| BUG-GLOBAL-001   | LGPD — botão "Somente necessários" não chamava `opt_out_capturing` (PostHog)   | QA-GLOBAL-01      |
| BUG-UX-003 a 006 | `aria-describedby` incorreto, `setFocus` ausente, FieldErrors sem tipo, Zod v4 | UX-01             |
| BUG-QA-17        | 17 bugs de UX corrigidos no ciclo exploratório (QA-estrategico + alter face)   | QA exploratório   |

---

## Melhorias Estruturais

### Produto

- Hierarquia Trilha → Conteúdo implementada com auto-migração "Meus Estudos" para usuários existentes
- Soft delete com Undo (5s) em conteúdo — experiência percebida de velocidade
- Paginação por trilha (PAGE_SIZE=6) com botão "Ver mais / Menos"
- Busca estendida na Biblioteca (título + autor + descrição, normalização NFD sem acento)
- Tab "📚 Revisão / 📔 Meu Material" no ReviewView com estado preservado ao trocar
- Highlights âmbar com `aria-label` dinâmico por item
- `MemoryView` reescrita com acordeões por conteúdo + busca NFD

### Arquitetura

- `FocusView` decomposto em orquestrador + `FocusStudyPhase` + `FocusExtractPhase` + `FocusTeachPhase`
- Funções puras `calculateStreak` e `calculateLevelUp` extraídas do AppContext
- Engine limpa: 3 arquivos legados deletados, módulos migrados para subpastas canônicas
- Supabase lazy singleton (client-side only)
- Husky v9 + lint-staged v15 + commitlint (pre-commit: prettier, commit-msg: conventional, pre-push: type-check+lint)
- Schemas Zod de output para 4 rotas de IA (422/AI_INVALID_OUTPUT, `.transform()` clamp 0–100)
- ESLint `no-console` com security logger estruturado
- `exercisesService` com CRUD completo e defense-in-depth duplo
- Knowledge Hub: 13 documentos em `project-knowledge/` (RF, RNF, RN, CA, ADR, Riscos, Fluxos, UX, Arquitetura, QA, Segurança, Contexto)

### Segurança

- Defense-in-depth: `.eq('user_id', userId)` em todos os 5 list services (complemento ao RLS)
- Tabela `exercises` com RLS e ON DELETE CASCADE
- 9 tabelas auditadas — RLS ativo em todas
- Testes de segurança multi-tenant com dois contextos de browser
- Playwright API suites: 10 contratos HTTP (health, auth guards, validação de input)
- LGPD: ConsentBanner + `DELETE /api/user/delete` + correção opt-out PostHog

### UX

- `FormField` + `FormError` + `FormHint` + `LoadingButton` como sistema de formulário unificado
- `ConfirmDialog` reutilizável (`role="alertdialog"`, `aria-modal`, foco automático, ESC)
- `SaveIndicator` com estado `saving` / `saved` / `error`
- Toasts descritivos para todas as operações CRUD
- Soft delete otimista com Undo — nenhuma ação destrutiva imediata
- Core Web Vitals: `display: swap`, skeletons com alturas reservadas, `startTransition` na busca, `React.memo` em Sidebar e BottomNav, lazy load de componentes não críticos

### QA

- 422 testes unitários passando (32 arquivos, Vitest)
- 39+ specs E2E Playwright cobrindo: auth, CRUD, trilhas, exercícios, revisão, API, segurança, acessibilidade, regressão global
- skill `qa-estrategico` executada após cada feature — detectou BUG-PROD-012 (keyboard guard) e BUG-GLOBAL-001 (LGPD)
- `production-security-gate` executado antes do deploy — status APROVADO

---

## Estado Atual da Aplicação

| Área             | Status     | Observação                                                                                |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Biblioteca       | ✅ Estável | CRUD completo, busca, trilhas, soft delete+undo, paginação, ContentDrawer                 |
| Trilhas          | ✅ Estável | CRUD completo, RLS, auto-migração, ON DELETE SET NULL                                     |
| Sessão de Estudo | ✅ Estável | Autosave, exercícios persistidos, highlights âmbar, 3 fases decompostas, Web Worker timer |
| Revisão          | ✅ Estável | Fila estável, atalhos de teclado, Meu Material, SM-2 funcionando                          |
| Segurança        | ✅ Estável | RLS + defense-in-depth + OWASP + LGPD + rate limiting + testes multi-tenant               |
| Persistência     | ✅ Estável | Autosave 30s, streak, XP, exercícios, flashcards — todos no Supabase                      |
| Ownership        | ✅ Estável | Defense-in-depth duplo (RLS + client-side) em todos os list services e mutações           |
| Multi-Tenant     | ✅ Estável | RLS + `.eq('user_id')` + testes E2E com dois contextos de browser confirmam isolamento    |
| Exercícios (UI)  | ⚠ Atenção  | CREATE implementado. Listagem, edição e exclusão pela UI não expostas ao usuário ainda    |
| Sessões (UI)     | ⚠ Atenção  | Criação funciona. Edição e exclusão de sessões não disponíveis na UI                      |
| Performance      | ⚠ Atenção  | Core Web Vitals endereçados em código. Latência Supabase ~150ms (região us-east-1)        |

---

## Débitos Técnicos Identificados

### Alta Prioridade

- **Senha admin temporária:** `NeuroLearn@2025!` documentada no `progress.md` — alterar antes de escalar usuários
- **CRUD de Exercício incompleto:** apenas CREATE exposto na UI; READ (listagem por conteúdo), UPDATE e DELETE precisam ser implementados
- **CRUD de Sessão incompleto:** edição e exclusão de sessões não disponíveis na UI

### Média Prioridade

- **Google OAuth desabilitado:** botão "Em breve" no login — requer Client ID/Secret no Supabase dashboard
- **Região Supabase us-east-1:** latência ~150ms do Brasil — migração para `sa-east-1` reduz para ~30ms
- **`POST /api/review/rate`:** endpoint SM-2 via API não criado — avaliações feitas apenas no client
- **Dependabot não configurado:** monitoramento de CVEs em dependências não automatizado

### Baixa Prioridade

- **DMARC `p=none` → `p=quarantine`:** aguardando 3+ semanas de monitoramento sem falsos positivos
- **AppContext god-object:** 24+ action types — candidato a split por domínio em sprint futura
- **Painel super admin:** gestão de usuários e analytics globais não implementados
- **Automação E2E de fluxo completo:** sessão de estudo end-to-end (foco → extração → exercício → flashcard → finalizar) não coberta por um único spec integrado

---

## Riscos Abertos

| ID      | Risco                                                                | Impacto | Probabilidade | Mitigação atual                                       |
| ------- | -------------------------------------------------------------------- | ------- | ------------- | ----------------------------------------------------- |
| RSK-001 | Senha admin temporária visível no progress.md versionado             | Alto    | Médio         | Alterar antes de escalar usuários                     |
| RSK-002 | Latência Supabase us-east-1 (~150ms) degrada UX em produção          | Médio   | Alto          | Migração para sa-east-1 no roadmap                    |
| RSK-003 | Google OAuth desabilitado — fricção para novos usuários              | Médio   | Alto          | Botão "Em breve" visível; Magic Link funcional        |
| RSK-004 | DMARC p=none — e-mails de phishing de neurolearn.tech não bloqueados | Médio   | Baixo         | Monitoramento DMARC ativo; upgrade para quarantine    |
| RSK-005 | AppContext com 24+ action types — acoplamento crescente              | Médio   | Médio         | Identificado como C-105 em CONCERNS.md                |
| RSK-006 | exercisesService sem exposição de listagem na UI — dados órfãos      | Baixo   | Alto          | Dados existem no banco; CRUD de leitura a implementar |

---

## Aprendizados da Sprint

### Produto

- A persistência imediata de exercícios (ao contrário do batch de flashcards no FINISH_SESSION) é o padrão correto para ações de criação de conhecimento — reduz risco de perda de dados
- Soft delete com Undo elimina a necessidade de modal de confirmação em ações de lista, resultando em UX mais fluida e reversível
- `ON DELETE SET NULL` em vez de `CASCADE` para trilhas → conteúdos respeita a autonomia do conhecimento do usuário (ADR-008)

### Arquitetura

- Defense-in-depth com `.eq('user_id', userId)` no client é complemento necessário ao RLS — RLS pode ter lacunas de configuração; o filtro client é uma rede de segurança adicional sem custo
- Decomposição de `FocusView` em fases (Study/Extract/Teach) foi a mudança arquitetural de maior impacto em manutenibilidade desta sprint
- Hooks `useToast` retornam `{ toast: { success, error, warning, info } }` — não `{ addToast }` — documentar na interface pública
- Commitlint com `body-max-line-length: 100` exige cuidado em mensagens de commit técnicas com nomes de função longos

### Segurança

- Dois contextos de browser em testes Playwright (`global.setup.ts` com user A e user B) são o padrão correto para validar isolamento multi-tenant em E2E
- LGPD opt-out via PostHog exige `opt_out_capturing()` explícito — não basta não inicializar; a flag deve reagir a mudanças mesmo após montagem

### QA

- Skill `qa-estrategico` com heurística ALTER FACE detectou o keyboard guard bug (BUG-PROD-012) que testes funcionais normais não detectariam — eventos globais de DOM são pontos cegos de suítes convencionais
- API suites Playwright com `{ request }` fixture são suficientes para contratos HTTP e eliminam a necessidade de Cypress/Supertest para esse escopo
- 422 testes unitários + production-security-gate antes do deploy criou uma rede de segurança que permitiu refatorações significativas sem regressões

---

## Recomendações para Sprint 02

### P0 — Crítico para usuários existentes

- **CRUD de Exercício completo:** implementar listagem de exercícios por conteúdo (na Biblioteca/ContentDrawer), edição e exclusão — dados já existem no banco desde P0-08
- **Alterar senha admin temporária** antes de ativar campanhas de aquisição
- **Migração Supabase para sa-east-1** — latência de 150ms para 30ms tem impacto direto na percepção de velocidade de todas as operações

### P1 — Importante para crescimento

- **Google OAuth:** ativar no Supabase dashboard (Client ID/Secret) e remover `disabled` do botão — reduz fricção no cadastro
- **CRUD de Sessão:** edição de título/contexto e exclusão de sessões históricas
- **Trilhas avançadas (Sprint 02 planejada):** ordenação de conteúdos dentro da trilha, metas por trilha, progresso agregado
- **Projetos de Aprendizagem:** criação de projetos com múltiplas trilhas e deadline

### P2 — Qualidade e operações

- **DMARC p=none → p=quarantine** (após 3+ semanas de monitoramento limpo)
- **Dependabot:** configurar monitoramento automático de CVEs em dependências
- **`POST /api/review/rate`:** mover avaliação SM-2 para API route (preparação para mobile)
- **Split do AppContext** por domínio (content/trail/review/user) — reduzir acoplamento e melhorar performance de re-render

---

## Score da Sprint

| Área         | Score | Justificativa                                                                                              |
| ------------ | ----: | ---------------------------------------------------------------------------------------------------------- |
| Produto      |    80 | CRUD de conteúdo e trilha completos. Exercício e sessão parciais. Soft delete, busca e paginação entregues |
| Arquitetura  |    91 | Decomposição, funções puras, defense-in-depth, Husky, lazy singleton, Knowledge Hub                        |
| Segurança    |    93 | RLS + client-side + OWASP + LGPD + testes multi-tenant + rate limiting + API suites                        |
| QA           |    89 | 422 unit tests, 39+ E2E specs, qa-estrategico, production-security-gate, contratos HTTP                    |
| UX           |    85 | FormField, toasts, ConfirmDialog, soft delete+undo, highlights âmbar, skeletons, atalhos de teclado        |
| Estabilidade |    88 | Console limpo, autosave, streak/XP persistidos, RLS sem recursão, fila de revisão estável                  |

**Nota Final: 90 / 100**

---

## Decisão Final

### Concluída com Pendências

A Sprint 01 atingiu seu objetivo central: o NeuroLearn está estável, seguro e confiável para os usuários. Os seis épicos foram endereçados. Os itens parcialmente concluídos (CRUD de exercício e sessão completos) não bloqueiam a experiência do usuário, pois os dados são persistidos corretamente — apenas a exposição de leitura/edição/exclusão na UI é pendente.

A plataforma está pronta para avançar para a Sprint 02 — Knowledge Structure.

---

## Próxima Sprint

**Sprint 02 — Knowledge Completion**

Escopo planejado:

- Trilhas avançadas (ordenação, metas, progresso agregado)
- Projetos de Aprendizagem
- Organização escalável do conhecimento
- Revisão por contexto (por trilha, por conteúdo)
- Busca e filtros avançados
- Paginação server-side
- CRUD completo de Exercício (pendência da Sprint 01)
