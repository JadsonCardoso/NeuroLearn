import { chromium, type FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

/**
 * Global setup: autentica um usuário de teste via Supabase Admin API.
 *
 * O admin.generateLink() retorna um link de fluxo implícito (hash fragment),
 * não PKCE. Por isso, após navegar ao action_link, os tokens chegam como:
 *   /auth/login?error=callback_failed#access_token=...&refresh_token=...
 *
 * Este setup extrai os tokens, constrói o objeto de sessão e seta os cookies
 * no formato exato que @supabase/ssr espera (chunked, encodeURIComponent, max 3180).
 *
 * Variáveis necessárias em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  ← apenas Node/setup; nunca exposta ao browser
 *   TEST_USER_EMAIL            ← email de um usuário cadastrado no Supabase
 */

const MAX_CHUNK_SIZE = 3180

function createChunks(key: string, value: string): Array<{ name: string; value: string }> {
  let encodedValue = encodeURIComponent(value)
  if (encodedValue.length <= MAX_CHUNK_SIZE) {
    return [{ name: key, value }]
  }
  const chunks: string[] = []
  while (encodedValue.length > 0) {
    let encodedChunkHead = encodedValue.slice(0, MAX_CHUNK_SIZE)
    const lastEscapePos = encodedChunkHead.lastIndexOf('%')
    if (lastEscapePos > MAX_CHUNK_SIZE - 3) {
      encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos)
    }
    let valueHead = ''
    while (encodedChunkHead.length > 0) {
      try {
        valueHead = decodeURIComponent(encodedChunkHead)
        break
      } catch (error) {
        if (
          error instanceof URIError &&
          encodedChunkHead.at(-3) === '%' &&
          encodedChunkHead.length > 3
        ) {
          encodedChunkHead = encodedChunkHead.slice(0, encodedChunkHead.length - 3)
        } else {
          throw error
        }
      }
    }
    chunks.push(valueHead)
    encodedValue = encodedValue.slice(encodedChunkHead.length)
  }
  return chunks.map((chunkValue, i) => ({ name: `${key}.${i}`, value: chunkValue }))
}

async function globalSetup(_config: FullConfig) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testEmail = process.env.TEST_USER_EMAIL

  if (!supabaseUrl || !serviceRoleKey || !testEmail) {
    console.warn(
      '[global.setup] Variáveis NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou TEST_USER_EMAIL não definidas. ' +
        'Testes autenticados serão pulados.',
    )
    return
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3003'
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const cookieName = `sb-${projectRef}-auth-token`

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testEmail,
    options: { redirectTo: `${baseURL}/auth/callback` },
  })

  if (error || !data.properties?.action_link) {
    console.error('[global.setup] Erro ao gerar magic link:', error?.message)
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(data.properties.action_link)
    // Aguarda qualquer redirect — PKCE vai para /dashboard, implícito vai para /auth/*
    await page.waitForURL(/\/(dashboard|auth\/)/, { timeout: 30_000 })

    const currentUrl = page.url()

    if (currentUrl.includes('/dashboard')) {
      // PKCE funcionou — raro com admin API, mas tratamos o caso
      await context.storageState({ path: 'tests/e2e/.auth/user.json' })
      console.log('[global.setup] Auth state salvo (PKCE flow) ✓')
      return
    }

    // Fluxo implícito: tokens chegam no hash fragment
    const urlHash = new URL(currentUrl).hash.slice(1)
    const hashParams = new URLSearchParams(urlHash)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const expiresIn = parseInt(hashParams.get('expires_in') ?? '3600', 10)
    const expiresAt = parseInt(
      hashParams.get('expires_at') ?? String(Math.floor(Date.now() / 1000) + 3600),
      10,
    )

    if (!accessToken || !refreshToken) {
      throw new Error(`Tokens ausentes no hash. URL: ${currentUrl}`)
    }

    // Decodifica o JWT para obter o user ID (sub)
    const jwtPayload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'),
    )
    const userId: string = jwtPayload.sub

    // Busca o perfil completo do usuário via Admin API
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
    if (userError || !userData.user) {
      throw new Error(`Falha ao buscar usuário: ${userError?.message}`)
    }

    // Constrói o objeto de sessão no formato exato que @supabase/ssr armazena
    const sessionObject = {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: expiresIn,
      expires_at: expiresAt,
      refresh_token: refreshToken,
      user: userData.user,
    }

    const sessionJson = JSON.stringify(sessionObject)
    const chunks = createChunks(cookieName, sessionJson)

    const cookieExpires = Math.floor(Date.now() / 1000) + 400 * 24 * 60 * 60

    await context.addCookies(
      chunks.map(({ name, value }) => ({
        name,
        value,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
        expires: cookieExpires,
      })),
    )

    // Verifica que a sessão é reconhecida pelo servidor
    await page.goto(`${baseURL}/dashboard`)
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    await context.storageState({ path: 'tests/e2e/.auth/user.json' })
    console.log('[global.setup] Auth state salvo em tests/e2e/.auth/user.json ✓')
  } catch (err) {
    console.error('[global.setup] Falha:', err)
  } finally {
    await browser.close()
  }
}

export default globalSetup
