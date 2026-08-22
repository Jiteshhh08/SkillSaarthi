import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../../services/authApi'
import TopBar from '../../components/layout/TopBar'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!token || token.length < 10) {
        setStatus('error')
        setMessage('This verification link is invalid or incomplete. Please request a new one.')
        return
      }
      try {
        const res = await verifyEmail(token)
        if (!cancelled) {
          setStatus('success')
          setMessage(res.message || 'Email verified successfully.')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          const msg =
            err?.response?.data?.message ||
            'Verification failed. The link may have expired or already been used.'
          setMessage(msg)
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-warm px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-card-rest text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-brand-soft" />
              <h1 className="mt-4 text-xl font-black">Verifying your email…</h1>
              <p className="mt-2 text-sm text-ink-muted">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                <span className="text-2xl" aria-hidden>✓</span>
              </div>
              <h1 className="mt-4 text-xl font-black text-success">Email verified!</h1>
              <p className="mt-2 text-sm text-ink-muted">{message}</p>
              <p className="mt-2 text-sm text-ink-muted">You now have full access to all features.</p>
              <Link to="/login" className="btn-primary mt-6 block w-full text-center">
                Continue to login
              </Link>
              <Link to="/home" className="btn-secondary mt-3 block w-full text-center">
                Go to home
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
                <span className="text-xl" aria-hidden>✕</span>
              </div>
              <h1 className="mt-4 text-xl font-black">Verification failed</h1>
              <p className="mt-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{message}</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/verify-pending" className="btn-primary block w-full text-center">
                  Resend verification email
                </Link>
                <Link to="/login" className="btn-secondary block w-full text-center">
                  Back to login
                </Link>
              </div>
              <p className="mt-4 text-xs text-ink-soft">If you already verified, try logging in directly.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
