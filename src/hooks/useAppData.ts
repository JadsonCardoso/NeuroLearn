'use client'

import { useAppContext } from '@/store/AppContext'
import type { AppState, AppAction } from '@/types'
import type React from 'react'

export interface UseAppDataReturn {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  userId: string | null
  loading: boolean
}

export function useAppData(): UseAppDataReturn {
  const { state, dispatch, userId, loading } = useAppContext()
  return { state, dispatch, userId, loading }
}
