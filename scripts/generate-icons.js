// Gerador de ícones PNG para PWA — puro Node.js, sem dependências externas
// Cria ícones sólidos com gradiente diagonal usando apenas zlib + fs

const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// CRC32 lookup table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

/**
 * Cria um PNG quadrado com gradiente diagonal:
 * canto superior-esquerdo = #7c3aed (roxo primário)
 * canto inferior-direito = #06b6d4 (azul info)
 * Com um "N" estilizado no centro (pixel art 8x8 ampliado)
 */
function createIcon(size) {
  // Pixel art da letra N (8x8 grid)
  const letterN = [
    [1,1,0,0,0,0,1,1],
    [1,1,1,0,0,0,1,1],
    [1,1,1,1,0,0,1,1],
    [1,1,0,1,1,0,1,1],
    [1,1,0,0,1,1,1,1],
    [1,1,0,0,0,1,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
  ]

  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    row[0] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      // Gradiente diagonal
      const tx = x / (size - 1)
      const ty = y / (size - 1)
      const t = (tx + ty) / 2

      // Interpolação entre #7c3aed e #06b6d4
      const r = Math.round(0x7c + (0x06 - 0x7c) * t)
      const g = Math.round(0x3a + (0xb6 - 0x3a) * t)
      const b = Math.round(0xed + (0xd4 - 0xed) * t)

      // Pixel art "N" — centralizado, com 60% do tamanho do ícone
      const letterSize = Math.floor(size * 0.45)
      const letterScale = letterSize / 8
      const offsetX = Math.floor((size - letterSize) / 2)
      const offsetY = Math.floor((size - letterSize) / 2)
      const lx = Math.floor((x - offsetX) / letterScale)
      const ly = Math.floor((y - offsetY) / letterScale)

      let pr = r, pg = g, pb = b
      if (lx >= 0 && lx < 8 && ly >= 0 && ly < 8 && letterN[ly][lx]) {
        pr = 255; pg = 255; pb = 255  // branco
      }

      const i = 1 + x * 4
      row[i] = pr; row[i + 1] = pg; row[i + 2] = pb; row[i + 3] = 255
    }
    rows.push(row)
  }

  const raw = Buffer.concat(rows)
  const compressed = zlib.deflateSync(raw, { level: 9 })

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB (sem alpha para menor tamanho — vamos usar RGBA = 6)
  ihdr[9] = 6  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

const icons = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of icons) {
  const png = createIcon(size)
  fs.writeFileSync(path.join(outDir, name), png)
  console.log(`✓ ${name} (${size}×${size}, ${Math.round(png.length / 1024)}KB)`)
}

console.log('\nÍcones gerados em public/icons/')
