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
