import { chromium, type FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

/**
 * Global setup: autentica um usuário de teste via Supabase Admin API (magic link),
 * navega até a aplicação e salva o storageState para reutilizar nos testes autenticados.
 *
 * Variáveis necessárias em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  ← nunca exposta ao browser; usada apenas aqui (Node)
 *   TEST_USER_EMAIL            ← email de um usuário de teste cadastrado no Supabase
 */
async function globalSetup(_config: FullConfig) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testEmail = process.env.TEST_USER_EMAIL

  if (!supabaseUrl || !serviceRoleKey || !testEmail) {
    console.warn(
      '[global.setup] Variáveis NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou TEST_USER_EMAIL não definidas. ' +
      'Testes autenticados serão pulados (storageState não gerado).'
    )
    return
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Gera magic link para o usuário de teste via Admin API
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: testEmail,
  })

  if (error || !data.properties?.action_link) {
    console.error('[global.setup] Erro ao gerar magic link:', error?.message)
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navega diretamente para o link de autenticação
    await page.goto(data.properties.action_link)
    // Aguarda redirecionamento para dashboard após callback
    await page.waitForURL('**/dashboard', { timeout: 30_000 })
    // Salva cookies + localStorage da sessão autenticada
    await context.storageState({ path: 'tests/e2e/.auth/user.json' })
    console.log('[global.setup] Auth state salvo em tests/e2e/.auth/user.json')
  } catch (err) {
    console.error('[global.setup] Falha ao navegar para magic link:', err)
  } finally {
    await browser.close()
  }
}

export default globalSetup
