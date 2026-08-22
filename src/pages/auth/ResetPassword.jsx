import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { updateRecovery } from '../../services/auth'
import TopBar from '../../components/layout/TopBar'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const secret = searchParams.get('secret') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

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
      await updateRecovery(userId, secret, password)
      navigate('/login')
    } catch (err) {
      setError(
        err?.message ||
          'Unable to reset your password. The link may have expired — request a new one.'
      )
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

          {!userId || !secret ? (
            <>
              <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                This reset link is invalid or incomplete. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn-primary mt-6 block w-full text-center">
                Request a new link
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-muted">
                Choose a new password for your account.
              </p>

              {error && (
                <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
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