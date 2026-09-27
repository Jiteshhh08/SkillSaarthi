import axios from 'axios'
import { account } from './appwrite'
import { isIdleTimeout } from './activity'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

let jwtCache = { token: '', exp: 0 }

export function clearJwtCache() {
  jwtCache = { token: '', exp: 0 }
}

function getJwtExp(token) {
  try {
    let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const payload = JSON.parse(atob(b64))
    return Number(payload.exp) ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

const PUBLIC_AUTH_PATHS = ['/api/auth/signup', '/api/auth/verify-otp', '/api/auth/resend-otp', '/api/auth/forgot-password', '/api/auth/verify-reset-otp', '/api/auth/reset-password', '/api/auth/check-reset-token']

api.interceptors.request.use(async (config) => {
  try {
    const url = String(config.url || '')
    if (PUBLIC_AUTH_PATHS.some((p) => url.includes(p))) {
      return config
    }
    const now = Date.now()
    // Idle gate: a fresh access token is only minted while the human is
    // active. Past the inactivity limit the session must die, not refresh.
    if (isIdleTimeout()) {
      clearJwtCache()
      return config
    }
    if (jwtCache.token && jwtCache.exp - 60_000 > now) {
      config.headers.Authorization = `Bearer ${jwtCache.token}`
      return config
    }
    // Only try JWT if we have a session — avoids 401 noise for anonymous
    try {
      await account.get()
    } catch {
      return config
    }
    const { jwt } = await account.createJWT()
    if (jwt) {
      jwtCache = { token: jwt, exp: getJwtExp(jwt) || now + 14 * 60 * 1000 }
      config.headers.Authorization = `Bearer ${jwt}`
    }
  } catch {
    // no active session: let the request proceed
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config
    const status = error?.response?.status
    // Fallback to fetch on 401: cached JWT may be stale/revoked before wall-clock exp.
    // Clear cache, mint a fresh JWT once, and retry the original request.
    if (status === 401 && original && !original._jwtRetried) {
      const url = String(original.url || '')
      if (PUBLIC_AUTH_PATHS.some((p) => url.includes(p))) {
        return Promise.reject(error)
      }
      original._jwtRetried = true
      clearJwtCache()
      // Same idle gate as the request path: never mint to recover from a
      // 401 when the human is gone — that 401 is the session dying.
      if (isIdleTimeout()) {
        return Promise.reject(error)
      }
      try {
        await account.get()
        const { jwt } = await account.createJWT()
        if (jwt) {
          jwtCache = { token: jwt, exp: getJwtExp(jwt) || Date.now() + 14 * 60 * 1000 }
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${jwt}`
          return api(original)
        }
      } catch {
        // no active session or mint failed: fall through to reject
      }
    }
    return Promise.reject(error)
  },
)

export default api