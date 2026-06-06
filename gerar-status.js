const PDFDocument = require("pdfkit");
const fs = require("fs");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 55, bottom: 55, left: 55, right: 55 },
  info: {
    Title: "NeuroLearn — Status do Projeto & Próximos Passos",
    Author: "NeuroLearn",
    Subject: "Spec-Driven Overview — O que foi feito e o que vem a seguir",
  },
});

const out = fs.createWriteStream("NeuroLearn-Status-Projeto.pdf");
doc.pipe(out);

// ── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  purple:      "#7C3AED",
  purpleL:     "#A78BFA",
  purpleXL:    "#EDE9FE",
  cyan:        "#0891B2",
  cyanL:       "#06B6D4",
  cyanXL:      "#ECFEFF",
  green:       "#059669",
  greenXL:     "#F0FDF4",
  orange:      "#D97706",
  orangeXL:    "#FFFBEB",
  red:         "#DC2626",
  redXL:       "#FFF5F5",
  yellow:      "#CA8A04",
  dark:        "#1E293B",
  mid:         "#475569",
  muted:       "#94A3B8",
  white:       "#FFFFFF",
  border:      "#E2E8F0",
  bg:          "#F8FAFC",
  bgCard:      "#F1F5F9",
};

const W = doc.page.width - 110;

// ── Helpers ──────────────────────────────────────────────────────────────────
const PG = () => doc.addPage();

function pageNum(n) {
  const y = doc.page.height - 38;
  doc.moveTo(55, y - 6).lineTo(55 + W, y - 6).strokeColor(C.border).lineWidth(0.5).stroke();
  doc.fillColor(C.muted).font("Helvetica").fontSize(8)
     .text("NeuroLearn — Status do Projeto & Próximos Passos", 55, y, { lineBreak: false });
  doc.fillColor(C.muted).fontSize(8)
     .text(`Página ${n}`, 55, y, { width: W, align: "right" });
}

function gap(n = 1) { doc.moveDown(n * 0.22); }

function rule(color = C.border) {
  doc.moveTo(55, doc.y).lineTo(55 + W, doc.y).strokeColor(color).lineWidth(0.8).stroke();
  doc.moveDown(0.3);
}

function h1(text, color = C.purple) {
  if (doc.y > doc.page.height - 140) PG();
  doc.moveDown(0.5);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(15).text(text, 55, doc.y);
  doc.moveDown(0.1);
  rule(color);
}

function h2(text, color = C.dark) {
  if (doc.y > doc.page.height - 110) PG();
  doc.moveDown(0.4);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(11.5).text(text, 55, doc.y);
  doc.moveDown(0.18);
}

function h3(text, color = C.cyan) {
  if (doc.y > doc.page.height - 90) PG();
  doc.moveDown(0.28);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(10).text(text, 55, doc.y);
  doc.moveDown(0.14);
}

function body(text, indent = 0) {
  doc.fillColor(C.mid).font("Helvetica").fontSize(9.5)
     .text(text, 55 + indent, doc.y, { width: W - indent, lineGap: 1.5 });
  doc.moveDown(0.18);
}

function li(text, indent = 14, color = C.purple) {
  const y = doc.y;
  doc.fillColor(color).font("Helvetica-Bold").fontSize(9.5).text("•", 55 + indent - 10, y, { lineBreak: false });
  doc.fillColor(C.mid).font("Helvetica").fontSize(9.5)
     .text(text, 55 + indent, y, { width: W - indent, lineGap: 1.2 });
  doc.moveDown(0.15);
}

function num(n, text, indent = 14) {
  const y = doc.y;
  doc.fillColor(C.purple).font("Helvetica-Bold").fontSize(9.5).text(`${n}.`, 55 + indent - 12, y, { lineBreak: false });
  doc.fillColor(C.mid).font("Helvetica").fontSize(9.5)
     .text(text, 55 + indent, y, { width: W - indent, lineGap: 1.2 });
  doc.moveDown(0.15);
}

function callout(icon, title, text, titleColor, bg) {
  if (doc.y > doc.page.height - 90) PG();
  const y = doc.y;
  const th = doc.heightOfString(text, { width: W - 26, fontSize: 9.5 }) + 4;
  const total = th + 28;
  doc.roundedRect(55, y, W, total, 5).fillColor(bg).fill();
  doc.moveTo(55, y).lineTo(55, y + total).strokeColor(titleColor).lineWidth(3).stroke();
  doc.fillColor(titleColor).font("Helvetica-Bold").fontSize(9.5)
     .text(`${icon}  ${title}`, 68, y + 8, { lineBreak: false });
  doc.fillColor(C.dark).font("Helvetica").fontSize(9.5)
     .text(text, 68, y + 22, { width: W - 26 });
  doc.y = y + total + 8;
}

