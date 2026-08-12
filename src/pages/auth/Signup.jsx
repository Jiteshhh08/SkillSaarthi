import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import TopBar from '../../components/layout/TopBar'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signUp(name, email, password)
      navigate('/onboarding/education-level')
    } catch (err) {
      setError(err?.message || 'Unable to create your account.')
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
          <p className="mt-1 text-sm text-ink-muted">Start your career journey.</p>

          {error && (
            <p className="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
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