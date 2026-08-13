import { useState } from 'react'

const STUDY_YEARS = [1, 2, 3, 4, 5, 6]

export default function AcademicStep({ educationLevel, initial, saving, onSave, onSkip }) {
  const [form, setForm] = useState({
    degree: initial?.degree || '',
    branch: initial?.branch || '',
    study_year: initial?.study_year || '',
    cgpa: initial?.cgpa ?? '',
    experience_years: initial?.experience_years ?? '',
    subjects: initial?.subjects || '',
    academic_strengths: initial?.academic_strengths || '',
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
      <h2 className="text-center text-xl font-bold">A bit about your academics</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        This helps us recommend careers and skills that fit your background.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl space-y-5">
        {educationLevel === 'college' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="degree">
                Degree
              </label>
              <input
                id="degree"
                type="text"
                value={form.degree}
                onChange={set('degree')}
                placeholder="e.g. B.Tech, B.Sc, B.Com"
                className="input-base mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="branch">
                Branch / Stream
              </label>
              <input
                id="branch"
                type="text"
                value={form.branch}
                onChange={set('branch')}
                placeholder="e.g. Computer Science"
                className="input-base mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="study_year">
                Study year
              </label>
              <select
                id="study_year"
                value={form.study_year}
                onChange={set('study_year')}
                className="input-base mt-1"
              >
                <option value="">Select year…</option>
                {STUDY_YEARS.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink" htmlFor="cgpa">
                CGPA / grades
              </label>
              <input
                id="cgpa"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.cgpa}
                onChange={set('cgpa')}
                placeholder="e.g. 8.1"
                className="input-base mt-1"
              />
            </div>
          </div>
        )}

        {educationLevel === 'job_seeker' && (
          <div>
            <label className="block text-sm font-bold text-ink" htmlFor="experience_years">
              Years of work experience
            </label>
            <input
              id="experience_years"
              type="number"
              min="0"
              max="60"
              value={form.experience_years}
              onChange={set('experience_years')}
              placeholder="e.g. 2"
              className="input-base mt-1"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="subjects">
            {educationLevel === 'high_school' ? 'Favourite subjects' : 'Subjects you enjoy'}
          </label>
          <textarea
            id="subjects"
            rows={3}
            value={form.subjects}
            onChange={set('subjects')}
            placeholder="e.g. Mathematics, Physics, English — separate with commas"
            className="input-base mt-1 !h-auto resize-y py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="academic_strengths">
            Academic strengths
          </label>
          <input
            id="academic_strengths"
            type="text"
            value={form.academic_strengths}
            onChange={set('academic_strengths')}
            placeholder="e.g. analytical thinking, writing, public speaking"
            className="input-base mt-1"
          />
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
