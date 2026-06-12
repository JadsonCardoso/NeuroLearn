# Sprint 02 — Knowledge Structure

# NeuroLearn

Status: Em Andamento

Prioridade: P0

Classificação: Knowledge Structure

---

# Objetivo

Transformar o NeuroLearn de uma biblioteca de conteúdos em uma estrutura organizada de conhecimento.

---

# Problema

Conforme a quantidade de conteúdos e trilhas cresce, a organização se torna difícil:

- dispersão de conteúdos;
- perda de contexto;
- dificuldade de navegação;
- aumento da carga cognitiva.

---

# Solução

Introduzir Projetos de Aprendizagem como agregado organizacional do DOM-003 — Learning Trails, conforme ADR-026.

---

# Estrutura Alvo

Projeto → Trilha → Conteúdo → Sessão → Revisão → Habilidade

---

# Épicos

| Épico                            | Prioridade | Descrição                                                            |
| -------------------------------- | ---------- | -------------------------------------------------------------------- |
| Épico 01 — Learning Projects     | P0         | CRUD de Projetos + associação Projeto↔Trilha + progresso + ownership |
| Épico 02 — Completion Sprint 01  | P0         | CRUD completo de Exercícios e Sessões                                |
| Épico 03 — Knowledge Navigation  | P1         | Busca e filtros por Projeto, Trilha, Conteúdo                        |
| Épico 04 — Progresso Consolidado | P1         | Indicadores visuais de progresso no Projeto                          |

---

# RFs

RF-191 → RF-198 (DOM-003 — Learning Trails)

---

# Decisões de Produto

- Progresso do Projeto = média simples do progresso das Trilhas associadas
- Projeto sem Trilhas = 0%
- Navegação por Projetos é paralela à LibraryView (não substitui)
- RF-193 (Editar Projeto) e RF-194 (Remover Projeto) são tratados como P0 nesta sprint

---

# Artefatos da Sprint

| Artefato             | Arquivo                               |
| -------------------- | ------------------------------------- |
| Especificação        | SPRINT-02-KNOWLEDGE-STRUCTURE.md      |
| Regras de Negócio    | RN-SPRINT-02-KNOWLEDGE-STRUCTURE.md   |
| Critérios de Aceite  | CA-SPRINT-02-KNOWLEDGE-STRUCTURE.md   |
| Estratégia de Testes | TEST-SPRINT-02-KNOWLEDGE-STRUCTURE.md |
| Plano de Execução    | SPRINT-02-EXECUTION-PLAN.md           |
| Prompt de Execução   | SPRINT-02-EXECUTION-PROMPT.md         |

---

# ADR de Referência

ADR-026 — Learning Projects as Organizational Aggregate

---

# Definition of Done

- RF-191 até RF-198 implementados
- CRUD Exercício completo (READ + UPDATE + DELETE na UI)
- CRUD Sessão completo (UPDATE + DELETE na UI)
- Ownership validado
- Multi-Tenant validado
- RLS validado
- Critérios de aceite aprovados
- Testes executados com sucesso
- Automação atualizada
- Sem bugs críticos abertos

---

# Fora de Escopo

- AI Learning Companion
- Analytics Avançado
- Gamificação
- Cognitive Engine V2
- Skill Tree
- Marketplace
- Comunidade
