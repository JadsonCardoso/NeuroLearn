# Feature Spec — Configurações e Settings

**ID:** F-014
**Status:** 🔜 Planned (v1.1)
**Complexidade:** Pequena
**Depende de:** F-011 (Export/Import)

## Overview

Página de Configurações no app com controles sobre dados, preferências e acesso a informações da conta. Fundamenta as funcionalidades de v1.1 (export, import, reset) e prepara a UX para v1.2 (perfil, auth).

---

## Requirements

### R-014-01 — Aba Settings no sidebar

**Nav item:** ⚙ Configurações (abaixo de Ajuda)
**Ícone:**

```jsx
Settings: () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
```

---

### R-014-02 — Seção: Dados e Backup

**Conteúdo:**

- Informações dos dados: `{n} conteúdos · {n} flashcards · {n} habilidades`
- Tamanho aproximado: calcular `JSON.stringify(data).length / 1024` KB
- Botão "⬇ Exportar backup (.json)" → chama F-011 export
- Botão "⬆ Importar backup" → input file → F-011 import
- Texto: "Último export: {data}" (salvo no localStorage como `nl_last_export`)

**Done when:** Informações corretas exibidas; botões funcionando.

---

### R-014-03 — Seção: Validação de Schema

**Funcionalidade interna (não visível):**

```javascript
function loadWithValidation() {
  try {
    const s = localStorage.getItem('nl_v2')
    if (!s) return SEED
    const parsed = JSON.parse(s)
    // Validar campos obrigatórios
    const required = ['contents', 'cards', 'skills', 'streak', 'totalXp']
    for (const field of required) {
      if (!(field in parsed)) {
        console.warn(`Schema inválido: campo '${field}' ausente. Usando SEED.`)
        return SEED
      }
    }
    // Garantir arrays existem
    parsed.sessions = parsed.sessions || []
    parsed.lastStudyDate = parsed.lastStudyDate || new Date().toDateString()
    return parsed
  } catch (e) {
    console.warn('localStorage corrompido, usando SEED:', e)
    return SEED
  }
}
```

**Done when:** App não crasha com dados corrompidos; sempre retorna estado válido.

---

### R-014-04 — Seção: Resetar Dados

**UI:**

- Título: "⚠ Zona de Perigo"
- Descrição: "Esta ação remove permanentemente todos os seus dados. Não pode ser desfeita."
- Botão vermelho: "Limpar todos os dados"
- Modal de confirmação: input de texto onde usuário digita "CONFIRMAR"
- Após confirmação: `localStorage.removeItem('nl_v2')` + reload da página

**Done when:** Reset sem digitar "CONFIRMAR" é bloqueado; após confirmar, app reinicia limpo.

---

### R-014-05 — Seção: Tema

Mover o toggle dark/light do sidebar para Configurações (manter também no sidebar como atalho).

**Exibição:** Radio group: ☀ Claro / 🌙 Escuro
**Preferência:** Ainda persiste em `localStorage.setItem('nl_theme', theme)`

---

## Não inclui

- Configurações por conteúdo (intervalo customizado de revisão)
- Preferências de notificação (v2.0)
- Integração de conta/perfil (v1.2)
- Importação de dados do Anki (.apkg) — v1.3
