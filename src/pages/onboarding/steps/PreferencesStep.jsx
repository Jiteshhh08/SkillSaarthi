import { useState } from 'react'
import FieldError from '../../../components/common/FieldError'
import Icon from '../../../components/common/Icon'
import {
  CAREER_ROLES,
  GOAL_TIMEFRAMES,
  PREFERRED_INDUSTRIES,
  PREFERRED_LOCATIONS,
  WORK_PREFERENCES,
} from '../../../services/profile'
import { required, validateFields } from '../../../utils/validation'

function buildGoalSentence(role, timeframe) {
  if (!role) return ''
  return timeframe ? `Become a ${role} ${timeframe}` : `Become a ${role}`
}

function findInitialGoal(initialGoal, field) {
  if (!initialGoal) return ''
  const lower = initialGoal.toLowerCase()
  const candidates = field === 'role' ? CAREER_ROLES : GOAL_TIMEFRAMES
  return candidates.find((item) => lower.includes(item.toLowerCase())) || ''
}

export default function PreferencesStep({ initial, saving, onSave, onSkip }) {
  const initialRole = findInitialGoal(initial?.career_goal, 'role')
  const initialTimeframe = findInitialGoal(initial?.career_goal, 'timeframe')

  const [form, setForm] = useState({
    career_goal_role: initialRole || initial?.preferred_role || '',
    career_goal_timeframe: initialTimeframe || '',
    preferred_industry: initial?.preferred_industry || '',
    preferred_role: initial?.preferred_role || initialRole || '',
    preferred_location: initial?.preferred_location || '',
    work_preference: initial?.work_preference || '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const rulesFor = (values) => ({
    career_goal_role: [() => required(values.career_goal_role, 'Target career')],
    career_goal_timeframe: [() => required(values.career_goal_timeframe, 'Goal timeframe')],
    preferred_industry: [() => required(values.preferred_industry, 'Preferred industry')],
    preferred_role: [() => required(values.preferred_role, 'Preferred role')],
    preferred_location: [() => required(values.preferred_location, 'Preferred location')],
    work_preference: [() => required(values.work_preference, 'Work preference')],
  })

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
    if (touched[key] || errors[key]) {
      setErrors((current) => ({ ...current, [key]: validateFields(rulesFor({ ...form, [key]: value }))[key] || '' }))
    }
  }

  const setTouchedFor = (key) => () => {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors((current) => ({ ...current, [key]: validateFields(rulesFor(form))[key] || '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const messages = validateFields(rulesFor(form))
    setErrors(messages)
    setTouched(Object.fromEntries(Object.keys(form).map((key) => [key, true])))
    if (Object.values(messages).some(Boolean)) return
    onSave({
      career_goal: buildGoalSentence(form.career_goal_role, form.career_goal_timeframe),
      preferred_role: form.preferred_role,
      preferred_industry: form.preferred_industry,
      preferred_location: form.preferred_location,
      work_preference: form.work_preference,
    })
  }

  const selectClass = (key) => `input-base mt-1${errors[key] ? ' input-invalid' : ''}`
  const errorId = (key) => (errors[key] ? `${key}-error` : undefined)
  const fieldProps = (key) => ({
    value: form[key],
    onChange: set(key),
    onBlur: setTouchedFor(key),
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errorId(key),
    className: selectClass(key),
  })
  const renderError = (key) => <FieldError id={`${key}-error`}>{errors[key]}</FieldError>

  return (
    <div>
      <h2 className="text-center text-xl font-bold">Your career preferences</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Tell us where you want to go — we will aim your recommendations there.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="career_goal_role">
            Career goal
          </label>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            <select id="career_goal_role" {...fieldProps('career_goal_role')}>
              <option value="">Target career…</option>
              {CAREER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select id="career_goal_timeframe" {...fieldProps('career_goal_timeframe')}>
              <option value="">Timeframe…</option>
              {GOAL_TIMEFRAMES.map((timeframe) => (
                <option key={timeframe} value={timeframe}>
                  {timeframe}
                </option>
              ))}
            </select>
          </div>
          {errors.career_goal_role || errors.career_goal_timeframe ? (
            <p className="field-error" role="alert">
              {errors.career_goal_role || errors.career_goal_timeframe}
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-soft">
              Your goal reads: <span className="font-bold text-ink">{buildGoalSentence(form.career_goal_role, form.career_goal_timeframe) || '—'}</span>
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="preferred_industry">
              Preferred industry
            </label>
            <select
              id="preferred_industry"
              {...fieldProps('preferred_industry')}
              className={`input-base mt-1${errors.preferred_industry ? ' input-invalid' : ''}`}
            >
              <option value="">Select industry…</option>
              {PREFERRED_INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {renderError('preferred_industry')}
          </div>

          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="preferred_role">
              Preferred role
            </label>
            <select
              id="preferred_role"
              {...fieldProps('preferred_role')}
              className={`input-base mt-1${errors.preferred_role ? ' input-invalid' : ''}`}
            >
              <option value="">Select role…</option>
              {CAREER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {renderError('preferred_role')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="preferred_location">
            Preferred location
          </label>
          <select
            id="preferred_location"
            {...fieldProps('preferred_location')}
            className={`input-base mt-1${errors.preferred_location ? ' input-invalid' : ''}`}
          >
            <option value="">Select location…</option>
            {PREFERRED_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {renderError('preferred_location')}
          <p className="mt-1 text-xs text-ink-soft">
            We use this to prioritise internships near you, or "Remote" / "Anywhere".
          </p>
        </div>

        <div>
          <span className="block text-sm font-bold text-ink">Work preference</span>
          <div className="mt-2 flex gap-3" role="group" aria-label="Work preference">
            {WORK_PREFERENCES.map((pref) => {
              const active = form.work_preference === pref.value
              return (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => {
                    const value = pref.value
                    setForm((current) => ({ ...current, work_preference: value }))
                    setErrors((current) => ({ ...current, work_preference: validateFields(rulesFor({ ...form, work_preference: value })).work_preference || '' }))
                    setTouched((current) => ({ ...current, work_preference: true }))
                  }}
                  aria-pressed={active}
                  className={`chip flex-1 justify-center ${active ? 'chip-active' : ''}${errors.work_preference ? ' border-danger text-danger' : ''}`}
                >
                  <span className="mr-1.5 inline-flex items-center text-brand-deep">
                    <Icon name={pref.icon} size={16} />
                  </span>
                  {pref.label}
                </button>
              )
            })}
          </div>
          {renderError('work_preference')}
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