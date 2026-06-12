# Sprint 02 Review

**Projeto:** NeuroLearn
**Sprint:** 02 — Knowledge Structure
**Período:** 2026-06-11 a 2026-06-12
**Status:** Concluída ✅
**Score:** 96/100

---

## Objetivo da Sprint

Transformar o NeuroLearn de uma biblioteca de conteúdos em uma estrutura organizada de conhecimento: permitir agrupar trilhas em projetos temáticos, navegar pelo acervo com busca e filtros multidimensionais, e encerrar pendências do CRUD de sessões e exercícios da Sprint 01.

O foco NÃO foi criar inteligência ou analytics. Foi organização, contexto e escalabilidade cognitiva.

---

## Escopo Planejado × Entregue

### Épico 1 — Learning Projects (P0)

| Item                                             | Planejado | Entregue | Status    |
| ------------------------------------------------ | --------- | -------- | --------- |
| Criar projeto (RF-191)                           | ✅        | ✅       | Concluído |
| Listar projetos + busca (RF-192)                 | ✅        | ✅       | Concluído |
| Editar projeto (RF-193)                          | ✅        | ✅       | Concluído |
| Excluir projeto com trilhas preservadas (RF-194) | ✅        | ✅       | Concluído |
| Associar/desassociar trilha (RF-195)             | ✅        | ✅       | Concluído |
| Progresso consolidado (RF-196, RF-197)           | ✅        | ✅       | Concluído |
| Ownership enforcement (RF-198)                   | ✅        | ✅       | Concluído |

### Épico 2 — Completion Sprint 01

| Item                                   | Planejado | Entregue | Status    |
| -------------------------------------- | --------- | -------- | --------- |
| CRUD Sessão — Editar (UPDATE_SESSION)  | ✅        | ✅       | Concluído |
| CRUD Sessão — Excluir (DELETE_SESSION) | ✅        | ✅       | Concluído |
| CRUD Exercício — Lazy-load + listar    | ✅        | ✅       | Concluído |
| CRUD Exercício — Editar                | ✅        | ✅       | Concluído |
| CRUD Exercício — Excluir               | ✅        | ✅       | Concluído |

### Épico 3 — Knowledge Navigation

| Item                        | Planejado    | Entregue     | Status    |
| --------------------------- | ------------ | ------------ | --------- |
| Busca por projeto (RF-201)  | ✅           | ✅           | Concluído |
| Busca por trilha (RF-202)   | ✅           | ✅           | Concluído |
| Busca por conteúdo (RF-203) | ✅ (existia) | ✅ Estendido | Concluído |
| Filtro por tipo (RF-204)    | ✅           | ✅           | Concluído |
| Filtro por status (RF-205)  | ✅           | ✅           | Concluído |
| Filtro por projeto (RF-206) | ✅           | ✅           | Concluído |
| Filtro por trilha (RF-207)  | ✅           | ✅           | Concluído |
| Limpar filtros (RF-209)     | ✅           | ✅           | Concluído |

---

## O que Funcionou Bem

### Arquitetura Two-Axis para Filtros

A decisão de separar os filtros em dois eixos independentes (eixo de seções via `filteredTrails` e eixo de conteúdos via `visibleFiltered`) evitou acoplamento e permitiu combinações de filtros previsíveis. O useMemo derivado previne re-renderizações desnecessárias.

### Ownership First Consistente

Todas as operações em `projectsService` aplicam dupla verificação `.eq('user_id', userId)`, garantindo que RLS do Supabase e validação da camada de serviço coincidam. Isso eliminou riscos de IDOR desde a fase de implementação.

### DELETE_PROJECT no Reducer

A decisão de desassociar trilhas no reducer (além do FK ON DELETE SET NULL no banco) garantiu que a UI reflita imediatamente a desassociação sem aguardar nova query. Consistência entre DB e estado local mantida.

### 484 Testes Unitários Aprovados

A cobertura de testes unitários (Vitest) inclui 28 testes para `projectsService` e 30 para `filterLogic`, cobrindo cenários de ownership, RN-004, normalização PT-BR e combinações de filtros.

### BUG-04 Encontrado e Corrigido

A ausência de try/catch em `ProjectFormModal.onSubmit` foi identificada durante a QA estratégica e corrigida antes de qualquer aprovação. O bug poderia causar falhas silenciosas sem feedback ao usuário.

---

## O que Pode Melhorar

### BUG-05 — Subtitle Inconsistency (Deferred)

Quando filtros de projeto ou trilha estão ativos, o subtitle da LibraryView exibe contagem de conteúdos visíveis mas não considera que seções inteiras de trilhas foram ocultadas. A inconsistência é sutil e de baixo impacto para MVP, mas foi documentada para Sprint 03.

### Testes E2E Condicionais para MemoryView

Os testes de CRUD de sessão e exercício dependem de dados prévios (sessões de Focus). Em ambiente de CI limpo, a maioria desses TCs seria anotada como condicional. Uma fixture de setup que cria sessões sintéticas resolveria isso em Sprint 03.

### Cobertura de AssignTrailModal com Trilha Já Associada

O cenário RN-004 (trilha já em outro projeto aparece com opacity 0.5 e sem botão de associação) foi coberto por testes unitários no `projectsService` mas não por E2E. Um teste E2E específico para esse cenário requer setup de dois projetos com trilha compartilhada.

---

## Métricas da Sprint

| Métrica                        | Valor                                                   |
| ------------------------------ | ------------------------------------------------------- |
| RFs implementados              | 15 (RF-191 a RF-207, RF-209)                            |
| Testes unitários (Vitest)      | 484/484 ✅                                              |
| Novos TCs unitários na sprint  | 66 (28 projectsService + 30 filterLogic + 8 AppContext) |
| Novos TCs E2E na sprint        | 72 (Playwright)                                         |
| Bugs encontrados e corrigidos  | 1 (BUG-04)                                              |
| Bugs aceitos como known issues | 1 (BUG-05)                                              |
| Erros de tipo (type-check)     | 0                                                       |
| Warnings de lint               | 0                                                       |
| Score QA Estratégico           | 96/100                                                  |

---

## Retrospectiva

**Manteve:** Processo Problema → Discovery → RF → RN → Implementação → QA → Automação. A sequência preveniu retrabalho significativo.

**Melhorou:** O gate técnico completo (type-check + lint + test:unit + build) foi executado em todas as fases antes de aprovação, eliminando regressões tardias.

**Fará diferente na Sprint 03:** Fixtures de setup para testes E2E de módulos stateful (MemoryView). Isso eliminaria a condicionalidade dos testes e aumentaria a cobertura efetiva em CI.

---

## Status de Encerramento

Sprint 02 — Knowledge Structure: **CONCLUÍDA** ✅

Todos os épicos entregues. Gate técnico aprovado. QA estratégico concluído. Automação criada. Documentação gerada.
