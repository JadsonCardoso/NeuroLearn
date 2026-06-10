# Feature Spec — PWA + Offline + Notificações Push

**ID:** F-060
**Status:** 🔜 Planned (v2.0)
**Complexidade:** Grande
**Depende de:** F-020 (migração Next.js)

## Overview

Transformar o NeuroLearn em uma PWA instalável com suporte offline para as funcionalidades mais críticas (revisão diária) e notificações push para lembrar revisões no horário certo.

---

## Requirements

### R-060-01 — PWA instalável

**Manifest:**

```json
{
  "name": "NeuroLearn",
  "short_name": "NeuroLearn",
  "description": "Sistema Operacional de Aprendizagem",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0a0b0f",
  "theme_color": "#7c3aed",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

**Done when:** App aparece no prompt "Adicionar à tela inicial" em Chrome/Safari mobile.

---

### R-060-02 — Service Worker e cache offline

**Estratégia por tipo de recurso:**

| Recurso                 | Estratégia               | TTL                |
| ----------------------- | ------------------------ | ------------------ |
| App shell (HTML/JS/CSS) | Cache First              | Versão do build    |
| Fontes (Inter)          | Cache First              | 1 ano              |
| API de revisão          | Network First + fallback | 5 min              |
| Cards pendentes         | Background Sync          | Sync quando online |
| Imagens de conteúdo     | Stale While Revalidate   | 1 hora             |

**Implementação (next-pwa + Workbox):**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    { urlPattern: /\/api\/review/, handler: 'NetworkFirst' },
    { urlPattern: /\/api\/flashcards/, handler: 'StaleWhileRevalidate' },
  ],
})
```

**Done when:** App funciona offline mostrando os cards já baixados; revisões feitas offline sincronizam quando online.

---

### R-060-03 — Notificações push de revisão

**Permissão:**

1. Solicitar permissão após usuário completar primeira revisão (não na entrada)
2. Mensagem: "Posso te lembrar quando tiver cards para revisar?"

**Schedule das notificações:**

- Calcular horário preferido baseado no histórico de uso do usuário
- Default: 08:00 no fuso horário do usuário
- Apenas se houver cards vencidos

**Payload da notificação:**

```json
{
  "title": "NeuroLearn — Hora de revisar!",
  "body": "Você tem 4 cards vencidos. 5 minutos garantem sua retenção de hoje.",
  "icon": "/icons/icon-192.png",
  "badge": "/icons/badge-96.png",
  "data": { "url": "/review" },
  "actions": [
    { "action": "review", "title": "Revisar agora" },
    { "action": "snooze", "title": "Depois" }
  ]
}
```

**Edge Function (cron diário):**

```typescript
// Executar às 06:00 UTC
// Para cada usuário com cards vencidos:
// 1. Calcular horário preferido
// 2. Agendar notificação via Web Push Protocol
// 3. Registrar em cognitive_events
```

**Done when:** Usuário recebe notificação quando há cards vencidos; tap abre o app direto na tela de revisão.

---

### R-060-04 — Offline: revisão com sync

**Background Sync API:**

```typescript
// Se offline durante revisão:
// 1. Salvar avaliações em IndexedDB
// 2. Registrar background sync tag 'review-sync'
// 3. Quando online: Service Worker executa sync
// 4. POST /api/review/batch com todas as avaliações pendentes

interface PendingReview {
  flashcard_id: string
  quality: 1 | 2 | 3 | 4
  response_time_ms: number
  reviewed_at: string // ISO timestamp real da revisão
}
```

**UI offline:**

- Banner sutil: "Modo offline — revisões serão sincronizadas quando conectar"
- Funcionalidades disponíveis offline: revisão, leitura da biblioteca, Modo Professor
- Funcionalidades indisponíveis offline: IA, upload, signup

**Done when:** Usuário faz revisão sem internet; ao conectar, cards atualizam no servidor.

---

## Não inclui

- App mobile nativo (React Native) — v2.5
- Sync completo offline (apenas revisão) — v2.0
- Notificações em iOS < 16.4 (limitação do sistema) — aguardar adoção
