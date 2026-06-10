# Project Structure

**Root:** `C:\Users\JadsonCardoso\Downloads\AppEstudo`

## Directory Tree

```
AppEstudo/
├── index.html                        # SPA principal (React + JSX inline)
├── landing.html                      # Landing page marketing
├── gerar-doc.js                      # Script Node.js → gera .docx
├── gerar-pdf.js                      # Script Node.js → gera .pdf
├── package.json                      # deps: docx, pdfkit (somente scripts)
├── node_modules/                     # docx, pdfkit e dependências
├── NeuroLearn-Documentacao.docx      # Documentação Word gerada
├── NeuroLearn-Documentacao-Tecnica.pdf # Documentação PDF gerada
├── .claude/
│   ├── launch.json                   # Config servidor dev (npx serve)
│   └── skills/
│       └── tlc-spec-driven/          # Skill instalada
└── .specs/                           # ← Este diretório (spec-driven docs)
    ├── project/
    │   ├── PROJECT.md
    │   ├── ROADMAP.md
    │   └── STATE.md
    ├── codebase/
    │   ├── STACK.md
    │   ├── ARCHITECTURE.md
    │   ├── CONVENTIONS.md
    │   ├── STRUCTURE.md
    │   ├── TESTING.md
    │   ├── INTEGRATIONS.md
    │   └── CONCERNS.md
    └── features/
        ├── dashboard/
        ├── library/
        ├── focus-session/
        ├── smart-review/
        ├── active-learning/
        ├── skill-tree/
        ├── help/
        └── dark-light-mode/
```

## Module Organization

### SPA Principal

**Purpose:** Toda a lógica da aplicação de aprendizagem
**Location:** `index.html` (único arquivo, ~1.650 linhas)
**Key files:** `index.html`

Organização interna (por ordem no arquivo):

| Bloco               | Linhas (aprox.) | Responsabilidade                                 |
| ------------------- | --------------- | ------------------------------------------------ |
| CSS global + tokens | 1–50            | Reset, componentes CSS, tokens dark/light        |
| Utils               | 51–90           | sm2, calcRetention, isDue, addDays, relDate, uid |
| Storage / SEED      | 91–120          | Dados iniciais, load(), save()                   |
| Icons               | 121–145         | SVG como componentes React                       |
| Ring                | 146–152         | Anel SVG de retenção                             |
| Dashboard           | 153–346         | Página home                                      |
| Library             | 347–446         | Gestão de conteúdos                              |
| Focus               | 447–672         | Sessão Pomodoro 3 fases                          |
| Review              | 673–805         | Flashcards SM-2                                  |
| Active              | 806–945         | Aprendizado ativo                                |
| Skills              | 946–1144        | Árvore de habilidades                            |
| Help                | 1145–1380       | Central de ajuda                                 |
| App                 | 1381–1490       | Orquestrador + sidebar                           |
| Bootstrap           | ~1490           | ReactDOM.createRoot                              |

### Landing Page

**Purpose:** Marketing / apresentação do produto
**Location:** `landing.html`
**Key files:** `landing.html` (auto-contido, sem dependências do index.html)

### Scripts de Documentação

**Purpose:** Gerar documentação offline em Word e PDF
**Location:** `gerar-doc.js`, `gerar-pdf.js`
**Key files:** Dependem de `node_modules/docx` e `node_modules/pdfkit`

## Where Things Live

**Algoritmos de aprendizagem:**

- SM-2: função `sm2()` em `index.html`
- Ebbinghaus retention: função `calcRetention()` em `index.html`
- Scheduling: função `isDue()` + `addDays()` em `index.html`

**Persistência:**

- Schema / seed: constante `SEED` em `index.html`
- Read: função `load()` → `localStorage.getItem('nl_v2')`
- Write: função `save()` → `localStorage.setItem('nl_v2', ...)`

**Design tokens:**

- Dark: `:root { --bg, --card, --border, --text, ... }` em `<style>` do `index.html`
- Light: `[data-theme="light"] { ... }` em `<style>` do `index.html`

**Configuração dev:**

- Servidor: `.claude/launch.json`
- Dependências docs: `package.json`
