# LANDING-01 — Tasks

**Status:** Ready to execute  
**Data:** 2026-06-07

---

## T-01 — Database: migration waitlist [independente]

**O que:** Criar tabela `waitlist` no Supabase via MCP  
**Reqs:** L-17  
**Done when:** Tabela existe, RLS INSERT anon OK, SELECT bloqueado

## T-02 — Validação: waitlistSchema [independente]

**O que:** Adicionar `waitlistSchema` em `src/lib/validation/schemas.ts`  
**Reqs:** L-10.2  
**Done when:** Schema com name (min 2) + email (válido); teste unitário passando

## T-03 — API route: POST /api/waitlist [depende T-01, T-02]

**O que:** Criar `src/app/api/waitlist/route.ts` com rate limit + insert Supabase  
**Reqs:** L-10.3, L-10.6  
**Done when:** POST retorna 201 (sucesso), 409 (email duplicado), 429 (rate limit), 422 (inválido)

## T-04 — LandingNavbar [independente]

**O que:** `src/modules/landing/layout/LandingNavbar.tsx` — logo + CTA Entrar + sticky blur  
**Reqs:** L-11  
**Done when:** Sticky, blur ao scroll, mobile ok

## T-05 — HeroSection [independente]

**O que:** `src/modules/landing/sections/HeroSection.tsx`  
**Reqs:** L-02  
**Done when:** Headline, subheadline, 2 CTAs, badge, gradiente animado

## T-06 — ProblemSection [independente]

**O que:** `src/modules/landing/sections/ProblemSection.tsx` — 4 pain points  
**Reqs:** L-03  
**Done when:** 4 cards visuais + copy de transição

## T-07 — CoreLoopSection [independente]

**O que:** `src/modules/landing/sections/CoreLoopSection.tsx` — 6 etapas  
**Reqs:** L-04  
**Done when:** 6 steps com ícone + texto + conector visual

## T-08 — ScienceSection [independente]

**O que:** `src/modules/landing/sections/ScienceSection.tsx` — 4 conceitos  
**Reqs:** L-05  
**Done when:** 4 cards científicos, linguagem simples

## T-09 — TeacherModeSection [independente]

**O que:** `src/modules/landing/sections/TeacherModeSection.tsx`  
**Reqs:** L-06  
**Done when:** Headline forte + explicação + mockup CSS do fluxo

## T-10 — DashboardMockupSection [independente]

**O que:** `src/modules/landing/sections/DashboardMockupSection.tsx` — mockup CSS  
**Reqs:** L-07  
**Done when:** Mockup visual com retenção %, risco, skills, streak

## T-11 — FeaturesSection [independente]

**O que:** `src/modules/landing/sections/FeaturesSection.tsx` — grid 4 features  
**Reqs:** L-08  
**Done when:** 4 cards com ícone + nome + frase

## T-12 — SocialProofSection [independente]

**O que:** `src/modules/landing/sections/SocialProofSection.tsx` — placeholder elegante  
**Reqs:** L-09  
**Done when:** Seção com slots de depoimentos + contador beta users

## T-13 — WaitlistSection [depende T-03]

**O que:** `src/modules/landing/sections/WaitlistSection.tsx` — formulário client component  
**Reqs:** L-10  
**Done when:** Form name+email, submit → API, toast sucesso/erro, loading state

## T-14 — LandingFooter [independente]

**O que:** `src/modules/landing/layout/LandingFooter.tsx`  
**Reqs:** L-12  
**Done when:** Logo + tagline + links + copyright

## T-15 — LandingPage orquestrador + page.tsx [depende T-04..T-14]

**O que:** `src/modules/landing/LandingPage.tsx` + atualizar `src/app/page.tsx`  
**Reqs:** L-01, L-13, L-14, L-15, L-16  
**Done when:** page.tsx verifica auth, metadata SEO, build passa, mobile ok

## T-16 — Testes [depende T-15]

**O que:** Playwright landing + unit waitlistSchema  
**Reqs:** L-18  
**Done when:** Playwright: landing renderiza + submit waitlist ok; unit: schema válido

---

## Ordem de execução

```
[P] T-01, T-02, T-04, T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-14  ← paralelo
     ↓
[P] T-03 (depende T-01+T-02)
     ↓
    T-13 (depende T-03)
     ↓
    T-15 (depende tudo)
     ↓
    T-16
```
