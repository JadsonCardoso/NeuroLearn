// Funções de sanitização — server-safe, sem dependências externas

// Remove todas as tags HTML de uma string
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

// Codifica caracteres especiais HTML para evitar XSS
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Remove path traversal e caracteres perigosos de nomes de arquivo
export function sanitizeFileName(name: string): string {
  return name
    .replace(/\.\./g, '')           // path traversal
    .replace(/[/\\:*?"<>|]/g, '_')  // chars inválidos em Windows/Unix
    .replace(/\s+/g, '_')           // espaços
    .replace(/_{2,}/g, '_')         // underscores múltiplos
    .trim()
    .slice(0, 255)                  // limite de nome de arquivo
}

// Valida MIME type contra uma lista de tipos permitidos
export function isValidMimeType(mime: string, allowed: string[]): boolean {
  const normalized = mime.toLowerCase().split(';')[0].trim()
  return allowed.map((a) => a.toLowerCase()).includes(normalized)
}

// MIME types permitidos por categoria (para uploads futuros)
export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
}
