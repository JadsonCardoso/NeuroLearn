'use client'

interface StreakRecoveryBannerProps {
  streak: number
  shields: number
  onUseShield: () => void
  onDismiss: () => void
}

export function StreakRecoveryBanner({
  streak,
  shields,
  onUseShield,
  onDismiss,
}: StreakRecoveryBannerProps) {
  return (
    <div
      data-testid="streak-recovery-banner"
      role="alert"
      className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5" aria-hidden="true">
          🛡️
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-400">Streak em risco!</p>
          <p className="text-xs text-amber-300/80 mt-0.5">
            Você perdeu um dia e seu streak de{' '}
            <strong className="text-amber-300">{streak} dias</strong> vai resetar. Use um Streak
            Shield para preservá-lo.
          </p>
          <p className="text-xs text-amber-300/60 mt-1">
            Shields disponíveis: <strong className="text-amber-300">{shields}</strong>
          </p>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              data-testid="use-shield-button"
              onClick={onUseShield}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-medium px-3 py-1.5 transition-colors"
            >
              <span>🛡️</span>
              Usar Escudo
            </button>
            <button
              type="button"
              data-testid="dismiss-shield-button"
              onClick={onDismiss}
              className="rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-medium px-3 py-1.5 transition-colors"
            >
              Deixar resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
