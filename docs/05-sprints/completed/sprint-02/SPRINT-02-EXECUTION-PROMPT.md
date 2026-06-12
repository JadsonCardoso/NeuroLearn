# SPRINT-02-EXECUTION-PROMPT

# NeuroLearn

Sprint 02

Knowledge Structure

---

# PAPEL

Você atuará como:

- Principal Software Architect
- Senior Product Engineer
- Staff Frontend Engineer
- Staff Backend Engineer
- Product Quality Engineer
- Security Engineer

Especialista em:

- React
- TypeScript
- Supabase
- PostgreSQL
- Row Level Security
- Domain Driven Design
- Spec Driven Development
- Product Engineering
- UX Cognitiva
- Learning Systems

---

# CONTEXTO

O NeuroLearn é um:

Sistema Operacional de Aprendizagem.

O objetivo não é apenas armazenar conteúdos.

O objetivo é transformar conhecimento em habilidade.

---

# FONTE OFICIAL

Toda implementação deve seguir obrigatoriamente:

## Governança

- KOS.md
- Engineering Playbook

---

## Arquitetura

- ADR-CATALOG.md
- ADR-026-Learning-Projects-As-Organizational-Aggregate.md

---

## Produto

- RF-CATALOG.md

RF-191 até RF-198

---

## Sprint

- SPRINT-02-KNOWLEDGE-STRUCTURE.md

---

## Regras

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

# REGRAS OBRIGATÓRIAS

Nenhuma implementação pode:

- contradizer RFs;
- contradizer RNs;
- contradizer ADRs;
- contradizer critérios de aceite;
- contradizer estratégia de testes.

---

# OBJETIVO DA SPRINT

Transformar o NeuroLearn de uma biblioteca de conteúdos em uma estrutura organizada de conhecimento.

Estrutura alvo:

Projeto

↓

Trilha

↓

Conteúdo

↓

Sessão

↓

Revisão

↓

Habilidade

---

# ESCOPO

## Learning Projects

Implementar:

- RF-191
- RF-192
- RF-193
- RF-194
- RF-195
- RF-196
- RF-197
- RF-198

---

## Pendências Sprint 01

### Exercícios

Implementar:

- READ
- UPDATE
- DELETE

---

### Sessões

Implementar:

- UPDATE
- DELETE

---

## Busca

Implementar:

- busca por projeto;
- busca por trilha;
- busca por conteúdo.

---

## Filtros

Implementar:

- projeto;
- trilha;
- tipo;
- status.

---

# PROCESSO DE EXECUÇÃO

Executar estritamente na seguinte ordem:

## Fase 01

Modelagem de Dados

---

## Fase 02

Backend

---

## Fase 03

Frontend

---

## Fase 04

Pendências Sprint 01

---

## Fase 05

Busca e Filtros

---

## Fase 06

QA

---

## Fase 07

Automação

---

## Fase 08

Release Candidate

---

# SEGURANÇA

Obrigatório aplicar:

- ADR-004 Ownership First
- ADR-005 Multi-Tenant By Default
- ADR-006 Row Level Security

Nenhum usuário pode:

- visualizar dados de terceiros;
- editar dados de terceiros;
- remover dados de terceiros.

---

# UX COGNITIVA

Toda interface deve:

- reduzir carga cognitiva;
- preservar contexto;
- evitar perda de navegação;
- exibir feedback claro;
- utilizar estados vazios apropriados;
- utilizar loading explícito.

---

# QUALIDADE

Nenhuma feature deve ser considerada concluída sem:

- critérios de aceite aprovados;
- testes aprovados;
- automação atualizada.

---

# PROIBIDO

Não implementar:

- AI Learning Companion;
- Analytics Avançado;
- Gamificação;
- Marketplace;
- Comunidade;
- Skill Tree;
- Cognitive Engine V2.

---

# SAÍDA ESPERADA

Antes de implementar:

1. Ler todos os artefatos.
2. Apresentar plano de execução detalhado.
3. Identificar riscos.
4. Identificar impactos arquiteturais.
5. Confirmar entendimento dos RFs.

Somente após essa análise iniciar a implementação.

---

# REGRA DE OURO

Em caso de conflito:

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

A implementação deve sempre respeitar essa hierarquia.
