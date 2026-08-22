import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { verifyOtp, resendOtp } from '../../services/authApi'
import TopBar from '../../components/layout/TopBar'

export default function VerifyOtp() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialEmail = searchParams.get('email') || localStorage.getItem('pending_email') || ''
  const autoOtp = searchParams.get('otp') || searchParams.get('token') || ''

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [autoVerifying, setAutoVerifying] = useState(false)
  const timerRef = useRef(null)
  const inputRefs = useRef([])

  const startCooldown = (sec = 60) => {
    setCooldown(sec)
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

  // Auto-verify if link contains email+otp
  useEffect(() => {
    if (initialEmail && autoOtp && autoOtp.length >= 4) {
      setEmail(initialEmail)
      setOtp(autoOtp)
      // auto trigger verification
      const run = async () => {
        setAutoVerifying(true)
        setError('')
        try {
          await verifyOtp({ email: initialEmail, otp: autoOtp })
          setSuccess('Email verified successfully! Account created. Redirecting to login…')
          localStorage.removeItem('pending_email')
          setTimeout(() => navigate('/login', { state: { message: 'Email verified! Please log in with your new credentials.' } }), 1500)
        } catch (err) {
          const msg = err?.response?.data?.message || 'Auto-verification failed. Please enter the OTP manually.'
          setError(msg)
        } finally {
          setAutoVerifying(false)
        }
      }
      run()
    }
  }, [initialEmail, autoOtp, navigate])

  const handleOtpChange = (value, index) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const newOtpArray = otp.split('')
    // ensure length 6
    while (newOtpArray.length < 6) newOtpArray.push('')
    newOtpArray[index] = clean
    const joined = newOtpArray.join('').slice(0, 6)
    setOtp(joined)
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      e.preventDefault()
      setOtp(pasted)
      const idx = Math.min(pasted.length, 5)
      inputRefs.current[idx]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e?.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }
    setVerifying(true)
    try {
      await verifyOtp({ email: email.trim(), otp: otp.trim() })
      setSuccess('Email verified successfully! Account created. Redirecting to login…')
      localStorage.removeItem('pending_email')
      setTimeout(() => navigate('/login', { state: { message: 'Email verified! Please log in with your new credentials.' } }), 1200)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Verification failed. Please try again.'
      setError(msg)
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email to resend the code.')
      return
    }
    setResending(true)
    setError('')
    setSuccess('')
    try {
      const res = await resendOtp(email.trim())
      if (res.already_exists) {
        setSuccess('Account already exists. Please log in.')
        setTimeout(() => navigate('/login'), 1000)
        return
      }
      setSuccess('New code sent! Check your inbox (and spam).')
      startCooldown(60)
      // dev helper
      if (res._dev_otp) {
        setSuccess(`New code sent! (dev OTP: ${res._dev_otp}) — Check server console.`)
      }
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || 'Failed to resend code.'
      setError(msg)
      if (status === 429) startCooldown(60)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-card-rest">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
            <span className="text-2xl" aria-hidden>✉️</span>
          </div>
          <h1 className="mt-4 text-center text-2xl font-black tracking-tight">Verify your email</h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            We sent a 6-digit code to <span className="font-bold text-ink">{email || 'your email'}</span>. Enter it below to activate your account. The code expires in 10 minutes.
          </p>

          {autoVerifying && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-center text-sm text-brand-deep">Verifying via link… please wait</p>
          )}

          {success && (
            <p className="mt-4 rounded-md bg-success-soft px-3 py-2 text-sm text-success">{success}</p>
          )}
          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <form onSubmit={handleVerify} className="mt-6">
            <label className="block text-sm font-bold text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                localStorage.setItem('pending_email', e.target.value)
              }}
              placeholder="you@example.com"
              className="input-base mt-1"
            />

            <label className="mt-4 block text-sm font-bold text-ink">Verification code</label>
            <div className="mt-2 flex justify-between gap-2" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="h-12 w-12 rounded-lg border border-line bg-white text-center text-lg font-black tracking-widest text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">You can also paste the full 6-digit code.</p>

            <button type="submit" disabled={verifying || autoVerifying} className="btn-primary mt-6 w-full disabled:opacity-50">
              {verifying ? 'Verifying…' : 'Verify & create account'}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {resending ? 'Resending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-ink-soft">
            Didn&apos;t receive the code? Check spam or click resend (60s cooldown, old code becomes invalid).
          </p>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Already verified? <Link to="/login" className="font-bold text-brand-deep hover:underline">Log in</Link>
            {' · '}
            <Link to="/signup" className="font-bold text-brand-deep hover:underline">Back to signup</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
