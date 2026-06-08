'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAnalytics } from '@/hooks/useAnalytics'

// Identifica o usuário autenticado no PostHog e Sentry uma vez por sessão
export function AnalyticsIdentifier() {
  const { identifyUser } = useAnalytics()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        identifyUser(data.user.id, {
          email: data.user.email,
          created_at: data.user.created_at,
        })
      }
    })
  }, [identifyUser])

  return null
}
