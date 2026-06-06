/**
 * Gerador de documentação DOCX — NeuroLearn
 * Lê os 3 arquivos .md em docs/ e gera um DOCX para cada um.
 *
 * Uso: node gerar-doc.js
 * Saída:
 *   docs/project-status/project-status.docx
 *   docs/technical-documentation/technical-documentation.docx
 *   docs/user-guide/user-guide.docx
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TableRow, TableCell, Table,
  WidthType, ShadingType, convertInchesToTwip
} = require('docx')
const fs = require('fs')
const path = require('path')

// ─── Paleta de cores ───────────────────────────────────────────────────────
const PURPLE = '7C3AED'
const CYAN   = '0891B2'
const DARK   = '1E293B'
const GRAY   = '64748B'

// ─── Parser de markdown para elementos docx ───────────────────────────────

function parseInline(text) {
  const runs = []
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      runs.push(new TextRun({ text: text.slice(last, match.index), font: 'Calibri', size: 22, color: DARK }))
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, font: 'Calibri', size: 22, color: DARK }))
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], font: 'Courier New', size: 20, color: PURPLE }))
    }
    last = match.index + match[0].length
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), font: 'Calibri', size: 22, color: DARK }))
  }
  return runs.length ? runs : [new TextRun({ text, font: 'Calibri', size: 22, color: DARK })]
}

function mdToDocxElements(markdown) {
  const lines = markdown.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeLines = []
  let inTable = false
  let tableRows = []

  function flushTable() {
    if (!tableRows.length) return
    const rows = tableRows.map((cells, rowIdx) =>
      new TableRow({
        children: cells.map(cell =>
          new TableCell({
            shading: rowIdx === 0
              ? { type: ShadingType.SOLID, color: PURPLE, fill: PURPLE }
              : rowIdx % 2 === 0
                ? { type: ShadingType.SOLID, color: 'F1F5F9', fill: 'F1F5F9' }
                : {},
            children: [new Paragraph({
              children: [new TextRun({
                text: cell.trim(),
                bold: rowIdx === 0,
                color: rowIdx === 0 ? 'FFFFFF' : DARK,
                font: 'Calibri',
                size: 20
              })]
            })]
          })
        )
      })
    )
    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    }))
    elements.push(new Paragraph({ text: '' }))
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Bloco de código
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(new Paragraph({
          children: [new TextRun({
            text: codeLines.join('\n'),
            font: 'Courier New',
            size: 18,
            color: DARK
          })],
          shading: { type: ShadingType.SOLID, color: 'F1F5F9', fill: 'F1F5F9' },
          spacing: { before: 200, after: 200 },
          indent: { left: convertInchesToTwip(0.3) }
        }))
        codeLines = []
        inCodeBlock = false
      } else {
        if (inTable) flushTable()
        inCodeBlock = true
      }
      continue
    }
    if (inCodeBlock) { codeLines.push(line); continue }

    // Tabela markdown
    if (line.includes('|')) {
      if (line.match(/^\|[\s\-|]+\|$/)) continue
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (cells.length > 0) {
        inTable = true
        tableRows.push(cells)
        continue
      }
    } else if (inTable) {
      flushTable()
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), bold: true, color: PURPLE, font: 'Calibri', size: 36 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
        border: { bottom: { color: PURPLE, space: 1, value: BorderStyle.SINGLE, size: 6 } }
      }))
    } else if (line.startsWith('## ')) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true, color: CYAN, font: 'Calibri', size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 160 }
      }))
    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(4), bold: true, color: DARK, font: 'Calibri', size: 24 })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 }
      }))
    } else if (line.startsWith('#### ')) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(5), bold: true, color: GRAY, font: 'Calibri', size: 22 })],
        spacing: { before: 160, after: 80 }
      }))
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.slice(2)
      elements.push(new Paragraph({
        children: parseInline(text),
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 },
        indent: { left: convertInchesToTwip(0.3) }
      }))
    } else if (line.match(/^\s{2,}[-*]\s/)) {
      const text = line.replace(/^\s+[-*]\s/, '')
      elements.push(new Paragraph({
        children: parseInline(text),
        bullet: { level: 1 },
        spacing: { before: 40, after: 40 },
        indent: { left: convertInchesToTwip(0.6) }
      }))
    } else if (line.startsWith('> ')) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), italics: true, color: GRAY, font: 'Calibri', size: 22 })],
        indent: { left: convertInchesToTwip(0.4) },
        border: { left: { color: PURPLE, space: 8, value: BorderStyle.SINGLE, size: 12 } },
        spacing: { before: 120, after: 120 }
      }))
    } else if (line.startsWith('---')) {
      elements.push(new Paragraph({
        border: { bottom: { color: 'E2E8F0', space: 1, value: BorderStyle.SINGLE, size: 4 } },
        spacing: { before: 200, after: 200 }
      }))
    } else if (line.trim() === '') {
      elements.push(new Paragraph({ text: '', spacing: { before: 80, after: 80 } }))
    } else {
      elements.push(new Paragraph({
        children: parseInline(line),
        spacing: { before: 80, after: 80 }
      }))
    }
  }

  if (inTable) flushTable()
  return elements
}

// ─── Capa do documento ────────────────────────────────────────────────────

function createCover(title, subtitle, date) {
  return [
    new Paragraph({ text: '', spacing: { before: 2400 } }),
    new Paragraph({
      children: [new TextRun({ text: 'NEUROLEARN', bold: true, color: PURPLE, font: 'Calibri', size: 64 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Sistema Operacional de Aprendizagem', color: CYAN, font: 'Calibri', size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 }
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, color: DARK, font: 'Calibri', size: 40 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 }
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, color: GRAY, font: 'Calibri', size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Versão 2.0  ·  ${date}`, color: GRAY, font: 'Calibri', size: 20 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({ text: '', pageBreakBefore: true })
  ]
}

// ─── Gerar DOCX ──────────────────────────────────────────────────────────

async function generateDocx(mdPath, outputPath, title, subtitle) {
  console.log(`  Lendo ${mdPath}...`)
  const markdown = fs.readFileSync(mdPath, 'utf-8')
  const date = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
            right: convertInchesToTwip(1.25)
          }
        }
      },
      children: [
        ...createCover(title, subtitle, date),
        ...mdToDocxElements(markdown)
      ]
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
  console.log(`  ✓ Gerado: ${outputPath}`)
}

// ─── Documentos ──────────────────────────────────────────────────────────

const docs = [
  {
    md:     'docs/project-status/project-status.md',
    output: 'docs/project-status/project-status.docx',
    title:    'Status do Projeto',
    subtitle: 'Visão geral, progresso e roadmap'
  },
  {
    md:     'docs/technical-documentation/technical-documentation.md',
    output: 'docs/technical-documentation/technical-documentation.docx',
    title:    'Documentação Técnica',
    subtitle: 'Arquitetura, stack, padrões e engenharia'
  },
  {
    md:     'docs/user-guide/user-guide.md',
    output: 'docs/user-guide/user-guide.docx',
    title:    'Guia do Usuário',
    subtitle: 'Como usar o NeuroLearn'
  }
]

;(async () => {
  console.log('\n🔷 NeuroLearn — Gerador de Documentação DOCX\n')
  for (const doc of docs) {
    await generateDocx(doc.md, doc.output, doc.title, doc.subtitle)
  }
  console.log('\n✅ Todos os DOCXs gerados com sucesso em docs/\n')
})().catch(err => {
  console.error('Erro ao gerar DOCX:', err.message)
  process.exit(1)
})
