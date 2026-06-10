# DOC-01 — Reestruturação Completa da Documentação do NeuroLearn

**Status:** Approved  
**Escopo:** Large  
**Data:** 2026-06-06

---

## Contexto

Existem 3 arquivos de documentação obsoletos na raiz do projeto, gerados por scripts desatualizados com conteúdo hardcoded. A documentação atual não reflete o estado real da plataforma (Fases 1–4 + UX-01 + QA-01 concluídas).

Arquivos a remover:

- `NeuroLearn-Documentacao.docx`
- `NeuroLearn-Status-Projeto.pdf`
- `NeuroLearn-Documentacao-Tecnica.pdf`

Scripts de geração desatualizados:

- `gerar-doc.js` — conteúdo hardcoded da v1.0
- `gerar-pdf.js` — conteúdo hardcoded da v1.0

---

## Objetivo

Criar estrutura documental oficial, profissional e escalável com 3 documentos canônicos em Markdown + geração automatizada de PDF e DOCX.

---

## Estrutura Final

```
docs/
├── project-status/
│   ├── project-status.md          ← Documento 1 (source of truth)
│   ├── project-status.pdf         ← Gerado por npm run generate-pdf
│   └── project-status.docx        ← Gerado por npm run generate-doc
├── technical-documentation/
│   ├── technical-documentation.md ← Documento 2 (source of truth)
│   ├── technical-documentation.pdf
│   └── technical-documentation.docx
├── user-guide/
│   ├── user-guide.md              ← Documento 3 (source of truth)
│   ├── user-guide.pdf
│   └── user-guide.docx
├── architecture/                  ← Reservado para diagramas e ADRs
├── qa/                            ← Reservado para relatórios de QA
├── security/                      ← Reservado para auditorias
└── ai/                            ← Reservado para estratégia de IA
```

---

## Requisitos

### R01 — Remover documentos antigos

- Remover os 3 arquivos obsoletos da raiz
- Resultado: raiz limpa de PDFs e DOCXs antigos

### R02 — Criar estrutura docs/

- 7 subpastas conforme especificado
- Resultado: estrutura de pastas existe

### R03 — project-status.md

Documento de status do projeto contendo:

- Visão geral e métricas de progresso
- Stack atual (completo)
- Funcionalidades implementadas (por módulo/fase)
- Funcionalidades pendentes (por fase do roadmap)
- Status por camada: backend, frontend, Cognitive Engine, IA, segurança, testes
- Bugs conhecidos
- Roadmap por fase
- Decisões arquiteturais importantes
- Próximos passos priorizados
- Linguagem: técnica, direta, objetiva

### R04 — technical-documentation.md

Documento técnico completo contendo:

- Visão arquitetural (diagrama textual)
- Stack tecnológica (versões)
- Estrutura de pastas detalhada
- Padrões arquiteturais adotados
- Frontend: componentes, rotas, estado, forms
- Backend: Supabase, RLS, auth, edge functions
- Banco de dados: schema completo, tabelas, tipos
- Cognitive Engine: algoritmos, fórmulas, módulos
- Sistema de revisão espaçada (SM-2 aprimorado)
- Fluxos da aplicação (auth, estudo, revisão)
- Segurança (OWASP, rate limiting, RBAC, LGPD)
- Estratégia de testes (unitários, E2E, Page Objects)
- Estratégia de IA (OpenAI, prompts, geração de flashcards)
- Deploy e variáveis de ambiente
- Convenções de código
- Gestão de estado (AppContext, ToastContext)
- Troubleshooting (erros comuns + soluções)
- Linguagem: técnica, onboarding-friendly para devs

### R05 — user-guide.md

Guia do usuário final contendo:

- O que é o NeuroLearn (proposta de valor clara, sem jargão)
- Como começar (passo a passo)
- Criando conta (Magic Link explicado de forma simples)
- Adicionando conteúdo à biblioteca
- Iniciando sessão de foco
- Usando flashcards
- Como revisar conteúdos
- Acompanhando retenção e progresso
- Evoluindo habilidades (Skill Tree)
- Como funciona a revisão espaçada (explicação humana, não técnica)
- Dicas de estudo baseadas em neurociência
- Perguntas frequentes
- UX Writing: linguagem acolhedora, humana, motivacional
- Sem termos técnicos desnecessários
- Tom: guia de produto moderno, não manual corporativo

### R06 — Reescrever gerar-doc.js

- Ler os 3 arquivos .md como fonte da verdade
- Converter markdown básico para DOCX usando biblioteca `docx`
- Gerar 3 arquivos DOCX individuais em suas respectivas subpastas
- Parser de markdown: h1, h2, h3, parágrafo, bullet, tabela, bold, code
- Manter paleta visual: purple (#7C3AED), cyan (#0891B2), dark (#1E293B)
- Scripts npm atualizados

### R07 — Reescrever gerar-pdf.js

- Ler os 3 arquivos .md como fonte da verdade
- Converter markdown básico para PDF usando biblioteca `pdfkit`
- Gerar 3 arquivos PDF individuais em suas respectivas subpastas
- Parser compartilhado (mesmo do gerar-doc.js ou módulo separado)
- Manter paleta visual e numeração de páginas

### R08 — Executar geradores e verificar saída

- `npm run generate-doc` → 3 DOCXs em docs/
- `npm run generate-pdf` → 3 PDFs em docs/
- Verificar que arquivos foram gerados sem erros

### R09 — Atualizar CLAUDE.md e progress.md

- CLAUDE.md: atualizar referências de documentação (nova estrutura)
- progress.md: registrar conclusão da DOC-01

---

## Critérios de Aceitação

- [ ] Nenhum PDF/DOCX na raiz do projeto
- [ ] `docs/` criada com 7 subpastas
- [ ] 3 arquivos .md existem e estão completos
- [ ] `npm run generate-doc` roda sem erros e gera 3 DOCXs
- [ ] `npm run generate-pdf` roda sem erros e gera 3 PDFs
- [ ] CLAUDE.md e progress.md atualizados
- [ ] Gate técnico passa: type-check + lint + build
