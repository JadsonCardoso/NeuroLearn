export function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number,
): { streak: number; lastStudyDate: string } {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  if (lastStudyDate === today) return { streak: currentStreak, lastStudyDate: today }
  if (lastStudyDate === yesterday) return { streak: currentStreak + 1, lastStudyDate: today }
  return { streak: 1, lastStudyDate: today }
}
