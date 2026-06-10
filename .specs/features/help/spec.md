# Feature Spec — Central de Ajuda

**ID:** F-007
**Status:** ✅ Implemented (v1.0)
**Component:** `Help` em `index.html`

## Overview

Guia interativo integrado ao app para orientar alunos no uso de cada funcionalidade, com base científica e FAQ. Acessível pelo ícone "?" no sidebar.

## Requirements

### Banner de início rápido (R-701)

**ID:** R-701
**Conteúdo:** 5 passos em badges: "1. Adicione um livro" → ... → "5. Revise todo dia"
**Visual:** Card com gradiente roxo/cyan, ícone 🚀
**Done when:** Badges visíveis e legíveis em dark e light mode

---

### Guia por módulo — accordion (R-702)

**ID:** R-702
**6 módulos:** Dashboard, Biblioteca, Sessão de Foco, Revisão, Aprendizado Ativo, Habilidades
**Cada item accordion contém:**

- Header clicável: ícone + título + tagline + seta rotacionável
- Body (quando aberto):
  - Passo a passo numerado (N, título, descrição)
  - Caixa de dica (tip) colorida com cor do módulo
  - Caixa de ciência (🧬) com a base científica relevante

**Comportamento:** Apenas um accordion aberto por vez (toggle: abrir fecha o anterior)
**Done when:** Accordion anima com slide-in; conteúdo correto por módulo

---

### Tabela de XP (R-703)

**ID:** R-703
**Tabela com 2 colunas:** Ação + XP ganho
**7 linhas de ações:**

- Revisar flashcard Fácil → +15 XP
- Revisar flashcard Bom → +10 XP
- Revisar flashcard Difícil/Esqueci → +5 XP
- Aprendizado Ativo > 50 palavras → +30 XP
- Aprendizado Ativo 20–50 palavras → +20 XP
- Finalizar Sessão de Foco → +20 XP
- Criar flashcard em sessão → +5 XP/card

**Zebra striping:** Linhas alternadas com background var(--card2)
**Done when:** Tabela renderiza corretamente em ambos os temas

---

### FAQ — accordion (R-704)

**ID:** R-704
**6 perguntas:**

1. Com que frequência devo usar o app?
2. Quantos flashcards devo criar por sessão?
3. O que é uma boa pergunta de flashcard?
4. Posso pular o Modo Professor?
5. Meus dados são salvos onde?
6. O que acontece se eu esquecer de revisar um dia?

**Comportamento:** Mesmo toggle do accordion de módulos (shared state `open`)
**Done when:** Pergunta e resposta corretas para cada item

---

### Nota de encerramento (R-705)

**ID:** R-705
**Mensagem:** Destaque em verde sobre consistência diária vs. maratonas
**Visual:** Card com borda verde e ícone ✅
**Done when:** Visível no final da página após rolar

---

## Não inclui

- Busca dentro da ajuda
- Vídeos tutoriais integrados
- Chat de suporte
- Feedback de utilidade ("Essa resposta foi útil?")
