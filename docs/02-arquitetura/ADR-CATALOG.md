# ADR-CATALOG.md

# Architectural Decision Records Catalog

# NeuroLearn

Versão: 1.0

Status: Oficial

---

# ADR-001

## Utilização de Spec Driven Development

Status

Aceito

---

Decisão

Toda implementação deve partir de:

Problema

↓

PRD

↓

RF

↓

RN

↓

RNF

↓

Critérios

↓

Testes

↓

Código

---

Motivação

Evitar desenvolvimento baseado em achismo.

---

# ADR-002

## Domain Driven Design

Status

Aceito

---

Decisão

Todo comportamento deve pertencer a um domínio.

---

Motivação

Evitar acoplamento.

---

# ADR-003

## Event Driven Architecture

Status

Aceito

---

Decisão

Domínios devem se comunicar por eventos.

---

Motivação

Escalabilidade.

---

# ADR-004

## Ownership First

Status

Aceito

---

Decisão

Todo recurso pertence a um usuário.

---

Validação obrigatória

resource.userId == authenticatedUser.id

---

# ADR-005

## Multi-Tenant By Default

Status

Aceito

---

Decisão

Todos os dados devem ser isolados por usuário.

---

# ADR-006

## Row Level Security

Status

Aceito

---

Aplicar em:

- conteúdos
- trilhas
- sessões
- revisões
- skills

---

# ADR-007

## Autosave Cognitivo

Status

Aceito

---

Decisão

Toda evidência cognitiva deve ser persistida.

---

Escopo

- highlights
- reflexões
- flashcards
- explicações
- exercícios

---

# ADR-008

## Trilha Não É Dona Do Conteúdo

Status

Aceito

---

Decisão

Excluir trilha não exclui conteúdo.

---

Conteúdo deve ser:

- desassociado
- preservado

---

# ADR-009

## CRUD Completo

Status

Aceito

---

Toda entidade deve possuir:

- criar
- visualizar
- editar
- remover

---

# ADR-010

## Cognitive Engine Centralizado

Status

Aceito

---

Responsável por:

- retenção
- esquecimento
- prioridade
- score cognitivo

---

# ADR-011

## Review Engine Independente

Status

Aceito

---

Responsável por:

- revisões
- agenda
- priorização

---

# ADR-012

## Skill Acquisition Separado

Status

Aceito

---

Skill não pertence à Biblioteca.

---

Skill é domínio próprio.

---

# ADR-013

## AI Assistida

Status

Aceito

---

IA deve apoiar aprendizagem.

---

Nunca substituir pensamento crítico.

---

# ADR-014

## IA Socrática

Status

Aceito

---

Priorizar:

- perguntas
- reflexão
- descoberta

---

# ADR-015

## Persistência Cognitiva

Status

Aceito

---

Nenhum conhecimento produzido pode ser perdido.

---

# ADR-016

## Atualização Reativa

Status

Aceito

---

Dados devem atualizar sem reload.

---

# ADR-017

## UX Cognitiva

Status

Aceito

---

Toda interface deve:

- reduzir atrito
- reduzir carga cognitiva
- aumentar confiança

---

# ADR-018

## Toasts Obrigatórios

Status

Aceito

---

Feedback obrigatório para:

- sucesso
- erro
- exclusão
- atualização

---

# ADR-019

## Campos Obrigatórios Identificados

Status

Aceito

---

Utilizar:

- ***

# ADR-020

## Segurança Antes de Funcionalidade

Status

Aceito

---

Ownership

↓

Autorização

↓

Funcionalidade

---

# ADR-021

## QA Como Quality Gate

Status

Aceito

---

Nenhuma feature entra em produção sem QA.

---

# ADR-022

## Playwright Frontend

Status

Aceito

---

Automação E2E.

---

# ADR-023

## Cypress API

Status

Aceito

---

Automação API.

---

# ADR-024

## Habilidades Como North Star

Status

Aceito

---

Métrica principal:

Quantidade de habilidades consolidadas.

---

# ADR-025

## Knowledge Operating System

Status

Aceito

---

KOS é a fonte oficial de governança.

---

# Regra Geral

Toda nova decisão relevante deve gerar novo ADR.

# ADR-026

## Learning Projects as Organizational Aggregate

Status

Aceito

---

Decisão

Projetos de Aprendizagem serão tratados como agregado organizacional do DOM-003 — Learning Trails.

Não será criado novo domínio.

---

Estrutura

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

Justificativa

Projetos de Aprendizagem não representam novo domínio de negócio.

Projetos não possuem bounded context próprio.

Projetos dependem diretamente de Trilhas.

Sua responsabilidade é exclusivamente organizacional.

---

Benefícios

- melhor organização;
- redução da carga cognitiva;
- continuidade contextual;
- escalabilidade da biblioteca;
- preservação da simplicidade arquitetural.

---

Impacto

DOM-003 — Learning Trails

RF-191 → RF-198

---

Decisão Final

Aceito.

---

# ADR-027

## Operações de Projeto chamam services diretamente nos componentes

Status

Aceito

---

Contexto

Durante a Sprint 02, o módulo de Projetos (RF-191–RF-198) foi implementado com CRUD completo. O AppContext já possui um `originalDispatch` que centraliza side effects assíncronos (chamadas a services) e sincroniza o estado com o Supabase para entidades como Conteúdos, Trilhas e Habilidades.

Para essas entidades, o padrão é: o componente dispara um `AppAction`, o `originalDispatch` chama o service correspondente usando o id que já está no payload, e o banco persiste.

Esse padrão tem uma pré-condição implícita: o id da entidade deve ser gerado no cliente (via `uid()`) e passado no insert ao banco — garantindo que o id no estado React e o id no banco sejam idênticos.

A tabela `projects` utiliza `id UUID DEFAULT gen_random_uuid()` — o banco gera o id, não o cliente. Se o padrão do AppContext fosse aplicado (dispatch → service), o estado React teria um id temporário diferente do id real do banco, causando inconsistência em operações subsequentes (update, delete, assign).

---

Decisão

Para o módulo de Projetos, as operações de mutação (criar, atualizar, excluir, associar/desassociar trilhas) são chamadas diretamente nos componentes React (`ProjectFormModal`, `AssignTrailModal`). O retorno do service fornece o id real do banco antes de qualquer dispatch.

O fluxo é:

```
Componente → await service(…) → dispatch({ type: 'ACTION', payload: dadoReal })
```

O `AppContext` continua sendo a fonte de verdade do estado global. O dispatch atualiza o estado reativamente. O `originalDispatch` não precisa de casos adicionais para Projetos — ele apenas passa o action para o reducer.

---

Consequências

- Sem inconsistência de id entre estado React e banco de dados.
- Componentes de Projeto têm responsabilidade de chamar o service e tratar erros (incluindo sessão expirada).
- Sem arquitetura paralela: Projeto permanece em DOM-003, sem novo contexto ou engine.
- Padrão diferente do usado por Trilhas/Conteúdos — documentado aqui para evitar confusão futura.
- Trilhas e Conteúdos mantêm o padrão original de id gerado no cliente; migração futura para UUID server-side exigiria refatoração similar.

---

Impacto

DOM-003 — Learning Trails

RF-191 → RF-198

Sprint 02 — Knowledge Structure

---

Decisão Final

Aceito.
