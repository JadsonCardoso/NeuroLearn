// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrailCollapse } from './useTrailCollapse'

const STORAGE_KEY = 'nl:trails:collapsed'

beforeEach(() => {
  localStorage.clear()
})

// ── TC-COL-010: toggle persiste em localStorage ───────────────────────────────

describe('useTrailCollapse — toggle', () => {
  it('TC-COL-010a: toggle adiciona trailId ao Set e persiste no localStorage', async () => {
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    act(() => result.current.toggle('trail-abc'))

    expect(result.current.collapsed.has('trail-abc')).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toContain('trail-abc')
  })

  it('TC-COL-010b: toggle remove trailId já presente e persiste no localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['trail-abc']))
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    act(() => result.current.toggle('trail-abc'))

    expect(result.current.collapsed.has('trail-abc')).toBe(false)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '["x"]')).not.toContain('trail-abc')
  })

  it('TC-COL-010c: toggle de duas trilhas distintas persiste ambas', async () => {
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    act(() => {
      result.current.toggle('trail-1')
      result.current.toggle('trail-3')
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
    expect(stored).toContain('trail-1')
    expect(stored).toContain('trail-3')
  })
})

// ── TC-COL-011: inicializa a partir do localStorage ───────────────────────────

describe('useTrailCollapse — inicialização', () => {
  it('TC-COL-011a: carrega IDs salvos no localStorage ao montar', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['trail-1', 'trail-3']))
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    expect(result.current.collapsed.has('trail-1')).toBe(true)
    expect(result.current.collapsed.has('trail-3')).toBe(true)
    expect(result.current.collapsed.has('trail-2')).toBe(false)
  })

  it('TC-COL-011b: inicia com Set vazio quando localStorage está vazio', async () => {
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    expect(result.current.collapsed.size).toBe(0)
  })
})

// ── TC-COL-012: JSON inválido não quebra o hook ───────────────────────────────

describe('useTrailCollapse — resiliência', () => {
  it('TC-COL-012: JSON inválido no localStorage inicializa com Set vazio sem lançar erro', async () => {
    localStorage.setItem(STORAGE_KEY, '{{invalid_json')

    expect(() => {
      const { result } = renderHook(() => useTrailCollapse())
      return result
    }).not.toThrow()

    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    expect(result.current.collapsed.size).toBe(0)
  })
})

// ── TC-COL-013: remove limpa IDs órfãos ──────────────────────────────────────

describe('useTrailCollapse — remove', () => {
  it('TC-COL-013a: remove limpa trailId colapsado e persiste no localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['trail-abc', 'trail-xyz']))
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    act(() => result.current.remove('trail-abc'))

    expect(result.current.collapsed.has('trail-abc')).toBe(false)
    expect(result.current.collapsed.has('trail-xyz')).toBe(true)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
    expect(stored).not.toContain('trail-abc')
    expect(stored).toContain('trail-xyz')
  })

  it('TC-COL-013b: remove de ID inexistente não altera o Set', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['trail-xyz']))
    const { result } = renderHook(() => useTrailCollapse())
    await act(async () => {})

    const before = result.current.collapsed.size

    act(() => result.current.remove('trail-nao-existe'))

    expect(result.current.collapsed.size).toBe(before)
  })
})
