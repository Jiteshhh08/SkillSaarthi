import { useState } from 'react'
import { updateMyCommunityProfile } from '../../services/community'

export default function ProfileEditor({ initialProfile, onSaved }) {
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [location, setLocation] = useState(initialProfile?.location || '')
  const [role, setRole] = useState(initialProfile?.role || '')
  const [interests, setInterests] = useState(initialProfile?.interests?.join(', ') || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await updateMyCommunityProfile({
        bio: bio.trim(),
        location: location.trim(),
        role: role.trim(),
        interests: interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      })
      onSaved?.()
    } catch {
      setError('Could not save your profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" noValidate>
      <h2 className="text-xl font-bold tracking-tight">Edit community profile</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Shown on your public community profile next to your posts.
      </p>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Bio</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell the community about yourself, your goals, and your journey…"
          rows={4}
          className="input-base h-auto resize-y !py-3"
          maxLength={2000}
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Current role</span>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. CS student, job seeker"
            className="input-base"
            maxLength={200}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Location</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Mumbai, India"
            className="input-base"
            maxLength={200}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Interests</span>
        <input
          type="text"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="web development, data science, design"
          className="input-base"
        />
        <span className="mt-1 block text-xs text-ink-soft">Comma-separated, up to 8 interests</span>
      </label>

      {error && <p className="field-error mt-4">{error}</p>}

      <div className="mt-5 flex items-center justify-end gap-3">
        <button type="button" onClick={() => onSaved?.()} className="btn-text !text-sm">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary !h-10 !px-4 !text-sm">
          {submitting ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}