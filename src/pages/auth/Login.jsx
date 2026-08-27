import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getVerificationStatus } from '../../services/authApi'
import { getAdminStatus } from '../../services/admin'
import TopBar from '../../components/layout/TopBar'

const FORGOT_PASSWORD_ENABLED = true // enabled — Mailjet HTTPS active

export default function Login() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const pendingEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(pendingEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState(location.state?.message || '')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('verify') === 'pending') {
      setInfo(
        (prev) =>
          prev ||
          'Account created! Check your email to verify — then log in. We sent a link (expires in 24h, check spam).',
      )
    }
  }, [pendingEmail, searchParams])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await login(email, password)
      // Allow login, but gate home — keep session for resend/verify
      let isAdmin = false
      try {
        const adminStatus = await getAdminStatus()
        isAdmin = Boolean(adminStatus?.is_admin)
      } catch {
        // ignore — treat as non-admin
      }
      if (isAdmin) {
        navigate('/home')
        return
      }
      if (FORGOT_PASSWORD_ENABLED) {
        try {
          const v = await getVerificationStatus()
          if (!v.verified) {
            navigate('/verify-pending')
            return
          }
        } catch {
          // If verification service is down/unavailable, don't block — let RouteGuards handle
        }
      }
      navigate('/home')
    } catch (err) {
      const msg = err?.message || 'Unable to log in. Check your credentials.'
      const lower = msg.toLowerCase()
      if (lower.includes('invalid credentials') || lower.includes('user not found') || lower.includes('invalid email or password') || lower.includes('not found')) {
        setError('Invalid email or password.')
      } else if (lower.includes('rate limit') || lower.includes('too many')) {
        setError('Too many attempts. Please wait and try again.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card-rest">
          <h1 className="text-2xl font-black tracking-tight">Login</h1>
          <p className="mt-1 text-sm text-ink-muted">Welcome back to skillsaarthi.</p>

          {info && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-deep">{info}</p>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <label className="mt-6 block text-sm font-bold text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base mt-1"
          />

          <label className="mt-4 block text-sm font-bold text-ink" htmlFor="password">
            Password
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base flex-1"
            />
            {FORGOT_PASSWORD_ENABLED && (
              <Link
                to="/forgot-password"
                className="shrink-0 text-xs font-bold text-brand-deep hover:underline"
              >
                Forgot?
              </Link>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-50">
            {submitting ? 'Logging in…' : 'Login'}
          </button>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-bold text-brand-deep hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}