function table(headers, rows, colW) {
  if (doc.y > doc.page.height - 80) PG();
  const rH = 19; const pad = 6;
  const totalW = colW.reduce((a, b) => a + b, 0);
  const startY = doc.y;
  // header
  doc.rect(55, startY, totalW, rH).fillColor(C.purple).fill();
  let cx = 55;
  headers.forEach((h, i) => {
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
       .text(h, cx + pad, startY + 5, { width: colW[i] - pad * 2, lineBreak: false });
    cx += colW[i];
  });
  // rows
  rows.forEach((row, ri) => {
    const ry = startY + rH + ri * rH;
    doc.rect(55, ry, totalW, rH).fillColor(ri % 2 === 0 ? C.bgCard : C.white).fill();
    doc.rect(55, ry, totalW, rH).strokeColor(C.border).lineWidth(0.4).stroke();
    let rx = 55;
    row.forEach((cell, ci) => {
      const isFirst = ci === 0;
      doc.fillColor(isFirst ? C.dark : C.mid)
         .font(isFirst ? "Helvetica-Bold" : "Helvetica").fontSize(8.5)
         .text(cell, rx + pad, ry + 5, { width: colW[ci] - pad * 2, lineBreak: false });
      rx += colW[ci];
    });
  });
  doc.y = startY + rH + rows.length * rH + 7;
}

function statusBadge(label, color, bg, x, y) {
  const pw = doc.widthOfString(label, { fontSize: 8 }) + 14;
  doc.roundedRect(x, y - 1, pw, 14, 4).fillColor(bg).fill();
  doc.fillColor(color).font("Helvetica-Bold").fontSize(8).text(label, x + 7, y + 2, { lineBreak: false });
  return pw;
}

