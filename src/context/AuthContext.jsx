import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signUp as signUpApi,
} from '../services/auth'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser)
      })
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    await loginApi(email, password)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    return currentUser
  }, [])

  const signUp = useCallback(async (name, email, password) => {
    await signUpApi(name, email, password)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    return currentUser
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}