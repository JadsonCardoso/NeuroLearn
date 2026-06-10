# Feature Spec — Dark/Light Mode

**ID:** F-008
**Status:** ✅ Implemented (v1.0)
**Scope:** index.html (app) + landing.html

## Overview

Sistema de tema claro/escuro com persistência de preferência. Implementado via CSS Custom Properties para máxima performance sem re-renders React.

## Requirements

### Tokens de design (R-801)

**ID:** R-801
**Tokens dark (`:root`):**

| Token     | Dark           | Light           |
| --------- | -------------- | --------------- |
| --bg      | #0a0b0f        | #f8fafc         |
| --bg2     | #0d0e14        | #f1f5f9         |
| --card    | #13141a        | #ffffff         |
| --card2   | #1a1b22        | #f4f6fa         |
| --border  | #1e2028        | #e2e8f0         |
| --border2 | #2d2f3a        | #cbd5e1         |
| --text    | #f1f5f9        | #0f172a         |
| --text2   | #e2e8f0        | #1e293b         |
| --text3   | #64748b        | #64748b         |
| --text4   | #94a3b8        | #94a3b8         |
| --shadow  | rgba(0,0,0,.5) | rgba(0,0,0,.08) |

**Aplicação:** `[data-theme="light"]` no `html` element
**Done when:** Todos os componentes usam `var(--*)` em vez de hex hardcoded

---

### Toggle no sidebar (R-802)

**ID:** R-802
**Localização:** Rodapé do sidebar, abaixo do streak
**Visual:** Toggle pill animado (bolinha desliza)
**Ícone contextual:** 🌙 "Modo escuro" / ☀️ "Modo claro"
**Animação:** CSS `transition: transform 0.3s` na bolinha
**Done when:** Toggle troca tema imediatamente; ícone atualiza

---

### Persistência (R-803)

**ID:** R-803
**Storage key:** `nl_theme` no localStorage
**Load on init:** `useState(() => localStorage.getItem('nl_theme') || 'dark')`
**Apply on change:** `useEffect(() => document.documentElement.setAttribute('data-theme', theme))`
**Done when:** Após reload, tema anterior é restaurado

---

### Transição suave (R-804)

**ID:** R-804
**CSS:** `body { transition: background .25s, color .25s; }`
**Elementos:** `.card`, `nav` e `main` também têm `transition: background .25s`
**Done when:** Sem flashes ou saltos bruscos ao trocar tema

---

### Landing page (R-805)

**ID:** R-805
**Mesma lógica:** `data-theme` no `html`, `localStorage` key `nl_theme`
**Toggle:** Botão pill na navbar da landing
**Done when:** Preferência da landing e do app são compartilhadas (mesma chave)

## Não inclui

- Detecção automática de preferência do sistema (`prefers-color-scheme`) — v1.1
- Tema custom / paleta personalizada — fora do escopo
