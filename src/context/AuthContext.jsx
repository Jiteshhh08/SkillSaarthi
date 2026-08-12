import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signUp as signUpApi,
} from '../services/auth'
import { getProfile } from '../services/profile'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId) => {
    const id = userId || user?.$id
    if (!id) {
      setProfile(null)
      return null
    }
    const fetched = await getProfile(id)
    setProfile(fetched)
    return fetched
  }, [user?.$id])

  useEffect(() => {
    let mounted = true

    getCurrentUser()
      .then(async (currentUser) => {
        if (!mounted) return
        setUser(currentUser)
        const fetched = await getProfile(currentUser.$id)
        if (mounted) setProfile(fetched)
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
    const fetched = await getProfile(currentUser.$id)
    setProfile(fetched)
    return currentUser
  }, [])

  const signUp = useCallback(async (name, email, password) => {
    await signUpApi(name, email, password)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    const fetched = await getProfile(currentUser.$id)
    setProfile(fetched)
    return currentUser
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
    setProfile(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signUp, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}