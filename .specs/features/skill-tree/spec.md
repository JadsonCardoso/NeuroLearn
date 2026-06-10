# Feature Spec — Árvore de Habilidades

**ID:** F-006
**Status:** ✅ Implemented (v1.0)
**Component:** `Skills` em `index.html`

## Overview

Sistema de progressão orientado a capacidade real, não consumo. XP cresce com prática ativa. Medição de habilidades como alternativa às métricas de consumo (páginas lidas, horas estudadas).

## Requirements

### Métricas de topo (R-601)

**ID:** R-601
**4 cards de métricas:**

- Total XP (acumulado do usuário)
- Número de habilidades cadastradas
- Nível médio (média de skill.level)
- Expert+ (habilidades com level ≥ 4)

**Done when:** Valores recalculados ao adicionar/remover habilidade ou ganhar XP

---

### Agrupamento por categoria (R-602)

**ID:** R-602
**Categorias:**

| ID      | Label       | Cor     |
| ------- | ----------- | ------- |
| product | Produto     | #7c3aed |
| tech    | Tecnologia  | #06b6d4 |
| soft    | Soft Skills | #ec4899 |
| data    | Dados       | #f59e0b |

**Renderização:** Cada categoria aparece como grupo com linha colorida + título
**Condição:** Categoria omitida se não houver habilidades nela
**Done when:** Habilidades corretamente agrupadas por `skill.cat`

---

### Card de habilidade (R-603)

**ID:** R-603
**Conteúdo de cada card:**

- Nome da habilidade
- Nível textual (Iniciante/Básico/Intermediário/Avançado/Expert/Mestre)
- Badge "Nv.X" com cor da categoria
- 5 barrinhas de progresso de nível (preenchidas até `skill.level`)
- Barra de XP: `skill.xp / skill.maxXp × 100%`
- Contador "XP X/Y"

**Interação:** Clique no card o seleciona/deseleciona
**Quando selecionado:** Exibe botões "+10 XP" e "+25 XP"
**Done when:** Seleção toggle correto; somente um card selecionado por vez

---

### Ganho de XP e level up (R-604)

**ID:** R-604
**Botões na expansão:** "+10 XP" e "+25 XP"
**Level up automático:** Quando `xp >= maxXp && level < 5`:

- `xp = xp - maxXp`
- `level++`
- `maxXp += 100`
  **Propagação:** `totalXp` do usuário também incrementa
  **Done when:** Level up imediato; barra volta para 0 e maxXp correto

---

### Criar nova habilidade (R-605)

**ID:** R-605
**Modal com campos:**

- Nome (obrigatório)
- Categoria (select)

**Valores iniciais:** level=0, xp=0, maxXp=200, color=cor da categoria
**Done when:** Nova habilidade aparece no grupo correto; modal fecha após criar

---

## Schema de habilidade

```js
{
  id: uid(),
  name: string,
  level: 0–5,
  xp: number,
  maxXp: number (começa 200, +100 por nível),
  cat: 'product' | 'tech' | 'soft' | 'data',
  color: string (hex)
}
```

## Não inclui

- Dependências entre habilidades (árvore visual com prerequisitos) — v1.3
- Deletar habilidade — v1.1
- Renomear habilidade — v1.1
- Vincular habilidade automaticamente a conteúdo — v1.3
