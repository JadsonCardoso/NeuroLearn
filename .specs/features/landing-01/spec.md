# LANDING-01 — Refatoração Estratégica da Landing Page

**Status:** Draft  
**Fase:** Specify  
**Complexidade:** Large  
**Data:** 2026-06-07

---

## Contexto

Atualmente a rota raiz `/` redireciona usuários não autenticados para `/auth/login`. Não existe landing page dedicada. O objetivo é criar uma landing page premium, orientada à conversão, que:

- Explique o produto em <5 segundos
- Converta visitantes em beta users (waitlist)
- Reflita o posicionamento: "Sistema Operacional de Aprendizagem"
- Headline: **"Aprenda sem esquecer."**

---

## Arquitetura de Rota

| Rota                  | Comportamento                         |
| --------------------- | ------------------------------------- |
| `/` (não autenticado) | Renderiza Landing Page                |
| `/` (autenticado)     | Redirect → `/dashboard`               |
| `/auth/login`         | Permanece igual (formulário de login) |

O `src/app/page.tsx` passa a renderizar o componente `<LandingPage />` para usuários não autenticados (server component + verificação Supabase).

---

## Requisitos

### L-01 — Rota e Layout

- **L-01.1** `src/app/page.tsx` verifica autenticação: autenticado → redirect `/dashboard`, não autenticado → renderiza `<LandingPage />`
- **L-01.2** A landing NÃO usa o layout com Sidebar (já é isolada — `page.tsx` está fora do grupo `(app)`)
- **L-01.3** Próprio layout visual: navbar minimalista + footer

### L-02 — Hero Section

- **L-02.1** Headline: `"Aprenda sem esquecer."`
- **L-02.2** Subheadline: explicação de transformação em 1-2 frases
- **L-02.3** CTA primário: `"Entrar para o Beta"` → ancora para seção waitlist
- **L-02.4** CTA secundário: `"Conhecer o Método"` → ancora para seção Core Loop
- **L-02.5** Background com gradiente sutil animado (CSS, sem JS)
- **L-02.6** Badge de social proof: `"Baseado em neurociência"` / `"Beta gratuito"`

### L-03 — Seção "O Problema"

- **L-03.1** 4 pain points visuais: lê muito / esquece rápido / acumula cursos / aprende passivamente
- **L-03.2** Transição emocional: problema → solução
- **L-03.3** Copy: `"O problema não é acesso ao conhecimento. É transformar informação em memória real."`

### L-04 — Core Loop ("Como Funciona")

- **L-04.1** 6 etapas: Consumir → Recordar → Explicar → Aplicar → Revisar → Consolidar
- **L-04.2** Cada etapa: ícone + título + microexplicação (1 linha)
- **L-04.3** Indicador visual de progressão entre etapas

### L-05 — Base Científica

- **L-05.1** 4 conceitos: Curva do Esquecimento / Revisão Espaçada / Aprendizado Ativo / Efeito de Ensinar
- **L-05.2** Cada conceito: ícone + título bold + 2-3 linhas simples
- **L-05.3** Linguagem: simples, visual, sem jargão acadêmico

### L-06 — Modo Professor

- **L-06.1** Seção destacada: `"Você aprende ensinando."`
- **L-06.2** Explicação do mecanismo: explicação ativa → prática → retenção → consolidação
- **L-06.3** Mockup visual CSS do fluxo de ensino (cards animados)

### L-07 — Dashboard Cognitivo (mockup)

- **L-07.1** Mockup CSS de dashboard mostrando: retenção %, risco de esquecimento, habilidades, streak
- **L-07.2** Transmitir: `"Esse produto mede aprendizado real."`
- **L-07.3** Dados simulados, visualmente fiéis ao dashboard real

### L-08 — Features Diferenciais

- **L-08.1** Grid 2×2 ou 3-col com features: SM-2 Inteligente / Active Learning / Cognitive Score / Skill Tree
- **L-08.2** Cada card: ícone + nome + 1 frase de impacto

### L-09 — Social Proof (placeholder elegante)

- **L-09.1** Seção com slots para depoimentos (estado vazio premium, não cheap placeholder)
- **L-09.2** Contador de beta users: `"Junte-se a X pessoas aprendendo diferente"` (hardcoded inicialmente)

### L-10 — Waitlist / Beta Access

- **L-10.1** Formulário: Nome + Email
- **L-10.2** Validação Zod + React Hook Form (padrão do projeto)
- **L-10.3** API route `POST /api/waitlist` salva em tabela Supabase `waitlist`
- **L-10.4** Toast de sucesso elegante após submit
- **L-10.5** Estado de loading no botão (`LoadingButton` existente)
- **L-10.6** Proteção: rate limit por IP (usar `checkRateLimit` existente em `src/lib/security/rateLimit.ts`)

