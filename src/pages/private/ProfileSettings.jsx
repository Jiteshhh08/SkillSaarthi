import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { updateName, uploadAvatar, removeAvatar, avatarUrl } from '../../services/auth'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Icon from '../../components/common/Icon'

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif'
const MAX_MB = 5

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const existingAvatar = avatarUrl(user)
  const showInitial = !file && !preview && !existingAvatar

  const handlePick = (event) => {
    setError('')
    setNotice('')
    const picked = event.target.files?.[0]
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WEBP, or GIF).')
      return
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large — keep it under ${MAX_MB} MB.`)
      return
    }
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name.')
      return
    }
    setSaving(true)
    try {
      if (trimmed !== user?.name) {
        await updateName(trimmed)
      }
      if (file) {
        await uploadAvatar(file)
      }
      await refreshUser()
      setFile(null)
      setPreview('')
      setNotice('Profile updated.')
    } catch (err) {
      setError(err?.message || 'Unable to update your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await removeAvatar()
      setFile(null)
      setPreview('')
      await refreshUser()
      setNotice('Profile picture removed.')
    } catch (err) {
      setError(err?.message || 'Unable to remove the picture. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-deep">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Update profile</h1>
          <p className="mt-2 text-lg text-ink-muted">
            Change your display name and profile picture. Your email stays fixed for logins.
          </p>
        </header>

        {error && (
          <p className="mt-6 rounded-md bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-6 rounded-md bg-success-soft px-4 py-3 text-sm font-bold text-success">
            {notice}
          </p>
        )}

        <form onSubmit={handleSave} className="card mt-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={saving}
                className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-brand-soft text-2xl font-black text-brand-deep ring-2 ring-line transition-shadow hover:shadow-card-hover disabled:opacity-60"
                aria-label="Choose a profile picture"
              >
                {showInitial ? (
                  (user?.name || 'U').charAt(0).toUpperCase()
                ) : (
                  <img
                    src={preview || existingAvatar}
                    alt={user?.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-brand text-white shadow-card-rest">
                <Icon name="camera" size={16} />
              </span>
            </div>
            <div className="text-sm">
              <p className="font-bold text-ink">{user?.name}</p>
              <p className="mt-0.5 text-ink-muted">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={saving}
                  className="text-sm font-bold text-brand-deep hover:underline disabled:opacity-50"
                >
                  {existingAvatar || preview ? 'Change picture' : 'Upload picture'}
                </button>
                {(existingAvatar || preview) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={saving}
                    className="text-sm font-bold text-danger hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handlePick}
            className="sr-only"
          />

          <label className="mt-6 block text-sm font-bold text-ink" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input-base mt-1"
          />

          <label className="mt-4 block text-sm font-bold text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            readOnly
            value={user?.email || ''}
            className="input-base mt-1 cursor-not-allowed bg-surface-soft text-ink-muted"
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-text">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Tip: your profile picture is shown next to your name in the top bar.
        </p>
      </main>

      <Footer />
    </div>
  )
}