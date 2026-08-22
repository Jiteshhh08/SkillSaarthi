import { useMemo, useState } from 'react'
import Icon from '../../../components/common/Icon'

const INTEREST_ICONS = {
  'Web Development': 'globe',
  'AI/ML': 'brain',
  Cybersecurity: 'shield-check',
  Cloud: 'cloud',
  Data: 'chart',
  Design: 'palette',
  Finance: 'wallet',
  Research: 'flask',
  Entrepreneurship: 'rocket',
  Gaming: 'gamepad',
  Education: 'book-open',
  Healthcare: 'heart-pulse',
}

export default function InterestsStep({ catalog, selected, saving, onSave, onSkip }) {
  const [current, setCurrent] = useState(selected)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((interest) => interest.name.toLowerCase().includes(q))
  }, [catalog, query])

  const originalIds = useMemo(() => new Set(Object.keys(selected)), [selected])
  const currentIds = useMemo(() => new Set(Object.keys(current)), [current])

  const toggle = (interestId) => {
    setError('')
    setCurrent((prev) => {
      const next = { ...prev }
      if (next[interestId]) {
        delete next[interestId]
      } else {
        next[interestId] = true
      }
      return next
    })
  }

  const handleSave = () => {
    if (selectedNames.length === 0) {
      setError('Select at least one interest so we can personalise your matches.')
      return
    }
    setError('')
    const removed = [...originalIds].filter((id) => !currentIds.has(id))
    const added = [...currentIds].filter((id) => !originalIds.has(id))
    onSave({ added, removed })
  }

  const selectedNames = catalog.filter((interest) => current[interest.$id]).map((i) => i.name)

  return (
    <div>
      <h2 className="text-center text-xl font-bold">What are you interested in?</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Choose as many as you like — interests heavily shape your career matches.
      </p>

      <div className="mx-auto mt-8 max-w-xl">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search interests…"
          className="input-base"
        />
      </div>

      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((interest) => {
          const active = Boolean(current[interest.$id])
          return (
            <button
              key={interest.$id}
              type="button"
              onClick={() => toggle(interest.$id)}
              className={`card card-hover flex items-center gap-3 !p-4 text-left ${
                active ? 'border-2 border-brand bg-brand-soft' : ''
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft">
                <Icon name={INTEREST_ICONS[interest.name] || 'star'} size={18} className="text-brand-deep" />
              </span>
              <span className="flex-1 text-sm font-bold">{interest.name}</span>
              {active && <span className="text-brand-deep">✓</span>}
            </button>
          )
        })}
      </div>

      {selectedNames.length > 0 && (
        <p className="mt-6 text-center text-sm text-ink-muted">
          Selected: <span className="font-bold text-ink">{selectedNames.join(', ')}</span>
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onSkip} disabled={saving} className="btn-text">
          Skip for now
        </button>
        <div className="text-right">
          {error && (
            <p role="alert" className="mb-2 text-sm font-bold text-danger">
              {error}
            </p>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
