'use client'

import { useState, useEffect, useRef } from 'react'
import { upsertDraft } from '@/services/sessionDraftsService'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveInput {
  notes: string
  highlights: string[]
  teachText: string
  contentId: string
  userId: string
}

export function useAutoSave(input: AutoSaveInput): { saveStatus: SaveStatus } {
  const { notes, highlights, teachText, contentId, userId } = input
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef<boolean>(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!contentId || !userId) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await upsertDraft(userId, contentId, { notes, highlights, teachText })
        setSaveStatus('saved')
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
      } catch {
        setSaveStatus('error')
      }
    }, 1500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [notes, highlights, teachText, contentId, userId])

  return { saveStatus }
}
