# ENGINEERING-PLAYBOOK.md

# Engineering Playbook

# NeuroLearn

Versão: 1.0

Status: Oficial

---

# OBJETIVO

Padronizar a forma de desenvolver o NeuroLearn.

---

# FLUXO OFICIAL

Problema

↓

Discovery

↓

NSEF

↓

PRD

↓

NFEF

↓

RF

↓

RN

↓

RNF

↓

Critérios

↓

ADR

↓

Testes

↓

Implementação

↓

Release

---

# SPEC DRIVEN DEVELOPMENT

Obrigatório.

---

Proibido:

Implementar antes da especificação.

---

# DOMAIN DRIVEN DESIGN

Obrigatório.

---

Toda feature pertence a um domínio.

---

Proibido:

Domain Leakage.

---

# ARQUITETURA

Respeitar:

- ADRs
- Domínios
- Eventos

---

# SEGURANÇA

Obrigatório:

- ownership
- RBAC
- RLS
- multi-tenant

---

# FRONTEND

Obrigatório:

- componentes reutilizáveis
- acessibilidade
- UX cognitiva

---

Todo campo obrigatório:

- ***

Todo erro:

toast descritivo

---

Todo sucesso:

toast descritivo

---

# BACKEND

Obrigatório:

- serviços desacoplados
- logs
- auditoria
- observabilidade

---

# TESTES

Obrigatórios:

- funcionais
- negativos
- permissões
- segurança
- regressão

---

# AUTOMAÇÃO

Frontend

Playwright

---

API

Cypress

---

# RELEASE

Antes do deploy:

- testes verdes
- segurança validada
- QA aprovado
- documentação atualizada

---

# PROIBIDO

- código morto
- duplicação desnecessária
- lógica espalhada
- acoplamento excessivo

---

# REGRA DE OURO

Não perguntar:

"Como implementar?"

Perguntar:

"Qual problema estamos resolvendo?"
