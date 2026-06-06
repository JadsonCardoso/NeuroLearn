# TC-LAND — Landing Page

Padrão AAA (Arrange-Act-Assert) · Google Testing Standards

---

## TC-LAND-001 — Nenhum link aponta para `index.html`

**Prioridade:** P0  
**Categoria:** Links / Navegação

**Arrange:** `landing.html` atualizado com rotas Next.js.  
**Act:** `grep "index.html" landing.html`  
**Assert:** Zero ocorrências.

---

## TC-LAND-002 — Botão nav "Abrir App" aponta para `/auth/login`

**Prioridade:** P0  
**Categoria:** Links / Navegação

**Arrange:** Navbar da landing page.  
**Act:** `grep 'href="/auth/login"' landing.html`  
**Assert:** Ao menos 1 ocorrência com texto relacionado a login/abrir app.

---

## TC-LAND-003 — Hero CTA aponta para `/auth/signup`

**Prioridade:** P0  
**Categoria:** Links / Conversão

**Arrange:** Seção hero da landing page.  
**Act:** `grep '/auth/signup' landing.html`  
**Assert:** Ao menos 1 ocorrência — botão de CTA primário.

---

## TC-LAND-004 — Footer: links de produto apontam para rotas corretas

**Prioridade:** P1  
**Categoria:** Links / Footer

**Arrange:** Seção footer "PRODUTO".  
**Act:** `grep -E '"/dashboard"|"/library"|"/review"|"/skills"' landing.html`  
**Assert:** Todos os 4 links corretos presentes.

---

## TC-LAND-005 — Nota CTA não menciona "Arquivo HTML"

**Prioridade:** P2  
**Categoria:** Conteúdo

**Arrange:** Parágrafo de nota abaixo do CTA principal.  
**Act:** `grep "Arquivo HTML" landing.html`  
**Assert:** Zero ocorrências — texto atualizado para a versão web.

---

## TC-LAND-006 — `public/landing.html` existe (serving estático)

**Prioridade:** P0  
**Categoria:** Deploy / Infra

**Arrange:** Next.js serve arquivos da pasta `public/` na raiz.  
**Act:** Verificar existência de `public/landing.html`.  
**Assert:** Arquivo presente.

---

## TC-LAND-007 — Rota raiz `/` redireciona para `/landing.html`

**Prioridade:** P0  
**Categoria:** Routing

**Arrange:** `src/app/page.tsx` com `redirect('/landing.html')`.  
**Act:** Ler arquivo.  
**Assert:** `redirect('/landing.html')` presente.

---

## TC-LAND-008 — Middleware permite `/landing.html` sem autenticação

**Prioridade:** P0  
**Categoria:** Segurança / Acesso

**Arrange:** `middleware.ts` com `isAppRoute`.  
**Act:** Verificar condição `pathname !== '/landing.html'` presente.  
**Assert:** `/landing.html` excluído de `isAppRoute` → acesso público garantido.
