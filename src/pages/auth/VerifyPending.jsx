import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getVerificationStatus, sendVerificationEmail } from '../../services/authApi'
import TopBar from '../../components/layout/TopBar'

export default function VerifyPending() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  const email = user?.email || ''

  const startCooldown = () => {
    setCooldown(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleCheck = async () => {
    setChecking(true)
    setError('')
    try {
      const status = await getVerificationStatus()
      if (status.verified) {
        await refreshUser()
        navigate('/home')
      } else {
        setMessage('Your email is not verified yet. Please check your inbox and click the verification link.')
        setTimeout(() => setMessage(''), 4000)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to check verification status.')
    } finally {
      setChecking(false)
    }
  }

  const handleResend = async () => {
    setSending(true)
    setError('')
    setMessage('')
    try {
      const res = await sendVerificationEmail()
      if (res.already_verified) {
        setMessage('Your email is already verified. Redirecting...')
        await refreshUser()
        setTimeout(() => navigate('/home'), 1000)
      } else {
        setMessage('Verification email sent. Please check your inbox (and spam folder).')
        startCooldown()
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send verification email. Please try again.'
      const status = err?.response?.status
      if (status === 429) {
        setError(msg)
        startCooldown()
      } else {
        setError(msg)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-card-rest text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
            <span className="text-2xl" aria-hidden>✉️</span>
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-ink-muted">
            We sent a verification link to <span className="font-bold text-ink">{email || 'your email'}</span>.
            Click the link in the email to verify your account. The link expires in 24 hours.
          </p>

          {message && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-deep">{message}</p>
          )}
          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
            </button>
            <button
              onClick={handleCheck}
              disabled={checking}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'I have verified — continue'}
            </button>
          </div>

          <p className="mt-6 text-xs text-ink-soft">
            Did not receive the email? Check your spam folder or click resend. The resend button is rate-limited to prevent spam.
          </p>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Wrong email?{' '}
            <Link to="/login" className="font-bold text-brand-deep hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
