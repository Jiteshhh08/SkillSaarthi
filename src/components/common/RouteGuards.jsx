import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}

export function ProfileCompleteRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin && !isProfileComplete(profile)) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}