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

function renderTable(doc, rows, margin) {
  if (!rows.length) return
  const colCount = Math.max(...rows.map(r => r.length))
  const tableW  = doc.page.width - margin * 2
  const colW    = tableW / colCount
  const rowH    = 22

  let y = doc.y

  rows.forEach((cells, rowIdx) => {
    if (y + rowH > doc.page.height - 60) { doc.addPage(); y = doc.page.margins.top }

    // Fundo da linha — hex direto, sem save()/restore() para não poluir o path state
    const bg = rowIdx === 0 ? COLORS.tableH : rowIdx % 2 === 0 ? COLORS.tableR2 : COLORS.tableR1
    doc.fillColor(bg).rect(margin, y, tableW, rowH).fill()

    // Texto de cada célula
    const textColor = rowIdx === 0 ? COLORS.white : COLORS.dark
    const fontName  = rowIdx === 0 ? 'Helvetica-Bold' : 'Helvetica'
    cells.slice(0, colCount).forEach((cell, colIdx) => {
      const clean = cell.trim().replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1')
      doc.font(fontName).fontSize(9).fillColor(textColor)
         .text(clean, margin + colIdx * colW + 4, y + 6, { width: colW - 8, ellipsis: true })
    })

    // Resetar fill color após a linha
    doc.fillColor(COLORS.dark)
    y += rowH
  })

  doc.y = y + 8
}

// ─── Parser markdown → PDF ────────────────────────────────────────────────

