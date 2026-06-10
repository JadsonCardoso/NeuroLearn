'use client'

import { useState } from 'react'
import type { UserMission } from '@/services/missionsService'

interface MissionItemProps {
  mission: UserMission
}

function MissionItem({ mission }: MissionItemProps) {
  const pct = Math.min(100, Math.round((mission.progress / mission.goal) * 100))
  const done = mission.completed

  return (
    <div
      data-testid="mission-item"
      className={`rounded-lg border p-3 transition-colors ${
        done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--border)] bg-[var(--card)]'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5">{mission.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm font-medium truncate ${
                done ? 'text-emerald-400 line-through' : 'text-[var(--foreground)]'
              }`}
            >
              {mission.title}
            </p>
            <span className="text-xs text-[var(--muted)] shrink-0">
              {mission.progress}/{mission.goal}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{mission.description}</p>

          {/* Barra de progresso */}
          <div
            className="mt-2 h-1.5 rounded-full bg-[var(--border)] overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                done ? 'bg-emerald-500' : 'bg-violet-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {done && (
          <span className="text-emerald-400 text-lg leading-none shrink-0" aria-label="Concluída">
            ✓
          </span>
        )}
      </div>

      {done && <p className="text-xs text-emerald-400 mt-1.5 text-right">+{mission.xpReward} XP</p>}
    </div>
  )
}

interface MissionsPanelProps {
  dailyMissions: UserMission[]
  weeklyMissions: UserMission[]
  loading: boolean
}

export function MissionsPanel({ dailyMissions, weeklyMissions, loading }: MissionsPanelProps) {
  const [open, setOpen] = useState(true)

  if (loading) {
    return (
      <div
        data-testid="missions-panel-loading"
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-[var(--border)]" />
          <div className="h-12 rounded bg-[var(--border)]" />
          <div className="h-12 rounded bg-[var(--border)]" />
        </div>
      </div>
    )
  }

  const allMissions = [...dailyMissions, ...weeklyMissions]
  if (allMissions.length === 0) return null

  const completedCount = allMissions.filter((m) => m.completed).length

  return (
    <div
      data-testid="missions-panel"
      className="rounded-xl border border-[var(--border)] bg-[var(--card)]"
    >
      {/* Cabeçalho com toggle */}
      <button
        type="button"
        data-testid="missions-panel-toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--muted)]/10 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="font-semibold text-sm text-[var(--foreground)]">Missões</span>
          <span className="text-xs text-[var(--muted)] bg-[var(--border)] rounded-full px-2 py-0.5">
            {completedCount}/{allMissions.length}
          </span>
        </div>
        <span className="text-[var(--muted)] text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Seção diárias */}
          {dailyMissions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">
                Diárias
              </p>
              <div className="space-y-2">
                {dailyMissions.map((m) => (
                  <MissionItem key={m.id} mission={m} />
                ))}
              </div>
            </div>
          )}

          {/* Seção semanais */}
          {weeklyMissions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">
                Semanais
              </p>
              <div className="space-y-2">
                {weeklyMissions.map((m) => (
                  <MissionItem key={m.id} mission={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
