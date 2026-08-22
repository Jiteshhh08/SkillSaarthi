import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'

export function ProtectedRoute({ children, allowUnverified = false }) {
  const { user, loading, emailVerified, verificationLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || (!allowUnverified && verificationLoading) || (!allowUnverified && adminLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verified check: admins bypass, null = legacy/unknown -> allow
  if (!allowUnverified && !isAdmin && emailVerified === false) {
    return <Navigate to="/verify-pending" replace />
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
  const { user, profile, loading, profileLoading, emailVerified, verificationLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || verificationLoading || adminLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Email verification gate (admins bypass, legacy users with null pass through)
  if (!isAdmin && emailVerified === false) {
    return <Navigate to="/verify-pending" replace />
  }

  if (!isProfileComplete(profile) && !isAdmin) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export function VerifiedRoute({ children }) {
  const { user, loading, emailVerified, verificationLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || verificationLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin && emailVerified === false) {
    return <Navigate to="/verify-pending" replace />
  }

  return children
}