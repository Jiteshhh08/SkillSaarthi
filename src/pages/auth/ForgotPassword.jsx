import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createRecovery } from '../../services/auth'
import TopBar from '../../components/layout/TopBar'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownTimer = useRef(null)

  const startCooldown = () => {
    setCooldown(30)
    if (cooldownTimer.current) clearInterval(cooldownTimer.current)
    cooldownTimer.current = setInterval(() => {
      setCooldown((seconds) => {
        if (seconds <= 1) {
          clearInterval(cooldownTimer.current)
          cooldownTimer.current = null
          return 0
        }
        return seconds - 1
      })
    }, 1000)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createRecovery(email)
      setSent(true)
      startCooldown()
    } catch (err) {
      setError(
        err?.message ||
          'Unable to send a recovery email. Check the email address and try again.'
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
          <h1 className="text-2xl font-black tracking-tight">Forgot password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          {sent && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-deep">
              If an account exists for {email}, a recovery link is on its way. Check
              your inbox (and spam folder). The link expires in about one hour.
            </p>
          )}

          <label className="mt-6 block text-sm font-bold text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            disabled={sent}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base mt-1 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={submitting || sent || cooldown > 0}
            className="btn-primary mt-6 w-full disabled:opacity-50"
          >
            {submitting
              ? 'Sending…'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : sent
                  ? 'Email sent'
                  : 'Send recovery email'}
          </button>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-brand-deep hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}