# DOC-01 — Tasks

**Status:** Ready to execute  
**Ordem de execução:** T-01/T-02 em paralelo → T-03/T-04/T-05 → T-06/T-07 → T-08 → T-09

---

## T-01 — Criar estrutura docs/ [P]

**O quê:** Criar `docs/` com 7 subpastas  
**Onde:** Raiz do projeto  
**Depende de:** —  
**Feito quando:** `docs/project-status/`, `docs/technical-documentation/`, `docs/user-guide/`, `docs/architecture/`, `docs/qa/`, `docs/security/`, `docs/ai/` existem

---

## T-02 — Remover arquivos antigos [P]

**O quê:** Deletar os 3 arquivos obsoletos da raiz  
**Onde:** `NeuroLearn-Documentacao.docx`, `NeuroLearn-Status-Projeto.pdf`, `NeuroLearn-Documentacao-Tecnica.pdf`  
**Depende de:** —  
**Feito quando:** Nenhum PDF/DOCX na raiz

---

## T-03 — Escrever project-status.md

**O quê:** Documento de status do projeto (linguagem técnica, direta)  
**Onde:** `docs/project-status/project-status.md`  
**Depende de:** T-01  
**Feito quando:** Arquivo existe com todas as seções do R03

---

## T-04 — Escrever technical-documentation.md

**O quê:** Documentação técnica completa (onboarding de devs + IA agents)  
**Onde:** `docs/technical-documentation/technical-documentation.md`  
**Depende de:** T-01  
**Feito quando:** Arquivo existe com todas as seções do R04

---

## T-05 — Escrever user-guide.md

**O quê:** Guia do usuário final com UX writing acolhedor  
**Onde:** `docs/user-guide/user-guide.md`  
**Depende de:** T-01  
**Feito quando:** Arquivo existe com todas as seções do R05

---

## T-06 — Reescrever gerar-doc.js

**O quê:** Script que lê os 3 .md e gera 3 DOCXs em suas respectivas subpastas  
**Onde:** `gerar-doc.js` (raiz)  
**Depende de:** T-03, T-04, T-05  
**Feito quando:** `npm run generate-doc` gera 3 arquivos .docx em docs/ sem erros

---

## T-07 — Reescrever gerar-pdf.js

**O quê:** Script que lê os 3 .md e gera 3 PDFs em suas respectivas subpastas  
**Onde:** `gerar-pdf.js` (raiz)  
**Depende de:** T-03, T-04, T-05  
**Feito quando:** `npm run generate-pdf` gera 3 arquivos .pdf em docs/ sem erros

---

## T-08 — Executar geradores e verificar saída

**O quê:** Rodar ambos os scripts e confirmar que os 6 arquivos foram gerados  
**Onde:** Terminal  
**Depende de:** T-06, T-07  
**Feito quando:** 6 arquivos existem em docs/ (3 docx + 3 pdf)

---

## T-09 — Atualizar CLAUDE.md e progress.md

**O quê:** Registrar nova estrutura de docs, atualizar comandos de geração  
**Onde:** `CLAUDE.md`, `progress.md`  
**Depende de:** T-08  
**Feito quando:** Ambos os arquivos refletem a nova estrutura DOC-01
