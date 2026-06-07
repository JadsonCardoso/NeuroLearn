# PRODUCT-OPS-01 — NeuroLearn
## Discovery Completo · PRDs · Histórias de Usuário · Critérios de Aceite · Estratégia QA · Roadmap

> **Versão:** 1.0  
> **Data:** 2026-06-07  
> **Responsável:** Jadson Cardoso (Product Owner)  
> **Status:** Aprovado para execução — Sprint 1 pronta para iniciar

---

## Índice

1. [FASE 1 — Discovery](#fase-1--discovery)
   - 1.1 Análise Situacional
   - 1.2 Mapa de Problemas
   - 1.3 Mapa de Oportunidades
   - 1.4 Riscos Técnicos
   - 1.5 Riscos de UX
   - 1.6 Quick Wins
2. [FASE 2 — PRDs](#fase-2--prds)
   - PRD-01: Dashboard Cognitivo Real
   - PRD-02: Revisão com Persistência Real e UX Premium
   - PRD-03: Geração de Flashcards por IA
   - PRD-04: Onboarding Guiado
3. [FASE 3 — Histórias de Usuário](#fase-3--histórias-de-usuário)
4. [FASE 4 — Critérios de Aceite (BDD)](#fase-4--critérios-de-aceite-bdd)
5. [FASE 5 — Estratégia QA](#fase-5--estratégia-qa)
6. [FASE 6 — Priorização](#fase-6--priorização)
7. [FASE 7 — Plano de Execução Evolutiva](#fase-7--plano-de-execução-evolutiva)

---

# FASE 1 — DISCOVERY

## 1.1 Análise Situacional

### Estado Atual do Produto

O NeuroLearn é uma plataforma SaaS de aprendizagem baseada em neurociência com stack madura (Next.js 15 + React 19 + TypeScript + Supabase) e fundações técnicas sólidas. O produto tem:

- **Cognitive Engine completo** (SM-2, Ebbinghaus, mastery score, cognitive score) — 272 testes unitários passando
- **CRUD funcional** na Biblioteca (conteúdos + flashcards)
- **Revisão espaçada** funcional com algoritmo SM-2
- **Sistema de sessões de foco** (Pomodoro + extração + modo professor)
- **Gamificação básica** (XP, streak, skills)
- **Infraestrutura de segurança** (OWASP, LGPD, RLS, rate limiting)
- **Deploy em produção** (Vercel + neurolearn.tech)
- **SMTP funcional** (Hostinger, SPF/DKIM/DMARC configurados)

### Gap Crítico Central: Desconexão Engine-Produto

O Cognitive Engine foi implementado e testado, mas **os resultados dos algoritmos não chegam ao usuário**. O Dashboard lê do AppContext (estado local do React), não do banco. O `calcCognitiveScore`, `calcMasteryScore` e `buildReviewQueue` existem e são testados, mas não são exibidos na interface.

**Analogia:** É como ter um motor de Fórmula 1 instalado, mas o velocímetro mostrando 0.

---

## 1.2 Mapa de Problemas

### Problemas Críticos (P0) — Corrigir imediatamente

| # | Problema | Localização | Impacto |
|---|---------|------------|---------|
| P0-01 | **Cognitive Score não exibido em nenhuma tela** | `src/engine/`, `src/modules/dashboard/` | O diferencial central do produto é invisível |
| P0-02 | **Streak e XP lidos do AppContext (não do Supabase)** | `src/store/AppContext.tsx:77-85` | Perda de dados ao trocar dispositivo ou limpar cache → churn |
| P0-03 | **EARN_XP do ActiveView não persiste no banco** | `src/modules/active/ActiveView.tsx:63-65` | XP de Aprendizado Ativo some ao recarregar |
| P0-04 | **FocusView perde estado ao navegar** — timer, notas e highlights são efêmeros | `src/modules/focus/FocusView.tsx` | Usuário perde sessão ao trocar de aba |
| P0-05 | **retention_snapshots não é escrito automaticamente** — tabela existe, nada grava | `src/services/` | Histórico de retenção vazio, analytics impossível |

### Problemas de Alta Prioridade (P1)

| # | Problema | Localização | Impacto |
|---|---------|------------|---------|
| P1-01 | **Nenhum atalho de teclado no Review** | `src/modules/review/ReviewView.tsx` | Fricção alta para usuários desktop — fluxo mais lento |
| P1-02 | **Library sem busca/filtro** | `src/modules/library/` | Com 20+ conteúdos, biblioteca fica inutilizável |
| P1-03 | **XP das Skills desconectado das atividades de estudo** | `src/modules/skills/SkillsView.tsx` | Gamificação sem feedback automático = sem engajamento |
| P1-04 | **Sem onboarding** para novos usuários | Dashboard | Dashboard vazio sem direção → ativação < 30% estimada |
| P1-05 | **ActiveView: apenas 1 prompt visível** — outros 2 são chips pouco óbvios | `src/modules/active/ActiveView.tsx` | Subutilização do Aprendizado Ativo |
| P1-06 | **Nenhuma funcionalidade de IA** — `ANTHROPIC_API_KEY` configurada mas sem uso | `src/lib/ai/` | Diferencial do produto não entregue |
| P1-07 | **MigrationBanner presente no layout de produção** | `src/components/layout/` | Ruído de UX desnecessário para todos os usuários |
| P1-08 | **Supabase na região us-east-1** — ~150ms de latência do Brasil | Infraestrutura | Performance degradada para todos os usuários brasileiros |

### Problemas de Média Prioridade (P2)

| # | Problema | Impacto |
|---|---------|---------|
| P2-01 | **ReviewView sem voltar ao card anterior** | Erro de avaliação é irreversível |
| P2-02 | **Sem notificação de revisão pendente** | Usuário quebra streak sem saber que há cards |
| P2-03 | **Sem mobile bottom nav** | Sidebar desktop inacessível em mobile |
| P2-04 | **Dashboard: calendário calcula do estado local** | Pode mostrar dados incorretos |
| P2-05 | **Google OAuth não ativo** — botão aparece mas falha | Confunde o usuário |
| P2-06 | **Sem exportação de dados** | Risco de compliance LGPD (portabilidade) |

### Problemas de Baixa Prioridade (P3)

| # | Problema |
|---|---------|
| P3-01 | Duração do Pomodoro fixa (25min) — sem customização |
| P3-02 | Preferência de tema (dark/light) não sincronizada entre dispositivos |
| P3-03 | DMARC ainda em `p=none` — reputação de e-mail vulnerável |

---

## 1.3 Mapa de Oportunidades

| Oportunidade | Valor | Esforço | Prioridade |
|---|---|---|---|
| **Dashboard cognitivo real** — exibir cognitive score + breakdown (engine pronto) | Alto | Baixo | Critical |
| **Persistência de Streak/XP** — resolver P0-02 definitivamente | Alto | Baixo | Critical |
| **Atalhos de teclado no Review** — Space, 1-4, Backspace | Médio | Baixo | Critical |
| **Busca na Biblioteca** | Médio | Baixo | High |
| **Persistência de review_cycle + retention_snapshot** | Alto | Médio | High |
| **Tela de resultado Review com score** | Médio | Baixo | High |
| **Geração de Flashcards por IA** — Anthropic API pronta | Alto | Alto | High |
| **Onboarding guiado 3 passos** | Alto | Médio | Medium |
| **EARN_XP ActiveView no banco** | Médio | Baixo | Medium |
| **Daily retention snapshot** (cron/edge function) | Médio | Médio | Medium |
| **FocusView timer com Web Worker** | Médio | Médio | Medium |
| **Mobile bottom navigation** | Médio | Médio | Medium |
| **Notificações de revisão pendente** | Alto | Alto | Low |
| **Google OAuth ativo** | Médio | Médio | Low |
| **Ranking/Social** | Médio | Alto | Low |
| **Migrar Supabase para sa-east-1** | Médio | Alto | Low |

---

## 1.4 Riscos Técnicos

| Risco | Severidade | Probabilidade | Mitigação |
|---|---|---|---|
| **Desincronização AppContext ↔ Supabase** | Alto | Alta | API routes síncronas + otimistic UI com rollback |
| **Latência us-east-1** (150ms/query do BR) | Médio | Alta | Migrar para `sa-east-1` ou usar edge functions |
| **Crescimento do AppContext** — 100+ cards = lento | Alto | Médio | Paginação + React Query/SWR |
| **FocusView timer sem Web Worker** — `setInterval` impreciso em background | Médio | Alta | Migrar timer para Web Worker |
| **Ausência de retry no Supabase** — falha de rede silencia ação | Alto | Média | Retry com exponential backoff |
| **Supabase RATE_CARD sem registro em review_cycles** | Alto | Certeza | Adicionar `recordReviewCycle` no handler |

---

## 1.5 Riscos de UX

| Risco | Descrição |
|---|---|
| **Avaliação errada sem undo** | ReviewView não permite voltar ao card anterior |
| **Perda de sessão de foco** | Sem aviso ao navegar com sessão ativa |
| **Abandono na primeira sessão** | Dashboard vazio não comunica próximo passo |
| **XP perdido invisível** | EARN_XP não persiste = confiança quebrada no sistema |
| **Latência visível** | 150ms por query em BR degrada percepção de performance |

---

## 1.6 Quick Wins (< 1 dia de implementação)

1. Remover `MigrationBanner` do layout de produção
2. Atalhos de teclado no ReviewView (Space + 1-4 + Backspace)
3. Busca por título na LibraryView
4. Exibir `calcCognitiveScore` no Dashboard (engine já implementado)
5. Desabilitar botão Google OAuth com tooltip "Em breve"

---

# FASE 2 — PRDs

---

## PRD-01: Dashboard Cognitivo Real

**Problema:** O usuário não sabe o quão bem está retendo conhecimento. O `calcCognitiveScore` existe em `src/engine/cognitive-score/cognitiveScore.ts` e retorna score 0–100 com breakdown, mas nunca é chamado no Dashboard. O Dashboard lê dados do AppContext (estado local), não do Supabase.

**Objetivo:** Transformar o Dashboard em painel de inteligência cognitiva real com Cognitive Score, breakdown por dimensão e dados persistidos.

**Hipótese de Valor:** Se o usuário ver seu score cognitivo com breakdown real, ele entenderá quais dimensões melhorar → aumento de sessões de revisão e foco em +30%.

**Fluxo do Usuário:**
1. Acessa `/dashboard`
2. Vê Cognitive Score (0–100) em destaque com anel visual
3. Vê breakdown: Retenção 35% · Mastery 30% · Consistência 20% · Aprendizado Ativo 15%
4. Vê tendência da última semana (gráfico de linha)
5. Clica em dimensão para ver detalhes e ação sugerida

**Requisitos Funcionais:**

| ID | Requisito |
|---|---|
| RF-01 | Calcular e exibir `calcCognitiveScore` para o usuário logado |
| RF-02 | Exibir breakdown das 4 dimensões com % e cor semântica (verde/amarelo/vermelho) |
| RF-03 | Streak persistido no Supabase (`users.streak` + `users.last_study_date`) |
| RF-04 | XP total atualizado via `updateUserTotalXP` a cada RATE_CARD e FINISH_SESSION |
| RF-05 | Calendário de revisões calculado de `flashcards.nextReview` do Supabase |

**Requisitos Não-Funcionais:**

| ID | Requisito |
|---|---|
| RNF-01 | Score calculado em < 200ms (client-side, engine já implementado) |
| RNF-02 | Streak/XP consistentes entre dispositivos (via Supabase) |
| RNF-03 | Fallback gracioso quando sem cards: exibir 0% + CTA de ação |

**Dependências:** `src/engine/cognitive-score/cognitiveScore.ts`, `src/services/skillsService.ts:updateUserTotalXP`, tabela `users` no Supabase

**Métricas de Sucesso:**
- Tempo na página Dashboard > 30s
- Taxa de clique em "Revisar agora" quando score < 60 ≥ 50%
- Score médio dos usuários ativos > 60 após 2 semanas

---

## PRD-02: Revisão com Persistência Real e UX Premium

**Problema:** ReviewView realiza SM-2 via AppContext, mas: (1) não registra em `review_cycles`, (2) XP não persiste no banco, (3) sem atalhos de teclado, (4) sem desfazer avaliação, (5) sem snapshot de retenção salvo.

**Objetivo:** Tornar a revisão a experiência central — rápida, acessível por teclado, persistente e recompensadora.

**Hipótese de Valor:** Com atalhos de teclado e persistência completa, usuários power users aumentarão frequência de revisão em 2x.

**Fluxo do Usuário:**
1. Acessa `/review`
2. Card exibido — pressiona Space para virar
3. Pressiona 1/2/3/4 para avaliar
4. Sistema registra: SM-2 atualizado + review_cycle criado + XP persistido + snapshot salvo
5. Ao final: tela de resultado com cognitive score atualizado

**Requisitos Funcionais:**

| ID | Requisito |
|---|---|
| RF-01 | Atalhos: Space = virar; 1/2/3/4 = avaliar; Backspace = card anterior |
| RF-02 | Persistir `review_cycle` no Supabase ao avaliar |
| RF-03 | XP ganho chama `updateUserTotalXP` imediatamente |
| RF-04 | Salvar `retention_snapshot` ao final de cada sessão |
| RF-05 | Streak incrementado no banco ao concluir sessão do dia |
| RF-06 | Tela de resultado exibe cognitive score recalculado |

**Requisitos Não-Funcionais:**

| ID | Requisito |
|---|---|
| RNF-01 | Resposta ao atalho de teclado < 50ms |
| RNF-02 | Persistência Supabase não bloqueia UX (otimistic update) |
| RNF-03 | Se Supabase falhar: retry silencioso + toast de aviso |

**Edge Cases:**
- Tecla numérica antes de virar → ignorar
- Sessão com 0 cards → redirecionar para dashboard
- Perda de conexão → continuar localmente, sincronizar ao reconectar
- Último card + sair → marcar como "done" mesmo sem tela de resultado

**Métricas de Sucesso:**
- % de sessões concluídas (vs abandonadas) > 80%
- Tempo médio de avaliação de card < 15s
- `retention_snapshots` preenchida para 100% dos usuários ativos

---

## PRD-03: Geração de Flashcards por IA

**Problema:** Criar flashcards manualmente é a maior fricção do fluxo. Criar 10 bons cards leva 20 minutos. A `ANTHROPIC_API_KEY` está configurada mas sem uso.

**Objetivo:** Usuário cola texto → recebe flashcards gerados por IA em < 30s → aprova → salva.

**Hipótese de Valor:** Se a criação de cards cair de 20 minutos para 30 segundos, taxa de criação após adicionar conteúdo sobe de ~20% para ~70%.

**Fluxo do Usuário:**
1. Clica em "Gerar Flashcards com IA" (LibraryView ou FocusView)
2. Cola texto (max 2.000 chars) ou conecta a conteúdo existente
3. Seleciona: quantidade (5/10/15) e nível (básico/intermediário/avançado)
4. Aguarda 5–10s (skeleton loader)
5. Recebe cards para revisar/editar individualmente
6. Aprovação individual ou em lote → salvar

**Requisitos Funcionais:**

| ID | Requisito |
|---|---|
| RF-01 | Endpoint `POST /api/ai/generate-flashcards` com Anthropic Claude Haiku |
| RF-02 | Input: text (max 2.000 chars) + contentId + quantity (5/10/15) + level |
| RF-03 | Output: array de `{front: string, back: string}` validado com Zod |
| RF-04 | Rate limit: 10 gerações por usuário por dia (via `cognitive_events`) |
| RF-05 | Preview editável antes de salvar |
| RF-06 | Salvar aprovados via `createFlashcards` existente |

**Requisitos Não-Funcionais:**

| ID | Requisito |
|---|---|
| RNF-01 | Timeout de 30s com feedback visual progressivo |
| RNF-02 | Input sanitizado contra XSS antes de enviar à API |
| RNF-03 | `ANTHROPIC_API_KEY` nunca exposta ao cliente |

**Edge Cases:**
- Texto < 100 chars → erro claro
- IA retorna JSON malformado → retry (1x) → fallback 503
- Limite diário atingido → mensagem com reset amanhã
- contentId não pertence ao usuário → 403

**Métricas de Sucesso:**
- 40% dos novos conteúdos com IA nos primeiros 7 dias
- Média de cards por sessão de foco: 2 → 8
- NPS de "Criar flashcards" de < 6 para > 8

---

## PRD-04: Onboarding Guiado para Novos Usuários

**Problema:** Novo usuário chega ao Dashboard completamente vazio. Sem tutorial, sem direção. Taxa de ativação estimada < 30%.

**Objetivo:** Guiar o novo usuário em 3 passos nos primeiros 5 minutos, garantindo que crie 1 conteúdo, 3 flashcards e faça 1 revisão.

**Fluxo do Usuário:**
1. Primeiro acesso pós-signup → banner de boas-vindas (não intrusivo)
2. Checklist no Dashboard: `[ ] Adicionar conteúdo` `[ ] Criar flashcard` `[ ] Fazer revisão`
3. Cada passo concluído → animação de check + toast + XP bônus
4. Ao completar os 3 → "Você está pronto! Seu cognitive score inicial é X"
5. Checklist some após completar (ou após 14 dias)

**Requisitos Funcionais:**

| ID | Requisito |
|---|---|
| RF-01 | Flag `onboarding_completed` em `users` (boolean) |
| RF-02 | Checklist persistido no banco (não localStorage) |
| RF-03 | XP bônus: +50 XP (adicionar), +100 XP (criar cards), +150 XP (revisar) |
| RF-04 | Link direto de cada passo para a ação correspondente |

**Métricas de Sucesso:**
- Taxa de ativação D1: 20% → 60%
- Retenção D7 de usuários que completaram onboarding vs não: diferença > 2x

---

# FASE 3 — HISTÓRIAS DE USUÁRIO

## Épico: Dashboard Cognitivo Real (PRD-01)

### US-01.1 — Cognitive Score no Dashboard
```
Como estudante ativo no NeuroLearn,
Quero ver meu Cognitive Score (0–100) no Dashboard com breakdown por dimensão,
Para entender em quais áreas do aprendizado preciso melhorar.
```
**Complexidade:** M | **Dependência:** engine/cognitiveScore.ts (existente)

---

### US-01.2 — Streak e XP persistidos
```
Como usuário que usa o NeuroLearn em múltiplos dispositivos,
Quero que meu streak e XP estejam sempre atualizados e consistentes,
Para não perder meu progresso ao trocar de dispositivo ou limpar cache.
```
**Complexidade:** P | **Dependência:** `updateUserTotalXP`, tabela `users`

---

### US-01.3 — Calendário de revisões do banco
```
Como estudante que planeja sua semana,
Quero ver o calendário de revisões calculado a partir dos dados reais do banco,
Para saber com precisão quantas revisões tenho em cada dia.
```
**Complexidade:** P | **Dependência:** `flashcards.nextReview` do Supabase

---

## Épico: Revisão Premium (PRD-02)

### US-02.1 — Atalhos de teclado
```
Como estudante que revisa diariamente no desktop,
Quero usar Space para virar o card e 1/2/3/4 para avaliar sem usar o mouse,
Para revisar mais rápido e com menos fricção.
```
**Complexidade:** P | **Dependência:** nenhuma

---

### US-02.2 — Desfazer última avaliação
```
Como estudante que às vezes pressiona a tecla errada,
Quero poder voltar ao card anterior e reavaliar,
Para garantir que meu progresso SM-2 seja preciso.
```
**Complexidade:** P | **Dependência:** lógica local do ReviewView

---

### US-02.3 — Persistência de review cycle e XP
```
Como usuário que quer que seu esforço de revisão seja reconhecido,
Quero que cada card revisado gere um review_cycle no banco e atualize meu XP,
Para que meu progresso nunca se perca e o cognitive score reflita a realidade.
```
**Complexidade:** M | **Dependência:** `recordReviewCycle`, `updateUserTotalXP`, `saveRetentionSnapshot`

---

### US-02.4 — Tela de resultado com cognitive score
```
Como estudante que acabou de revisar,
Quero ver na tela de resultado meu cognitive score atualizado com comparação ao anterior,
Para sentir o impacto imediato da minha sessão.
```
**Complexidade:** P | **Dependência:** US-02.3 concluída

---

## Épico: Geração de Flashcards por IA (PRD-03)

### US-03.1 — Endpoint de geração
```
Como usuário técnico,
Quero um endpoint POST /api/ai/generate-flashcards com Claude Haiku,
Para que o frontend possa solicitar geração de cards a partir de texto.
```
**Complexidade:** M | **Dependência:** `ANTHROPIC_API_KEY` (configurada)

---

### US-03.2 — UI de geração e aprovação
```
Como estudante que adicionou um novo livro,
Quero colar um trecho e receber flashcards gerados por IA para aprovar,
Para criar cards de qualidade em segundos em vez de minutos.
```
**Complexidade:** G | **Dependência:** US-03.1 concluída

---

## Épico: Onboarding (PRD-04)

### US-04.1 — Checklist de onboarding
```
Como novo usuário que acabou de se cadastrar,
Quero ver um checklist de 3 passos no Dashboard com progresso visual,
Para saber exatamente o que fazer primeiro no NeuroLearn.
```
**Complexidade:** M | **Dependência:** coluna `onboarding_completed` em `users`

---

## Quick Wins (histórias pontuais)

### US-QW.1 — Busca na Biblioteca
```
Como estudante com mais de 20 conteúdos,
Quero digitar parte do título para filtrar instantaneamente,
Para encontrar o conteúdo que preciso sem rolar a lista.
```
**Complexidade:** P

### US-QW.2 — Remover MigrationBanner de produção
```
Como usuário de produção,
Quero que o banner de migração não apareça para mim,
Para ter uma experiência limpa e profissional.
```
**Complexidade:** P

### US-QW.3 — Desabilitar Google OAuth com "Em breve"
```
Como usuário que tentou login com Google,
Quero ver que a opção está "Em breve" em vez de falhar,
Para não me sentir confuso ou frustrado.
```
**Complexidade:** P

---

# FASE 4 — CRITÉRIOS DE ACEITE (BDD)

## CA: US-02.1 — Atalhos de Teclado

```gherkin
Scenario: Space vira o card (frente → resposta)
  Dado que o usuário está na tela de revisão com o card mostrando a frente
  Quando pressionar a tecla Space
  Então o card deve virar e mostrar a resposta
  E os botões de avaliação devem aparecer

Scenario: Space não vira quando card já está virado
  Dado que o card está mostrando a resposta
  Quando pressionar Space novamente
  Então o card deve voltar para a frente
  E os botões de avaliação devem desaparecer

Scenario: Tecla 1 avalia como "Esqueci"
  Dado que o card está virado mostrando a resposta
  Quando pressionar a tecla "1"
  Então o sistema deve registrar avaliação quality=1
  E o card deve avançar para o próximo

Scenario: Tecla 2 avalia como "Difícil"
  Dado que o card está virado
  Quando pressionar a tecla "2"
  Então o sistema deve registrar avaliação quality=2

Scenario: Tecla 3 avalia como "Bom"
  Dado que o card está virado
  Quando pressionar a tecla "3"
  Então o sistema deve registrar avaliação quality=3

Scenario: Tecla 4 avalia como "Fácil"
  Dado que o card está virado
  Quando pressionar a tecla "4"
  Então o sistema deve registrar avaliação quality=4

Scenario: Tecla numérica antes de virar é ignorada
  Dado que o card está mostrando apenas a frente (não virado)
  Quando pressionar qualquer tecla 1/2/3/4
  Então nenhuma avaliação deve ser registrada
  E o card não deve avançar

Scenario: Atalhos desabilitados na tela de resultado
  Dado que o usuário completou todos os cards e está na tela de resultado
  Quando pressionar Space ou 1/2/3/4
  Então nenhuma ação deve ocorrer

Scenario: Atalhos não capturam foco de campos de texto
  Dado que o foco está em um elemento de input
  Quando pressionar Space
  Então o campo deve receber o espaço normalmente
  E o card não deve virar
```

---

## CA: US-02.2 — Desfazer Última Avaliação

```gherkin
Scenario: Backspace volta ao card anterior
  Dado que o usuário avaliou pelo menos 1 card
  Quando pressionar Backspace
  Então o sistema deve exibir o card anterior
  E o estado deve ser "frente visível" (não virado)
  E o SM-2 do card anterior deve ser revertido ao estado pré-avaliação

Scenario: Backspace no primeiro card não faz nada
  Dado que o usuário está no primeiro card
  Quando pressionar Backspace
  Então nada deve acontecer
  E nenhum erro deve ser lançado

Scenario: Botão "Voltar" visível após primeiro card
  Dado que o usuário avaliou o primeiro card
  Então um botão "← Voltar" deve estar visível e acessível por teclado

Scenario: Revert do SM-2 preserva estado anterior
  Dado que um card com ef=2.5, interval=1 foi avaliado com quality=4
  Quando o usuário pressionar Backspace
  Então o card deve ter ef=2.5 e interval=1 novamente
```

---

## CA: US-02.3 — Persistência de Review Cycle e XP

```gherkin
Scenario: review_cycle criado ao avaliar card
  Dado que o usuário avalia um card com quality=3
  Quando a avaliação é processada
  Então um registro em review_cycles deve existir no Supabase
  Com: card_id, user_id, quality=3, date=hoje, ef_after, interval_after

Scenario: XP atualizado no Supabase
  Dado que o usuário tem total_xp=500 no banco
  Quando avaliar um card com quality=4 (xp=15)
  Então users.total_xp deve ser 515 no Supabase após a sessão
  E o estado local deve mostrar 515 imediatamente (otimistic update)

Scenario: retention_snapshot salvo ao final da sessão
  Dado que o usuário concluiu todos os cards da fila de revisão
  Quando a tela de resultado aparecer
  Então um retention_snapshot deve existir para cada card revisado

Scenario: Streak incrementado no primeiro review do dia
  Dado que last_study_date != hoje
  Quando completar pelo menos 1 card de revisão
  Então users.streak deve ser incrementado em 1
  E users.last_study_date deve ser atualizado para hoje

Scenario: Streak não incrementado na segunda revisão do dia
  Dado que last_study_date == hoje
  Quando completar outra sessão
  Então users.streak não deve mudar

Scenario: Falha no Supabase não bloqueia revisão
  Dado que o Supabase retorna erro de rede
  Quando o usuário avaliar um card
  Então a revisão deve continuar normalmente no estado local
  E um toast deve aparecer informando sobre a sincronização
  E uma nova tentativa deve ocorrer em 5 segundos
```

---

## CA: US-03.1 — Endpoint de Geração de Flashcards

```gherkin
Scenario: Geração bem-sucedida
  Dado que o usuário enviou POST /api/ai/generate-flashcards
  Com body: { text: "texto com 200+ chars", contentId: "uuid", quantity: 10, level: "intermediário" }
  E o usuário tem menos de 10 gerações hoje
  Quando a API Anthropic responder com sucesso
  Então retornar 200 com { cards: [{front, back}, ...] }
  E evento registrado em cognitive_events

Scenario: Rate limit atingido
  Dado que o usuário já fez 10 gerações hoje
  Quando enviar nova requisição
  Então retornar 429
  Com { error: "Limite diário de geração atingido. Tente amanhã." }

Scenario: Texto muito curto
  Dado body contém text com menos de 100 caracteres
  Então retornar 400
  Com { error: "Texto muito curto para gerar flashcards de qualidade." }

Scenario: ContentId não pertence ao usuário
  Dado que contentId pertence a outro usuário
  Então retornar 403

Scenario: IA retorna JSON malformado — retry
  Dado que Anthropic retornou resposta fora do formato esperado
  Quando o parsing falhar
  Então o sistema faz 1 retry
  Se retry falhar, retornar 503

Scenario: Sem autenticação
  Dado que a requisição não contém sessão válida
  Então retornar 401
```

---

## CA: US-QW.1 — Busca na Biblioteca

```gherkin
Scenario: Filtro por título em tempo real
  Dado que o usuário tem 10 conteúdos na biblioteca
  Quando digitar "react" no campo de busca
  Então apenas conteúdos com "react" no título (case insensitive) devem aparecer

Scenario: Sem resultados
  Dado que nenhum conteúdo corresponde ao texto
  Então exibir: "Nenhum conteúdo encontrado para '[termo]'"

Scenario: Campo limpo retorna todos
  Dado que há texto no campo de busca
  Quando limpar o campo
  Então todos os conteúdos devem reaparecer

Scenario: Busca funciona com acentos
  Dado que existe "Psicologia Cognitiva"
  Quando digitar "psicologia" (sem acento)
  Então o conteúdo deve aparecer

Scenario: Acessibilidade
  Então o campo deve ter aria-label="Buscar conteúdo"
  E deve ter placeholder="Buscar por título..."
  E deve ser focusável por Tab
```

---

# FASE 5 — ESTRATÉGIA QA

## 5.1 Cobertura Atual vs Necessária

| Módulo | Unitário Atual | E2E Atual | Gap Principal |
|---|---|---|---|
| engine/ | 76 testes ✅ | — | Nenhum |
| security/ | 70 testes ✅ | — | Nenhum |
| auth/ | 12 testes ✅ | 7 E2E ✅ | Nenhum |
| library/ | 9 testes ✅ | 11 E2E ✅ | Busca (nova feature) |
| review/ | 3 testes ✅ | 6 E2E parciais ⚠️ | Atalhos teclado, persistência |
| focus/ | ❌ | ❌ | **Cobertura total ausente** |
| active/ | ❌ | ❌ | **Cobertura total ausente** |
| skills/ | ❌ | Parcial ⚠️ | XP persistence, ConfirmDialog |
| dashboard/ | ❌ | ❌ | **Cognitive score, métricas** |
| api/ai/ | ❌ | ❌ | Endpoint novo — cobertura necessária |

## 5.2 Testes Obrigatórios por Entrega

### Dashboard Cognitivo (PRD-01)
**Unitários:**
- `calcCognitiveScore` com dados reais do AppContext
- Streak increment logic (dia novo vs mesmo dia)
- XP accumulation no Supabase

**E2E (Playwright):**
- Dashboard exibe cognitive score ring com valor numérico
- Breakdown visível com 4 dimensões
- CTA "Revisar agora" navega para `/review`
- Estado vazio (sem cards) exibe 0% com CTA de ação

---

### Revisão Premium (PRD-02)
**Unitários:**
- Keyboard handler: Space vira, 1–4 avalia, Backspace volta
- Undo/redo stack (card anterior)
- review_cycle payload validation (Zod)
- retention_snapshot payload validation (Zod)

**E2E (Playwright):**
- Space vira o card
- Tecla 4 avalia e avança para próximo
- Tecla 1 quando card não está virado → ignorado
- Backspace volta ao card anterior
- Completar sessão → tela de resultado exibe XP ganho
- Toast de sync após erro de rede (mock)

---

### IA Flashcards (PRD-03)
**Unitários (request/response):**
- Zod schema: input validation (text length, quantity range, level enum)
- Zod schema: output validation (array de {front, back})
- Rate limit: 10/dia por usuário
- Sanitização do texto antes de enviar à API

**Integration (API route):**
- POST com texto válido → 200 + array de cards
- POST com texto < 100 chars → 400
- Rate limit atingido → 429
- Sem auth → 401
- Mock Anthropic malformado → retry → 503

**E2E (Playwright):**
- Botão "Gerar com IA" visível na LibraryView
- Modal abre com campo de texto
- Skeleton loader exibido durante aguarda
- Cards gerados aparecem com opção editar/remover
- "Salvar X cards" salva e fecha modal
- Toast de sucesso exibido

---

### Quick Wins
**E2E:**
- LibraryView: campo de busca filtra conteúdos
- ReviewView: Space funciona como flip
- MigrationBanner não está visível em produção
- Google OAuth com tooltip "Em breve"

## 5.3 Gate de Qualidade Obrigatório

Antes de qualquer PR ser considerado pronto:

```bash
npm run type-check       # zero erros de tipo
npm run lint             # zero warnings
npm run test:unit        # todos os 272+ testes passando
npx playwright test      # suite completa passando
npm run build            # build limpo
```

---

# FASE 6 — PRIORIZAÇÃO

## Backlog Priorizado Completo

| ID | Feature | Impacto | Esforço | Risco | Prioridade |
|---|---|---|---|---|---|
| QW-01 | Atalhos de teclado Review (Space, 1-4, Backspace) | Alto | Baixo | Baixo | **Critical** |
| QW-02 | Streak/XP persistidos no Supabase (fix P0-02) | Alto | Baixo | Baixo | **Critical** |
| QW-03 | Cognitive Score no Dashboard (engine pronto) | Alto | Baixo | Baixo | **Critical** |
| QW-04 | Remover MigrationBanner de produção | Médio | Baixo | Zero | **Critical** |
| QW-05 | Busca na Biblioteca | Médio | Baixo | Baixo | **High** |
| QW-06 | Desabilitar Google OAuth com "Em breve" | Baixo | Baixo | Zero | **High** |
| P1 | Persistência de review_cycle + retention_snapshot | Alto | Médio | Baixo | **High** |
| P2 | Tela de resultado Review com cognitive score | Médio | Baixo | Baixo | **High** |
| P3 | Geração de Flashcards por IA (PRD-03) | Alto | Alto | Médio | **High** |
| P4 | Onboarding guiado (PRD-04) | Alto | Médio | Baixo | **Medium** |
| P5 | EARN_XP ActiveView persiste no banco | Médio | Baixo | Baixo | **Medium** |
| P6 | Daily retention snapshot (cron/edge function) | Médio | Médio | Médio | **Medium** |
| P7 | FocusView timer com Web Worker | Médio | Médio | Médio | **Medium** |
| P8 | Mobile bottom navigation | Médio | Médio | Baixo | **Medium** |
| P9 | Google OAuth ativo | Médio | Médio | Baixo | **Low** |
| P10 | Notificações de revisão (push/email) | Alto | Alto | Alto | **Low** |
| P11 | Ranking/Social | Baixo | Alto | Alto | **Low** |
| P12 | Migrar Supabase para sa-east-1 | Médio | Alto | Alto | **Low** |

---

# FASE 7 — PLANO DE EXECUÇÃO EVOLUTIVA

## Sprint 1 — Foundation Fix (1–2 dias)
**Objetivo:** Corrigir os P0s e entregar quick wins antes de qualquer nova feature.

| # | Tarefa | US | Estimativa |
|---|---|---|---|
| 1 | Atalhos de teclado ReviewView (Space + 1-4 + Backspace) | US-02.1 + US-02.2 | 3h |
| 2 | Streak/XP persistidos no Supabase | US-01.2 | 2h |
| 3 | Cognitive Score no Dashboard | US-01.1 | 4h |
| 4 | Remover MigrationBanner | QW-04 | 30min |
| 5 | Google OAuth → tooltip "Em breve" | QW-06 | 30min |
| 6 | Testes E2E para itens acima | — | 3h |

**Critério de conclusão:** Gate completo passando + zero regressões nos 272 testes existentes.

---

## Sprint 2 — Review Completo (2–3 dias)
**Objetivo:** Tornar a revisão o coração confiável e persistente do produto.

| # | Tarefa | US | Estimativa |
|---|---|---|---|
| 1 | `recordReviewCycle` no handler RATE_CARD | US-02.3 | 2h |
| 2 | `saveRetentionSnapshot` ao final de cada sessão | US-02.3 | 2h |
| 3 | Tela de resultado com cognitive score recalculado | US-02.4 | 3h |
| 4 | Busca na Biblioteca | US-QW.1 | 2h |
| 5 | EARN_XP do ActiveView persistido no banco | P5 | 1h |
| 6 | Testes unitários + E2E | — | 4h |

---

## Sprint 3 — IA + Onboarding (3–5 dias)
**Objetivo:** Remover a maior fricção de criação + garantir ativação de novos usuários.

| # | Tarefa | US | Estimativa |
|---|---|---|---|
| 1 | Endpoint `POST /api/ai/generate-flashcards` | US-03.1 | 4h |
| 2 | UI de geração e aprovação na LibraryView | US-03.2 | 6h |
| 3 | Checklist de onboarding no Dashboard | US-04.1 | 4h |
| 4 | Daily retention snapshot (cron Supabase ou Vercel cron) | P6 | 3h |
| 5 | Testes completos (unitários + integration + E2E) | — | 6h |

---

## Sprint 4 — Polish + Mobile (2–3 dias)
**Objetivo:** Experiência premium em desktop e mobile.

| # | Tarefa | Estimativa |
|---|---|---|
| 1 | FocusView timer com Web Worker | 4h |
| 2 | Mobile bottom navigation | 6h |
| 3 | Google OAuth ativo | 3h |
| 4 | FocusView warning ao navegar com sessão ativa | 2h |

---

## Resultado Final Esperado (após as 4 sprints)

| Dimensão | Antes | Depois |
|---|---|---|
| Cognitive Score visível ao usuário | ❌ | ✅ |
| Dados persistentes entre dispositivos | ❌ | ✅ |
| Revisão com atalhos de teclado | ❌ | ✅ |
| Revisão com persistência completa | ❌ | ✅ |
| Flashcards gerados por IA | ❌ | ✅ |
| Onboarding guiado | ❌ | ✅ |
| Cobertura E2E dos módulos core | ~30% | ~90% |
| Snapshots de retenção automáticos | ❌ | ✅ |
| Cognitive Engine exposto ao usuário | ❌ | ✅ |

O NeuroLearn passará de **"plataforma com engine cognitivo implementado mas invisível"** para **"produto onde cada ação gera feedback cognitivo real, persistente e inteligente"** — a proposta de valor central entregue de ponta a ponta.

---

## Glossário

| Termo | Definição |
|---|---|
| **SM-2** | Algoritmo SuperMemo 2 de repetição espaçada |
| **Cognitive Score** | Score 0–100 calculado por `calcCognitiveScore` em `src/engine/` |
| **retention_snapshot** | Registro pontual da taxa de retenção de um card em uma data |
| **review_cycle** | Registro de uma avaliação de flashcard (quality, ef_after, interval_after) |
| **AppContext** | Store global React (Context + useReducer) em `src/store/AppContext.tsx` |
| **EARN_XP** | Action do AppContext para ganhar XP via Aprendizado Ativo |
| **RATE_CARD** | Action do AppContext que aplica SM-2 e sincroniza com Supabase |
| **MigrationBanner** | Componente de migração de dados do localStorage (legado) |
| **otimistic update** | Atualizar UI antes de confirmar persistência no banco |
| **P/M/G** | Pequeno/Médio/Grande — estimativa de complexidade de histórias |
