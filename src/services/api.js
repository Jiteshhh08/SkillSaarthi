import axios from 'axios'
import { account } from './appwrite'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

let jwtCache = { token: '', exp: 0 }

function getJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
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
  (error) => Promise.reject(error),
)

export default api