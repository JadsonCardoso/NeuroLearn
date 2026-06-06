// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { ToastProvider, useToastContext } from './ToastContext'

// Wrapper que envolve o hook no provider
function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(ToastProvider, null, children)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastContext — addToast', () => {
  it('adiciona um toast à lista', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => { result.current.addToast('success', 'Salvo!') })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Salvo!')
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('adiciona toast com title', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => { result.current.addToast('info', 'Mensagem', 'Título') })
    expect(result.current.toasts[0].title).toBe('Título')
  })

  it('define duração correta por tipo (success: 4000, error: 6000)', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => { result.current.addToast('success', 'ok') })
    expect(result.current.toasts[0].duration).toBe(4000)

    act(() => { result.current.addToast('error', 'falha') })
    expect(result.current.toasts[0].duration).toBe(6000)
  })

  it('insere o mais recente no topo da lista', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => {
      result.current.addToast('info', 'primeiro')
      result.current.addToast('info', 'segundo')
    })
    expect(result.current.toasts[0].message).toBe('segundo')
  })
})

describe('ToastContext — MAX_TOASTS', () => {
  it('não acumula mais de 3 toasts', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => {
      result.current.addToast('info', 'um')
      result.current.addToast('info', 'dois')
      result.current.addToast('info', 'três')
      result.current.addToast('info', 'quatro')
    })
    expect(result.current.toasts).toHaveLength(3)
  })

  it('o toast mais antigo é removido quando o limite é atingido', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => {
      result.current.addToast('info', 'um')
      result.current.addToast('info', 'dois')
      result.current.addToast('info', 'três')
      result.current.addToast('info', 'quatro')
    })
    const messages = result.current.toasts.map((t) => t.message)
    expect(messages).not.toContain('um')
    expect(messages).toContain('quatro')
  })
})

describe('ToastContext — removeToast', () => {
  it('marca o toast como "leaving" ao remover', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => { result.current.addToast('success', 'teste') })
    const id = result.current.toasts[0].id
    act(() => { result.current.removeToast(id) })
    expect(result.current.toasts[0].leaving).toBe(true)
  })

  it('remove o toast da lista após animação de saída', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    act(() => { result.current.addToast('success', 'teste') })
    const id = result.current.toasts[0].id
    act(() => {
      result.current.removeToast(id)
      vi.advanceTimersByTime(200) // LEAVE_ANIMATION_MS = 150
    })
    expect(result.current.toasts).toHaveLength(0)
  })
})
