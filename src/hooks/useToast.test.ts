// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { useToast } from './useToast'
import { ToastProvider, useToastContext } from '@/store/ToastContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(ToastProvider, null, children)
}

describe('useToast', () => {
  it('expõe toast.success, error, warning, info', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    expect(typeof result.current.toast.success).toBe('function')
    expect(typeof result.current.toast.error).toBe('function')
    expect(typeof result.current.toast.warning).toBe('function')
    expect(typeof result.current.toast.info).toBe('function')
  })

  it('toast.success não lança erros', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    expect(() => result.current.toast.success('Operação concluída!')).not.toThrow()
  })

  it('toast.success com title não lança erros', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    expect(() => result.current.toast.success('Mensagem', 'Título')).not.toThrow()
  })

  it('useToastContext expõe toasts como array', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper })
    expect(Array.isArray(result.current.toasts)).toBe(true)
  })
})
