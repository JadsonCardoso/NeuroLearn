# RN-SPRINT-02-KNOWLEDGE-STRUCTURE

# NeuroLearn

Sprint 02

Status: Oficial

Versão: 1.0

---

# Objetivo

Definir as regras de negócio necessárias para implementação dos Projetos de Aprendizagem e das pendências herdadas da Sprint 01.

---

# Escopo

Relacionadas aos RFs:

- RF-191
- RF-192
- RF-193
- RF-194
- RF-195
- RF-196
- RF-197
- RF-198

e às pendências:

- CRUD Exercício
- CRUD Sessão

---

# Projetos de Aprendizagem

## RN-001

Um Projeto de Aprendizagem pode possuir uma ou mais Trilhas.

---

## RN-002

Toda Trilha pode pertencer a no máximo um Projeto.

---

## RN-003

Um Projeto pode existir sem Trilhas associadas.

---

## RN-004

Uma Trilha não pode ser associada simultaneamente a múltiplos Projetos.

---

## RN-005

A remoção de um Projeto não deve remover Trilhas associadas.

As Trilhas devem ser desassociadas e preservadas.

---

## RN-006

A remoção de um Projeto não deve remover Conteúdos.

---

## RN-007

A remoção de um Projeto não deve remover Sessões de Estudo.

---

## RN-008

A remoção de um Projeto não deve remover Revisões.

---

# Ownership

## RN-009

Todo Projeto pertence exclusivamente ao usuário criador.

---

## RN-010

Usuários não podem visualizar Projetos pertencentes a terceiros.

---

## RN-011

Usuários não podem editar Projetos pertencentes a terceiros.

---

## RN-012

Usuários não podem remover Projetos pertencentes a terceiros.

---

## RN-013

Usuários não podem associar Trilhas de terceiros aos seus Projetos.

---

# Progresso Consolidado

## RN-014

O progresso do Projeto deve ser calculado com base nas Trilhas associadas.

---

## RN-015

Projetos sem Trilhas devem possuir progresso igual a 0%.

---

## RN-016

Projetos concluídos devem possuir progresso igual a 100%.

---

## RN-017

A atualização do progresso deve ocorrer automaticamente.

---

# Busca e Navegação

## RN-018

Projetos devem ser exibidos antes das Trilhas na hierarquia de navegação.

---

## RN-019

A busca deve considerar:

- nome do projeto;
- nome da trilha;
- nome do conteúdo.

---

## RN-020

Filtros devem permitir seleção por:

- projeto;
- trilha;
- tipo;
- status.

---

# Exercícios

## RN-021

A edição de Exercícios deve preservar histórico anterior.

---

## RN-022

A exclusão de Exercícios deve exigir confirmação explícita.

---

## RN-023

Exercícios removidos não devem impactar registros históricos de aprendizado.

---

# Sessões de Estudo

## RN-024

Sessões encerradas podem ser editadas.

---

## RN-025

A exclusão de Sessões deve exigir confirmação explícita.

---

## RN-026

A exclusão de Sessões não deve remover evidências cognitivas associadas.

---

# Consistência

## RN-027

Toda alteração em Projetos deve atualizar automaticamente os indicadores relacionados.

---

## RN-028

Toda associação ou desassociação de Trilhas deve atualizar o progresso consolidado.

---

## RN-029

Nenhuma operação deve exigir recarregamento manual da página.

---

# Segurança

## RN-030

Todas as regras de Ownership, Multi-Tenant e RLS definidas nos ADRs permanecem obrigatórias.

---

# Referências

ADR-004 — Ownership First

ADR-005 — Multi-Tenant By Default

ADR-006 — Row Level Security

ADR-026 — Learning Projects as Organizational Aggregate

RF-191 → RF-198

Sprint-01-RF-Validation
