import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signUp as signUpApi,
} from '../services/auth'
import { getProfile } from '../services/profile'
import { touchStreak } from '../services/streak'
import { getVerificationStatus } from '../services/authApi'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [streak, setStreak] = useState({ current: 0, best: 0 })
  const [emailVerified, setEmailVerified] = useState(null) // null = unknown/loading, true/false = known
  const [verificationLoading, setVerificationLoading] = useState(false)

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

  const refreshVerification = useCallback(async () => {
    if (!user?.$id) {
      setEmailVerified(null)
      return null
    }
    setVerificationLoading(true)
    try {
      const res = await getVerificationStatus()
      setEmailVerified(Boolean(res.verified))
      return res.verified
    } catch {
      // Fallback: check Appwrite emailVerification and profile field
      const appwriteVerified = Boolean(user?.emailVerification)
      const profileVerified = profile?.is_email_verified
      // Treat undefined as verified for legacy users
      if (profileVerified === false) {
        setEmailVerified(false)
        return false
      }
      if (appwriteVerified) {
        setEmailVerified(true)
        return true
      }
      // If profile has no field and appwrite says not verified, assume verified for legacy
      // New users will have profile.is_email_verified = false explicitly
      if (profile && profile.is_email_verified === undefined) {
        setEmailVerified(true)
        return true
      }
      setEmailVerified(false)
      return false
    } finally {
      setVerificationLoading(false)
    }
  }, [user?.$id, user?.emailVerification, profile])

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
      // Fetch verification status (non-blocking)
      setVerificationLoading(true)
      getVerificationStatus()
        .then((res) => {
          if (active) setEmailVerified(Boolean(res.verified))
        })
        .catch(() => {
          if (!active) return
          // Fallback logic
          const appwriteVerified = Boolean(user.emailVerification)
          const profileVerified = profile?.is_email_verified
          if (profileVerified === false) setEmailVerified(false)
          else if (appwriteVerified) setEmailVerified(true)
          else if (profile && profile.is_email_verified === undefined) setEmailVerified(true)
          else setEmailVerified(false)
        })
        .finally(() => {
          if (active) setVerificationLoading(false)
        })
    } else {
      setEmailVerified(null)
    }
    return () => {
      active = false
    }
  }, [user, profile])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoading,
        loading,
        streak,
        emailVerified,
        verificationLoading,
        login,
        signUp,
        logout,
        refreshProfile,
        refreshUser,
        refreshVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}