'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppData } from '@/hooks/useAppData'
import { FocusView } from '@/modules/focus/FocusView'

export default function FocusPage() {
  const params = useParams()
  const router = useRouter()
  const { state } = useAppData()
  const contentId = params.contentId as string

  const content = state.contents.find((c) => c.id === contentId)

  useEffect(() => {
    if (!content) {
      router.push('/library')
    }
  }, [content, router])

  if (!content) return null

  return <FocusView content={content} />
}
