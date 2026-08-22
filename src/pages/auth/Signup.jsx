import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupPending } from '../../services/authApi'
import TopBar from '../../components/layout/TopBar'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      const res = await signupPending({ name: name.trim(), email: email.trim(), password })
      // store pending email for OTP screen convenience
      localStorage.setItem('pending_email', email.trim().toLowerCase())
      if (res._dev_otp) {
        setInfo(`Dev mode: OTP is ${res._dev_otp} (also logged on server console).`)
      }
      // Redirect to OTP verification — DO NOT create Appwrite user yet
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to create your account.'
      const lower = msg.toLowerCase()
      if (lower.includes('already exists') || lower.includes('user with the same')) {
        setError('An account with this email already exists. Try logging in or reset your password.')
      } else if (err?.response?.status === 429) {
        setError('Too many requests. Please wait and try again.')
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
           <h1 className="text-2xl font-black tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Verify your email before your account is created — no data is stored until you confirm.</p>

          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-deep">{info}</p>
          )}

          <label className="mt-6 block text-sm font-bold text-ink" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base mt-1"
          />

          <label className="mt-4 block text-sm font-bold text-ink" htmlFor="email">
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

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-50">
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>

          <p className="mt-4 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-deep hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}