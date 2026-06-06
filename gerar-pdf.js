/**
 * Gerador de documentação PDF — NeuroLearn
 * Lê os 3 arquivos .md em docs/ e gera um PDF para cada um.
 *
 * Uso: node gerar-pdf.js
 * Saída:
 *   docs/project-status/project-status.pdf
 *   docs/technical-documentation/technical-documentation.pdf
 *   docs/user-guide/user-guide.pdf
 */

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

// ─── Paleta de cores ──────────────────────────────────────────────────────
const COLORS = {
  purple:  '#7C3AED',
  cyan:    '#0891B2',
  dark:    '#1E293B',
  gray:    '#64748B',
  border:  '#E2E8F0',
  codeBg:  '#F1F5F9',
  tableH:  '#7C3AED',
  tableR1: '#FFFFFF',
  tableR2: '#F8FAFC',
  white:   '#FFFFFF'
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function hexToRgbStr(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2),16)
  const g = parseInt(h.slice(2,4),16)
  const b = parseInt(h.slice(4,6),16)
  return `rgb(${r},${g},${b})`
}

function renderTable(doc, rows, margin) {
  if (!rows.length) return
  const colCount = Math.max(...rows.map(r => r.length))
  const tableW = doc.page.width - margin * 2
  const colW = tableW / colCount
  const rowH = 22
  let y = doc.y

  rows.forEach((cells, rowIdx) => {
    if (y + rowH > doc.page.height - 60) { doc.addPage(); y = doc.page.margins.top }
    const bg = rowIdx === 0 ? COLORS.tableH : rowIdx % 2 === 0 ? COLORS.tableR2 : COLORS.tableR1
    doc.save().rect(margin, y, tableW, rowH).fill(hexToRgbStr(bg)).restore()
    cells.slice(0, colCount).forEach((cell, colIdx) => {
      doc.font(rowIdx === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(9)
         .fillColor(rowIdx === 0 ? COLORS.white : COLORS.dark)
         .text(cell.trim(), margin + colIdx * colW + 4, y + 6, { width: colW - 8, ellipsis: true })
    })
    y += rowH
  })
  doc.y = y + 8
}

// ─── Parser markdown → PDF ────────────────────────────────────────────────

function mdToPdf(doc, markdown, margin) {
  const lines = markdown.split('\n')
  let inCodeBlock = false
  let codeLines = []
  let inTable = false
  let tableRows = []

  function flushTable() {
    if (!tableRows.length) return
    renderTable(doc, tableRows, margin)
    tableRows = []
    inTable = false
  }

  function checkPage() {
    if (doc.y > doc.page.height - 80) doc.addPage()
  }

  for (const line of lines) {
    checkPage()

    // Bloco de código
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const code = codeLines.join('\n')
        const lineCount = codeLines.length
        const blockH = Math.max(30, lineCount * 13 + 16)
        if (doc.y + blockH > doc.page.height - 60) doc.addPage()
        doc.save().rect(margin, doc.y, doc.page.width - margin*2, blockH)
           .fill(hexToRgbStr(COLORS.codeBg)).restore()
        doc.font('Courier').fontSize(8).fillColor(COLORS.dark)
           .text(code, margin + 8, doc.y + 6, { width: doc.page.width - margin*2 - 16 })
        doc.y += 8
        codeLines = []
        inCodeBlock = false
      } else {
        if (inTable) flushTable()
        inCodeBlock = true
      }
      continue
    }
    if (inCodeBlock) { codeLines.push(line); continue }

    // Tabela
    if (line.includes('|')) {
      if (line.match(/^\|[\s\-|]+\|$/)) continue
      const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
      if (cells.length) { inTable = true; tableRows.push(cells); continue }
    } else if (inTable) {
      flushTable()
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inTable) flushTable()
      doc.moveDown(0.8)
      doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.purple)
         .text(line.slice(2), margin, doc.y, { width: doc.page.width - margin*2 })
      doc.moveTo(margin, doc.y).lineTo(doc.page.width - margin, doc.y)
         .strokeColor(COLORS.purple).lineWidth(2).stroke()
      doc.moveDown(0.5)
    } else if (line.startsWith('## ')) {
      if (inTable) flushTable()
      doc.moveDown(0.6)
      doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.cyan)
         .text(line.slice(3), margin, doc.y, { width: doc.page.width - margin*2 })
      doc.moveDown(0.3)
    } else if (line.startsWith('### ')) {
      if (inTable) flushTable()
      doc.moveDown(0.4)
      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.dark)
         .text(line.slice(4), margin, doc.y, { width: doc.page.width - margin*2 })
      doc.moveDown(0.2)
    } else if (line.startsWith('#### ')) {
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.gray)
         .text(line.slice(5), margin, doc.y, { width: doc.page.width - margin*2 })
      doc.moveDown(0.2)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1')
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
         .text(`• ${text}`, margin + 12, doc.y, { width: doc.page.width - margin*2 - 12 })
    } else if (line.match(/^\s{2,}[-*]\s/)) {
      const text = line.replace(/^\s+[-*]\s/, '').replace(/\*\*(.+?)\*\*/g, '$1')
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.gray)
         .text(`  ◦ ${text}`, margin + 24, doc.y, { width: doc.page.width - margin*2 - 24 })
    } else if (line.startsWith('> ')) {
      doc.save().rect(margin, doc.y, 3, 18).fill(COLORS.purple).restore()
      doc.font('Helvetica-Oblique').fontSize(11).fillColor(COLORS.gray)
         .text(line.slice(2), margin + 12, doc.y, { width: doc.page.width - margin*2 - 12 })
      doc.moveDown(0.3)
    } else if (line.startsWith('---')) {
      doc.moveDown(0.4)
      doc.moveTo(margin, doc.y).lineTo(doc.page.width - margin, doc.y)
         .strokeColor(COLORS.border).lineWidth(0.5).stroke()
      doc.moveDown(0.4)
    } else if (line.trim() === '') {
      doc.moveDown(0.4)
    } else {
      const clean = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1')
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
         .text(clean, margin, doc.y, { width: doc.page.width - margin*2 })
    }
  }
  if (inTable) flushTable()
}

