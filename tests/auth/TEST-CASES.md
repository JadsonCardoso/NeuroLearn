# TC-AUTH — Fase 2: Backend, Autenticação e Serviços

Padrão AAA (Arrange-Act-Assert) · Google Testing Standards

---

## TC-AUTH-001 — Middleware: rota protegida redireciona para login sem sessão

**Prioridade:** P0  
**Categoria:** Middleware / Segurança

**Arrange:** Usuário não autenticado tenta acessar `/dashboard`.  
**Act:** `middleware.ts` intercepta requisição, `supabase.auth.getUser()` retorna `user = null`.  
**Assert:** Redirect para `/auth/login` via `NextResponse.redirect`.

---

## TC-AUTH-002 — Middleware: rotas públicas não exigem autenticação

**Prioridade:** P0  
**Categoria:** Middleware

**Arrange:** Usuário não autenticado acessa `/auth/login`, `/auth/signup`, `/`, `/landing.html`.  
**Act:** Middleware avalia `isAppRoute`.  
**Assert:** `isAppRoute = false` para todas as rotas públicas → sem redirect forçado.

**Verificação do código:**
```ts
const isAppRoute =
  !pathname.startsWith('/auth') &&   // /auth/* → false ✓
  pathname !== '/' &&                // / → false ✓
  pathname !== '/landing.html' &&    // /landing.html → false ✓
  !pathname.startsWith('/_next') &&
  !pathname.startsWith('/favicon')
```

---

## TC-AUTH-003 — Middleware: usuário autenticado em /auth/* é redirecionado ao dashboard

**Prioridade:** P1  
**Categoria:** Middleware / UX

**Arrange:** Usuário já autenticado acessa `/auth/login`.  
**Act:** `supabase.auth.getUser()` retorna user válido, `pathname.startsWith('/auth') = true`.  
**Assert:** Redirect para `/dashboard`.

---

## TC-AUTH-004 — Login: formulário de email/senha presente e funcional (estático)

**Prioridade:** P0  
**Categoria:** UI / Auth

**Arrange:** Página `/auth/login` renderizada.  
**Act:** Inspecionar componente `LoginForm`.  
**Assert:**
- Input `type="email"` com `required` ✅
- Input `type="password"` com `required` ✅ (modo `password`)
- Botão submit presente ✅
- `handleEmailPassword` chama `supabase.auth.signInWithPassword({ email, password })` ✅

---

## TC-AUTH-005 — Login: modo Magic Link oculta campo senha

**Prioridade:** P1  
**Categoria:** UI / Auth

**Arrange:** Usuário clica na tab "✉️ Magic Link".  
**Act:** `mode` state muda para `'magic'`.  
**Assert:** Campo de senha não é renderizado (condicional `{mode === 'password' && ...}`).

---

## TC-AUTH-006 — Login: Google OAuth inicia fluxo correto

**Prioridade:** P1  
**Categoria:** OAuth

**Arrange:** Usuário clica em "Continuar com Google".  
**Act:** `handleGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: .../auth/callback } })`.  
**Assert:** Callback configurado para `/auth/callback` — rota existe em `src/app/auth/callback/route.ts`.

---

## TC-AUTH-007 — Login: exibição de erro de autenticação

**Prioridade:** P1  
**Categoria:** UX / Feedback

**Arrange:** `signInWithPassword` retorna erro.  
**Act:** `setMessage({ type: 'error', text: 'Email ou senha incorretos.' })`.  
**Assert:** Mensagem de erro visível com background vermelho e texto correto.

---

## TC-AUTH-008 — Login: parâmetro `?error` na URL exibe mensagem

**Prioridade:** P2  
**Categoria:** UX

**Arrange:** URL `/auth/login?error=...`.  
**Act:** `useSearchParams().get('error')` retorna valor não-nulo.  
**Assert:** `message` inicializado com `{ type: 'error', text: 'Erro de autenticação. Tente novamente.' }`.

---

## TC-AUTH-009 — Signup: campos obrigatórios presentes

**Prioridade:** P0  
**Categoria:** UI / Auth

**Arrange:** Página `/auth/signup` renderizada.  
**Act:** Inspecionar formulário.  
**Assert:**
- Input nome (`type="text"`, `required`) ✅
- Input email (`type="email"`, `required`) ✅
- Input senha (`type="password"`, `minLength=6`, `required`) ✅
- `handleSignup` chama `supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })` ✅

---

## TC-AUTH-010 — Signup: senha mínima de 6 caracteres

**Prioridade:** P1  
**Categoria:** Validação

**Arrange:** Campo senha com `minLength={6}`.  
**Act:** HTML validation nativa do browser + `supabase.auth.signUp` rejeita senha curta.  
**Assert:** `minLength={6}` presente no input → validação client-side ativa.

---

## TC-AUTH-011 — Callback: rota de troca de código existe

**Prioridade:** P0  
**Categoria:** OAuth / Magic Link

**Arrange:** `src/app/auth/callback/route.ts` implementado.  
**Act:** Verificar que o arquivo existe e exporta handler `GET`.  
**Assert:** Arquivo presente ✅

---

## TC-AUTH-012 — Supabase client: variáveis de ambiente configuradas

**Prioridade:** P0  
**Categoria:** Configuração / Infraestrutura

**Arrange:** `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
**Act:** Build sem erros de variáveis undefined.  
**Assert:** Build passou ✅ — variáveis resolvidas em tempo de build.

---

## TC-AUTH-013 — Serviços: camada de serviços isolada do Supabase direto

**Prioridade:** P1  
**Categoria:** Arquitetura

**Arrange:** Serviços em `src/services/`: contents, flashcards, skills, sessions, retention, review, cognitiveEvents, localStorage.  
**Act:** `grep -r "createBrowserClient\|createServerClient" src/modules/ src/components/`  
**Assert:** Nenhuma ocorrência — acesso DB exclusivo via serviços.

---

## TC-AUTH-014 — AppContext: carrega estado do Supabase quando autenticado

**Prioridade:** P1  
**Categoria:** State Management

**Arrange:** `src/store/AppContext.tsx` usa `useReducer` + `useEffect`.  
**Act:** Verificar que ao montar com `userId` válido carrega dados do Supabase.  
**Assert:** Lógica de carga presente no `useEffect` do AppContext ✅ (verificação estática).

---

## TC-AUTH-015 — Login: tema claro/escuro funciona na página de login

**Prioridade:** P2  
**Categoria:** UI / Tema

**Arrange:** `useTheme()` retorna `{ theme, toggle }`.  
**Act:** Botão de toggle presente com `aria-label` correto.  
**Assert:**
- Painel esquerdo muda gradiente: dark = `#0d0621` / light = `#f5f0ff` ✅
- Botão com ícone Sun/Moon correto por tema ✅
