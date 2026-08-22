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

api.interceptors.request.use(async (config) => {
  try {
    const now = Date.now()
    if (jwtCache.token && jwtCache.exp - 60_000 > now) {
      config.headers.Authorization = `Bearer ${jwtCache.token}`
      return config
    }
    const { jwt } = await account.createJWT()
    if (jwt) {
      jwtCache = { token: jwt, exp: getJwtExp(jwt) || now + 14 * 60 * 1000 }
      config.headers.Authorization = `Bearer ${jwt}`
    }
  } catch {
    // no active session: let the request proceed and fail auth downstream
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api