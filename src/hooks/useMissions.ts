'use client'

import { useState, useEffect, useCallback } from 'react'
import { ensureMissionsForPeriod, type UserMission } from '@/services/missionsService'

interface UseMissionsReturn {
  dailyMissions: UserMission[]
  weeklyMissions: UserMission[]
  loading: boolean
  refresh: () => void
}

export function useMissions(userId: string | null): UseMissionsReturn {
  const [dailyMissions, setDailyMissions] = useState<UserMission[]>([])
  const [weeklyMissions, setWeeklyMissions] = useState<UserMission[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) {
      setDailyMissions([])
      setWeeklyMissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const all = await ensureMissionsForPeriod(userId)
    setDailyMissions(all.filter((m) => m.periodType === 'daily'))
    setWeeklyMissions(all.filter((m) => m.periodType === 'weekly'))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Recarrega quando qualquer evento de missão é disparado
  useEffect(() => {
    const handler = () => load()
    window.addEventListener('nl:missions_updated', handler)
    return () => window.removeEventListener('nl:missions_updated', handler)
  }, [load])

  return { dailyMissions, weeklyMissions, loading, refresh: load }
}
