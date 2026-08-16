import { useState } from 'react'
import Icon from '../../../components/common/Icon'
import {
  ASSESSMENT_DIMENSIONS,
  ASSESSMENT_QUESTIONS,
  scoreAssessment,
} from '../../../services/assessment'

export default function AssessmentStep({ saving, onComplete, onSkip }) {
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [showingResult, setShowingResult] = useState(false)

  const question = ASSESSMENT_QUESTIONS[index]
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === ASSESSMENT_QUESTIONS.length

  const selectOption = (optionIndex) => {
    const next = { ...answers, [question.id]: optionIndex }
    setAnswers(next)
    if (index < ASSESSMENT_QUESTIONS.length - 1) {
      setIndex(index + 1)
    } else {
      setResult(scoreAssessment(next))
      setShowingResult(true)
    }
  }

  const goBack = () => {
    if (index > 0) setIndex(index - 1)
  }

  const seeResults = () => {
    setResult(scoreAssessment(answers))
    setShowingResult(true)
  }

  if (showingResult && result) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-ink-muted">
            Your assessment score
          </p>
          <p className="mt-3 text-6xl font-black text-brand-deep">{result.score}%</p>
          <p className="mt-3 text-ink-muted">
            {result.score >= 70
              ? 'Strong career readiness — great foundation for recommendations.'
              : result.score >= 40
                ? 'Good foundation — a few areas to strengthen as you grow.'
                : 'Early stage — your roadmap will help you build up from here.'}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {result.dimensions.map((dim) => (
            <div key={dim.id} className="card !p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Icon name={dim.icon} size={18} className="text-brand-deep" />
                  {dim.label}
                </span>
                <span className="text-sm font-black text-brand-deep">{dim.score}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setShowingResult(false)
              setIndex(0)
            }}
            disabled={saving}
            className="btn-text"
          >
            Retake
          </button>
          <div className="flex items-center gap-3">
            {onSkip && (
              <button type="button" onClick={onSkip} disabled={saving} className="btn-text">
                Finish later
              </button>
            )}
            <button
              type="button"
              onClick={() => onComplete(answers, result)}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save results'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-center text-xl font-bold">Career assessment</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Answer honestly — there are no wrong answers. This powers your recommendations.
      </p>

      <div className="mt-8 flex items-center justify-between text-sm font-bold text-ink-muted">
        <span>
          Question {index + 1} of {ASSESSMENT_QUESTIONS.length}
        </span>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand-deep">
          {answeredCount} answered
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${(answeredCount / ASSESSMENT_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-bold leading-relaxed">{question.question}</h3>
        <div className="mt-5 space-y-3">
          {question.options.map((option, optionIndex) => {
            const active = answers[question.id] === optionIndex
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => selectOption(optionIndex)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-bold transition-colors ${
                  active
                    ? 'border-brand bg-brand-soft text-brand-deep'
                    : 'border-line bg-white text-ink hover:bg-surface-hover'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {index > 0 ? (
            <button type="button" onClick={goBack} className="btn-text">
              ← Back
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            {onSkip && (
              <button type="button" onClick={onSkip} disabled={saving} className="btn-text">
                Finish onboarding later
              </button>
            )}
            {allAnswered && (
              <button type="button" onClick={seeResults} className="btn-primary">
                See my results →
              </button>
            )}
          </div>
        </div>
      </div>

      {!allAnswered && index === ASSESSMENT_QUESTIONS.length - 1 && (
        <p className="mt-4 text-center text-sm text-ink-soft">
          Answer all questions to see your results, or use Back to review earlier answers.
        </p>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-ink-soft">We evaluate: {ASSESSMENT_DIMENSIONS.map((d) => d.label).join(' · ')}.</p>
      </div>
    </div>
  )
}
