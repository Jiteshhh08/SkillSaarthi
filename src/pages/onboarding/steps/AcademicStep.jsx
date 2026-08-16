import { useState } from 'react'
import FieldError from '../../../components/common/FieldError'
import {
  ACADEMIC_STRENGTHS,
  ACADEMIC_SUBJECTS,
  DEGREES,
  branchesForDegree,
  yearsForDegree,
} from '../../../services/profile'
import {
  decimalInRange,
  integerInRange,
  required,
  validateFields,
} from '../../../utils/validation'

function parsePrefill(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Only keep stored values that are still valid for the selected degree, so a
// user can never keep an old combo (e.g. B.Tech + B.Com stream) after the data
// model changes.
function normalizeAcademicInitial(initial) {
  const degree = DEGREES.includes(initial?.degree) ? initial.degree : ''
  const branches = branchesForDegree(degree)
  const years = yearsForDegree(degree)
  const branch = branches.includes(initial?.branch) ? initial.branch : ''
  const year = String(initial?.study_year ?? '')
  const study_year = years.includes(Number(year)) && year !== '' ? year : ''
  return { degree, branch, study_year }
}

export default function AcademicStep({ educationLevel, initial, saving, onSave, onSkip }) {
  const normalized = normalizeAcademicInitial(initial)
  const [form, setForm] = useState({
    degree: normalized.degree,
    branch: normalized.branch,
    study_year: normalized.study_year,
    cgpa: initial?.cgpa ?? '',
    experience_years: initial?.experience_years ?? '',
  })
  const [subjects, setSubjects] = useState(parsePrefill(initial?.subjects))
  const [strengths, setStrengths] = useState(parsePrefill(initial?.academic_strengths))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const isCollege = educationLevel === 'college'
  const isJobSeeker = educationLevel === 'job_seeker'
  const isHighSchool = educationLevel === 'high_school'

  const subjectsLabel = isHighSchool ? 'Favourite subjects' : 'Subjects you enjoy'

  const rulesFor = (values) => {
    const rules = {
      subjects: [() => required(subjects, subjectsLabel)],
      strengths: [() => required(strengths, 'Academic strengths')],
    }
    if (isCollege) {
      rules.degree = [() => required(values.degree, 'Degree')]
      rules.branch = [
        () => required(values.branch, 'Branch / Stream'),
        () =>
          values.branch &&
          !branchesForDegree(values.degree).includes(values.branch)
            ? 'This branch does not belong to the selected degree'
            : '',
      ]
      rules.study_year = [
        () => required(values.study_year, 'Study year'),
        () =>
          values.study_year &&
          !yearsForDegree(values.degree).includes(Number(values.study_year))
            ? `Year ${values.study_year} is not valid for this degree`
            : '',
      ]
      rules.cgpa = [() => required(values.cgpa, 'CGPA / grades'), () => decimalInRange(values.cgpa, 'CGPA / grades', 0, 10)]
    } else if (isJobSeeker) {
      rules.experience_years = [() => required(values.experience_years, 'Years of work experience'), () => integerInRange(values.experience_years, 'Years of work experience', 0, 60)]
    }
    return rules
  }

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
    if (touched[key] || errors[key]) {
      setErrors((current) => ({ ...current, [key]: validateFields(rulesFor({ ...form, [key]: value }))[key] || '' }))
    }
  }

  const handleDegreeChange = (event) => {
    const degree = event.target.value
    setForm((current) => {
      const validBranches = branchesForDegree(degree)
      const validYears = yearsForDegree(degree)
      return {
        ...current,
        degree,
        branch: validBranches.includes(current.branch) ? current.branch : '',
        study_year: validYears.includes(Number(current.study_year)) ? current.study_year : '',
      }
    })
    setErrors((current) => ({ ...current, degree: '', branch: '', study_year: '' }))
    setTouched((current) => ({ ...current, degree: true, branch: false, study_year: false }))
  }

  const setTouchedFor = (key) => () => {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors((current) => ({ ...current, [key]: validateFields(rulesFor(form))[key] || '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const messages = validateFields(rulesFor(form))
    setErrors(messages)
    setTouched(Object.fromEntries(Object.keys({ ...form, subjects, strengths }).map((key) => [key, true])))
    if (Object.values(messages).some(Boolean)) return
    onSave({
      ...form,
      subjects: subjects.join(', '),
      academic_strengths: strengths.join(', '),
    })
  }

  const errorId = (key) => (errors[key] ? `${key}-error` : undefined)
  const fieldProps = (key) => ({
    value: form[key],
    onChange: set(key),
    onBlur: setTouchedFor(key),
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errorId(key),
  })
  const renderError = (key) => <FieldError id={`${key}-error`}>{errors[key]}</FieldError>

  const ChipGroup = ({ title, hint, options, selected, onToggle, fieldKey, renderErrorFn }) => (
    <div>
      <span className="block text-sm font-bold text-ink">{title}</span>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={title}>
        {options.map((option) => {
          const active = selected.includes(option.name)
          return (
            <button
              key={option.name}
              type="button"
              aria-pressed={active}
              onClick={() => {
                const next = active
                  ? selected.filter((item) => item !== option.name)
                  : [...selected, option.name]
                onToggle(next)
                setErrors((current) => ({ ...current, [fieldKey]: '' }))
              }}
              className={`chip ${active ? 'chip-active' : 'hover:border-brand'}${errors[fieldKey] ? ' border-danger text-danger' : ''}`}
            >
              {active ? '✓ ' : '+ '}
              {option.name}
            </button>
          )
        })}
      </div>
      {renderErrorFn(fieldKey)}
    </div>
  )

  return (
    <div>
      <h2 className="text-center text-xl font-bold">A bit about your academics</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        What you study and what you're good at get added to your skill profile — so your matches
        reflect your real strengths.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 max-w-xl space-y-5">
        {isCollege && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="degree">
                Degree
              </label>
              <select
                id="degree"
                {...fieldProps('degree')}
                onChange={handleDegreeChange}
                className={`input-base mt-1${errors.degree ? ' input-invalid' : ''}`}
              >
                <option value="">Select degree…</option>
                {DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
              {renderError('degree')}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="branch">
                Branch / Stream
              </label>
              <select
                id="branch"
                {...fieldProps('branch')}
                className={`input-base mt-1${errors.branch ? ' input-invalid' : ''}`}
              >
                <option value="">Select branch…</option>
                {branchesForDegree(form.degree).map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              {renderError('branch')}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="study_year">
                Study year
              </label>
              <select
                id="study_year"
                {...fieldProps('study_year')}
                className={`input-base mt-1${errors.study_year ? ' input-invalid' : ''}`}
              >
                <option value="">Select year…</option>
                {yearsForDegree(form.degree).map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
              {renderError('study_year')}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="cgpa">
                CGPA / grades
              </label>
              <input
                id="cgpa"
                type="number"
                inputMode="decimal"
                min="0"
                max="10"
                step="0.1"
                placeholder="e.g. 8.1"
                {...fieldProps('cgpa')}
                className={`input-base mt-1${errors.cgpa ? ' input-invalid' : ''}`}
              />
              {renderError('cgpa')}
            </div>
          </div>
        )}

        {isJobSeeker && (
          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="experience_years">
              Years of work experience
            </label>
            <input
              id="experience_years"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
                            step="1"
              placeholder="e.g. 2"
              {...fieldProps('experience_years')}
              className={`input-base mt-1${errors.experience_years ? ' input-invalid' : ''}`}
            />
            {renderError('experience_years')}
          </div>
        )}

        <ChipGroup
          title={subjectsLabel}
          hint="Pick the ones you enjoy — these add related skills to your profile."
          options={ACADEMIC_SUBJECTS}
          selected={subjects}
          onToggle={setSubjects}
          fieldKey="subjects"
          renderErrorFn={renderError}
        />

        <ChipGroup
          title="Academic strengths"
          hint="Pick what you're naturally good at — these become soft skills in your profile."
          options={ACADEMIC_STRENGTHS}
          selected={strengths}
          onToggle={setStrengths}
          fieldKey="strengths"
          renderErrorFn={renderError}
        />

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