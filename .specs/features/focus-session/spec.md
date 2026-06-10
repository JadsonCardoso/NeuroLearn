# Feature Spec — Sessão de Foco

**ID:** F-003
**Status:** ✅ Implemented (v1.0)
**Component:** `Focus` em `index.html`

## Overview

Sessão de estudo guiada em 3 fases obrigatórias: Pomodoro, Extração Ativa e Modo Professor. Baseada na Pirâmide de Glasser — força o aluno a sair da leitura passiva.

## Fases

### Fase 1 — Sessão de Foco / Pomodoro (R-301)

**Timer:** 25 minutos regressivos, exibido como `MM:SS`
**Visualização:** Anel SVG animado mostrando progresso
**Controles:** Iniciar / Pausar / Resetar
**Comportamento ao zerar:** Para automaticamente, avança para Fase 2, timer reseta para 5 min
**Anotações:** Textarea livre para escrever enquanto estuda
**Highlights:** Input de texto + Enter ou botão "+" adiciona tags removíveis
**Done when:** Timer conta corretamente, pausa/retoma, avança de fase ao zerar

---

### Fase 2 — Extração Ativa (R-302)

**3 perguntas de reflexão obrigatórias:**

1. O que foi mais importante nessa sessão?
2. O que você ainda não entende completamente?
3. Como aplicaria isso na prática?

**Criação de Flashcards:**

- Campo frente (pergunta/conceito)
- Campo verso (resposta/explicação)
- Botão "+ Adicionar Card" — valida que ambos os campos estão preenchidos
- Lista dos cards criados com botão de remoção individual

**Botão avançar:** "Próximo: Ensinar →" leva para Fase 3

**Done when:** Cards criados aparecem na lista; botão avançar habilitado mesmo sem cards (a sessão pode ser salva sem flashcards)

---

### Fase 3 — Modo Professor (R-303)

**Prompt principal:** Textarea para explicar o conteúdo como professor
**Placeholder guidance:** "Hoje aprendi que... O conceito funciona assim..."
**Feedback de progresso:** Contador de palavras; quando > 30 palavras, exibe mensagem positiva
**Exibe highlights da Fase 1** se existirem
**Desafio de aplicação:** Card contextual pedindo exemplo real baseado no título do conteúdo

**Botão finalizar:** "✓ Finalizar e Salvar Sessão"

- Cria objeto `session` com: id, cid, date, duration, highlights, notes, teachText
- Salva todos os flashcards criados com: ef=2.5, interval=1, reps=0, nextReview=hoje, mastery='new'
- Incrementa `content.progress` em +10% (max 100%)
- Adiciona +20 XP base + 5 XP por card criado
- Atualiza streak se for o primeiro estudo do dia
- Navega de volta ao Dashboard

**Done when:** Após finalizar, todos os dados persistem no localStorage; cards aparecem na Revisão

---

## Navegação entre fases

- Tabs clicáveis no topo permitem navegar livremente entre fases
- Avançar na Fase 1 pode ser feito pelo botão "Finalizar Sessão →" (pula o timer se necessário)
- Voltar na Fase 3 leva para Fase 2

## Não inclui

- Gravação de áudio (Fase "Modo Gravação") — previsto para v1.3
- Análise automática de qualidade do texto — previsto para v2.0
- Flashcards com imagem — previsto para v1.3
