import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendVerificationEmail } from '../../services/authApi'
import { useAuth } from '../../hooks/useAuth'

const EMAIL_VERIFICATION_ENABLED = true // enabled — SendGrid HTTPS active

export default function VerificationBanner() {
  if (!EMAIL_VERIFICATION_ENABLED) return null
  const { user, emailVerified, verificationLoading } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (verificationLoading || emailVerified !== false || !user) return null

  const handleResend = async () => {
    setSending(true)
    setError('')
    try {
      await sendVerificationEmail()
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-b border-warning bg-warning-soft px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-warning">Email not verified</span>
          <span className="text-ink-muted">
            Please verify <span className="font-bold text-ink">{user.email}</span> to unlock all features.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {sent && <span className="text-xs font-bold text-success">Email sent!</span>}
          {error && <span className="text-xs text-danger">{error}</span>}
          <button
            onClick={handleResend}
            disabled={sending}
            className="rounded-full bg-warning px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-600 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
          <Link
            to="/verify-pending"
            className="rounded-full border border-warning bg-white px-4 py-1.5 text-xs font-bold text-warning hover:bg-warning-soft"
          >
            Verify now
          </Link>
        </div>
      </div>
    </div>
  )
}
