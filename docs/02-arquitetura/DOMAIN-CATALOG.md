# DOMAIN-CATALOG.md

# Domain Catalog

# NeuroLearn

Versão: 1.0

Status: Oficial

---

# DOM-001

## Identity

Responsável por:

- cadastro
- login
- autenticação
- autorização
- sessão

---

Não é responsável por:

- conteúdos
- trilhas
- skills

---

# DOM-002

## Learning Content

Responsável por:

- conteúdos
- livros
- cursos
- PDFs
- links
- artigos

---

Entidades

- Content

---

# DOM-003

## Learning Trails

Responsável por:

- trilhas
- agrupamentos
- organização

---

Entidades

- Trail

---

Regra

Trilha não é dona do conteúdo.

---

# DOM-004

## Study Sessions

Responsável por:

- sessão de estudo
- highlights
- notas
- reflexões
- flashcards
- explicações
- exercícios

---

Entidades

- StudySession
- Highlight
- Reflection
- Flashcard
- Explanation
- Exercise

---

# DOM-005

## Review Engine

Responsável por:

- agenda
- revisões
- prioridades

---

Entidades

- Review
- ReviewQueue

---

# DOM-006

## Cognitive Engine

Responsável por:

- retenção
- esquecimento
- cognitive score
- priority score

---

Entidades

- Retention
- CognitiveScore
- Decay

---

# DOM-007

## Gamification

Responsável por:

- XP
- níveis
- conquistas

---

Entidades

- Achievement
- XP

---

# DOM-008

## AI Learning Assistant

Responsável por:

- perguntas
- recomendações
- mentor cognitivo

---

Entidades

- Recommendation
- SkillGap

---

# DOM-009

## Analytics

Responsável por:

- dashboards
- métricas
- insights

---

Entidades

- Metric
- Insight

---

# DOM-010

## Security

Responsável por:

- ownership
- auditoria
- LGPD
- RLS

---

Entidades

- AuditLog
- SecurityEvent

---

# DOM-011

## Skill Acquisition

Responsável por:

- habilidades
- skill score
- skill progress
- consolidação

---

Entidades

- Skill
- SkillProgress

---

# RELAÇÃO ENTRE DOMÍNIOS

Identity

↓

Learning Content

↓

Study Sessions

↓

Review Engine

↓

Cognitive Engine

↓

Skill Acquisition

↓

Analytics

---

# REGRAS DE DOMÍNIO

## Regra 01

Nenhum domínio acessa banco de outro domínio diretamente.

---

## Regra 02

Comunicação preferencial via eventos.

---

## Regra 03

Proibido Domain Leakage.

---

## Regra 04

Toda feature deve pertencer a um domínio.

---

## Regra 05

Toda entidade possui ownership.

---

# RESULTADO

Arquitetura desacoplada.

Escalável.

Governável.

Preparada para evolução.