// ─── Capa ─────────────────────────────────────────────────────────────────

function createPdfCover(doc, title, subtitle, margin) {
  doc.save().rect(0, 0, doc.page.width, 260).fill(hexToRgbStr(COLORS.purple)).restore()

  doc.font('Helvetica-Bold').fontSize(34).fillColor(COLORS.white)
     .text('NEUROLEARN', margin, 75, { align: 'center', width: doc.page.width - margin*2 })

  doc.font('Helvetica').fontSize(14).fillColor('#DDD6FE')
     .text('Sistema Operacional de Aprendizagem', margin, 122, { align: 'center', width: doc.page.width - margin*2 })

  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.dark)
     .text(title, margin, 300, { align: 'center', width: doc.page.width - margin*2 })

  doc.font('Helvetica').fontSize(12).fillColor(COLORS.gray)
     .text(subtitle, margin, 335, { align: 'center', width: doc.page.width - margin*2 })

  const date = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.gray)
     .text(`Versão 2.0  ·  ${date}`, margin, 390, { align: 'center', width: doc.page.width - margin*2 })

  doc.addPage()
}

// ─── Rodapé ───────────────────────────────────────────────────────────────

function addFooters(doc, title) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    const pageNum = i - range.start + 1
    const y = doc.page.height - 40
    doc.moveTo(50, y - 10).lineTo(doc.page.width - 50, y - 10)
       .strokeColor(COLORS.border).lineWidth(0.5).stroke()
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.gray)
       .text(`NeuroLearn · ${title}`, 50, y, { width: 300 })
    doc.text(`${pageNum}`, 50, y, { width: doc.page.width - 100, align: 'right' })
  }
}

// ─── Gerar PDF ────────────────────────────────────────────────────────────

async function generatePdf(mdPath, outputPath, title, subtitle) {
  console.log(`  Lendo ${mdPath}...`)
  const markdown = fs.readFileSync(mdPath, 'utf-8')
  const margin = 50

  const doc = new PDFDocument({ size: 'A4', margin, bufferPages: true })
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)

  createPdfCover(doc, title, subtitle, margin)
  mdToPdf(doc, markdown, margin)
  addFooters(doc, title)

  doc.end()
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
  console.log(`  ✓ Gerado: ${outputPath}`)
}

// ─── Documentos ──────────────────────────────────────────────────────────

const docs = [
  {
    md:     'docs/project-status/project-status.md',
    output: 'docs/project-status/project-status.pdf',
    title:    'Status do Projeto',
    subtitle: 'Visão geral, progresso e roadmap'
  },
  {
    md:     'docs/technical-documentation/technical-documentation.md',
    output: 'docs/technical-documentation/technical-documentation.pdf',
    title:    'Documentação Técnica',
    subtitle: 'Arquitetura, stack, padrões e engenharia'
  },
  {
    md:     'docs/user-guide/user-guide.md',
    output: 'docs/user-guide/user-guide.pdf',
    title:    'Guia do Usuário',
    subtitle: 'Como usar o NeuroLearn'
  }
]

;(async () => {
  console.log('\n🔷 NeuroLearn — Gerador de Documentação PDF\n')
  for (const doc of docs) {
    await generatePdf(doc.md, doc.output, doc.title, doc.subtitle)
  }
  console.log('\n✅ Todos os PDFs gerados com sucesso em docs/\n')
})().catch(err => {
  console.error('Erro ao gerar PDF:', err.message)
  process.exit(1)
})
