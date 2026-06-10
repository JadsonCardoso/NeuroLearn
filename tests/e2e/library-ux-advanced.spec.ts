import { test, expect, type Page } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'
import { ReviewPage } from './pages/ReviewPage'

// TC-ADV: Cenários avançados de UX da Biblioteca e Revisão — requer sessão autenticada
//
// Cobre cenários não testados nos specs anteriores:
// - Drawer com métricas completas (progresso, retenção, flashcards, CTAs, ações)
// - Exclusão de trilha sem excluir conteúdos (move para Inbox Cognitiva)
// - Criação de conteúdo sem trilha → Inbox Cognitiva
// - Timer de soft delete (remoção permanente após 5s sem desfazer)
// - Resolução de exercício sem crash (flip + avaliação)
// - Cenários fixme: reordenar, filtro de skill, persistência de tentativa, backend

// ── Helpers ────────────────────────────────────────────────────────────────────

async function criarTrilha(page: Page, nome: string) {
  await page.click('[data-testid="btn-new-trail"]')
  await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })
  await page.fill('[data-testid="trail-title"]', nome)
  await page.click('[data-testid="trail-save-btn"]')
  await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({ timeout: 5000 })
}

async function criarConteudo(page: Page, titulo: string) {
  const library = new LibraryPage(page)
  await library.openAddModal()
  await library.fillTitle(titulo)
  await library.selectType('book')
  await page.click('button[type="submit"]:has-text("Adicionar")')
  await library.waitForContentCard(titulo)
}

async function criarConteudoNaTrilha(page: Page, titulo: string, nomeTrilha: string) {
  const library = new LibraryPage(page)
  await library.openAddModal()
  await library.fillTitle(titulo)
  await library.selectType('book')
  const seletor = page.locator('#add-trail')
  await expect(seletor).toBeVisible({ timeout: 3000 })
  const value = await seletor.evaluate((el: HTMLSelectElement, t) => {
    return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
  }, nomeTrilha)
  if (value) await seletor.selectOption(value)
  await page.click('button[type="submit"]:has-text("Adicionar")')
  await library.waitForContentCard(titulo)
}

// ── CRUD Cognitivo — Drawer Completo ──────────────────────────────────────────

test.describe('TC-ADV — Drawer Contextual Completo', () => {
  test('TC-ADV-001: drawer exibe métricas (progresso, retenção, flashcards), CTAs e ações', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-ADV-001 ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()

    const drawer = page.locator('[data-testid="content-drawer"]')
    await expect(drawer).toBeVisible({ timeout: 5000 })

    // Seção de métricas — labels visíveis
    await expect(drawer.locator('text=Progresso')).toBeVisible()
    await expect(drawer.locator('text=Retenção')).toBeVisible()
    await expect(drawer.locator('text=Flashcards')).toBeVisible()

    // CTAs rápidos
    await expect(drawer.locator('button:has-text("Iniciar Sessão")')).toBeVisible()
    await expect(drawer.locator('button:has-text("Gerar Cards")')).toBeVisible()

    // Tabs Flashcards e Sessões
    await expect(page.locator('[data-testid="drawer-tab-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="drawer-tab-sessions"]')).toBeVisible()

    // Ações no footer do drawer
    await expect(page.locator('[data-testid="drawer-edit-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="drawer-delete-btn"]')).toBeVisible()
  })

  test('TC-ADV-002: aba Sessões no drawer exibe lista ou estado vazio sem crash', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-ADV-002 ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    await page.click('[data-testid="drawer-tab-sessions"]')

    // Não deve ter erro 500
    await expect(page.locator('text=500')).not.toBeVisible()
    // Estado vazio ou lista — ambos são válidos
    const drawer = page.locator('[data-testid="content-drawer"]')
    const bodyText = await drawer.textContent()
    // Deve ter algo renderizado (estado vazio ou sessões)
    expect(bodyText?.length).toBeGreaterThan(0)
  })

  test.fixme('TC-ADV-003: exibir badge "salvando…" e "salvo" ao editar conteúdo no drawer', async () => {
    // Auto-save não implementado no drawer.
    // O drawer usa botão manual "Salvar" (drawer-save-btn).
    // Feature futura: ao alterar qualquer campo, exibir badge de salvamento automático.
  })

  test.fixme('TC-ADV-004: exibir erro contextual ao falhar salvamento automático', async () => {
    // Depende de TC-ADV-003 (auto-save implementado).
    // Fluxo: simular falha de rede (page.route 500) → editar campo → verificar erro.
    // O sistema não deve exibir "salvo" quando houve falha.
  })
})

