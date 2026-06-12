# SPRINT-02-KNOWLEDGE-STRUCTURE

# NeuroLearn

Sprint 02

Status: Planejada

Prioridade: P0

Classificação: Knowledge Structure

---

# OBJETIVO DA SPRINT

Transformar o NeuroLearn de uma biblioteca de conteúdos em uma estrutura organizada de conhecimento.

O foco NÃO é criar inteligência artificial.

O foco NÃO é criar analytics avançado.

O foco é:

- organização;
- contexto;
- escalabilidade;
- continuidade cognitiva;
- gestão do conhecimento.

---

# VISÃO

Hoje o usuário consegue:

- estudar;
- revisar;
- produzir conhecimento.

Porém, conforme a quantidade de conteúdos cresce, a organização se torna mais difícil.

Esta sprint existe para resolver esse problema.

---

# PROBLEMA

Hoje o conhecimento é organizado principalmente através de:

Conteúdo

↓

Trilha

Em cenários de grande volume isso gera:

- dispersão;
- perda de contexto;
- dificuldade de navegação;
- aumento da carga cognitiva.

---

# SOLUÇÃO

Introduzir:

Projeto de Aprendizagem

como agregado organizacional do domínio:

DOM-003 — Learning Trails

Conforme definido em:

ADR-026 — Learning Projects as Organizational Aggregate

---

# ESTRUTURA ALVO

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

# ÉPICO 01 — LEARNING PROJECTS

Prioridade

P0

---

## Objetivo

Permitir organização de grandes jornadas de aprendizagem.

---

## Escopo

### Criar Projeto

RF-191

---

### Visualizar Projeto

RF-192

---

### Editar Projeto

RF-193

---

### Remover Projeto

RF-194

---

### Associar Trilhas ao Projeto

RF-195

---

### Calcular Progresso do Projeto

RF-196

---

### Exibir Progresso do Projeto

RF-197

---

### Ownership do Projeto

RF-198

---

## Critério de Sucesso

Usuário consegue:

- criar projeto;
- organizar trilhas;
- acompanhar progresso;
- manter contexto.

---

# ÉPICO 02 — COMPLETION SPRINT 01

Prioridade

P0

---

## Objetivo

Eliminar pendências herdadas da Sprint 01.

---

## Escopo

### Exercícios

Completar CRUD.

Implementar:

- READ
- UPDATE
- DELETE

---

### Sessões

Completar CRUD.

Implementar:

- UPDATE
- DELETE

---

## Critério de Sucesso

Todas as entidades da Sprint 01 possuem CRUD completo.

---

# ÉPICO 03 — KNOWLEDGE NAVIGATION

Prioridade

P1

---

## Objetivo

Facilitar localização do conhecimento.

---

## Escopo

### Busca

Permitir busca por:

- projeto;
- trilha;
- conteúdo.

---

### Filtros

Permitir filtragem por:

- projeto;
- trilha;
- tipo;
- status.

---

### Navegação

Permitir navegação contextual:

Projeto

↓

Trilha

↓

Conteúdo

---

## Critério de Sucesso

Usuário encontra qualquer conteúdo em poucos passos.

---

# ÉPICO 04 — PROGRESSO CONSOLIDADO

Prioridade

P1

---

## Objetivo

Tornar evolução visível.

---

## Escopo

### Projeto

Exibir:

- progresso geral;
- quantidade de trilhas;
- quantidade de conteúdos;
- status.

---

### Trilha

Exibir:

- progresso individual.

---

## Critério de Sucesso

Usuário compreende facilmente sua evolução.

---

# IMPACTO COGNITIVO

## Continuidade Cognitiva

Reduz perda de contexto.

---

## Retenção

Facilita revisões organizadas.

---

## Aprendizado Ativo

Permite organização por objetivo de aprendizagem.

---

## Cognitive Score Esperado

85+

---

# TESTES OBRIGATÓRIOS

## Funcionais

Projetos

CRUD

Associação Projeto ↔ Trilha

Progresso

Busca

Filtros

---

## Negativos

Ownership

Permissões

Validações obrigatórias

---

## Segurança

Multi-Tenant

Ownership

RLS

---

## UX

Toasts

Loading

Estados vazios

Mensagens de erro

---

## Regressão

Conteúdos

Trilhas

Sessões

Revisão

---

# AUTOMAÇÃO

## Playwright

Fluxos críticos:

- criar projeto;
- editar projeto;
- remover projeto;
- associar trilha;
- navegar projeto.

---

## Cypress

APIs:

- projects;
- trails;
- content;
- sessions.

---

# DEFINITION OF DONE

A sprint só pode ser encerrada quando:

- projetos implementados;
- RF-191 até RF-198 implementados;
- CRUD Exercício completo;
- CRUD Sessão completo;
- ownership validado;
- testes executados;
- automação criada;
- documentação atualizada;
- sem erros críticos.

---

# FORA DE ESCOPO

Proibido nesta sprint:

- AI Learning Companion;
- Analytics Avançado;
- Gamificação;
- Cognitive Engine V2;
- Skill Tree;
- Marketplace;
- Comunidade.

---

# RESULTADO ESPERADO

Ao final da Sprint 02 o usuário deve sentir:

"Meu conhecimento está organizado e faz sentido."

---

# MÉTRICA DE SUCESSO

Usuário consegue:

- criar projetos;
- organizar trilhas;
- localizar conteúdos;
- acompanhar progresso.

Sem necessidade de reorganização manual externa.

---

# PRÓXIMA SPRINT

Sprint 03

Learning Intelligence

Possível escopo:

- Cognitive Engine Evolution
- Review Intelligence
- Skill Progression
- Learning Analytics

---

# REGRA DE OURO

Antes de implementar qualquer item:

Validar:

- ADRs
- RF Catalog
- QA Strategy
- Engineering Playbook

O objetivo é organizar.

Não complexificar.
