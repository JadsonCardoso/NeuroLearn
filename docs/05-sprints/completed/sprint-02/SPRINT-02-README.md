# Sprint 02 — Knowledge Structure

# NeuroLearn

Status: Planejada

Prioridade: P0

Versão: 1.0

---

# Objetivo

Transformar o NeuroLearn de uma biblioteca de conteúdos em uma estrutura organizada de conhecimento.

Esta sprint introduz o conceito de:

Projeto de Aprendizagem

como agregado organizacional do domínio:

DOM-003 — Learning Trails

conforme definido em:

ADR-026 — Learning Projects as Organizational Aggregate

---

# Escopo Principal

## Learning Projects

RF-191 até RF-198

---

## Pendências Herdadas da Sprint 01

### Exercícios

- READ
- UPDATE
- DELETE

---

### Sessões

- UPDATE
- DELETE

---

## Busca e Filtros

Implementar:

- busca por projeto;
- busca por trilha;
- busca por conteúdo;
- filtros por projeto;
- filtros por trilha;
- filtros por tipo;
- filtros por status.

---

# Artefatos da Sprint

## Planejamento

- SPRINT-02-KNOWLEDGE-STRUCTURE.md

---

## Regras de Negócio

- RN-SPRINT-02-KNOWLEDGE-STRUCTURE.md

---

## Critérios de Aceite

- CA-SPRINT-02-KNOWLEDGE-STRUCTURE.md

---

## Estratégia de Testes

- TEST-SPRINT-02-KNOWLEDGE-STRUCTURE.md

---

## Plano de Execução

- SPRINT-02-EXECUTION-PLAN.md

---

## Prompt de Execução

- SPRINT-02-EXECUTION-PROMPT.md

---

# Dependências

## Arquitetura

- ADR-CATALOG.md
- ADR-026-Learning-Projects-As-Organizational-Aggregate.md

---

## Produto

- RF-CATALOG.md

---

## Governança

- KOS.md
- Engineering Playbook

---

# Ordem de Leitura Obrigatória

1. README.md

2. SPRINT-02-KNOWLEDGE-STRUCTURE.md

3. RN-SPRINT-02-KNOWLEDGE-STRUCTURE.md

4. CA-SPRINT-02-KNOWLEDGE-STRUCTURE.md

5. TEST-SPRINT-02-KNOWLEDGE-STRUCTURE.md

6. SPRINT-02-EXECUTION-PLAN.md

7. SPRINT-02-EXECUTION-PROMPT.md

---

# Ordem de Execução

1. Modelagem de Dados

2. Backend

3. Frontend

4. Pendências Sprint 01

5. Busca e Filtros

6. QA

7. Automação

8. Release Candidate

---

# Critério de Conclusão

A Sprint 02 somente poderá ser encerrada quando:

- RF-191 até RF-198 estiverem implementados;
- CRUD Exercício estiver completo;
- CRUD Sessão estiver completo;
- Critérios de aceite aprovados;
- Testes aprovados;
- Automação atualizada;
- Segurança validada;
- Nenhum bug crítico permanecer aberto.

---

# Próxima Sprint

Sprint 03

Learning Intelligence

Escopo previsto:

- Cognitive Engine Evolution
- Review Intelligence
- Learning Analytics
- Skill Progression

---

# Regra de Ouro

Em caso de conflito entre documentos:

ADR

↓

RF

↓

RN

↓

CA

↓

TESTE

↓

IMPLEMENTAÇÃO

Sempre respeitar esta hierarquia.
