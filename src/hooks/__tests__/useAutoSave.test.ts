// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/services/sessionDraftsService', () => ({
  upsertDraft: vi.fn(),
}))

const { useAutoSave } = await import('../useAutoSave')
import { upsertDraft } from '@/services/sessionDraftsService'

const mockUpsert = upsertDraft as ReturnType<typeof vi.fn>

const DEFAULT_INPUT = {
  notes: 'notas iniciais',
  highlights: ['h1'],
  teachText: 'texto inicial',
  contentId: 'content-1',
  userId: 'user-1',
}

beforeEach(() => {
  vi.useFakeTimers()
  mockUpsert.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('useAutoSave', () => {
  it('não dispara upsertDraft no mount (isFirstRender)', () => {
    renderHook(() => useAutoSave(DEFAULT_INPUT))
    // Avança todos os timers — não deve ter chamado upsertDraft
    act(() => {
      vi.runAllTimers()
    })
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('transita idle → saving → saved → idle após mudança de estado', async () => {
    // Controla manualmente quando upsertDraft resolve
    let resolveUpsert!: () => void
    mockUpsert.mockReturnValueOnce(
      new Promise<void>((res) => {
        resolveUpsert = res
      })
    )

    const { result, rerender } = renderHook((props: typeof DEFAULT_INPUT) => useAutoSave(props), {
      initialProps: DEFAULT_INPUT,
    })

    expect(result.current.saveStatus).toBe('idle')

    rerender({ ...DEFAULT_INPUT, notes: 'novas notas' })

    // Dispara o debounce: status deve ser 'saving' antes da promise resolver
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(result.current.saveStatus).toBe('saving')

    // Resolve o upsertDraft → status passa para 'saved'
    await act(async () => {
      resolveUpsert()
    })
    expect(result.current.saveStatus).toBe('saved')

    // Após 3000ms o timer zera para 'idle'
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.saveStatus).toBe('idle')
  })

  it('não salva quando contentId está vazio', async () => {
    const { rerender } = renderHook((props: typeof DEFAULT_INPUT) => useAutoSave(props), {
      initialProps: DEFAULT_INPUT,
    })

    rerender({ ...DEFAULT_INPUT, contentId: '', notes: 'mudou' })

    await act(async () => {
      vi.runAllTimers()
    })
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('cancela debounce anterior quando estado muda rapidamente', async () => {
    const { rerender } = renderHook((props: typeof DEFAULT_INPUT) => useAutoSave(props), {
      initialProps: DEFAULT_INPUT,
    })

    // Primeira mudança — inicia debounce
    rerender({ ...DEFAULT_INPUT, notes: 'versão 1' })

    // Avança apenas 800ms (antes dos 1500ms do debounce)
    act(() => {
      vi.advanceTimersByTime(800)
    })

    // Segunda mudança — deve cancelar o primeiro debounce
    rerender({ ...DEFAULT_INPUT, notes: 'versão 2' })

    // Avança mais 800ms — total 1600ms desde a primeira mudança,
    // mas apenas 800ms desde a segunda, portanto não deve ter salvo ainda
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(mockUpsert).not.toHaveBeenCalled()

    // Avança os 700ms restantes do segundo debounce
    await act(async () => {
      vi.advanceTimersByTime(700)
    })
    await act(async () => {
      await Promise.resolve()
    })

    // Deve ter chamado apenas uma vez (com a versão final)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    expect(mockUpsert).toHaveBeenCalledWith('user-1', 'content-1', {
      notes: 'versão 2',
      highlights: ['h1'],
      teachText: 'texto inicial',
    })
  })
})
