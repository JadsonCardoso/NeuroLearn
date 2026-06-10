# Feature Spec — SEO e Blog Educacional

**ID:** F-070
**Status:** 🔜 Planned (v2.0)
**Complexidade:** Média (SEO) / Grande (Blog)
**Depende de:** F-020 (migração Next.js — SSR necessário)

## Overview

Estratégia de crescimento orgânico via SEO técnico e conteúdo educacional evergreen sobre neurociência, memória e aprendizagem eficiente. O blog posiciona o NeuroLearn como autoridade no tema.

---

## Requirements

### R-070-01 — SEO técnico base (v2.0)

**Meta tags dinâmicas (Next.js Metadata API):**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'NeuroLearn', template: '%s | NeuroLearn' },
  description:
    'Plataforma de aprendizagem baseada em neurociência. Revisão espaçada, Modo Professor e IA para consolidar memória de longo prazo.',
  keywords: [
    'revisão espaçada',
    'spaced repetition',
    'neurociência',
    'memória',
    'flashcards',
    'SM-2',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://neurolearn.app',
    siteName: 'NeuroLearn',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://neurolearn.app' },
}
```

**Sitemap automático:**

```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://neurolearn.app', changeFrequency: 'weekly', priority: 1 },
    { url: 'https://neurolearn.app/blog', changeFrequency: 'daily', priority: 0.9 },
    // + posts do blog gerados dinamicamente
  ]
}
```

**Done when:** Google Search Console indexa as páginas principais sem erros de crawl.

---

### R-070-02 — Landing page com SSG

**Rota:** `app/(public)/page.tsx`

**Seções obrigatórias (baseadas na landing.html atual):**

- Hero com headline + CTA
- Social proof / métricas
- Como funciona (Core Loop)
- Base científica (Ebbinghaus + Glasser + SM-2)
- Funcionalidades
- Depoimentos
- CTA final

**Performance:**

- Renderizado com SSG (static generation) — zero JS no servidor
- Imagens com `next/image` (WebP automático + lazy loading)
- Fontes com `next/font` (sem flash, preload automático)
- LCP < 1.5s (meta agressiva para página de conversão)

**Done when:** Lighthouse score ≥ 95 em Performance + SEO na landing page.

---

### R-070-03 — Blog educacional

**Tecnologia:** MDX (Markdown + JSX) com Next.js Content Layer ou Contentlayer2

**Estrutura de conteúdo:**

```
content/
└── blog/
    ├── como-revisar-flashcards-corretamente.mdx
    ├── curva-do-esquecimento-ebbinghaus.mdx
    ├── piramide-de-glasser-aprendizagem-ativa.mdx
    └── algoritmo-sm2-guia-completo.mdx
```

**Schema de post:**

```typescript
interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  readingTime: number
  content: string
  ogImage?: string
}
```

**Rota:** `/blog/[slug]` com SSG

**Done when:** Post com SSG renderiza sem JavaScript; Google indexa o conteúdo completo.

---

### R-070-04 — Pilares de conteúdo (estratégia editorial)

**Cluster 1: Ciência da Memória**

- Curva do Esquecimento de Ebbinghaus: o guia completo
- Por que você esquece o que estudou em 24 horas
- Como o cérebro consolida memória durante o sono
- Neuroplasticidade e aprendizagem de adultos

**Cluster 2: Técnicas de Estudo**

- Revisão espaçada: como funciona e por que é superior
- Técnica Feynman: aprenda ensinando
- Active Recall vs. Releitura: o que a ciência diz
- Como criar flashcards eficientes (não triviais)

**Cluster 3: Produtividade Cognitiva**

- Deep Work e fluxo cognitivo: como criar sessões de foco
- Por que maratonas de estudo não funcionam
- Como manter consistência nos estudos
- Gestão do conhecimento para profissionais

**Cluster 4: NeuroLearn + SM-2**

- O que é o algoritmo SM-2 e como ele funciona
- Guia completo do NeuroLearn para iniciantes
- Como criar seus primeiros 50 flashcards
- Do livro ao domínio: o fluxo completo

**Meta de publicação:** 2 posts/semana nos primeiros 3 meses

**Done when:** 20 posts publicados; tráfego orgânico de 500 visitas/mês após 90 dias.

---

### R-070-05 — Structured Data (JSON-LD)

```typescript
// Para páginas do blog:
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  datePublished: post.date,
  author: { '@type': 'Person', name: post.author },
  publisher: { '@type': 'Organization', name: 'NeuroLearn' },
  description: post.description,
}
```

**Done when:** Rich snippets aparecem no Google Search para posts do blog.

---

## KPIs de SEO

| Métrica                         | Meta 3 meses | Meta 6 meses |
| ------------------------------- | ------------ | ------------ |
| Artigos indexados               | 20           | 50           |
| Impressões/mês (Search Console) | 10.000       | 50.000       |
| Cliques orgânicos/mês           | 500          | 5.000        |
| Posição média keywords-alvo     | < 20         | < 10         |
| Core Web Vitals (Good)          | 100% landing | 100% blog    |

## Não inclui

- Conteúdo em inglês (v2.1)
- Newsletter / RSS (v2.0)
- Comunidade / fórum (v3.0)
