import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../../services/authApi'
import TopBar from '../../components/layout/TopBar'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownTimer = useRef(null)
  const navigate = useNavigate()

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
    setDevOtp('')
    setSubmitting(true)
    try {
      const res = await forgotPassword(email)
      setSent(true)
      if (res?._dev_otp) {
        setDevOtp(res._dev_otp)
      } else if (res?._dev_token) {
        setDevOtp(res._dev_token)
      }
      startCooldown()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message
      if (err?.response?.status === 429) {
        setError(msg || 'Too many requests. Please wait and try again.')
        startCooldown()
      } else {
        setError(msg || 'Unable to send a recovery code. Check the email address and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (event) => {
    event.preventDefault()
    setResetError('')
    if (!otp.trim() || otp.trim().length < 4) {
      setResetError('Enter the 6-digit code from your email.')
      return
    }
    if (password.length < 8) {
      setResetError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setResetError('Passwords do not match.')
      return
    }
    setResetting(true)
    try {
      await resetPassword({ email, otp: otp.trim(), password, confirmPassword: confirm })
      setResetSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to reset password. Check the code and try again.'
      setResetError(msg)
    } finally {
      setResetting(false)
    }
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
          <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card-rest text-center">
            <p className="rounded-md bg-success-soft px-3 py-2 text-sm font-bold text-success">Password reset successfully. Redirecting to login…</p>
            <Link to="/login" className="btn-primary mt-6 block w-full text-center">Go to login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card-rest">
          <h1 className="text-2xl font-black tracking-tight">Forgot password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter your email and we&apos;ll send you a 6-digit code. Your password will only be updated after you verify the code.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          {sent && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-deep">
              If an account exists for {email}, a code is on its way. Check inbox (and spam). Code expires in 10 minutes.
            </p>
          )}
          {devOtp && (
            <div className="mt-4 rounded-md border border-dashed border-brand bg-brand-soft/50 px-3 py-2">
              <p className="text-xs font-bold text-brand-deep">Dev mode — Email not configured:</p>
              <p className="mt-1 break-all text-xs text-ink">OTP: <span className="font-black">{devOtp}</span></p>
              <p className="mt-1 text-xs text-ink-soft">Use this code to reset. Also logged on server console.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-sm font-bold text-ink" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base mt-1"
            />
            <button type="submit" disabled={submitting || cooldown > 0} className="btn-primary mt-4 w-full disabled:opacity-50">
              {submitting ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend code' : 'Send code'}
            </button>
          </form>

          {sent && (
            <form onSubmit={handleReset} className="mt-6 border-t border-line-soft pt-6">
              <p className="text-sm font-bold text-ink">Verify & reset</p>
              {resetError && <p className="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{resetError}</p>}
              <label className="mt-4 block text-sm font-bold text-ink" htmlFor="otp">6-digit code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="input-base mt-1 tracking-widest text-center text-lg font-black"
              />
              <label className="mt-4 block text-sm font-bold text-ink" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base mt-1"
              />
              <label className="mt-4 block text-sm font-bold text-ink" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-base mt-1"
              />
              <button type="submit" disabled={resetting} className="btn-primary mt-6 w-full disabled:opacity-50">
                {resetting ? 'Resetting…' : 'Verify code & reset password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-muted">
            Remembered it? <Link to="/login" className="font-bold text-brand-deep hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}