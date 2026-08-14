import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getAdminStatus } from '../services/admin'

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const check = async () => {
      if (!user) {
        if (active) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }
      try {
        const status = await getAdminStatus()
        if (active) setIsAdmin(Boolean(status?.is_admin))
      } catch {
        if (active) setIsAdmin(false)
      } finally {
        if (active) setLoading(false)
      }
    }
    setLoading(true)
    check()
    return () => {
      active = false
    }
  }, [user])

  return { isAdmin, loading }
}