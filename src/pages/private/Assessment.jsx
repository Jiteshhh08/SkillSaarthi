import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { submitAssessment } from '../../services/assessment'
import AssessmentStep from '../onboarding/steps/AssessmentStep'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

export default function Assessment() {
  const { user, profile, refreshProfile } = useAuth()
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleComplete = async (responses, result) => {
    setError('')
    setSaving(true)
    try {
      await submitAssessment(user.$id, responses)
      await refreshProfile(user.$id)
      setSaved(result)
    } catch (err) {
      setError(err?.message || 'Unable to save your assessment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {saved ? (
          <div className="card mx-auto max-w-2xl text-center">
            <p className="text-4xl">🎉</p>
            <h1 className="mt-3 text-2xl font-black">Assessment saved!</h1>
            <p className="mt-2 text-ink-muted">
              Your score is <span className="font-black text-brand-deep">{saved.score}%</span>. We
              use it together with your profile to rank your best career matches.
            </p>
            <button
              type="button"
              onClick={() => setSaved(null)}
              className="btn-secondary mt-6"
            >
              Retake assessment
            </button>
          </div>
        ) : (
          <>
            <header className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.08em]">Career assessment</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Discover your strengths</h1>
              <p className="mt-3 text-lg text-ink-muted">
                A short questionnaire that evaluates your interests, aptitude, and work style.
              </p>

              {profile?.assessment_score > 0 && (
                <p className="mx-auto mt-4 inline-block rounded-full bg-brand-soft px-4 py-2 text-sm font-bold text-brand-deep">
                  Last score: {profile.assessment_score}% — you can retake anytime
                </p>
              )}
            </header>

            {error && (
              <p className="mx-auto mt-6 max-w-xl rounded-md bg-danger-soft px-4 py-3 text-center text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-10">
              <AssessmentStep saving={saving} onComplete={handleComplete} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
