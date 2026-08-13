import { useMemo, useState } from 'react'
import { PROFICIENCY_LEVELS, proficiencyLabel } from '../../../services/skills'

export default function SkillsStep({ catalog, selected, saving, onSave, onSkip }) {
  const [current, setCurrent] = useState(selected)
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const byCategory = {}
    for (const skill of catalog) {
      if (q && !skill.name.toLowerCase().includes(q)) continue
      const category = skill.category || 'General'
      if (!byCategory[category]) byCategory[category] = []
      byCategory[category].push(skill)
    }
    return byCategory
  }, [catalog, query])

  const originalIds = useMemo(() => new Set(Object.keys(selected)), [selected])
  const currentIds = useMemo(() => new Set(Object.keys(current)), [current])

  const toggleSkill = (skillId) => {
    setCurrent((prev) => {
      const next = { ...prev }
      if (next[skillId]) {
        delete next[skillId]
      } else {
        next[skillId] = 3
      }
      return next
    })
  }

  const setProficiency = (skillId, proficiency) => {
    setCurrent((prev) => ({ ...prev, [skillId]: proficiency }))
  }

  const handleSave = () => {
    const removed = [...originalIds].filter((id) => !currentIds.has(id))
    onSave({ updated: current, removed })
  }

  const selectedSkills = catalog.filter((skill) => current[skill.$id])

  return (
    <div>
      <h2 className="text-center text-xl font-bold">Which skills do you have?</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Pick what you already know and how good you are at it. You can always change this later.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills…"
            className="input-base"
          />
          <div className="mt-5 space-y-5">
            {Object.entries(groups).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-sm font-black uppercase tracking-wide text-ink-muted">
                  {category}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const active = Boolean(current[skill.$id])
                    return (
                      <button
                        key={skill.$id}
                        type="button"
                        onClick={() => toggleSkill(skill.$id)}
                        className={`chip ${active ? 'chip-active' : 'hover:border-brand'}`}
                      >
                        {active ? '✓ ' : '+ '}
                        {skill.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wide text-ink-muted">My skills</h3>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand-deep">
              {selectedSkills.length}
            </span>
          </div>

          {selectedSkills.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              No skills yet — tap skills on the left to add them.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedSkills.map((skill) => (
                <li key={skill.$id} className="rounded-md border border-line-soft bg-surface-soft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill.$id)}
                      className="text-xs font-black text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {PROFICIENCY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setProficiency(skill.$id, level.value)}
                        title={level.hint}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                          current[skill.$id] === level.value
                            ? 'bg-brand text-white'
                            : 'bg-white text-ink-muted hover:bg-surface-hover'
                        }`}
                      >
                        {level.value}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {proficiencyLabel(current[skill.$id])}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onSkip} disabled={saving} className="btn-text">
          Skip for now
        </button>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : 'Save & continue'}
        </button>
      </div>
    </div>
  )
}
