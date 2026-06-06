// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('useTheme', () => {
  it('valor inicial é dark quando não há preferência salva', async () => {
    const { result } = renderHook(() => useTheme())
    // estado síncrono inicial é 'dark'
    expect(result.current.theme).toBe('dark')
  })

  it('lê tema do data-theme attribute no mount', async () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const { result } = renderHook(() => useTheme())
    await act(async () => {}) // aguarda useEffect
    expect(result.current.theme).toBe('light')
  })

  it('toggle muda de dark para light', async () => {
    const { result } = renderHook(() => useTheme())
    await act(async () => {})
    act(() => { result.current.toggle() })
    expect(result.current.theme).toBe('light')
  })

  it('toggle muda de light para dark', async () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const { result } = renderHook(() => useTheme())
    await act(async () => {})
    act(() => { result.current.toggle() })
    expect(result.current.theme).toBe('dark')
  })

  it('toggle persiste tema no localStorage', async () => {
    const { result } = renderHook(() => useTheme())
    await act(async () => {})
    act(() => { result.current.toggle() })
    expect(localStorage.getItem('nl_theme')).toBe('light')
  })

  it('toggle aplica data-theme no documentElement', async () => {
    const { result } = renderHook(() => useTheme())
    await act(async () => {})
    act(() => { result.current.toggle() })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
