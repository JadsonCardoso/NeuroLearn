import { test, expect } from '@playwright/test'

// PROF — Perfil do Usuário + SEO
// /profile: renderização, validação do formulário, toggle notificações, sidebar
// SEO: /sitemap.xml, /robots.txt

// ---------------------------------------------------------------------------
// PROF-01 — Renderização e estrutura da página
// ---------------------------------------------------------------------------
test.describe('Perfil — Renderização (PROF-01)', () => {
  test('TC-PROF-001: /profile carrega sem erros de JS', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('TC-PROF-002: título "Perfil" visível na página', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Perfil').first()).toBeVisible({ timeout: 5_000 })
  })

  test('TC-PROF-003: seções "Identificação" e "Notificações" visíveis', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Identificação')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('text=Notificações')).toBeVisible()
  })

  test('TC-PROF-004: campo nome visível e editável', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    const nameInput = page.locator('input#name')
    await expect(nameInput).toBeVisible({ timeout: 5_000 })
    await expect(nameInput).toBeEnabled()
  })

  test('TC-PROF-005: campo URL do avatar visível', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input#avatar_url')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-PROF-006: e-mail exibido em modo leitura (não como input editável)', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=E-mail')).toBeVisible({ timeout: 5_000 })
    // E-mail é renderizado como texto, não como <input type="email">
    await expect(page.locator('input[type="email"]')).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------
// PROF-02 — Validação do formulário (sem popup nativo do browser)
// ---------------------------------------------------------------------------
test.describe('Perfil — Validação do formulário (PROF-02)', () => {
  test('TC-PROF-007: submeter com nome vazio exibe mensagem de erro em PT-BR', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.locator('input#name').waitFor({ state: 'visible', timeout: 5_000 })

    // Preenche avatar_url com URL válida para tornar o form sujo (habilita o botão)
    await page.locator('input#avatar_url').fill('https://example.com/avatar.jpg')
    // Limpa o nome — campo fica inválido
    await page.locator('input#name').fill('')

    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('text=O nome é obrigatório.')
    ).toBeVisible({ timeout: 3_000 })
  })

  test('TC-PROF-008: URL de avatar inválida exibe mensagem de erro em PT-BR', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.locator('input#name').waitFor({ state: 'visible', timeout: 5_000 })

    // Torna o form sujo com nome válido e URL inválida
    await page.locator('input#name').fill('Nome Válido Teste')
    await page.locator('input#avatar_url').fill('url-sem-protocolo')

    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('text=Informe uma URL válida (https://...)')
    ).toBeVisible({ timeout: 3_000 })
  })

  test('TC-PROF-009: botão "Salvar alterações" desabilitado quando formulário limpo', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.locator('input#name').waitFor({ state: 'visible', timeout: 5_000 })

    // Aguarda o reset assíncrono com dados carregados do Supabase
    const saveBtn = page.locator('button[type="submit"]:has-text("Salvar alterações")')
    await expect(saveBtn).toBeVisible({ timeout: 3_000 })
    await expect(saveBtn).toBeDisabled({ timeout: 3_000 })
  })

  test('TC-PROF-010: botão "Salvar alterações" habilita após editar o nome', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.locator('input#name').waitFor({ state: 'visible', timeout: 5_000 })

    await page.locator('input#name').fill('Nome Editado Pelo QA')

    const saveBtn = page.locator('button[type="submit"]:has-text("Salvar alterações")')
    await expect(saveBtn).toBeEnabled({ timeout: 3_000 })
  })
})

// ---------------------------------------------------------------------------
// PROF-03 — Toggle de notificações
// ---------------------------------------------------------------------------
test.describe('Perfil — Notificações (PROF-03)', () => {
  test('TC-PROF-011: toggle de notificações presente com role="switch"', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    const toggle = page.locator('button[role="switch"]')
    await expect(toggle).toBeVisible({ timeout: 5_000 })
    const ariaChecked = await toggle.getAttribute('aria-checked')
    expect(['true', 'false']).toContain(ariaChecked)
  })

  test('TC-PROF-012: clicar no toggle inverte o estado (aria-checked)', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    const toggle = page.locator('button[role="switch"]')
    await expect(toggle).toBeVisible({ timeout: 5_000 })

    const before = await toggle.getAttribute('aria-checked')
    await toggle.click()
    const after = await toggle.getAttribute('aria-checked')

    expect(before).not.toBe(after)
  })
})

// ---------------------------------------------------------------------------
// PROF-04 — Navegação: sidebar
// ---------------------------------------------------------------------------
test.describe('Perfil — Sidebar (PROF-04)', () => {
  test('TC-PROF-013: link "Perfil" na sidebar navega para /profile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.locator('a[href="/profile"]').click()
    await expect(page).toHaveURL(/\/profile/)
    await expect(page.locator('text=Perfil').first()).toBeVisible({ timeout: 5_000 })
  })
})

// ---------------------------------------------------------------------------
// SEO-01 — Sitemap e Robots (rotas públicas — não requerem auth)
// ---------------------------------------------------------------------------
test.describe('SEO — Sitemap e Robots (SEO-01)', () => {
  test('TC-SEO-001: /sitemap.xml retorna XML com URLs públicas', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('<?xml')
    expect(body).toContain('neurolearn.tech')
    expect(body).toContain('/auth/login')
  })

  test('TC-SEO-002: /robots.txt retorna diretivas User-agent e Sitemap', async ({ page }) => {
    const response = await page.request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('User-agent:')
    expect(body).toContain('Disallow: /api/')
    expect(body).toContain('Sitemap:')
  })

  test('TC-SEO-003: /robots.txt bloqueia rotas autenticadas (dashboard, profile)', async ({ page }) => {
    const response = await page.request.get('/robots.txt')
    const body = await response.text()
    expect(body).toContain('/dashboard')
    expect(body).toContain('/profile')
  })
})
