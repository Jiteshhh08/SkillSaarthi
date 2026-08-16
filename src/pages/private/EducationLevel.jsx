import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { EDUCATION_LEVELS, updateEducationLevel } from '../../services/profile'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Icon from '../../components/common/Icon'
import DecorativeShapes from '../../components/common/DecorativeShapes'

export default function EducationLevel() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canModify = Boolean(profile?.education_level)

  const handleSelect = async (value) => {
    if (saving) return
    setError('')
    setSaving(true)
    try {
      await updateEducationLevel(user.$id, value)
      await refreshProfile(user.$id)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Unable to save your education level. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Let&apos;s get to know you</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            {canModify ? 'Update your education level' : 'What best describes you?'}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Pick your current stage and we&apos;ll tailor your profile, recommendations, and
            learning roadmap to fit your journey.
          </p>
        </header>

        {error && (
          <p className="mx-auto mt-8 max-w-xl rounded-md bg-danger-soft px-4 py-3 text-center text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {EDUCATION_LEVELS.map((level, index) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleSelect(level.value)}
              disabled={saving}
              className="card card-hover group relative flex flex-col items-start overflow-hidden text-left disabled:opacity-60"
            >
              <DecorativeShapes variant="card" index={index} />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft">
                <Icon name={level.icon} size={26} className="text-brand-deep" />
              </span>
              <h3 className="mt-5 text-xl font-bold">{level.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{level.description}</p>
              <span className="mt-5 text-sm font-bold text-brand-deep group-hover:underline">
                {canModify ? 'Save this level →' : 'Continue →'}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-soft">
          You can change your education level later from your dashboard.
        </p>
      </main>

      <Footer />
    </div>
  )
}