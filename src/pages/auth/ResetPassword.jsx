import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword as resetViaBackend, checkResetToken } from '../../services/authApi'
import { updateRecovery } from '../../services/auth'
import TopBar from '../../components/layout/TopBar'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const userId = searchParams.get('userId') || ''
  const secret = searchParams.get('secret') || ''
  const isLegacy = !token && Boolean(userId && secret)
  const hasToken = Boolean(token || isLegacy)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [checking, setChecking] = useState(Boolean(token))
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setChecking(true)
    setTokenError('')
    checkResetToken(token)
      .catch((err) => {
        if (!cancelled) {
          setTokenError(err?.response?.data?.message || 'This reset link is invalid or has expired.')
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      if (token) {
        await resetViaBackend({ token, password, confirmPassword: confirm })
      } else {
        await updateRecovery(userId, secret, password)
      }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to reset your password. The link may have expired — request a new one.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card-rest">
          <h1 className="text-2xl font-black tracking-tight">Set a new password</h1>

          {success ? (
            <>
              <p className="mt-4 rounded-md bg-success-soft px-3 py-2 text-sm text-success">
                Password reset successfully. Redirecting to login…
              </p>
              <Link to="/login" className="btn-primary mt-6 block w-full text-center">
                Go to login
              </Link>
            </>
          ) : !hasToken ? (
            <>
              <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                This reset link is invalid or incomplete. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn-primary mt-6 block w-full text-center">
                Request a new link
              </Link>
            </>
          ) : checking ? (
            <p className="mt-4 text-sm text-ink-muted">Validating reset link…</p>
          ) : tokenError ? (
            <>
              <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{tokenError}</p>
              <Link to="/forgot-password" className="btn-primary mt-6 block w-full text-center">
                Request a new link
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-muted">Choose a new password for your account.</p>

              {error && (
                <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <label className="mt-6 block text-sm font-bold text-ink" htmlFor="password">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base mt-1"
              />
              <p className="mt-1 text-xs text-ink-soft">At least 8 characters.</p>

              <label className="mt-4 block text-sm font-bold text-ink" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-base mt-1"
              />

              <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-50">
                {submitting ? 'Resetting…' : 'Reset password'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}