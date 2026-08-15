import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getAdminStatus } from '../services/admin'

const adminCache = new Map()

export function useAdmin() {
  const { user } = useAuth()
  const userId = user?.$id
  const cached = userId ? adminCache.get(userId) : null
  const [isAdmin, setIsAdmin] = useState(cached?.isAdmin || false)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let active = true
    const check = async () => {
      if (!userId) {
        if (active) {
          setLoading(false)
        }
        return
      }
      if (adminCache.has(userId)) {
        if (active) {
          setIsAdmin(Boolean(adminCache.get(userId)?.isAdmin))
          setLoading(false)
        }
        return
      }
      try {
        const status = await getAdminStatus()
        const value = Boolean(status?.is_admin)
        adminCache.set(userId, { isAdmin: value })
        if (active) setIsAdmin(value)
      } catch {
        if (active) setIsAdmin(false)
      } finally {
        if (active) setLoading(false)
      }
    }
    setLoading(!adminCache.has(userId))
    check()
    return () => {
      active = false
    }
  }, [userId])

  return { isAdmin, loading }
}