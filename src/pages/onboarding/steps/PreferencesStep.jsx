import { useState } from 'react'
import { PREFERRED_INDUSTRIES, WORK_PREFERENCES } from '../../../services/profile'

export default function PreferencesStep({ initial, saving, onSave, onSkip }) {
  const [form, setForm] = useState({
    career_goal: initial?.career_goal || '',
    preferred_industry: initial?.preferred_industry || '',
    preferred_role: initial?.preferred_role || '',
    preferred_location: initial?.preferred_location || '',
    work_preference: initial?.work_preference || '',
  })

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold">Your career preferences</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Tell us where you want to go — we will aim your recommendations there.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="career_goal">
            Career goal
          </label>
          <input
            id="career_goal"
            type="text"
            value={form.career_goal}
            onChange={set('career_goal')}
            placeholder="e.g. Become a full stack developer in 2 years"
            className="input-base mt-1"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="preferred_industry">
              Preferred industry
            </label>
            <select
              id="preferred_industry"
              value={form.preferred_industry}
              onChange={set('preferred_industry')}
              className="input-base mt-1"
            >
              <option value="">Select industry…</option>
              {PREFERRED_INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="preferred_role">
              Preferred role
            </label>
            <input
              id="preferred_role"
              type="text"
              value={form.preferred_role}
              onChange={set('preferred_role')}
              placeholder="e.g. Frontend Developer"
              className="input-base mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="preferred_location">
            Preferred location
          </label>
          <input
            id="preferred_location"
            type="text"
            value={form.preferred_location}
            onChange={set('preferred_location')}
            placeholder="e.g. Bangalore, Remote, Anywhere"
            className="input-base mt-1"
          />
        </div>

        <div>
          <span className="block text-sm font-bold text-ink">Work preference</span>
          <div className="mt-2 flex gap-3">
            {WORK_PREFERENCES.map((pref) => {
              const active = form.work_preference === pref.value
              return (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, work_preference: pref.value }))}
                  className={`chip flex-1 justify-center ${active ? 'chip-active' : ''}`}
                >
                  <span className="mr-1.5">{pref.icon}</span>
                  {pref.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onSkip} disabled={saving} className="btn-text">
            Skip for now
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save & continue'}
          </button>
        </div>
      </form>
    </div>
  )
}
