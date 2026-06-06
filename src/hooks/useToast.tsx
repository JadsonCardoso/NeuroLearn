'use client'

import { useToastContext } from '@/store/ToastContext'

export function useToast() {
  const { addToast } = useToastContext()

  return {
    toast: {
      success: (message: string, title?: string) => addToast('success', message, title),
      error:   (message: string, title?: string) => addToast('error',   message, title),
      warning: (message: string, title?: string) => addToast('warning', message, title),
      info:    (message: string, title?: string) => addToast('info',    message, title),
    },
  }
}
