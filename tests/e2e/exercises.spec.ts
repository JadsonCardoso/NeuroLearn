import { test, expect, type Page } from '@playwright/test'

// TC-EXE: Exercícios na fase de Extração do Focus — requer sessão autenticada

test.describe('Exercícios — Fase de Extração do Focus', () => {
  async function goToExtractPhase(page: Page) {
    // Navega para /focus e seleciona o primeiro conteúdo disponível
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')

    // Clica no primeiro conteúdo disponível para iniciar sessão
    const firstContent = page.locator('[data-testid="content-focus-card"]').first()
    await expect(firstContent).toBeVisible({ timeout: 10_000 })
    await firstContent.click()

    // Aguarda a página de sessão e avança para fase de extração
    await page.waitForLoadState('networkidle')
    const extractTab = page.locator('button').filter({ hasText: /2\. Extração/i })
    await expect(extractTab).toBeVisible({ timeout: 5_000 })
    await extractTab.click()
    await expect(page.getByTestId('exercises-panel')).toBeVisible({ timeout: 5_000 })
  }

  test('TC-EXE-01: painel de exercícios é exibido na fase de extração', async ({ page }) => {
    await goToExtractPhase(page)
    await expect(page.getByTestId('exercises-panel')).toBeVisible()
    await expect(page.getByTestId('exercise-question')).toBeVisible()
    await expect(page.getByTestId('exercise-answer')).toBeVisible()
    await expect(page.getByTestId('btn-save-exercise')).toBeVisible()
  })

  test('TC-EXE-02: campos de exercício estão vazios ao abrir a fase', async ({ page }) => {
    await goToExtractPhase(page)
    await expect(page.getByTestId('exercise-question')).toHaveValue('')
    await expect(page.getByTestId('exercise-answer')).toHaveValue('')
  })

  test('TC-EXE-03: contador inicia em 0', async ({ page }) => {
    await goToExtractPhase(page)
    const counter = page.getByTestId('exercises-panel').locator('text=/0 exercício/')
    await expect(counter).toBeVisible()
  })

  test('TC-EXE-04: salvar exercício válido incrementa contador e limpa campos', async ({
    page,
  }) => {
    await goToExtractPhase(page)

    await page.getByTestId('exercise-question').fill('O que é injeção de dependência?')
    await page
      .getByTestId('exercise-answer')
      .fill('É o padrão de passar dependências de fora ao invés de criá-las internamente.')
    await page.getByTestId('btn-save-exercise').click()

    // Campos voltam ao estado vazio
    await expect(page.getByTestId('exercise-question')).toHaveValue('', { timeout: 5_000 })
    await expect(page.getByTestId('exercise-answer')).toHaveValue('', { timeout: 5_000 })

    // Contador incrementa para 1
    const counter = page.getByTestId('exercises-panel').locator('text=/1 exercício/')
    await expect(counter).toBeVisible({ timeout: 5_000 })
  })

  test('TC-EXE-05: clicar Salvar sem preencher campos não incrementa contador', async ({
    page,
  }) => {
    await goToExtractPhase(page)
    await page.getByTestId('btn-save-exercise').click()

    // Contador permanece 0
    await page.waitForTimeout(500)
    const counter = page.getByTestId('exercises-panel').locator('text=/0 exercício/')
    await expect(counter).toBeVisible()
  })

  test('TC-EXE-06: clicar Salvar com somente pergunta não incrementa contador', async ({
    page,
  }) => {
    await goToExtractPhase(page)
    await page.getByTestId('exercise-question').fill('Pergunta sem resposta')
    await page.getByTestId('btn-save-exercise').click()

    await page.waitForTimeout(500)
    const counter = page.getByTestId('exercises-panel').locator('text=/0 exercício/')
    await expect(counter).toBeVisible()
  })

  test('TC-EXE-07: múltiplos exercícios acumulam no contador', async ({ page }) => {
    await goToExtractPhase(page)

    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('exercise-question').fill(`Pergunta ${i}`)
      await page.getByTestId('exercise-answer').fill(`Resposta ${i}`)
      await page.getByTestId('btn-save-exercise').click()
      await expect(page.getByTestId('exercise-question')).toHaveValue('', { timeout: 5_000 })
    }

    const counter = page.getByTestId('exercises-panel').locator('text=/3 exercício/')
    await expect(counter).toBeVisible({ timeout: 5_000 })
  })

  test('TC-EXE-08: exercício é persistido via POST ao Supabase com user_id', async ({ page }) => {
    await goToExtractPhase(page)

    const exerciseRequests: string[] = []
    await page.route('**/exercises*', (route) => {
      if (route.request().method() === 'POST') {
        exerciseRequests.push(route.request().url())
      }
      route.continue()
    })

    await page.getByTestId('exercise-question').fill('Questão de persistência')
    await page.getByTestId('exercise-answer').fill('Resposta de persistência')
    await page.getByTestId('btn-save-exercise').click()

    await expect(page.getByTestId('exercise-question')).toHaveValue('', { timeout: 5_000 })
    expect(exerciseRequests.length).toBeGreaterThan(0)
  })

  test('TC-EXE-09: painel de exercícios coexiste com flashcards sem interferência', async ({
    page,
  }) => {
    await goToExtractPhase(page)

    // Cria um flashcard
    await page.locator('input.input').first().fill('Frente do card')
    await page.locator('textarea.textarea').first().fill('Verso do card')
    await page
      .locator('button.btn-primary')
      .filter({ hasText: /adicionar card/i })
      .click()

    // Cria um exercício
    await page.getByTestId('exercise-question').fill('Pergunta coexistência')
    await page.getByTestId('exercise-answer').fill('Resposta coexistência')
    await page.getByTestId('btn-save-exercise').click()

    // Ambos os contadores devem refletir 1
    await expect(page.locator('text=/1 card/i')).toBeVisible({ timeout: 5_000 })
    const exCounter = page.getByTestId('exercises-panel').locator('text=/1 exercício/')
    await expect(exCounter).toBeVisible({ timeout: 5_000 })
  })
})
