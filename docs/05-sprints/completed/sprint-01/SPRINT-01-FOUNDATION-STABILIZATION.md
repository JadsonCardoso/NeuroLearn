# SPRINT-01-FOUNDATION-STABILIZATION.md

# NeuroLearn

Sprint 01

Status: Ativa

Prioridade: P0

Classificação: Foundation Stabilization

---

# OBJETIVO DA SPRINT

Transformar o NeuroLearn em um MVP confiável.

O foco NÃO é criar novas funcionalidades.

O foco é:

- estabilidade;
- confiança;
- persistência;
- consistência;
- qualidade.

---

# VISÃO

Hoje o usuário consegue estudar.

Mas ainda não possui confiança total na plataforma.

Esta sprint existe para resolver isso.

---

# ÉPICO 01 — CORREÇÃO DE PRODUÇÃO

Prioridade

P0

---

## Objetivo

Eliminar bugs conhecidos.

---

## Escopo

### Cadastro

Corrigir falhas de criação de conta.

---

### Login

Corrigir falhas de autenticação.

---

### Erros HTTP

Eliminar:

- 500
- 404

---

### Console

Eliminar erros críticos.

---

## Critério de Sucesso

Nenhum bug bloqueante conhecido.

---

# ÉPICO 02 — PERSISTÊNCIA COGNITIVA

Prioridade

P0

---

## Problema

Usuário produz conhecimento.

O sistema não preserva tudo.

---

## Objetivo

Salvar todas as evidências cognitivas.

---

## Escopo

### Sessão de Estudo

Salvar:

- highlights
- anotações

---

### Extração Inteligente

Salvar:

- reflexão ativa
- flashcards
- explicações

---

### Exercícios

Salvar:

- respostas
- progresso
- histórico

---

## Critério de Sucesso

Usuário fecha navegador.

Retorna posteriormente.

Tudo permanece disponível.

---

# ÉPICO 03 — CRUD COMPLETO

Prioridade

P0

---

## Objetivo

Nenhuma entidade sem edição.

---

## Escopo

### Conteúdo

CRUD completo.

---

### Trilha

CRUD completo.

---

### Sessão

CRUD completo.

---

### Flashcard

CRUD completo.

---

### Reflexão

CRUD completo.

---

### Exercício

CRUD completo.

---

## Critério de Sucesso

Todas as entidades possuem:

- criar
- visualizar
- editar
- remover

---

# ÉPICO 04 — UX FOUNDATION

Prioridade

P0

---

## Objetivo

Aumentar confiança do usuário.

---

## Escopo

### Campos obrigatórios

Adicionar:

- ***

### Mensagens de erro

Toast descritivo.

---

Exemplo

"Informe o título para continuar."

---

### Mensagens de sucesso

Toast descritivo.

---

Exemplo

"Conteúdo salvo com sucesso."

---

### Exclusão

Modal de confirmação.

---

### Loading

Estados claros.

---

### Validação visual

Destacar campo inválido.

---

## Critério de Sucesso

Usuário sempre entende:

- o que aconteceu;
- por que aconteceu;
- o que deve fazer.

---

# ÉPICO 05 — SINCRONIZAÇÃO AUTOMÁTICA

Prioridade

P0

---

## Problema

Alguns dados só aparecem após F5.

---

## Objetivo

Atualização automática.

---

## Escopo

### Biblioteca

Atualização reativa.

---

### Trilhas

Atualização reativa.

---

### Revisão

Atualização reativa.

---

### Dashboard

Atualização reativa.

---

## Critério de Sucesso

Nenhuma tela depende de reload manual.

---

# ÉPICO 06 — SEGURANÇA BASE

Prioridade

P0

---

## Objetivo

Garantir isolamento de dados.

---

## Escopo

### Ownership

Validar dono do recurso.

---

### Multi-Tenant

Isolamento obrigatório.

---

### Acesso Indevido

Bloqueio obrigatório.

---

## Critério de Sucesso

Nenhum usuário acessa dados de terceiros.

---

# TESTES OBRIGATÓRIOS

## Funcionais

CRUD

Persistência

Estudo

Revisão

---

## Negativos

Campos obrigatórios

Permissões

Validações

---

## Segurança

Ownership

Multi-Tenant

---

## UX

Toasts

Feedback

Loading

---

## Regressão

Fluxos principais.

---

# AUTOMAÇÃO

## Playwright

Fluxos críticos:

- cadastro
- login
- criar conteúdo
- editar conteúdo
- criar trilha
- estudar
- persistir dados

---

## Cypress

APIs:

- auth
- content
- trails
- study sessions
- reviews

---

# DEFINITION OF DONE

A sprint só pode ser encerrada quando:

- bugs corrigidos
- persistência implementada
- CRUD completo
- UX Foundation implementada
- sincronização funcionando
- testes executados
- automação criada
- documentação atualizada
- sem erros críticos de console

---

# RESTRIÇÕES

Proibido nesta sprint:

- Cognitive Engine V1
- IA avançada
- Analytics avançado
- Gamificação
- Novos módulos

---

# RESULTADO ESPERADO

Ao final da Sprint 01 o usuário deve sentir:

"Posso confiar no NeuroLearn."

---

# PRÓXIMA SPRINT

Sprint 02

Knowledge Structure

Escopo:

- Trilhas avançadas
- Projetos de Aprendizagem
- Organização escalável
- Revisão por contexto
- Busca e filtros
- Paginação

---

# REGRA DE OURO

Antes de implementar qualquer item:

Validar:

- ADRs
- Domínios
- QA Strategy
- Engineering Playbook

O objetivo é estabilizar.

Não reinventar.
