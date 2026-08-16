import { getProfile, updateProfile } from './profile'

function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDateKey(key, days) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

/**
 * Records a daily activity and returns the updated streak counters.
 *
 * - Visited today already  -> no change
 * - Last visit was yesterday -> streak + 1
 * - Otherwise (first time or streak broken) -> streak resets to 1
 */
export async function touchStreak(userId) {
  const fallback = { current: 0, best: 0 }
  if (!userId) return fallback
  try {
    const profile = await getProfile(userId)
    const today = dateKey()
    const last = profile?.last_active_date || ''

    if (last === today) {
      return { current: Number(profile.current_streak) || 0, best: Number(profile.best_streak) || 0 }
    }

    let current = 1
    if (last === shiftDateKey(today, -1)) {
      current = (Number(profile.current_streak) || 0) + 1
    }
    const best = Math.max(Number(profile?.best_streak) || 0, current)

    await updateProfile(userId, {
      current_streak: current,
      best_streak: best,
      last_active_date: today,
    })
    return { current, best }
  } catch {
    return fallback
  }
}