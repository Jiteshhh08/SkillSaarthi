import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'
import AnimatedLoader from './AnimatedLoader'

const EMAIL_VERIFICATION_ENABLED = true // enabled — SendGrid HTTPS active

export function ProtectedRoute({ children, allowUnverified = false }) {
  const { user, loading, emailVerified, verificationLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || (EMAIL_VERIFICATION_ENABLED && !allowUnverified && verificationLoading) || (!allowUnverified && adminLoading)) {
    return <AnimatedLoader message="Preparing your workspace…" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verified check: admins bypass, null = legacy/unknown -> allow — disabled when EMAIL_VERIFICATION_ENABLED=false
  if (EMAIL_VERIFICATION_ENABLED && !allowUnverified && !isAdmin && emailVerified === false) {
    return <Navigate to="/verify-pending" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AnimatedLoader message="Getting things ready…" />
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}

export function ProfileCompleteRoute({ children }) {
  const { user, profile, loading, profileLoading, emailVerified, verificationLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (loading || adminLoading || profileLoading) {
    return <AnimatedLoader message="Loading your career hub…" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Email verification gate - show loader only if truly unverified, don't block on verificationLoading flicker
  if (EMAIL_VERIFICATION_ENABLED && !isAdmin && emailVerified === false && !verificationLoading) {
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

  if (loading || adminLoading) {
    return <AnimatedLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (EMAIL_VERIFICATION_ENABLED && !isAdmin && emailVerified === false && !verificationLoading) {
    return <Navigate to="/verify-pending" replace />
  }

  return children
}