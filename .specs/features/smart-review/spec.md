# Feature Spec — Revisão Inteligente (SM-2)

**ID:** F-004
**Status:** ✅ Implemented (v1.0)
**Component:** `Review` em `index.html`

## Overview

Motor de consolidação de memória baseado no algoritmo SM-2. Apresenta flashcards vencidos e recalcula o próximo intervalo de revisão com base na avaliação de qualidade do aluno.

## Requirements

### Fila de revisão (R-401)

**ID:** R-401
**Regra de elegibilidade:** `isDue(card)` → `new Date(card.nextReview) <= new Date()`
**Ordenação:** Por data de vencimento (mais antigo primeiro)
**Estado vazio:** Exibir tela "Nada para revisar hoje!" com data da próxima revisão
**Done when:** Apenas cards vencidos aparecem na fila

---

### Exibição do flashcard (R-402)

**ID:** R-402
**Frente (padrão):** Mostra pergunta + instrução "Clique para revelar"
**Verso (ao clicar):** Animação 3D flip (rotateY 180°), mostra resposta com destaque roxo
**Informações contextuais:** Nome do conteúdo fonte + badge de retenção atual (cor semântica)
**Progresso:** Barra linear mostrando "X de Y cards" + percentual
**Done when:** Flip anima corretamente; texto do verso não vaza pela frente (backface-visibility)

---

### Avaliação de qualidade (R-403)

**ID:** R-403
**Opções (exibidas após revelar o verso):**

| Botão   | Quality | Comportamento                |
| ------- | ------- | ---------------------------- |
| Esqueci | 1       | Reinicia: reps=0, interval=1 |
| Difícil | 2       | Reinicia: reps=0, interval=1 |
| Bom     | 3       | Avança com EF mínimo         |
| Fácil   | 4       | Avança com EF normal         |

**Algoritmo SM-2:**

```
nef = max(1.3, ef + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)))
if q < 3: reps=0, interval=1
elif reps==0: interval=1
elif reps==1: interval=6
else: interval = round(interval * nef)
```

**Após avaliação:**

- Atualiza card: ef, interval, repetitions, nextReview, lastReview, mastery
- `mastery`: 'strong' se interval≥21; 'review' se ≥6; 'learning' caso contrário
- Ganha XP: +15 (Fácil), +10 (Bom), +5 (Difícil/Esqueci)
- Flip reseta para frente; próximo card exibido

**Done when:** Card nunca aparece duas vezes na mesma sessão; próxima revisão agendada corretamente

---

### Tela de resultado (R-404)

**ID:** R-404
**Exibido ao completar todos os cards da fila**
**Métricas:**

- Total de cards revisados
- % de desempenho (cards com quality≥4 / total)
- XP ganho nesta sessão
  **Botão:** "Voltar ao Dashboard"
  **Done when:** Cálculo correto; tela não aparece antes de terminar a fila

---

## Fluxo de estados

```
[fila vazia]     → Tela "sem revisões"
[fila com cards] → Exibir card frente
                   → Click → Flip verso
                   → Avaliar → próximo card
                   → Último card avaliado → Tela de resultado
```

## Não inclui

- Edição de flashcard durante a revisão
- Undo da última avaliação (v1.x futuro)
- Modo "Cram" (revisar todos ignorando agenda) — v1.3
