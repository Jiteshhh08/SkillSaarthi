import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signUp as signUpApi,
} from '../services/auth'
import { getProfile } from '../services/profile'
import { touchStreak } from '../services/streak'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [streak, setStreak] = useState({ current: 0, best: 0 })

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

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    return currentUser
  }, [])

  useEffect(() => {
    let mounted = true

    async function boot() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return
        setUser(currentUser)
        setLoading(false)
        const fetched = await getProfile(currentUser.$id)
        if (mounted) setProfile(fetched)
      } catch {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    boot()

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
    setStreak({ current: 0, best: 0 })
  }, [])

  useEffect(() => {
    let active = true
    if (user) {
      setStreak({ current: 0, best: 0 })
      touchStreak(user.$id).then((result) => {
        if (active) setStreak(result)
      })
    }
    return () => {
      active = false
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoading,
        loading,
        streak,
        login,
        signUp,
        logout,
        refreshProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}