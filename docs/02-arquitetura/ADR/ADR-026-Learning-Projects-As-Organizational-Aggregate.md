# ADR-005 — Learning Projects as Organizational Aggregate

Status: Aprovado

Data: 2026-06-11

Autores:

- Product Governance
- Architecture Governance

---

# Contexto

O NeuroLearn evoluiu para suportar grandes volumes de conteúdos, trilhas, sessões de estudo, revisões e habilidades.

Com o crescimento da base de conhecimento, surgiu a necessidade de organizar conteúdos relacionados em agrupamentos de maior nível.

Exemplos:

- Curso Cypress Completo
- Formação Product Discovery
- Engenharia de Requisitos
- Prompt Engineering
- Livro Clean Code

Atualmente o domínio DOM-003 permite organização através de Trilhas de Aprendizagem.

Entretanto, em cenários de grande volume, múltiplas trilhas relacionadas precisam ser agrupadas sob um contexto comum.

---

# Problema

Sem uma estrutura organizacional superior às trilhas, o usuário pode enfrentar:

- excesso de conteúdos dispersos;
- dificuldade de navegação;
- perda de contexto;
- aumento da carga cognitiva;
- dificuldade de acompanhar progresso de grandes jornadas de aprendizagem.

---

# Decisão

Introduzir o conceito de:

Projeto de Aprendizagem

como agregado organizacional do domínio:

DOM-003 — Learning Trails.

Estrutura resultante:

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

# Justificativa

Projetos de Aprendizagem:

- não representam novo domínio de negócio;
- não possuem bounded context próprio;
- dependem diretamente de Trilhas;
- possuem responsabilidade exclusivamente organizacional.

Portanto:

Não será criado um novo domínio.

O conceito será incorporado ao:

DOM-003 — Learning Trails.

---

# Consequências Positivas

## Produto

- maior organização;
- melhor experiência de navegação;
- melhor escalabilidade da biblioteca.

---

## UX Cognitiva

- redução da carga cognitiva;
- preservação de contexto;
- melhor continuidade de aprendizagem.

---

## Arquitetura

- evita criação de domínio desnecessário;
- reduz acoplamento;
- reduz complexidade.

---

## Governança

- mantém consistência do KOS;
- reduz fragmentação dos domínios.

---

# Consequências Negativas

- necessidade de evolução do modelo de dados;
- necessidade de atualização dos RFs;
- necessidade de atualização futura do Domain Model.

---

# Impacto nos Domínios

DOM-003 — Learning Trails

Impacto: Alto

Demais domínios:

- Sem impacto estrutural direto.

---

# Impacto no RF Catalog

Novos RFs serão adicionados ao DOM-003:

- RF-191
- RF-192
- RF-193
- RF-194
- RF-195
- RF-196
- RF-197
- RF-198

---

# Decisão Final

Aprovado.

Projetos de Aprendizagem serão tratados como agregado organizacional do DOM-003 e não como novo domínio.