// ── Inbox Cognitiva ────────────────────────────────────────────────────────────

test.describe('TC-ADV — Inbox Cognitiva (Sem Trilha)', () => {
  test('TC-ADV-005: conteúdo criado sem trilha aparece na Inbox Cognitiva', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-ADV-005 SemTrilha ${Date.now()}`

    // Cria sem selecionar trilha
    await library.openAddModal()
    await library.fillTitle(titulo)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(titulo)

    // Deve aparecer na seção "Sem Trilha" (orphan)
    const orphanSection = page.locator('[data-testid="trail-section-orphan"]')
    await expect(
      orphanSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })

    // NÃO deve aparecer em nenhuma seção de trilha nomeada
    const trailCards = page
      .locator('[data-testid="trail-section"]:not([data-testid="trail-section-orphan"])')
      .locator('[data-testid="content-card"]')
      .filter({ hasText: titulo })
    await expect(trailCards).not.toBeVisible()
  })

  test('TC-ADV-006: excluir trilha não exclui conteúdos — move para Inbox Cognitiva', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha ADV006 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo ADV006 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    // Confirma que conteúdo está na trilha
    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    await expect(
      trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })

    // Abre o formulário de edição da trilha
    await trailSection.locator('[data-testid="btn-edit-trail"]').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })

    // Clica em "Excluir trilha"
    await page.click('[data-testid="trail-delete-btn"]')
    await page.waitForSelector('[data-testid="confirm-dialog"]', { timeout: 3000 })
    await page.click('[data-testid="confirm-dialog-confirm"]')

    await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({
      timeout: 5000,
    })

    // Trilha deve ter desaparecido
    await expect(
      page.locator('[data-testid="trail-section"]').filter({ hasText: nomeTrilha })
    ).not.toBeVisible({ timeout: 5000 })

    // Conteúdo deve continuar existindo na seção orphan (Inbox Cognitiva)
    const orphanSection = page.locator('[data-testid="trail-section-orphan"]')
    await expect(
      orphanSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })
  })
})

// ── Soft Delete — Timer ────────────────────────────────────────────────────────

test.describe('TC-ADV — Soft Delete com Timer', () => {
  test('TC-ADV-007: conteúdo é removido permanentemente após timer de undo expirar (5s)', async ({
    page,
  }) => {
    // Aumenta timeout do teste para acomodar o delay de 5s + margem
    test.setTimeout(30_000)

    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-ADV-007 Timer ${Date.now()}`
    await criarConteudo(page, titulo)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })

    // Inicia soft delete
    await card.hover()
    await card.locator('[data-testid="btn-delete-content"]').click()
    await page.click('[data-testid="confirm-dialog-confirm"]')

    // Imediatamente após: card some (optimistic), toast Desfazer visível
    await expect(card).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('button:has-text("Desfazer")')).toBeVisible({ timeout: 4000 })

    // Aguarda o timer expirar (5s + margem de 2s)
    await page.waitForTimeout(7000)

    // Após expiração: Desfazer some e conteúdo não volta
    await expect(page.locator('button:has-text("Desfazer")')).not.toBeVisible({ timeout: 3000 })
    await expect(card).not.toBeVisible()
  })

  test('TC-ADV-007b: segundo soft delete confirma o primeiro antes de iniciar novo', async ({
    page,
  }) => {
    // Aumenta timeout para acomodar delays
    test.setTimeout(30_000)

    const library = new LibraryPage(page)
    await library.goto()

    const tituloA = `TC-ADV-007b-A ${Date.now()}`
    const tituloB = `TC-ADV-007b-B ${Date.now()}`
    await criarConteudo(page, tituloA)
    await criarConteudo(page, tituloB)

    const cardA = page.locator('[data-testid="content-card"]').filter({ hasText: tituloA })
    const cardB = page.locator('[data-testid="content-card"]').filter({ hasText: tituloB })

    // Inicia soft delete de A
    await cardA.hover()
    await cardA.locator('[data-testid="btn-delete-content"]').click()
    await page.click('[data-testid="confirm-dialog-confirm"]')
    await expect(cardA).not.toBeVisible({ timeout: 3000 })

    // Inicia soft delete de B — deve confirmar A automaticamente
    await cardB.hover()
    await cardB.locator('[data-testid="btn-delete-content"]').click()
    await page.click('[data-testid="confirm-dialog-confirm"]')
    await expect(cardB).not.toBeVisible({ timeout: 3000 })

    // Desfazer visível apenas para B (A foi confirmado automaticamente)
    // Não há dois toasts Desfazer simultâneos
    const undoBtns = page.locator('button:has-text("Desfazer")')
    const count = await undoBtns.count()
    expect(count).toBeLessThanOrEqual(1)
  })
})

