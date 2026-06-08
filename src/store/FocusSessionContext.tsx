'use client'

import { createContext, useContext, useState } from 'react'

interface FocusSessionCtx {
  isRunning: boolean
  setIsRunning: (v: boolean) => void
}

const FocusSessionContext = createContext<FocusSessionCtx>({
  isRunning: false,
  setIsRunning: () => {},
})

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false)
  return (
    <FocusSessionContext.Provider value={{ isRunning, setIsRunning }}>
      {children}
    </FocusSessionContext.Provider>
  )
}

export const useFocusSession = () => useContext(FocusSessionContext)
