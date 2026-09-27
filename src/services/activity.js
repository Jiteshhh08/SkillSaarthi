// Inactivity tracking — the "log out when idle" half of the access/refresh model.
//
// Appwrite JWTs are short-lived access tokens; the session underneath acts as
// the refresh token. api.js only mints a fresh JWT while the human is active —
// once idle past the access-token lifetime it stops refreshing, and
// AuthContext ends the session. Reading from localStorage keeps this
// consistent across tabs.

const KEY = 'ss_last_activity'

// Idle longer than one access-token lifetime => session must die, not refresh.
export const INACTIVITY_LIMIT_MS = 15 * 60 * 1000

const WRITE_THROTTLE_MS = 5000
const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel']

let lastWrite = 0
let attached = false

export function touchActivity() {
  try {
    const now = Date.now()
    if (now - lastWrite < WRITE_THROTTLE_MS) return
    lastWrite = now
    localStorage.setItem(KEY, String(now))
  } catch {
    // storage unavailable: stay fail-open, session check still gates
  }
}

export function clearActivity() {
  lastWrite = 0
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export function lastActivity() {
  try {
    const value = Number(localStorage.getItem(KEY))
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

export function isIdleTimeout(limitMs = INACTIVITY_LIMIT_MS) {
  const last = lastActivity()
  if (!last) return false // never tracked: fail open, session check still gates
  return Date.now() - last > limitMs
}

function onActivityEvent() {
  touchActivity()
}

export function initActivityTracking() {
  if (attached || typeof window === 'undefined') return
  attached = true
  touchActivity() // page load itself counts as presence
  for (const evt of EVENTS) {
    window.addEventListener(evt, onActivityEvent, { passive: true, capture: true })
  }
}

export function destroyActivityTracking() {
  if (!attached || typeof window === 'undefined') return
  attached = false
  for (const evt of EVENTS) {
    window.removeEventListener(evt, onActivityEvent, { capture: true })
  }
}
