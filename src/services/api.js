import axios from 'axios'
import { account } from './appwrite'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

api.interceptors.request.use(async (config) => {
  try {
    const { jwt } = await account.createJWT()
    if (jwt) {
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