# TEST-SPRINT-02-KNOWLEDGE-STRUCTURE

# NeuroLearn

Sprint 02

Status: Oficial

Versão: 1.0

---

# Objetivo

Definir a estratégia de testes para validação dos requisitos implementados na Sprint 02.

Este documento garante que todas as funcionalidades entregues estejam alinhadas aos:

- ADRs
- RFs
- RNs
- Critérios de Aceite

---

# Escopo

## Learning Projects

RF-191 até RF-198

---

## Pendências Sprint 01

### Exercícios

- READ
- UPDATE
- DELETE

### Sessões

- UPDATE
- DELETE

---

## Navegação

- Projetos
- Trilhas
- Conteúdos

---

## Busca

- Projetos
- Trilhas
- Conteúdos

---

## Filtros

- Projeto
- Trilha
- Tipo
- Status

---

# Estratégia de Testes

## Testes Funcionais

Validar:

- criação de projetos;
- visualização de projetos;
- edição de projetos;
- remoção de projetos;
- associação de trilhas;
- cálculo de progresso;
- exibição de progresso.

---

## Testes Negativos

Validar:

- campos obrigatórios;
- dados inválidos;
- associações inválidas;
- ownership;
- acesso indevido.

---

## Testes de Segurança

Validar:

- Ownership;
- Multi-Tenant;
- RLS;
- isolamento de dados.

---

## Testes de UX

Validar:

- mensagens de erro;
- mensagens de sucesso;
- estados vazios;
- loading;
- atualização automática;
- navegação contextual.

---

## Testes de Regressão

Validar:

- conteúdos;
- trilhas;
- sessões;
- revisão;
- flashcards;
- reflexões;
- exercícios.

---

# Cobertura por RF

## RF-191 — Criar Projeto

### Cenários

- criar projeto válido;
- criar projeto sem nome;
- criar projeto sem permissão.

---

## RF-192 — Visualizar Projeto

### Cenários

- visualizar projetos próprios;
- não visualizar projetos de terceiros;
- estado vazio.

---

## RF-193 — Editar Projeto

### Cenários

- editar projeto válido;
- editar projeto inexistente;
- editar projeto de terceiro.

---

## RF-194 — Remover Projeto

### Cenários

- remover projeto;
- cancelar remoção;
- preservar trilhas;
- preservar conteúdos.

---

## RF-195 — Associar Trilha

### Cenários

- associar trilha válida;
- associar trilha já vinculada;
- associar trilha de terceiro.

---

## RF-196 — Calcular Progresso

### Cenários

- projeto sem trilhas;
- projeto com trilhas;
- atualização automática.

---

## RF-197 — Exibir Progresso

### Cenários

- progresso parcial;
- progresso completo;
- projeto vazio.

---

## RF-198 — Ownership

### Cenários

- acesso autorizado;
- acesso não autorizado;
- edição não autorizada;
- exclusão não autorizada.

---

# Cobertura das Pendências da Sprint 01

## Exercícios

### READ

Validar:

- listagem;
- visualização individual.

---

### UPDATE

Validar:

- atualização de dados;
- persistência.

---

### DELETE

Validar:

- confirmação;
- remoção;
- preservação do histórico.

---

## Sessões

### UPDATE

Validar:

- atualização;
- persistência.

---

### DELETE

Validar:

- confirmação;
- remoção;
- preservação das evidências cognitivas.

---

# Testes de Segurança

## Ownership

Validar:

- leitura;
- edição;
- remoção;
- associação.

---

## Multi-Tenant

Validar:

- isolamento completo de dados.

---

## RLS

Validar:

- consultas;
- atualizações;
- exclusões.

---

# Testes de UX

## Estados Vazios

Validar:

- nenhum projeto;
- nenhuma trilha;
- nenhum conteúdo.

---

## Feedback

Validar:

- sucesso;
- erro;
- validação.

---

## Atualização Reativa

Validar:

- criação;
- edição;
- exclusão;
- associação.

Sem necessidade de F5.

---

# Automação

## Playwright

Fluxos críticos:

- criar projeto;
- editar projeto;
- remover projeto;
- associar trilha;
- navegar projeto;
- visualizar progresso.

---

## Cypress

APIs:

- projects;
- trails;
- content;
- sessions.

---

# Critérios de Aprovação QA

A Sprint somente poderá ser aprovada quando:

- todos os critérios de aceite forem validados;
- todos os RFs forem testados;
- todos os testes críticos forem aprovados;
- nenhuma falha crítica permanecer aberta;
- ownership estiver validado;
- multi-tenant estiver validado;
- regressão estiver aprovada.

---

# Matriz de Cobertura

| RF     | RN          | CA          | Testado |
| ------ | ----------- | ----------- | ------- |
| RF-191 | RN-001..003 | CA-001..002 | Sim     |
| RF-192 | RN-009..013 | CA-003..004 | Sim     |
| RF-193 | RN-009..013 | CA-005..006 | Sim     |
| RF-194 | RN-005..008 | CA-007..008 | Sim     |
| RF-195 | RN-001..004 | CA-009..010 | Sim     |
| RF-196 | RN-014..017 | CA-011..012 | Sim     |
| RF-197 | RN-014..017 | CA-013..014 | Sim     |
| RF-198 | RN-009..013 | CA-015..016 | Sim     |

---

# Resultado Esperado

Ao final da Sprint 02:

- Projetos funcionando;
- Trilhas organizadas;
- Progresso consolidado;
- CRUD Exercício completo;
- CRUD Sessão completo;
- Segurança preservada;
- Continuidade cognitiva preservada;
- Nenhuma regressão crítica identificada.
