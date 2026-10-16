import { track } from '@vercel/analytics'

// Conversion / funnel events. Keep names short and stable — they become the
// event identifiers in the Vercel Analytics dashboard.
export const EVENTS = {
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_SUBMITTED: 'signup_submitted',
  LOGIN_SUCCESS: 'login_success',
}

/**
 * Fire a custom analytics event. Best-effort: analytics must never break the
 * user flow, so failures are swallowed.
 *
 * @param {string} name
 * @param {Record<string, string | number | boolean | null | undefined>} [properties]
 */
export function trackEvent(name, properties = {}) {
  try {
    track(name, properties)
  } catch {
    // no-op
  }
}
