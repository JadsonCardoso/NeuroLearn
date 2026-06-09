import { test, chromium } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// Spec dedicado à captura de screenshots para o Guia do Usuário.
// Executa no projeto 'authenticated' (storageState já configurado).
// Saída: docs/user-guide/images/*.png

const OUT = path.resolve(process.cwd(), 'docs/user-guide/images')
fs.mkdirSync(OUT, { recursive: true })

test.use({ viewport: { width: 1280, height: 800 } })

async function shot(page: import('@playwright/test').Page, name: string) {
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
  console.log(`  ✓ ${name}.png`)
}

test('screenshot: login page (sem auth)', async ({}) => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const pg = await ctx.newPage()
  await pg.goto('http://localhost:3003/auth/login')
  await pg.waitForLoadState('networkidle')
  await pg.screenshot({ path: path.join(OUT, '01-login.png') })
  await pg.goto('http://localhost:3003/auth/signup')
  await pg.waitForLoadState('networkidle')
  await pg.screenshot({ path: path.join(OUT, '02-signup.png') })
  await browser.close()
  console.log('  ✓ 01-login.png  ✓ 02-signup.png')
})

test('screenshot: dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await shot(page, '03-dashboard')
})

test('screenshot: library vazia → add modal aberto', async ({ page }) => {
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(OUT, '04-library.png') })

  // Abre o modal de adição para screenshot da Biblioteca com modal
  const addBtn = page.locator('button').filter({ hasText: /adicionar/i }).first()
  if (await addBtn.isVisible()) {
    await addBtn.click()
    await page.waitForSelector('#title', { timeout: 4000 })
    await page.screenshot({ path: path.join(OUT, '04-library-modal.png') })
    await page.keyboard.press('Escape')
  }
  console.log('  ✓ 04-library.png + 04-library-modal.png')
})

test('screenshot: revisão', async ({ page }) => {
  await page.goto('/review')
  await shot(page, '06-review')
})

test('screenshot: aprendizado ativo', async ({ page }) => {
  await page.goto('/active')
  await shot(page, '08-active')
})

test('screenshot: habilidades (skills)', async ({ page }) => {
  await page.goto('/skills')
  await shot(page, '09-skills')
})

test('screenshot: configurações', async ({ page }) => {
  await page.goto('/settings')
  await shot(page, '10-settings')
})
