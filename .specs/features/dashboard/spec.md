# Feature Spec — Dashboard

**ID:** F-001
**Status:** ✅ Implemented (v1.0)
**Component:** `Dashboard` em `index.html`

## Overview

Central de comando diária do aluno. Apresenta o estado atual de aprendizagem e agenda as ações prioritárias do dia.

## Requirements

### Métricas de topo (R-001)

**ID:** R-001
**Descrição:** Exibir 4 métricas principais em cards no topo da página
**Métricas:**

- Streak (dias consecutivos de estudo)
- Total XP acumulado
- Quantidade de cards para revisar hoje
- Retenção média global (%)

**Cálculo retenção média:** `média de calcRetention(card)` para todos os cards do usuário
**Done when:** Os 4 cards aparecem com valores corretos atualizados em tempo real

---

### Lista de revisões do dia (R-002)

**ID:** R-002
**Descrição:** Listar cards vencidos hoje com botão para iniciar revisão
**Regra:** Card é vencido quando `new Date(card.nextReview) <= new Date()`
**Exibição:** Mostrar máximo 3 cards; se houver mais, mostrar "+N mais"
**Cada card mostra:** fonte do conteúdo, início da pergunta, badge de retenção atual (verde/amarelo/vermelho)
**Done when:** Lista atualiza após cada revisão concluída; botão navega para página Review

---

### Alerta de risco de esquecimento (R-003)

**ID:** R-003
**Descrição:** Exibir bloco de alerta quando algum card tiver retenção < 50% (e > 0%)
**Conteúdo:** Contagem de cards em risco + lista dos 3 primeiros com % de retenção
**Cor:** Amarelo/laranja (warning)
**Done when:** Bloco aparece somente quando há cards em risco; some quando todos estão acima de 50%

---

### Calendário de revisões (R-004)

**ID:** R-004
**Descrição:** Gráfico de barras mostrando quantidade de revisões agendadas para os próximos 7 dias
**Eixo X:** Dias da semana (Dom–Sáb)
**Eixo Y:** Número de cards
**Destaque:** Hoje em roxo/gradiente; dias futuros em cinza
**Done when:** Barras representam corretamente os cards por data de nextReview

---

### Mapa de retenção (R-005)

**ID:** R-005
**Descrição:** Anel SVG circular mostrando retenção média global
**Classificação lateral:**

- Fortes: retenção ≥ 75%
- Médios: 50% ≤ retenção < 75%
- Fracos: retenção < 50% e > 0%
  **Cor do anel:** verde (≥70%), amarelo (40–69%), vermelho (<40%)
  **Done when:** Anel anima ao carregar; valores são calculados corretamente

---

### Em progresso (R-006)

**ID:** R-006
**Descrição:** Lista de conteúdos com progresso < 100%, com barra de progresso
**Máximo:** 3 conteúdos exibidos
**Botão:** "Ver Biblioteca →" navega para a Library
**Done when:** Barra reflete `content.progress` com cor do conteúdo

---

### Top habilidades (R-007)

**ID:** R-007
**Descrição:** Resumo das 4 habilidades com maior nível
**Cada habilidade:** Nome, nível atual, barra de XP
**Botão:** "Árvore de Habilidades →" navega para Skills
**Done when:** Ordenado por `skill.level` desc

## Comportamento de borda

- Zero cards: mostrar estado vazio "Nada para revisar hoje!"
- Zero conteúdos: seção "Em Progresso" omitida ou vazia
- Dados SEED pré-carregados na primeira abertura

## Não inclui

- Edição de dados diretamente no Dashboard
- Notificações ou alertas sonoros
- Gráficos históricos (fora do escopo v1)
