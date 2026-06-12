# SPRINT-02 — Release Candidate

**Projeto:** NeuroLearn
**Sprint:** 02 — Knowledge Structure
**Data:** 2026-06-12
**Status:** RELEASE CANDIDATE ✅

---

## Veredicto

A Sprint 02 atingiu status de **Release Candidate**.

Todos os épicos prioritários foram implementados, validados via QA estratégico, cobertos por testes automatizados e aprovados em gate técnico completo.

---

## Checklist de Prontidão

| Critério                                            | Status |
| --------------------------------------------------- | ------ |
| `npm run type-check` — 0 erros de tipo              | ✅     |
| `npm run lint` — 0 warnings                         | ✅     |
| `npm run test:unit` — 484/484 aprovados             | ✅     |
| `npm run build` — build limpo, sem erros            | ✅     |
| Skill `qa-estrategico` executada                    | ✅     |
| Testes E2E criados e configurados                   | ✅     |
| Sem bugs críticos ou médios sem correção            | ✅     |
| `progress.md` atualizado                            | ✅     |
| Ownership + RLS validados (ADR-004, ADR-006)        | ✅     |
| Toasts obrigatórios em todas as operações (ADR-018) | ✅     |
| Atualização reativa sem reload (ADR-016)            | ✅     |
| Sem `SERVICE_ROLE_KEY` no frontend                  | ✅     |
| Sem `.env.local` commitado                          | ✅     |

---

## Épicos Entregues

### Épico 1 — Learning Projects (RF-191 a RF-198)

Sistema completo de projetos de aprendizagem.

- **RF-191 Criar Projeto:** Modal com nome (obrigatório, máx 100 chars) e descrição. Zod + RHF + noValidate + try/catch com toast.error.
- **RF-192 Visualizar Projetos:** Grid responsivo com busca por nome/descrição (normalização NFD para PT-BR). Estado vazio com CTA.
- **RF-193 Editar Projeto:** Modal pré-preenchido, botão salvar disabled quando isDirty=false, toast de sucesso.
- **RF-194 Excluir Projeto:** ConfirmDialog com aviso de preservação de trilhas. DELETE_PROJECT no reducer desfaz associações (RN-005).
- **RF-195 Associar Trilhas:** AssignTrailModal com lista de trilhas. Validação RN-004 (trilha já em outro projeto = desabilitada). removeTrailFromProject com ownership check.
- **RF-196/197 Progresso Consolidado:** Barra de progresso calculada client-side (média de trilhas; trilha sem conteúdos = 0%). ProjectCard exibe %, contador de trilhas e conteúdos.
- **RF-198 Ownership:** Todas as operações via `projectsService` usam `.eq('user_id', userId)` duplo (ADR-004).

### Épico 2 — Completion Sprint 01 (CRUD Sessão + Exercício)

Fechamento das pendências da Sprint 01.

- **CRUD Sessão (UPDATE + DELETE):** SessionEditModal para edição de notas, highlights e modo professor. Exclusão com ConfirmDialog informando preservação de flashcards (DELETE_SESSION no AppContext).
- **CRUD Exercício (READ + UPDATE + DELETE):** ExercisesSection com lazy-load via `listExercisesByContent`. ExerciseEditModal com Zod + try/catch. Exclusão com ConfirmDialog + ownership.

### Épico 3 — Knowledge Navigation (Busca + Filtros)

- **RF-201 Busca por Projeto:** Filtro em ProjectsView por nome e descrição, normalização NFD.
- **RF-202 Busca por Trilha:** Campo de busca inclui título da trilha via trailMap (useMemo).
- **RF-203 Busca por Conteúdo:** Busca por título, autor, descrição e trilha.
- **RF-204 Filtro por Tipo:** 5 chips toggle (book/course/video/article/note), multi-select via Set<ContentType>.
- **RF-205 Filtro por Status:** 4 botões (all/new/in_progress/done), mutuamente exclusivos.
- **RF-209 Limpar Filtros:** Botão condicional, reseta todos os estados de filtro.
- Arquitetura two-axis: eixo de seções (filteredTrails) × eixo de conteúdos (visibleFiltered).

---

## Gate Técnico Final

```
npm run type-check → 0 erros
npm run lint       → 0 warnings
npm run test:unit  → 484/484 ✅
npm run build      → sucesso
```

**Testes unitários notáveis:**

- `projectsService.test.ts`: 28 testes (ownership, RN-004, RN-009, RN-013, RN-015, RN-016)
- `filterLogic.test.ts`: 30 testes (normalize, filterContents, filterTrailsForSection, filterProjects)
- `AppContext.test.ts`: 8 testes (UPDATE_SESSION, DELETE_SESSION)

---

## Cobertura de Automação E2E

| Arquivo                                   | TCs | Projeto Playwright       |
| ----------------------------------------- | --- | ------------------------ |
| `projects.spec.ts`                        | 17  | authenticated            |
| `memory-crud.spec.ts`                     | 22  | authenticated            |
| `library-filters.spec.ts`                 | 20  | authenticated            |
| `projects-api.spec.ts`                    | 12  | chromium                 |
| `global-regression.spec.ts` + `/projects` | +1  | chromium + authenticated |

**Total Sprint 02:** 72 novos casos de teste E2E

---

## Bugs Encontrados e Corrigidos

| ID     | Descrição                                                                 | Severidade | Status       |
| ------ | ------------------------------------------------------------------------- | ---------- | ------------ |
| BUG-04 | `ProjectFormModal.onSubmit` sem try/catch — falha DB silenciosa sem toast | Médio      | ✅ Corrigido |

---

## Riscos Residuais Aceitos

| ID      | Risco                                                                          | Decisão                                      |
| ------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| BUG-05  | Subtitle inconsistency no LibraryView quando filtros por projeto/trilha ativos | Aceito — deferred Sprint 03                  |
| R-07-01 | Testes MemoryView condicionais (requerem sessões de Focus prévias)             | Aceito — design correto para testes stateful |

---

## ADRs Aplicados

- ADR-004 Ownership First — todas as mutations
- ADR-006 RLS Supabase — todas as tabelas
- ADR-016 Atualização Reativa — sem reload em nenhuma operação
- ADR-018 Toasts Obrigatórios — sucesso + erro em todo CRUD

---

## Decisão

**SPRINT-02: APROVADA PARA RELEASE CANDIDATE**

Nenhum bloqueio identificado. Os riscos residuais são de baixa severidade e estão documentados para Sprint 03.
