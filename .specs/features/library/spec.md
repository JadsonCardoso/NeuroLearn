# Feature Spec — Biblioteca de Conhecimento

**ID:** F-002
**Status:** ✅ Implemented (v1.0)
**Component:** `Library` em `index.html`

## Overview

Central de gerenciamento de conteúdos de aprendizagem. Cada item representa uma fonte de conhecimento (livro, curso, vídeo, artigo ou nota) com seu próprio conjunto de flashcards e progresso de estudo.

## Requirements

### Grid de conteúdos (R-201)

**ID:** R-201
**Layout:** Grid responsivo `repeat(auto-fill, minmax(290px, 1fr))`
**Cada card exibe:**

- Ícone do tipo (📚/🎓/🎥/📄/📝) com fundo colorido
- Badge "✓ Concluído" quando progress = 100%
- % de retenção média dos flashcards daquele conteúdo (se cards > 0)
- Título, autor (se preenchido), descrição (se preenchida)
- Barra de progresso (0–100%) com cor do conteúdo
- Contagem de flashcards
- Botão "Estudar →" abre Focus Session com esse conteúdo

**Hover:** Borda muda para cor do conteúdo
**Done when:** Grid renderiza todos os conteúdos do state; retenção calculada corretamente

---

### Adicionar conteúdo (R-202)

**ID:** R-202
**Trigger:** Botão "+ Adicionar" no header da página
**Modal com campos:**

- Título (obrigatório, validação: não-vazio após trim)
- Tipo: Livro / Curso / Vídeo / Artigo / Anotação (select)
- Autor/Fonte (opcional)
- Descrição (opcional, textarea)

**Valores gerados automaticamente:**

- `id`: uid()
- `color`: mapeado pelo tipo (book→#7c3aed, course→#06b6d4, video→#ef4444, article→#f59e0b, note→#10b981)
- `addedAt`: new Date().toISOString()
- `progress`: 0

**Done when:** Modal fecha após salvar; novo card aparece no grid imediatamente

---

### Estado vazio (R-203)

**ID:** R-203
**Condição:** `data.contents.length === 0`
**Exibição:** Ícone 📚 + texto "Biblioteca vazia" + instrução para adicionar
**Done when:** Estado vazio visível na primeira abertura antes do SEED ser carregado (ou se todos os conteúdos forem removidos)

---

## Schema de conteúdo

```js
{
  id: string (uid),
  title: string,
  type: 'book' | 'course' | 'video' | 'article' | 'note',
  author: string (opcional),
  desc: string (opcional),
  color: string (hex),
  addedAt: ISO string,
  progress: number (0–100)
}
```

## Não inclui

- Editar conteúdo existente — v1.1
- Deletar conteúdo — v1.1
- Filtros e busca — v1.2
- Import de URL/PDF externo — v1.3
- Ordenação customizada — v1.2
