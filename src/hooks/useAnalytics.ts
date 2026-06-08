import { useCallback } from 'react'
import posthog from 'posthog-js'
import * as Sentry from '@sentry/nextjs'

// Tipos de eventos rastreados no NeuroLearn
export type AnalyticsEventName =
  | 'session_started'
  | 'session_completed'
  | 'card_reviewed'
  | 'review_completed'
  | 'achievement_unlocked'
  | 'content_created'
  | 'flashcard_generated'
  | 'login_magic_link_sent'

interface EventProperties {
  session_started: { content_id: string; phase: 'study' | 'extract' | 'teach'; duration_secs: number }
  session_completed: { content_id: string; phase: 'study' | 'extract' | 'teach'; duration_secs: number }
  card_reviewed: { rating: number; content_id?: string }
  review_completed: { cards_reviewed: number; cognitive_score_delta: number }
  achievement_unlocked: { achievement_id: string; xp_gained: number }
  content_created: { content_id: string; has_flashcards: boolean }
  flashcard_generated: { content_id: string; card_count: number }
  login_magic_link_sent: { email_domain: string }
}

export function useAnalytics() {
  const track = useCallback(
    <E extends AnalyticsEventName>(event: E, properties: EventProperties[E]) => {
      try {
        if (typeof posthog !== 'undefined' && posthog.__loaded) {
          posthog.capture(event, properties as Record<string, unknown>)
        }
      } catch (err) {
        // Falha de analytics nunca deve quebrar a UI
        Sentry.captureException(err)
      }
    },
    []
  )

  const identifyUser = useCallback((userId: string, traits?: Record<string, unknown>) => {
    try {
      if (typeof posthog !== 'undefined' && posthog.__loaded) {
        posthog.identify(userId, traits)
      }
      Sentry.setUser({ id: userId })
    } catch {
      // silencioso
    }
  }, [])

  const resetUser = useCallback(() => {
    try {
      if (typeof posthog !== 'undefined' && posthog.__loaded) {
        posthog.reset()
      }
      Sentry.setUser(null)
    } catch {
      // silencioso
    }
  }, [])

  return { track, identifyUser, resetUser }
}