function mdToPdf(doc, markdown, margin, mdBasePath) {
  const lines = markdown.split('\n')
  const pageW  = doc.page.width
  const pageH  = doc.page.height
  const cW     = pageW - margin * 2

  let inCodeBlock = false
  let codeLines   = []
  let inTable     = false
  let tableRows   = []

  function flushTable() {
    if (!tableRows.length) return
    renderTable(doc, tableRows, margin)
    tableRows = []
    inTable = false
  }

  // Garante espaço suficiente para o próximo bloco — nunca chamado antes de linhas vazias
  function need(h) {
    if (doc.y + h > pageH - 60) doc.addPage()
  }

  function stripInline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g,    '$1')
      .replace(/`(.+?)`/g,      '$1')
  }

  for (const line of lines) {

    // ── Bloco de código ──────────────────────────────────────────────────
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const code   = codeLines.join('\n')
        const blockH = Math.max(30, codeLines.length * 13 + 16)
        need(blockH)
        const y0 = doc.y
        doc.fillColor(COLORS.codeBg).rect(margin, y0, cW, blockH).fill()
        doc.fillColor(COLORS.dark)
        doc.font('Courier').fontSize(8)
           .text(code, margin + 8, y0 + 6, { width: cW - 16 })
        doc.y = y0 + blockH + 4
        codeLines   = []
        inCodeBlock = false
      } else {
        if (inTable) flushTable()
        inCodeBlock = true
      }
      continue
    }
    if (inCodeBlock) { codeLines.push(line); continue }

    // ── Tabela ───────────────────────────────────────────────────────────
    if (line.includes('|')) {
      if (line.match(/^\|[\s\-|]+\|$/)) continue
      const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
      if (cells.length) { inTable = true; tableRows.push(cells); continue }
    } else if (inTable) {
      flushTable()
    }

    // ── Headings ─────────────────────────────────────────────────────────
    if (line.startsWith('# ')) {
      if (inTable) flushTable()
      need(50)
      doc.moveDown(0.8)
      doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.purple)
         .text(line.slice(2), margin, doc.y, { width: cW })
      doc.moveTo(margin, doc.y).lineTo(pageW - margin, doc.y)
         .strokeColor(COLORS.purple).lineWidth(2).stroke()
      doc.moveDown(0.5)

    } else if (line.startsWith('## ')) {
      if (inTable) flushTable()
      need(35)
      doc.moveDown(0.6)
      doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.cyan)
         .text(line.slice(3), margin, doc.y, { width: cW })
      doc.moveDown(0.3)

    } else if (line.startsWith('### ')) {
      if (inTable) flushTable()
      need(25)
      doc.moveDown(0.4)
      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.dark)
         .text(line.slice(4), margin, doc.y, { width: cW })
      doc.moveDown(0.2)

    } else if (line.startsWith('#### ')) {
      need(20)
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.gray)
         .text(line.slice(5), margin, doc.y, { width: cW })
      doc.moveDown(0.2)

    // ── Listas ───────────────────────────────────────────────────────────
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      need(16)
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
         .text(`• ${stripInline(line.slice(2))}`, margin + 12, doc.y, { width: cW - 12 })

    } else if (line.match(/^\s{2,}[-*]\s/)) {
      need(14)
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.gray)
         .text(`  ◦ ${stripInline(line.replace(/^\s+[-*]\s/, ''))}`, margin + 24, doc.y, { width: cW - 24 })

    // ── Blockquote ───────────────────────────────────────────────────────
    } else if (line.startsWith('> ')) {
      const content = line.slice(2)

      // Placeholder de imagem — caixa cinza clara com borda
      if (content.includes('📸') || content.toLowerCase().includes('[imagem:')) {
        const imgW = cW
        const imgH = 44
        need(imgH + 12)
        const y0 = doc.y
        // Fill separado do stroke para compatibilidade PDFKit
        doc.rect(margin, y0, imgW, imgH).fillColor('#F1F5F9').fill()
        doc.rect(margin, y0, imgW, imgH).strokeColor('#CBD5E1').lineWidth(0.5).stroke()
        // Texto centralizado na caixa — sem deixar doc.y avançar automaticamente
        doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
           .text('[ Imagem ilustrativa ]', margin, y0 + imgH / 2 - 6, { width: imgW, align: 'center' })
        doc.y = y0 + imgH + 8   // posiciona explicitamente após a caixa

      } else {
        // Blockquote normal
        need(20)
        const cleanBlock = stripInline(content.replace(/^#{1,3}\s+/, ''))
        const y0 = doc.y
        doc.fillColor(COLORS.purple).rect(margin, y0, 3, 18).fill()
        doc.fillColor(COLORS.gray)
        doc.font('Helvetica-Oblique').fontSize(11)
           .text(cleanBlock, margin + 12, y0, { width: cW - 12 })
        doc.moveDown(0.3)
      }

    // ── Imagem Markdown ──────────────────────────────────────────────────
    } else if (line.startsWith('![')) {
      const imgMatch = line.match(/^!\[(.*?)\]\((.+?)\)$/)
      if (imgMatch && mdBasePath) {
        if (inTable) flushTable()
        const alt     = imgMatch[1]
        const imgRel  = imgMatch[2]
        const imgPath = path.resolve(mdBasePath, imgRel)
        const maxH    = 220
        need(maxH + 40)
        if (fs.existsSync(imgPath)) {
          try {
            const beforeY = doc.y
            doc.image(imgPath, margin, beforeY, { fit: [cW, maxH], align: 'center' })
            doc.y = beforeY + maxH + 6
            if (alt) {
              doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.gray)
                 .text(alt, margin, doc.y, { width: cW, align: 'center' })
              doc.moveDown(0.5)
            }
          } catch (_e) {
            const imgH = 44, y0 = doc.y
            doc.rect(margin, y0, cW, imgH).fillColor('#F1F5F9').fill()
            doc.rect(margin, y0, cW, imgH).strokeColor('#CBD5E1').lineWidth(0.5).stroke()
            doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
               .text(`[ ${alt || 'Imagem'} ]`, margin, y0 + imgH / 2 - 6, { width: cW, align: 'center' })
            doc.y = y0 + imgH + 8
          }
        } else {
          const imgH = 44, y0 = doc.y
          doc.rect(margin, y0, cW, imgH).fillColor('#F1F5F9').fill()
          doc.rect(margin, y0, cW, imgH).strokeColor('#CBD5E1').lineWidth(0.5).stroke()
          doc.fillColor('#94A3B8').font('Helvetica').fontSize(9)
             .text(`[ ${alt || 'Imagem não encontrada'} ]`, margin, y0 + imgH / 2 - 6, { width: cW, align: 'center' })
          doc.y = y0 + imgH + 8
        }
      }

    // ── Separador ────────────────────────────────────────────────────────
    } else if (line.startsWith('---')) {
      doc.moveDown(0.4)
      doc.moveTo(margin, doc.y).lineTo(pageW - margin, doc.y)
         .strokeColor(COLORS.border).lineWidth(0.5).stroke()
      doc.moveDown(0.4)

    // ── Linha em branco — NÃO cria página nova, só avança se não estiver no topo ──
    } else if (line.trim() === '') {
      if (doc.y > doc.page.margins.top + 30) doc.moveDown(0.4)

    // ── Parágrafo normal ─────────────────────────────────────────────────
    } else {
      need(16)
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
         .text(stripInline(line), margin, doc.y, { width: cW })
    }
  }
  if (inTable) flushTable()
}

// ─── Capa ─────────────────────────────────────────────────────────────────

function createPdfCover(doc, title, subtitle, margin) {
  doc.fillColor(COLORS.purple).rect(0, 0, doc.page.width, 260).fill()
  doc.fillColor(COLORS.dark) // reset após o rect

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
  mdToPdf(doc, markdown, margin, path.dirname(path.resolve(mdPath)))
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
