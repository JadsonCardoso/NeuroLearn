# CA-SPRINT-02-KNOWLEDGE-STRUCTURE

# NeuroLearn

Sprint 02

Status: Oficial

Versão: 1.0

---

# Objetivo

Definir os critérios de aceite dos requisitos implementados na Sprint 02.

---

# RF-191 — Usuário pode criar Projetos de Aprendizagem

## CA-001

Dado que o usuário está autenticado

Quando informar os dados obrigatórios do Projeto

E clicar em salvar

Então o sistema deve criar o Projeto com sucesso

---

## CA-002

Dado que existem campos obrigatórios não preenchidos

Quando o usuário tentar criar um Projeto

Então o sistema deve impedir a criação

E exibir mensagem orientativa

---

# RF-192 — Usuário pode visualizar Projetos de Aprendizagem

## CA-003

Dado que existem Projetos cadastrados

Quando o usuário acessar a área de Projetos

Então o sistema deve exibir apenas os Projetos pertencentes ao usuário

---

## CA-004

Dado que não existem Projetos cadastrados

Quando o usuário acessar a área de Projetos

Então o sistema deve exibir estado vazio apropriado

---

# RF-193 — Usuário pode editar Projetos de Aprendizagem

## CA-005

Dado que o Projeto pertence ao usuário

Quando realizar alterações válidas

Então o sistema deve salvar as alterações

E atualizar a visualização automaticamente

---

## CA-006

Dado que o Projeto não pertence ao usuário

Quando tentar editar o Projeto

Então o sistema deve bloquear a operação

---

# RF-194 — Usuário pode remover Projetos de Aprendizagem

## CA-007

Dado que o usuário deseja remover um Projeto

Quando solicitar a exclusão

Então o sistema deve solicitar confirmação explícita

---

## CA-008

Dado que a exclusão foi confirmada

Quando o Projeto for removido

Então as Trilhas devem permanecer preservadas

E apenas a associação deve ser removida

---

# RF-195 — Usuário pode associar Trilhas a Projetos

## CA-009

Dado que o usuário possui Projetos e Trilhas

Quando associar uma Trilha a um Projeto

Então o sistema deve persistir a associação

---

## CA-010

Dado que a Trilha já pertence a outro Projeto

Quando tentar realizar nova associação

Então o sistema deve impedir a operação

---

# RF-196 — Sistema deve calcular progresso agregado do Projeto

## CA-011

Dado que um Projeto possui Trilhas associadas

Quando houver alteração no progresso das Trilhas

Então o sistema deve recalcular automaticamente o progresso consolidado

---

## CA-012

Dado que o Projeto não possui Trilhas

Quando o progresso for exibido

Então o valor deve ser igual a 0%

---

# RF-197 — Sistema deve exibir progresso do Projeto

## CA-013

Dado que o Projeto possui progresso calculado

Quando o usuário visualizar o Projeto

Então o sistema deve exibir indicador visual de progresso

---

## CA-014

Dado que o Projeto foi concluído

Quando o progresso for exibido

Então o sistema deve apresentar 100%

---

# RF-198 — Sistema deve preservar ownership do Projeto

## CA-015

Dado que o usuário tenta acessar Projeto de terceiros

Quando realizar a operação

Então o sistema deve bloquear o acesso

---

## CA-016

Dado que o usuário acessa seus próprios Projetos

Quando navegar na plataforma

Então o sistema deve visualizar apenas seus dados

---

# Pendência Sprint 01 — CRUD Exercício

## CA-017

Dado que existem Exercícios cadastrados

Quando o usuário acessar a área de Exercícios

Então o sistema deve listar os registros existentes

---

## CA-018

Dado que um Exercício existe

Quando o usuário editar seus dados

Então o sistema deve persistir as alterações

---

## CA-019

Dado que o usuário deseja remover um Exercício

Quando confirmar a exclusão

Então o sistema deve remover o registro

Sem impactar histórico de aprendizagem

---

# Pendência Sprint 01 — CRUD Sessão

## CA-020

Dado que existe uma Sessão cadastrada

Quando o usuário editar seus dados

Então o sistema deve persistir as alterações

---

## CA-021

Dado que o usuário deseja remover uma Sessão

Quando confirmar a exclusão

Então o sistema deve remover a Sessão

Sem remover evidências cognitivas associadas

---

# Busca

## CA-022

Dado que existem Projetos, Trilhas e Conteúdos

Quando o usuário utilizar a busca

Então os resultados devem considerar todos os níveis da estrutura

---

# Filtros

## CA-023

Dado que existem registros cadastrados

Quando o usuário utilizar filtros

Então o sistema deve permitir filtrar por:

- Projeto
- Trilha
- Tipo
- Status

---

# Navegação

## CA-024

Dado que o usuário acessa um Projeto

Quando navegar pela estrutura

Então deve visualizar:

Projeto

↓

Trilha

↓

Conteúdo

---

# Atualização Reativa

## CA-025

Dado que uma alteração ocorre

Quando o sistema concluir a operação

Então os dados devem ser atualizados automaticamente

Sem necessidade de recarregamento manual

---

# Critério de Aprovação da Sprint

A Sprint 02 será considerada concluída quando:

- RF-191 até RF-198 estiverem implementados;
- CRUD Exercício estiver completo;
- CRUD Sessão estiver completo;
- Ownership estiver validado;
- Multi-Tenant estiver validado;
- Testes executados com sucesso;
- Automação atualizada;
- Nenhum bug crítico permanecer aberto.
