# Feature Spec — Aprendizado Ativo

**ID:** F-005
**Status:** ✅ Implemented (v1.0)
**Component:** `Active` em `index.html`

## Overview

Módulo de prática ativa baseado nos níveis superiores da Pirâmide de Glasser (75–90% retenção). Três modos distintos forçam o aluno a recuperar e aplicar o conhecimento, não apenas reler.

## Requirements

### Tela home — seleção de modo (R-501)

**ID:** R-501
**3 modos disponíveis:**

| Modo              | Ícone | Retenção estimada | Descrição                         |
| ----------------- | ----- | ----------------- | --------------------------------- |
| Modo Professor    | 🎓    | ~90%              | Explicar como se ensinasse alguém |
| Aplicação Prática | ⚡    | ~75%              | Criar exemplos reais e hipóteses  |
| Auto-Avaliação    | 🧩    | ~65%              | Perguntas de reflexão profunda    |

**Callout informativo:** Pirâmide de Glasser com percentuais de cada método
**Done when:** Cada modo navega para sua tela de prática

---

### Seleção de conteúdo (R-502)

**ID:** R-502
**Filtro:** Apenas conteúdos com `progress > 0`
**Exibição:** Título + autor + % de progresso
**Hover:** Destaque com cor do modo selecionado
**Done when:** Lista atualiza se novo conteúdo for adicionado; botão X fecha a seleção

---

### Desafio e prática (R-503)

**ID:** R-503
**Prompt:** Exibir 1 pergunta de desafio (do banco de 3 prompts por modo)
**Textarea:** Mínimo de 10 caracteres para habilitar o botão de salvar
**Contador de palavras:** Exibe contagem em tempo real; verde quando > 50 palavras
**Prompts adicionais:** Os outros 2 prompts do modo aparecem abaixo como sugestões clicáveis (append ao textarea)

**Prompts por modo:**

- Modo Professor: explicação geral, resumo 2 min, 3 ideias principais
- Aplicação: aplicação no trabalho (7 dias), hipótese/experimento, exemplo concreto
- Auto-Avaliação: maior insight, mudança de perspectiva, dúvidas restantes

**Done when:** Prompts corretos por modo; append funciona sem sobrescrever texto existente

---

### Salvar e ganhar XP (R-504)

**ID:** R-504
**XP por wordcount:**

- < 20 palavras → +10 XP
- 20–50 palavras → +20 XP
- > 50 palavras → +30 XP

**Após salvar:**

- `totalXp` incrementado
- Textarea limpa
- Feedback visual "✓ Salvo! +XP" por 3 segundos
- Botão volta a "Salvar e ganhar XP →"

**Done when:** XP persistido no localStorage; feedback desaparece automaticamente

---

## Fluxo de navegação

```
Home (seleção de modo)
  → Selecionar modo
    → Selecionar conteúdo
      → Escrever resposta
        → Salvar (+XP)
          → Pode praticar novamente ou voltar
← Botão "← Voltar" em qualquer passo
```

## Não inclui

- Salvar texto da resposta no histórico
- Análise automática de qualidade com IA
- Modo específico "Debate com IA"