function sectionDivider(number, title, subtitle) {
  if (doc.y > doc.page.height - 120) PG();
  doc.moveDown(0.6);
  const y = doc.y;
  doc.rect(55, y, W, 38).fillColor(C.purple).fill();
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(17)
     .text(number, 68, y + 9, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(12)
     .text(title, 55 + 36, y + 7, { lineBreak: false });
  doc.fillColor(C.purpleL).font("Helvetica").fontSize(9)
     .text(subtitle, 55 + 36, y + 23, { lineBreak: false });
  doc.y = y + 38 + 10;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPA
// ═══════════════════════════════════════════════════════════════════════════
// Fundo escuro
doc.rect(0, 0, doc.page.width, doc.page.height).fillColor("#080910").fill();

// Orb decorativo
doc.circle(doc.page.width - 60, 60, 220).fillOpacity(0.06).fillColor(C.purple).fill();
doc.circle(60, doc.page.height - 60, 160).fillOpacity(0.05).fillColor(C.cyan).fill();
doc.fillOpacity(1);

// Logo box
doc.roundedRect(55, 72, 48, 48, 10).fillColor(C.purple).fill();
doc.moveTo(65, 96).lineTo(65, 96); // placeholder brain icon visual
doc.fillColor(C.white).font("Helvetica-Bold").fontSize(24).text("N", 55, 84, { width: 48, align: "center", lineBreak: false });

// Títulos
doc.fillColor(C.white).font("Helvetica-Bold").fontSize(36).text("NeuroLearn", 115, 72);
doc.fillColor(C.purpleL).font("Helvetica").fontSize(14).text("Sistema Operacional de Aprendizagem", 115, 115);

// Linha decorativa
doc.moveTo(55, 140).lineTo(doc.page.width - 55, 140).strokeColor(C.purple).lineWidth(1.5).stroke();

// Título do doc
doc.fillColor(C.white).font("Helvetica-Bold").fontSize(20)
   .text("Status do Projeto & Próximos Passos", 55, 158, { width: W, align: "center" });
doc.fillColor(C.muted).font("Helvetica").fontSize(11)
   .text("Spec-Driven Overview — Gerado em " + new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), 55, 186, { width: W, align: "center" });

// 4 cards de destaque
const cards = [
  { icon: "✅", val: "v1.0", label: "Versão atual" },
  { icon: "📦", val: "8", label: "Módulos entregues" },
  { icon: "📋", val: "18", label: "Docs spec-driven" },
  { icon: "🎯", val: "11", label: "Concerns mapeados" },
];
const cW = (W - 18) / 4;
cards.forEach((c, i) => {
  const cx = 55 + i * (cW + 6);
  doc.roundedRect(cx, 222, cW, 62, 7).fillColor("#14151e").fill();
  doc.roundedRect(cx, 222, cW, 62, 7).strokeColor(C.purple).lineWidth(0.8).stroke();
  doc.fillColor(C.white).font("Helvetica").fontSize(18).text(c.icon, cx, 232, { width: cW, align: "center", lineBreak: false });
  doc.fillColor(C.purpleL).font("Helvetica-Bold").fontSize(14).text(c.val, cx, 252, { width: cW, align: "center", lineBreak: false });
  doc.fillColor(C.muted).font("Helvetica").fontSize(7.5).text(c.label, cx, 268, { width: cW, align: "center", lineBreak: false });
});

// Resumo do conteúdo
doc.fillColor(C.muted).font("Helvetica-Bold").fontSize(9).text("ESTE DOCUMENTO CONTÉM", 55, 310);
const summary = [
  "• O que foi construído no projeto (v1.0 completo)",
  "• Análise brownfield do codebase (stack, arquitetura, convenções)",
  "• 11 concerns técnicos priorizados por risco",
  "• Roadmap detalhado: v1.1 → v1.2 → v1.3 → v2.0",
  "• Próximos passos práticos com estimativas",
];
summary.forEach((s, i) => {
  doc.fillColor(C.white).font("Helvetica").fontSize(9.5).text(s, 55, 326 + i * 16, { lineBreak: false });
});

// Versão e data
doc.fillColor(C.muted).font("Helvetica").fontSize(8)
   .text(`v1.0  ·  Spec-Driven com tlc-spec-driven  ·  ${new Date().toLocaleDateString("pt-BR")}`, 55, doc.page.height - 50, { lineBreak: false });

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 2 — SUMÁRIO
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(2);

doc.fillColor(C.purple).font("Helvetica-Bold").fontSize(20).text("Sumário", 55, 55);
doc.moveDown(0.15); rule(C.purple); doc.moveDown(0.5);

const toc = [
  { n: "1", t: "O que foi construído",            sub: "v1.0 — todos os módulos entregues",           p: 3  },
  { n: "2", t: "Análise do Codebase (Brownfield)", sub: "Stack, arquitetura, convenções, estrutura",   p: 4  },
  { n: "3", t: "Concerns Técnicos",               sub: "11 riscos mapeados e priorizados",             p: 6  },
  { n: "4", t: "Documentação Spec-Driven",        sub: "18 documentos gerados em .specs/",             p: 8  },
  { n: "5", t: "Roadmap Completo",                sub: "v1.1 → v1.2 → v1.3 → v2.0",                  p: 9  },
  { n: "6", t: "Próximos Passos Práticos",        sub: "O que fazer primeiro e por quê",              p: 11 },
  { n: "7", t: "Decisões Técnicas Registradas",   sub: "6 decisões + idéias deferidas",               p: 12 },
];

toc.forEach(item => {
  const y = doc.y;
  doc.fillColor(C.purple).font("Helvetica-Bold").fontSize(11).text(`${item.n}`, 55, y, { lineBreak: false });
  doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(11).text(item.t, 72, y, { lineBreak: false });
  const tw = doc.widthOfString(item.t, { fontSize: 11 });
  const dotX = 72 + tw + 6;
  const dotEnd = 55 + W - 28;
  const dots = ".".repeat(Math.max(0, Math.floor((dotEnd - dotX) / 4.2)));
  doc.fillColor(C.border).font("Helvetica").fontSize(11).text(dots, dotX, y, { lineBreak: false, characterSpacing: 1 });
  doc.fillColor(C.purple).font("Helvetica-Bold").fontSize(11).text(String(item.p), 55 + W - 16, y, { lineBreak: false });
  doc.fillColor(C.muted).font("Helvetica").fontSize(8.5).text(item.sub, 72, y + 14);
  doc.moveDown(0.3);
});

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 3 — O QUE FOI CONSTRUÍDO
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(3);
sectionDivider("1", "O que foi construído", "v1.0 — MVP completo");

callout("🎯", "Produto entregue", "O NeuroLearn v1.0 é uma SPA (Single-Page Application) 100% client-side, sem backend, sem conta de usuário e sem instalação. Abre direto no navegador — o aluno só precisa abrir o index.html.", C.purple, C.purpleXL);
gap();

h2("Módulos implementados");
table(
  ["Módulo", "Componente React", "Status", "Base Científica"],
  [
    ["Dashboard",           "Dashboard()",  "✅ Done", "Ebbinghaus — curva do esquecimento"],
    ["Biblioteca",          "Library()",    "✅ Done", "Organização de conteúdos"],
    ["Sessão de Foco",      "Focus()",      "✅ Done", "Glasser — Pirâmide (90% retenção)"],
    ["Revisão Inteligente", "Review()",     "✅ Done", "SM-2 — Spaced Repetition"],
    ["Aprendizado Ativo",   "Active()",     "✅ Done", "Glasser — prática ativa (75-90%)"],
    ["Árvore de Habilidades","Skills()",   "✅ Done", "Skill Acquisition Theory"],
    ["Central de Ajuda",    "Help()",       "✅ Done", "Guia interativo com FAQ"],
    ["Dark/Light Mode",     "App() + CSS",  "✅ Done", "CSS Custom Properties"],
  ],
  [150, 120, 68, 162]
);

gap();
h2("Entregáveis complementares");
table(
  ["Entregável", "Arquivo", "Gerado com"],
  [
    ["Landing Page Marketing", "landing.html", "HTML/CSS/JS puro"],
    ["Documentação Word",      "NeuroLearn-Documentacao.docx", "node gerar-doc.js (docx npm)"],
    ["Documentação PDF Técnica","NeuroLearn-Documentacao-Tecnica.pdf", "node gerar-pdf.js (pdfkit npm)"],
    ["Spec-Driven Docs (18)",   ".specs/**/*.md", "tlc-spec-driven skill"],
    ["Este documento",          "NeuroLearn-Status-Projeto.pdf", "node gerar-status.js"],
  ],
  [145, 195, 160]
);

gap();
h2("Core Loop implementado");
body("O produto executa o ciclo completo de consolidação cognitiva:");
const loop = ["Consumir (Biblioteca + Sessão de Foco)","Recordar (Flashcards na Revisão)","Explicar (Modo Professor)","Aplicar (Aprendizado Ativo)","Revisar (SM-2 automático)","Consolidar (Árvore de Habilidades)"];
loop.forEach((s, i) => num(i + 1, s));

gap();
callout("📊", "North Star Metric", "Quantidade de habilidades consolidadas (nível ≥ 3) por usuário ativo — medindo capacidade real, não consumo de conteúdo.", C.green, C.greenXL);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 4–5 — ANÁLISE DO CODEBASE
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(4);
sectionDivider("2", "Análise do Codebase (Brownfield)", "Stack, Arquitetura, Convenções");

h2("Stack Tecnológica");
table(
  ["Camada", "Tecnologia", "Versão / Detalhe"],
  [
    ["Framework UI",   "React",              "18.x via CDN (unpkg.com)"],
    ["Linguagem",      "JavaScript + JSX",   "Transpilado em runtime pelo Babel Standalone"],
    ["Transpiler",     "@babel/standalone",  "Runtime — sem build step"],
    ["Estilização",    "CSS Custom Props",   "Inline styles + :root tokens dark/light"],
    ["State Mgmt",     "useState (local)",   "Prop drilling — sem Redux/Zustand"],
    ["Persistência",   "localStorage",       "Chave nl_v2 (dados) + nl_theme (tema)"],
    ["Docs offline",   "docx + pdfkit",      "Scripts Node.js independentes"],
    ["Dev server",     "npx serve",          "Porta 3000 via .claude/launch.json"],
  ],
  [130, 140, 230]
);

gap();
h2("Arquitetura — Padrões identificados");

h3("Page-as-Component Router");
body("Roteamento simples via state `page` no componente App. Sem React Router. Renderização condicional: `{page==='review' && <Review .../>}`");

h3("Single Global State + Prop Drilling");
body("Um único objeto `data` descendo de App para todas as páginas. `setData` passado como prop para escrita. Funciona bem para a escala atual (~8 páginas).");

h3("localStorage Auto-Sync");
body("useEffect com dependência [data] persiste o estado completo a cada mudança. Silent catch em load() garante que dados corrompidos não travam o app.");

h3("CSS Tokens para Temas");
body("Troca de tema sem re-render React: document.documentElement.setAttribute('data-theme', theme) atualiza os CSS custom properties globalmente.");

gap();
h2("Estrutura do arquivo principal (index.html ~1.650 linhas)");
table(
  ["Bloco", "Linhas (aprox.)", "Conteúdo"],
  [
    ["CSS Global + Tokens", "1 – 50",     "Reset, classes reutilizáveis, vars dark/light"],
    ["Utilitários",         "51 – 90",    "sm2, calcRetention, isDue, addDays, uid"],
    ["Storage + SEED",      "91 – 120",   "Dados iniciais, load(), save()"],
    ["Icons (I.*)",         "121 – 145",  "SVGs inline como arrow functions React"],
    ["Ring",                "146 – 152",  "Anel SVG de retenção reutilizável"],
    ["Dashboard",           "153 – 346",  "Página home com métricas"],
    ["Library",             "347 – 446",  "Gestão de conteúdos"],
    ["Focus",               "447 – 672",  "Sessão Pomodoro (3 fases)"],
    ["Review",              "673 – 805",  "Flashcards SM-2"],
    ["Active",              "806 – 945",  "Aprendizado ativo (3 modos)"],
    ["Skills",              "946 – 1144", "Árvore de habilidades"],
    ["Help",                "1145– 1380", "Central de ajuda + FAQ"],
    ["App + Bootstrap",     "1381– fim",  "Orquestrador, sidebar, theme toggle"],
  ],
  [145, 112, 243]
);

PG();
pageNum(5);
h2("Convenções de código observadas");
table(
  ["Elemento", "Convenção", "Exemplo"],
  [
    ["Componentes React",  "PascalCase",           "Dashboard, Library, Focus, Review"],
    ["Funções utilitárias","camelCase + verbo",    "calcRetention, addDays, isDue"],
    ["Constantes globais", "UPPER_SNAKE_CASE",     "SEED, MODES, PROMPTS, CATS"],
    ["Object de ícones",   "I.* (single letter)",  "I.Brain, I.Book, I.Timer"],
    ["Props de callback",  "Verbo curto",          "nav, onDone, onBack, startReview"],
    ["Cores em CSS",       "CSS custom properties","var(--bg), var(--text), var(--card)"],
    ["Comentários seção",  "Linha decorativa",     "// ── Dashboard ──────────────"],
    ["Error handling",     "Silent try/catch",     "load() e save() em localStorage"],
  ],
  [140, 155, 205]
);

gap();
h2("Algoritmos científicos implementados");

h3("SM-2 — Revisão Espaçada");
body("Função: sm2(quality, ef=2.5, interval=1, reps=0)");
body("• Quality 1-2 (Esqueci/Difícil): reinicia para interval=1, reps=0", 14);
body("• Quality 3+ (Bom/Fácil): interval cresce exponencialmente via EF", 14);
body("• EF = max(1.3,  ef + 0.1 − (5−q) × (0.08 + (5−q) × 0.02))", 14);
body("• Sequência típica: 1d → 6d → 13d → 21d → 34d...", 14);

gap(0.5);
h3("Ebbinghaus — Cálculo de Retenção");
body("Função: calcRetention(card)");
body("• Fórmula: R = 100 × e^(−t / (interval × EF))", 14);
body("• t = dias desde lastReview; stability = interval × EF", 14);
body("• Resultado: 0–100% — usado nos badges de retenção e no anel do Dashboard", 14);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 6–7 — CONCERNS
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(6);
sectionDivider("3", "Concerns Técnicos", "11 riscos mapeados e priorizados");

callout("⚠️", "O que são Concerns?", "Durante o mapeamento brownfield (tlc-spec-driven), foram identificados 11 pontos de risco técnico. Eles estão priorizados por impacto real no produto e no aluno.", C.orange, C.orangeXL);
gap();

h2("🔴 Alto Risco — Ação urgente");

h3("C-001 — Zero cobertura de testes");
body("Nenhum arquivo de teste existe. Os algoritmos SM-2 e calcRetention não têm validação automática.");
body("Impacto: bug silencioso nesses algoritmos prejudica a retenção real do aluno sem que ninguém perceba.", 14);
body("Fix: instalar Vitest + jsdom, extrair utils para src/utils.js, criar testes unitários.", 14);
gap(0.3);

h3("C-002 — Arquivo único com 1.650 linhas");
body("Todo o app (CSS, algoritmos, 8 páginas React, bootstrap) em um único index.html.");
body("Impacto: difícil manutenção, impossível de modularizar ou fazer tree-shaking. Babel recompila tudo a cada load.", 14);
body("Fix gradual: extrair utils → storage → migrar para Vite (v1.2).", 14);
gap(0.3);

h3("C-003 — CDN sem pinning de versão exata");
body("URLs do React/Babel usam @18 — qualquer breaking change na minor pode quebrar o app.");
body("Fix imediato: trocar para versão exata (@18.3.1) ou auto-hospedar os arquivos.", 14);

gap(0.5);
h2("🟡 Médio Risco — Planejar para v1.1");

h3("C-004 — Sem export/backup de dados");
body("Todos os dados estão só no localStorage. Limpar o cache = perder tudo.");
body("Fix: botão Export JSON + Import JSON nas configurações (feature de v1.1).", 14);
gap(0.3);

h3("C-005 — Sem validação de schema no load()");
body("Se o localStorage estiver corrompido ou com schema antigo, o app pode quebrar.");
body("Fix: validar campos obrigatórios em load() antes de usar os dados.", 14);
gap(0.3);

h3("C-006 — Babel Standalone em produção");
body("~900KB de Babel carregado e executado no browser a cada visita. Overhead de ~300ms.");
body("Fix: pré-compilar com Vite para produção (v1.2).", 14);
gap(0.3);

h3("C-007 — Prop drilling profundo sem Context");
body("data e setData passados manualmente para todos os 8 componentes de página.");
body("Fix: criar AppContext quando o número de componentes crescer (v1.2).", 14);

PG();
pageNum(7);
h2("🟢 Baixo Risco — Melhorias futuras");
table(
  ["ID", "Concern", "Impacto", "Quando atacar"],
  [
    ["C-008", "Sem PWA / Service Worker",          "App não funciona offline",                "v2.0"],
    ["C-009", "Sem limite de tamanho no localStorage","Pode atingir limite após meses de uso", "v1.3"],
    ["C-010", "Modo Professor sem validação mínima","Usuário ganha XP com texto sem sentido",  "v1.1"],
    ["C-011", "react.development.js em uso",        "~30% maior, mais lento que .production",  "v1.2"],
  ],
  [52, 185, 165, 98]
);

gap();
h2("Matriz de risco × esforço");
table(
  ["Concern", "Risco", "Esforço", "Prioridade"],
  [
    ["C-001 — Zero testes",       "🔴 Alto", "Médio",  "P0 — Fazer primeiro"],
    ["C-004 — Sem export dados",  "🔴 Alto", "Pequeno","P0 — Fazer primeiro"],
    ["C-005 — Schema sem validação","🟡 Médio","Pequeno","P1 — v1.1"],
    ["C-003 — CDN sem pinning",   "🔴 Alto", "Pequeno","P0 — 1 linha de mudança"],
    ["C-002 — Arquivo único",     "🟡 Médio","Grande", "P1 — Planejar em v1.2"],
    ["C-006 — Babel produção",    "🟡 Médio","Grande", "P1 — Junto com C-002"],
    ["C-010 — Validação texto",   "🟢 Baixo","Pequeno","P2 — Quick fix"],
    ["C-011 — React dev build",   "🟢 Baixo","Pequeno","P2 — Troca de URL"],
  ],
  [168, 72, 80, 180]
);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 8 — DOCS SPEC-DRIVEN
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(8);
sectionDivider("4", "Documentação Spec-Driven", "18 documentos em .specs/");

callout("📁", "Estrutura gerada", "Todos os documentos vivem em .specs/ na raiz do projeto. Seguem o padrão tlc-spec-driven v2.0 para projetos brownfield (existentes).", C.cyan, C.cyanXL);
gap();

h2(".specs/project/ — Documentos do projeto");
table(
  ["Arquivo", "Conteúdo", "Tamanho"],
  [
    ["PROJECT.md",  "Visão, goals com métricas, stack, scope v1, constraints", "~800 words"],
    ["ROADMAP.md",  "v1.0 completo + v1.1→v2.0 com features e prioridades",   "~600 words"],
    ["STATE.md",    "6 decisões técnicas, todos, lessons learned, ideias deferidas", "~500 words"],
  ],
  [120, 272, 108]
);

gap();
h2(".specs/codebase/ — Análise brownfield (7 docs)");
table(
  ["Arquivo", "Conteúdo"],
  [
    ["STACK.md",        "React 18 CDN, Babel, localStorage, npm deps (docx, pdfkit)"],
    ["ARCHITECTURE.md", "SPA monolito, padrões: router, prop drilling, tokens CSS, SM-2, fluxos"],
    ["CONVENTIONS.md",  "PascalCase, camelCase, inline styles, CSS vars, comentários de seção"],
    ["STRUCTURE.md",    "Árvore de diretórios + organização interna do index.html por blocos"],
    ["TESTING.md",      "Zero testes + matriz de cobertura + recomendação setup Vitest"],
    ["INTEGRATIONS.md", "CDNs (React/Babel/Fonts), localStorage, sem backend, scripts Node.js"],
    ["CONCERNS.md",     "11 concerns com evidência, impacto e fix recomendado para cada"],
  ],
  [130, 370]
);

gap();
h2(".specs/features/ — Specs de funcionalidades (8 features)");
table(
  ["Feature", "ID", "Status", "Requirements"],
  [
    ["Dashboard",           "F-001", "✅ Done", "R-001 a R-007 (7 requirements)"],
    ["Biblioteca",          "F-002", "✅ Done", "R-201 a R-203 (3 requirements)"],
    ["Sessão de Foco",      "F-003", "✅ Done", "R-301 a R-303 (3 fases documentadas)"],
    ["Revisão SM-2",        "F-004", "✅ Done", "R-401 a R-404 (fila, flip, SM-2, resultado)"],
    ["Aprendizado Ativo",   "F-005", "✅ Done", "R-501 a R-504 (3 modos, XP)"],
    ["Árvore de Habilidades","F-006","✅ Done", "R-601 a R-605 (métricas, level up, XP)"],
    ["Central de Ajuda",    "F-007", "✅ Done", "R-701 a R-705 (accordion, FAQ, XP table)"],
    ["Dark/Light Mode",     "F-008", "✅ Done", "R-801 a R-805 (tokens, toggle, persistência)"],
  ],
  [140, 50, 65, 245]
);

gap();
callout("💡", "Como usar esses documentos", "Antes de qualquer nova feature: leia PROJECT.md + STATE.md + spec da feature relacionada. Antes de refatorar: leia ARCHITECTURE.md + CONCERNS.md. Para onboarding de novo colaborador: STACK.md + STRUCTURE.md + CONVENTIONS.md.", C.purple, C.purpleXL);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 9–10 — ROADMAP
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(9);
sectionDivider("5", "Roadmap Completo", "v1.1 → v1.2 → v1.3 → v2.0");

h2("v1.1 — Robustez e Dados");
body("Objetivo: evitar perda de dados e melhorar a confiabilidade do produto.");
table(
  ["Feature", "Prioridade", "Complexidade", "Impacto"],
  [
    ["Export/Import JSON de dados",          "P0", "Pequena", "Evita perda total ao limpar cache"],
    ["Validação de schema no load()",        "P0", "Pequena", "Evita crash com dados corrompidos"],
    ["Deletar e editar conteúdo/habilidade", "P1", "Pequena", "UX básica ausente no v1"],
    ["Configurações (reset de dados)",       "P1", "Média",   "Controle do usuário sobre seus dados"],
    ["Validação mínima no Modo Professor",   "P2", "Pequena", "Garante qualidade mínima do aprendizado"],
  ],
  [175, 70, 90, 165]
);

gap();
h2("v1.2 — Qualidade e Testes");
body("Objetivo: tornar o codebase confiável e preparar para crescimento.");
table(
  ["Feature", "Prioridade", "Complexidade", "Impacto"],
  [
    ["Vitest + testes unitários (utils)", "P0", "Média",  "Segurança nos algoritmos SM-2 e Ebbinghaus"],
    ["Extrair utils para src/utils.js",   "P1", "Média",  "Modularização e testabilidade"],
    ["react.production.min.js",           "P1", "Pequena","Performance imediata"],
    ["Pinning de versão CDN",             "P0", "Pequena","Estabilidade do app"],
    ["Migrar para Vite (decisão)",        "P1", "Grande", "Base para todas melhorias futuras"],
  ],
  [175, 70, 90, 165]
);

gap();
h2("v1.3 — Funcionalidades de Aprendizado");
body("Objetivo: enriquecer o ciclo de consolidação cognitiva.");
table(
  ["Feature", "Prioridade", "Complexidade"],
  [
    ["Estatísticas detalhadas por conteúdo (histórico de retenção)", "P1", "Média"],
    ["Histórico de sessões de estudo",                               "P1", "Média"],
    ["Modo 'Cram' — revisar tudo ignorando a agenda",                "P2", "Pequena"],
    ["Flashcards com imagem ou bloco de código",                     "P2", "Média"],
    ["Modo desafio — quiz com timer por card",                       "P2", "Grande"],
    ["Dependências entre habilidades (árvore visual)",               "P2", "Grande"],
  ],
  [240, 70, 90]
);

PG();
pageNum(10);
h2("v2.0 — Plataforma");
body("Objetivo: escalar o produto para uso em equipes e ambientes corporativos.");
table(
  ["Feature", "Complexidade", "Pré-requisito"],
  [
    ["PWA + Service Worker (offline first)",        "Grande",      "Migração para Vite (v1.2)"],
    ["Import de PDF com extração de flashcards",    "Grande",      "Decisão de backend ou WASM"],
    ["Notificações push de revisão",                "Média",       "PWA (acima)"],
    ["Sync na nuvem (Supabase/PocketBase)",         "Muito grande","Backend + autenticação"],
    ["Compartilhamento de decks",                   "Muito grande","Sync na nuvem (acima)"],
    ["IA que gera flashcards automaticamente",      "Muito grande","Backend + API LLM"],
    ["Modo colaborativo / aprendizado em equipe",   "Muito grande","Sync + autenticação"],
  ],
  [195, 100, 205]
);

gap();
h2("Timeline estimada");
table(
  ["Versão", "Foco", "Estimativa (1 dev)"],
  [
    ["v1.1", "Robustez e Dados",       "1–2 semanas"],
    ["v1.2", "Qualidade e Testes",     "2–3 semanas"],
    ["v1.3", "Funcionalidades",        "3–4 semanas"],
    ["v2.0", "Plataforma",            "2–4 meses"],
  ],
  [80, 220, 200]
);

gap();
callout("🎯", "Recomendação de sequência", "v1.1 primeiro (C-004 export de dados é P0 — risco de perda de dados para usuário). Depois v1.2 (testes garantem segurança para refatorar). Só então v1.3 e v2.0.", C.green, C.greenXL);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 11 — PRÓXIMOS PASSOS
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(11);
sectionDivider("6", "Próximos Passos Práticos", "O que fazer primeiro e por quê");

callout("🏃", "Onde começar AGORA", "3 ações de alto impacto e baixo esforço que podem ser feitas hoje, antes de qualquer nova feature.", C.purple, C.purpleXL);
gap();

h2("Ação 1 — Fixar versão do CDN (30 minutos)");
body("Por quê primeiro: risco alto, esforço mínimo. Uma linha mudada garante estabilidade.");
li("Abrir index.html e landing.html");
li("Trocar unpkg.com/react@18 por unpkg.com/react@18.3.1");
li("Trocar unpkg.com/react-dom@18 por unpkg.com/react-dom@18.3.1");
li("Trocar @babel/standalone por @babel/standalone@7.23.9");
li("Testar no browser — zero mudanças visuais esperadas");
li("Commit: \"fix: pin CDN versions to avoid breaking changes\"");
gap();

h2("Ação 2 — Export/Import de dados (2–3 horas)");
body("Por quê segundo: P0 de v1.1. Usuário pode perder todos os dados ao limpar o cache.");
num(1, "Adicionar botão 'Exportar dados' no sidebar ou numa nova página Configurações");
num(2, "Lógica de export: JSON.stringify(data) → Blob → download automático do arquivo");
num(3, "Lógica de import: input[type=file] → FileReader → JSON.parse → validar schema → setData");
num(4, "Adicionar spec em .specs/features/settings/spec.md antes de implementar");
num(5, "Testar: exportar → limpar localStorage manualmente → importar → verificar integridade");
gap();

h2("Ação 3 — Testes unitários dos algoritmos (4–6 horas)");
body("Por quê terceiro: os algoritmos SM-2 e calcRetention são o coração do produto. Sem testes, qualquer mudança é arriscada.");
num(1, "npm install --save-dev vitest jsdom");
num(2, "Criar src/utils.js com sm2, calcRetention, isDue, addDays, uid");
num(3, "Criar tests/utils.test.js com casos-limite:");
li("sm2(1, 2.5, 6, 3) → interval deve reiniciar para 1", 28);
li("sm2(4, 2.5, 1, 0) → interval deve ser 6", 28);
li("calcRetention com lastReview = hoje → retenção ~100%", 28);
li("calcRetention com lastReview = 30 dias atrás → retenção baixa", 28);
num(4, "Adicionar \"test\": \"vitest run\" no package.json");
num(5, "Meta mínima: cobrir todos os casos-limite de sm2() e calcRetention()");
gap();

h2("Ação 4 — Criar spec de Export/Import antes de implementar");
body("Seguindo o processo spec-driven: escrever a spec antes do código garante requisitos claros.");
li("Criar .specs/features/settings/spec.md com requirements de Export, Import, Reset");
li("Usar IDs rastreáveis: R-901 (export), R-902 (import), R-903 (reset)");
li("Definir 'Done when' para cada requirement antes de abrir o editor");

gap();
callout("📋", "Checklist completo v1.1", "[ ] Pin CDN versions  [ ] Export JSON  [ ] Import JSON  [ ] Validação schema load()  [ ] Deletar conteúdo  [ ] Editar conteúdo  [ ] Validação Modo Professor (10 palavras mín)  [ ] Testes unitários utils", C.cyan, C.cyanXL);

// ═══════════════════════════════════════════════════════════════════════════
// PÁG 12 — DECISÕES E ENCERRAMENTO
// ═══════════════════════════════════════════════════════════════════════════
PG();
pageNum(12);
sectionDivider("7", "Decisões Técnicas Registradas", "6 decisões + ideias deferidas");

h2("Decisões arquiteturais (STATE.md)");
table(
  ["ID", "Decisão", "Racional"],
  [
    ["D-001", "Single HTML file (v1)",         "Zero fricção de setup; prova de conceito rápida"],
    ["D-002", "localStorage como persistência","Sem backend simplifica deploy e onboarding"],
    ["D-003", "React CDN + Babel Standalone",  "JSX sem build step obrigatório"],
    ["D-004", "CSS Custom Props para temas",   "Troca de tema sem re-render React"],
    ["D-005", "Algoritmo SM-2",               "Comprovado cientificamente, simples de implementar"],
    ["D-006", "North Star: habilidades consolidadas","Mede capacidade real, não consumo"],
  ],
  [45, 185, 270]
);

gap();
h2("Ideias deferidas (para versões futuras)");
table(
  ["ID", "Ideia", "Por que deferida", "Revisitar"],
  [
    ["I-001", "IA gera flashcards auto",     "Requer API externa + backend",      "v2.0"],
    ["I-002", "Modo colaborativo",           "Requer backend + autenticação",     "v2.0"],
    ["I-003", "Import PDF com OCR",          "Processamento pesado no browser",   "v1.3+"],
    ["I-004", "Notificações push",           "Service Worker + permissão usuário","v2.0"],
    ["I-005", "NLP no Modo Professor",       "IA/LLM fora do escopo v1",          "v2.0"],
  ],
  [45, 155, 180, 120]
);

gap();
h2("Lições aprendidas");
table(
  ["ID", "Lição"],
  [
    ["L-001", "Inline styles com CSS vars é eficiente para theming sem CSS-in-JS complexo"],
    ["L-002", "Arquivo único escala mal — refatorar em v1.2 para módulos separados"],
    ["L-003", "SM-2 sem testes é arriscado — bugs silenciosos impactam retenção real do aluno"],
  ],
  [45, 455]
);

gap();
rule(C.purple);
gap(0.5);

// Fechamento
doc.fillColor(C.purple).font("Helvetica-Bold").fontSize(14)
   .text("NeuroLearn", 55, doc.y, { width: W, align: "center" });
doc.fillColor(C.mid).font("Helvetica").fontSize(10)
   .text("Sistema Operacional de Aprendizagem", 55, doc.y + 2, { width: W, align: "center" });
gap(0.8);
doc.fillColor(C.muted).font("Helvetica").fontSize(9)
   .text('"O usuário não sente que está estudando. Ele sente que está evoluindo cognitivamente."', 55, doc.y, { width: W, align: "center", italics: true });
gap(0.5);
doc.fillColor(C.muted).font("Helvetica").fontSize(8)
   .text(`Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}  ·  Spec-Driven com tlc-spec-driven v2.0  ·  12 páginas`, 55, doc.y, { width: W, align: "center" });

// ── Finalizar ────────────────────────────────────────────────────────────────
doc.end();
out.on("finish", () => {
  console.log("OK: NeuroLearn-Status-Projeto.pdf criado com sucesso!");
  console.log("Paginas: 12  |  Secoes: 7");
});
