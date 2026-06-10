# External Integrations

**Analyzed:** 2026-06-05

## CDN / Font Services

### unpkg.com (React + Babel)

**Purpose:** Carrega React 18 e Babel Standalone em runtime
**Implementation:** Tags `<script>` no `<head>` de `index.html`
**Authentication:** Nenhuma (CDN público)
**URLs:**

```html
https://unpkg.com/react@18/umd/react.development.js
https://unpkg.com/react-dom@18/umd/react-dom.development.js
https://unpkg.com/@babel/standalone/babel.min.js
```

**Risco:** Dependência de disponibilidade do CDN. Sem pinning de versão exata (apenas `@18`).

### Google Fonts

**Purpose:** Fonte Inter (300–800 weight)
**Implementation:** `<link>` no `<head>` de `index.html` e `landing.html`
**Authentication:** Nenhuma (CDN público)
**URL:** `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap`
**Fallback:** `font-family: 'Inter', sans-serif` — degradação para sans-serif do sistema

## Browser APIs

### localStorage

**Purpose:** Persistência de todos os dados do usuário
**Implementation:** `load()` / `save()` em `index.html`
**Chaves usadas:**

- `nl_v2` — estado completo da aplicação (contents, cards, skills, sessions, streak, totalXp)
- `nl_theme` — preferência de tema (`'dark'` | `'light'`)
  **Limitação:** ~5-10MB por domínio; sem sincronização entre dispositivos

### SVG API

**Purpose:** Anel de retenção (Ring), timer Pomodoro
**Implementation:** SVG inline no JSX com atributos dinâmicos
**Técnica:** `stroke-dasharray` animado para progress circles

### CSS Custom Properties

**Purpose:** Sistema de tema dark/light
**Implementation:** `document.documentElement.setAttribute('data-theme', theme)`

### setInterval / clearInterval

**Purpose:** Timer Pomodoro (conta regressiva 25min)
**Implementation:** `useRef` para armazenar o interval ID, limpo no cleanup do `useEffect`

## Sem Integrações Externas

O projeto **não possui**:

- APIs REST externas
- WebSockets
- Autenticação (OAuth, JWT, etc.)
- Analytics (Google Analytics, Mixpanel, etc.)
- Error tracking (Sentry, etc.)
- Push Notifications
- Service Workers / PWA
- Pagamentos
- Email / SMS
- IA/LLM APIs

## Scripts de Documentação (Node.js)

### docx (npm)

**Purpose:** Gerar `NeuroLearn-Documentacao.docx`
**Location:** `gerar-doc.js`
**Usage:** `node gerar-doc.js`
**Output:** arquivo `.docx` local

### pdfkit (npm)

**Purpose:** Gerar `NeuroLearn-Documentacao-Tecnica.pdf`
**Location:** `gerar-pdf.js`
**Usage:** `node gerar-pdf.js`
**Output:** arquivo `.pdf` local
