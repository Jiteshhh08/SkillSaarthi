import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [streakLoading, setStreakLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(null) // null = unknown/loading, true/false = known
  const [verificationLoading, setVerificationLoading] = useState(false)
  const lastStreakUserId = useRef(null)

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

  // Streak: runs once per user per session, reuses already-fetched profile to save 1 DB read
  useEffect(() => {
    let active = true
    if (user?.$id) {
      if (lastStreakUserId.current === user.$id) return // already touched this session
      const cached = profile && profile.$id === user.$id ? profile : null
      if (profileLoading && !cached) return // wait for boot profile to avoid extra read
      setStreakLoading(true)
      touchStreak(user.$id, cached).then((result) => {
        if (active) {
          setStreak(result)
          setStreakLoading(false)
          lastStreakUserId.current = user.$id
        }
      }).catch(() => {
        if (active) setStreakLoading(false)
      })
    } else {
      lastStreakUserId.current = null
      setStreakLoading(false)
    }
    return () => {
      active = false
    }
  }, [user?.$id, profile, profileLoading])

  // Email verification: non-blocking, uses profile fallback
  useEffect(() => {
    let active = true
    if (user) {
      setVerificationLoading(true)
      getVerificationStatus()
        .then((res) => {
          if (active) setEmailVerified(Boolean(res.verified))
        })
        .catch(() => {
          if (!active) return
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
        streakLoading,
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