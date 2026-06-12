# ROADMAP — NeuroLearn

**Versão:** 2.0
**Status:** Oficial
**Horizonte:** 24 Meses
**Atualizado:** 2026-06-12

---

## Visão

Transformar o NeuroLearn na principal plataforma de inteligência de aprendizagem baseada em neurociência.

---

## Sprint 01 — Foundation Stabilization ✅ CONCLUÍDA

**Período:** 2026-06-07 a 2026-06-10
**Score:** 88/100
**Objetivo:** Estabilizar a plataforma e garantir confiança do usuário.

### Entregas

| Área                   | Entregas                                                              | Status       |
| ---------------------- | --------------------------------------------------------------------- | ------------ |
| Confiabilidade         | Correção de bugs, erros 500, erros 404                                | ✅           |
| Persistência Cognitiva | Highlights, reflexões, flashcards, explicações, exercícios            | ✅           |
| CRUD Completo          | Criar, visualizar, editar, remover (trilhas + conteúdos + flashcards) | ✅ (parcial) |
| UX Foundation          | Toasts, loading states, validações PT-BR, noValidate + Zod            | ✅           |
| Segurança Base         | Ownership, multi-tenant, RBAC, RLS Supabase                           | ✅           |

### Pendências Encaminhadas para Sprint 02

- CRUD Sessão (UPDATE + DELETE)
- CRUD Exercício (READ + UPDATE + DELETE)
- BUG-05 (subtitle inconsistency — identificado na Sprint 02)

---

## Sprint 02 — Knowledge Structure ✅ CONCLUÍDA

**Período:** 2026-06-11 a 2026-06-12
**Score:** 96/100
**Objetivo:** Transformar a biblioteca de conteúdos em estrutura organizada de conhecimento.

### Entregas

| Épico                | RFs                                                                               | Status |
| -------------------- | --------------------------------------------------------------------------------- | ------ |
| Learning Projects    | RF-191 a RF-198 (CRUD projetos + ownership + progresso consolidado)               | ✅     |
| Completion Sprint 01 | UPDATE_SESSION, DELETE_SESSION, CRUD Exercício completo                           | ✅     |
| Knowledge Navigation | RF-201 a RF-209 (busca multidimensional + filtros por tipo/status/projeto/trilha) | ✅     |

### Métricas

| Métrica                   | Valor        |
| ------------------------- | ------------ |
| RFs implementados         | 15           |
| Testes unitários (Vitest) | 484/484 ✅   |
| Testes E2E (Playwright)   | 72 novos TCs |
| Score QA Estratégico      | 96/100       |
| Bugs corrigidos           | 1 (BUG-04)   |
| Erros de tipo             | 0            |
| Warnings de lint          | 0            |

### Known Issues Aceitos

- **BUG-05** — Subtitle inconsistency em LibraryView quando filtros por projeto/trilha ativos (baixa severidade, deferred Sprint 03)
- **R-07-01** — Testes MemoryView condicionais (dependem de sessões de Focus prévias; design correto para MVP)

---

## Sprint 03 — Cognitive Engine 🗓 PLANEJAMENTO

**Status:** Em planejamento
**Objetivo:** Implementar inteligência cognitiva — transformar dados de estudo em percepções acionáveis.

### Escopo Preliminar

| Área                 | Entregas Candidatas                                           | Prioridade |
| -------------------- | ------------------------------------------------------------- | ---------- |
| Retention Score      | Cálculo de retenção por conteúdo baseado no SM-2              | P0         |
| Knowledge Decay      | Decaimento exponencial — alertas de revisão urgente           | P0         |
| Priority Engine      | Fila inteligente de revisão baseada em urgência cognitiva     | P0         |
| Skill Score          | Score de progresso por habilidade com threshold de mastery    | P1         |
| Cognitive Score      | Score global de aprendizagem por usuário                      | P1         |
| Fix BUG-05           | Subtitle inconsistency em LibraryView com filtros ativos      | P1         |
| E2E Fixtures         | Setup de fixtures stateful para MemoryView e sessões de Focus | P2         |
| AssignTrailModal E2E | Cobertura E2E para cenário RN-004 (trilha em dois projetos)   | P2         |

### Critério de Entrada

- [ ] Sprint 02 formalmente encerrada (CLOSURE assinado)
- [ ] Backlog da Sprint 03 priorizado pelo PO
- [ ] ADRs relevantes revisados (engine cognitivo pode requerer novos ADRs)
- [ ] Fixtures E2E planejadas para módulos stateful

### Critério de Saída (Definition of Done)

- Retention Score calculado e exibido por conteúdo
- Priority Engine gerando fila de revisão
- Knowledge Decay disparando alertas visíveis na UI
- Gate técnico: type-check + lint + test:unit + build — 0 erros
- QA Estratégico executado — nenhum crítico ou médio sem correção

---

## Sprint 04 — AI Learning Assistant 🔜 ROADMAP

**Objetivo:** Criar mentor cognitivo personalizado.

### Entregas Planejadas

- Coach de Aprendizagem com IA
- IA Socrática (questionamento adaptativo)
- Skill Gap Analysis
- Recomendações Inteligentes baseadas no histórico cognitivo

---

## Sprint 05 — Learning Intelligence Platform 🔜 ROADMAP

**Objetivo:** Transformar NeuroLearn em plataforma de inteligência de aprendizagem.

### Entregas Planejadas

- Forecast Cognitivo
- Learning Intelligence Dashboard
- IA Proativa (sugere próximo conteúdo automaticamente)
- Cognitive Twin (gêmeo digital do perfil de aprendizagem)

---

## Roadmap Corporativo (Paralelo às Sprints)

| Iniciativa                       | Status |
| -------------------------------- | ------ |
| Universidade Corporativa         | 🔜     |
| Onboarding Inteligente           | 🔜     |
| Skill Management (multi-tenant)  | 🔜     |
| Learning Analytics para gestores | 🔜     |

---

## North Star

> **Quantidade de Habilidades Consolidadas por Usuário**

---

## Regra de Evolução

Nenhuma funcionalidade pode ser priorizada sem estar alinhada com:

- MPD (Modelo de Produto Desejado)
- ADRs aprovados
- Domínios definidos no DOMAIN_CATALOG
- Este Roadmap

---

## Histórico de Sprints

| Sprint | Nome                           | Período                 | Score  | Status          |
| ------ | ------------------------------ | ----------------------- | ------ | --------------- |
| 01     | Foundation Stabilization       | 2026-06-07 / 2026-06-10 | 88/100 | ✅ Concluída    |
| 02     | Knowledge Structure            | 2026-06-11 / 2026-06-12 | 96/100 | ✅ Concluída    |
| 03     | Cognitive Engine               | —                       | —      | 🗓 Planejamento |
| 04     | AI Learning Assistant          | —                       | —      | 🔜 Roadmap      |
| 05     | Learning Intelligence Platform | —                       | —      | 🔜 Roadmap      |