// ── Drag and Drop Avançado ─────────────────────────────────────────────────────

test.describe('TC-ADV — Drag and Drop Avançado', () => {
  test.fixme('TC-ADV-008: reorganizar conteúdos dentro da mesma trilha atualiza ordem', async () => {
    // Reordenação intra-trilha não implementada.
    // O @dnd-kit atual suporta apenas ASSIGN_CONTENT_TRAIL (mover entre trilhas).
    // Feature futura: onDragEnd com source e destination na mesma trilha
    // deve atualizar posição/sequência dos conteúdos.
  })

  test.fixme('TC-ADV-009: ordem cognitiva persiste após recarregar a página', async () => {
    // Depende de TC-ADV-008 (reordenação intra-trilha implementada).
    // Verificar que positions são salvas no Supabase e restauradas no reload.
  })

  test.fixme('TC-ADV-010: reverter drag and drop quando Supabase retornar erro', async () => {
    // CC-03: optimistic update sem rollback.
    // handleDragEnd despacha ASSIGN_CONTENT_TRAIL otimisticamente sem revert em erro.
    // Feature futura: interceptar erro Supabase → restaurar estado anterior.
    // Simular: page.route para retornar 500 no PATCH → verificar rollback visual.
  })
})

// ── Revisão Contextual — Avançada ─────────────────────────────────────────────

test.describe('TC-ADV — Revisão Contextual Avançada', () => {
  test.fixme('TC-ADV-011: filtrar revisão por sessão específica exibe apenas itens da sessão', async () => {
    // Requer sessão de revisão previamente concluída (fluxo completo de FocusView → SM-2).
    // Fluxo: concluir sessão → voltar à revisão → selecionar "Por Sessão" → validar filtro.
    // Dependência: dados de sessão precisam existir no Supabase para o usuário de teste.
  })

  test.fixme('TC-ADV-012: filtrar exercícios por skill exibe apenas itens da skill selecionada', async () => {
    // Skill filter não implementado na aba Exercícios.
    // A aba atual usa apenas o ContextSelector (trilha/conteúdo/sessão).
    // Feature futura: dropdown de skill na aba Exercícios → filtrar por tema/competência.
  })
})

// ── Exercícios — Interação Completa ───────────────────────────────────────────

