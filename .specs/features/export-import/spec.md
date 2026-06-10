# Feature Spec — Export e Import de Dados

**ID:** F-011
**Status:** 🔜 Planned (v1.1) — PRÓXIMO SPRINT
**Complexidade:** Pequena
**Depende de:** nada (feature standalone no v1.0)

## Overview

Proteção de dados do usuário contra perda por limpeza de cache. Export JSON completo e Import de backup. Funcionalidade crítica P0 antes da migração v1.2.

---

## Requirements

### R-011-01 — Export de dados

**Localização UI:** Sidebar → botão "⬇ Exportar dados" ou página Configurações
**Trigger:** Clique do usuário

**Formato exportado:**

```json
{
  "version": "1.0",
  "exported_at": "2026-06-05T12:00:00Z",
  "data": {
    "contents": [...],
    "cards": [...],
    "skills": [...],
    "sessions": [...],
    "streak": 5,
    "lastStudyDate": "...",
    "totalXp": 1040
  }
}
```

**Implementação:**

```javascript
function exportData(data) {
  const payload = JSON.stringify(
    { version: '1.0', exported_at: new Date().toISOString(), data },
    null,
    2
  )
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neurolearn-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Done when:** Arquivo JSON baixado com todos os dados do usuário; pode abrir e ler.

---

### R-011-02 — Import de dados

**Localização UI:** Mesma área do Export
**Trigger:** Input `type="file"` accept=".json"

**Validação antes de importar:**

```javascript
function validateImport(parsed) {
  if (!parsed.version) throw new Error('Arquivo sem versão')
  if (!parsed.data?.contents) throw new Error('Campo contents ausente')
  if (!parsed.data?.cards) throw new Error('Campo cards ausente')
  if (!parsed.data?.skills) throw new Error('Campo skills ausente')
  return true
}
```

**Fluxo:**

1. Usuário seleciona arquivo .json
2. FileReader lê e faz JSON.parse
3. Validação de schema
4. Modal de confirmação: "Isso vai substituir seus dados atuais. Continuar?"
5. setData(parsed.data) + save()
6. Feedback: "✅ Dados importados com sucesso!"

**Done when:** Import de backup restaura todos os dados corretamente; app funciona normalmente após importar.

---

### R-011-03 — Tela de Configurações

**Rota/página:** Nova aba "Configurações" no sidebar

**Seções:**

1. **Dados**
   - Botão "⬇ Exportar backup"
   - Botão "⬆ Importar backup"
   - Informações: data do último export, tamanho dos dados
2. **Estatísticas**
   - Total de cards, conteúdos, sessões, XP
3. **Resetar dados**
   - Botão "🗑 Limpar todos os dados"
   - Confirmação dupla: "Digite CONFIRMAR para continuar"
   - Reseta para estado inicial (SEED ou empty)

**Done when:** Todas as 3 seções funcionais; reset exige confirmação explícita.

---

## Não inclui

- Exportação seletiva por conteúdo
- Merge de backups (importar sem substituir)
- Exportação em outros formatos (CSV, Anki .apkg)
- Histórico de backups