### L-11 — Navbar

- **L-11.1** Logo NeuroLearn (ícone + nome) à esquerda
- **L-11.2** CTA `"Entrar"` → `/auth/login` à direita
- **L-11.3** Sticky com blur backdrop ao scroll
- **L-11.4** Mobile: versão simplificada (logo + botão Entrar)

### L-12 — Footer

- **L-12.1** Logo + tagline
- **L-12.2** Links: Política de Privacidade / Entrar
- **L-12.3** Copyright

### L-13 — SEO e Metadata

- **L-13.1** `metadata` export em `page.tsx`: title, description, keywords
- **L-13.2** OpenGraph: og:title, og:description, og:image (placeholder)
- **L-13.3** Twitter Cards
- **L-13.4** Semantic HTML correto (h1 único, h2 por seção, etc.)

### L-14 — Performance

- **L-14.1** Zero dependências externas de animação (CSS puro)
- **L-14.2** Imagens: apenas SVG inline ou CSS — nenhuma imagem raster
- **L-14.3** Server Component onde possível; Client Component apenas no formulário waitlist e navbar scroll

### L-15 — Acessibilidade

- **L-15.1** Contraste WCAG AA em todos os textos
- **L-15.2** `aria-label` em elementos interativos
- **L-15.3** Foco visível em CTAs e links
- **L-15.4** Navegação por teclado funcional

### L-16 — Mobile-First

- **L-16.1** Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- **L-16.2** Hero legível em 375px sem scroll horizontal
- **L-16.3** Formulário waitlist confortável em mobile

### L-17 — Database (Supabase)

- **L-17.1** Tabela `waitlist`: `id uuid PK`, `name text`, `email text unique`, `created_at timestamptz`
- **L-17.2** RLS: INSERT público (anon), SELECT bloqueado (apenas service_role)
- **L-17.3** Migration via `supabase/migrations/` ou MCP apply_migration

### L-18 — Testes

- **L-18.1** Teste Playwright: renderização da landing, submit do formulário waitlist (sucesso + email duplicado)
- **L-18.2** Teste unitário: schema Zod do waitlist
- **L-18.3** Nenhuma regressão nos testes existentes

---

## Decisões em Aberto

> Preciso de confirmação do usuário antes de avançar para Design + Tasks:

**D-01 — Supabase Waitlist:**  
Dados da waitlist vão para tabela no Supabase (`waitlist`). Confirmar.

**D-02 — Mockups visuais:**  
Dashboard cognitivo e Modo Professor serão CSS puro (sem imagens externas). Confirmar ou prefere screenshots reais da plataforma?

**D-03 — Animações:**  
CSS animations nativas (sem Framer Motion) para manter bundle leve. Confirmar.

**D-04 — Landing acessível a usuários autenticados:**  
Usuário autenticado que acessa `/` → redirect para `/dashboard` (não vê a landing). Confirmar ou prefere que possa ver a landing também?

---

## Componentes a criar

```
src/
├── app/
│   ├── page.tsx                          ← Atualizar (verifica auth → landing ou dashboard)
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts                  ← POST /api/waitlist
│   └── (landing pode ser inline em page.tsx ou em módulo separado)
├── modules/
│   └── landing/
│       ├── LandingPage.tsx               ← Orquestrador (Server Component)
│       ├── sections/
│       │   ├── HeroSection.tsx
│       │   ├── ProblemSection.tsx
│       │   ├── CoreLoopSection.tsx
│       │   ├── ScienceSection.tsx
│       │   ├── TeacherModeSection.tsx
│       │   ├── DashboardMockupSection.tsx
│       │   ├── FeaturesSection.tsx
│       │   ├── SocialProofSection.tsx
│       │   └── WaitlistSection.tsx       ← Client Component (form)
│       └── layout/
│           ├── LandingNavbar.tsx         ← Client Component (scroll)
│           └── LandingFooter.tsx
├── lib/
│   └── validation/
│       └── schemas.ts                    ← Adicionar waitlistSchema
supabase/
└── migrations/
    └── YYYYMMDD_create_waitlist.sql
```

---

## Gate de Qualidade

- [ ] `npm run type-check` — zero erros
- [ ] `npm run lint` — zero warnings
- [ ] `npm run test:unit` — todos passando (incluindo waitlistSchema)
- [ ] `npm run build` — build limpo
- [ ] Playwright: landing renderiza + waitlist submit funciona
- [ ] Mobile 375px: sem scroll horizontal, legível
- [ ] Supabase RLS: INSERT anon OK, SELECT bloqueado