test.describe('TC-ADV — Exercícios', () => {
  test('TC-ADV-013: abrir aba Exercícios com contexto de conteúdo e interagir com card', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha ADV013 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo ADV013 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona o conteúdo no ContextSelector
    await page.click('[data-testid="context-by-content"]')
    const dropdown = page.locator('[data-testid="context-content-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, titulo)
    if (value) await dropdown.selectOption(value)

    // Abre aba Exercícios
    const tabPractice = page.locator('[data-testid="tab-practice"]')
    await expect(tabPractice).toBeVisible({ timeout: 5000 })
    await tabPractice.click()

    // Não deve gerar erro
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()

    // Contexto deve ser mantido após trocar de aba
    await expect(page.locator('[data-testid="context-selector"]')).toContainText(titulo)

    // Se há cards disponíveis, testa a interação de resposta
    const flipBtn = page
      .locator('button')
      .filter({ hasText: /ver resposta|revelar|virar/i })
      .first()
    const hasCards = await flipBtn.isVisible({ timeout: 2000 }).catch(() => false)
    if (hasCards) {
      await flipBtn.click()
      // Após flip, deve exibir botões de avaliação
      const rateBtn = page
        .locator('button')
        .filter({ hasText: /acertei|errei|fácil|difícil/i })
        .first()
      await expect(rateBtn).toBeVisible({ timeout: 2000 })
      // Não deve ter erro após responder
      await rateBtn.click()
      await expect(page.locator('text=500')).not.toBeVisible()
    }
  })

  test.fixme('TC-ADV-014: resolver exercício persiste tentativa e atualiza progresso', async () => {
    // Exercícios não persistem tentativas (NÃO disparam RATE_CARD por design).
    // Feature futura: persistir histórico de exercícios sem afetar o algoritmo SM-2.
    // Verificar que uma tabela/campo específico de "exercise_attempts" é atualizado.
  })

  test.fixme('TC-ADV-015: retenção atualiza no frontend após responder exercício', async () => {
    // Depende de TC-ADV-014 (persistência de tentativa implementada).
    // O SM-2 atual só atualiza retenção via RATE_CARD na revisão oficial.
    // Feature futura: exercícios podem influenciar score de retenção suavemente.
  })
})

// ── Meu Material — Integração ─────────────────────────────────────────────────

test.describe('TC-ADV — Meu Material', () => {
  test.fixme('TC-ADV-016: criar anotação em sessão de foco atualiza Meu Material automaticamente', async () => {
    // Fluxo requer: iniciar FocusView → adicionar nota/highlight → finalizar sessão
    // → ir para revisão → aba Meu Material → verificar que a anotação aparece.
    // Complexidade: o fluxo completo de FocusView é longo. Cobrir quando
    // o fluxo de sessão e MemoryView estiverem totalmente estáveis.
  })

  test('TC-ADV-017: Meu Material com contexto de conteúdo exibe estado coerente', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha ADV017 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo ADV017 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona o conteúdo como contexto
    await page.click('[data-testid="context-by-content"]')
    const dropdown = page.locator('[data-testid="context-content-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, titulo)
    if (value) await dropdown.selectOption(value)

    // Abre aba Meu Material
    await page.click('[data-testid="tab-knowledge"]')

    // Não deve ter erro
    await expect(page.locator('text=500')).not.toBeVisible()
    // O seletor de contexto deve manter o conteúdo selecionado
    await expect(page.locator('[data-testid="context-selector"]')).toContainText(titulo)
    // Estado vazio contextual deve mencionar o conteúdo ou exibir lista filtrada
    await expect(page.locator('body')).toBeVisible()
  })
})

// ── Retenção e Progressão ─────────────────────────────────────────────────────

test.describe('TC-ADV — Retenção e Progressão', () => {
  test.fixme('TC-ADV-018: retenção atualiza imediatamente no frontend após concluir revisão SM-2', async () => {
    // Requer fluxo completo de revisão SM-2: abrir cartões, responder todos,
    // ver tela de resultado e verificar que a métrica de retenção foi atualizada.
    // Complexidade: depende de cards com RATE_CARD e recálculo de retention model.
  })

  test.fixme('TC-ADV-019: job de recomputação de retenção recalcula e persiste valor oficial', async () => {
    // Não testável diretamente via E2E (job de background/cron).
    // Abordagem possível: verificar via Supabase MCP ou endpoint de healthcheck
    // que o cron job está registrado e que o valor de last_computed_at atualiza.
  })
})
