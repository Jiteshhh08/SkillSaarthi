import { EDUCATION_LEVELS } from '../../../services/profile'
import Icon from '../../../components/common/Icon'
import DecorativeShapes from '../../../components/common/DecorativeShapes'

export default function EducationStep({ value, saving, onSelect }) {
  return (
    <div>
      <h2 className="text-center text-xl font-bold">What best describes you?</h2>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Pick your current stage — we tailor your profile, skills, and assessment to it.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {EDUCATION_LEVELS.map((level, index) => {
          const active = value === level.value
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onSelect(level.value)}
              disabled={saving}
              className={`card card-hover group relative flex flex-col items-start overflow-hidden text-left disabled:opacity-60 ${
                active ? 'border-2 border-brand bg-brand-soft' : ''
              }`}
            >
              <DecorativeShapes variant="card" index={index} />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft">
                <Icon name={level.icon} size={26} className="text-brand-deep" />
              </span>
              <h3 className="mt-5 text-xl font-bold">{level.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                {level.description}
              </p>
              <span className="mt-5 text-sm font-bold text-brand-deep group-hover:underline">
                {active ? 'Selected ✓' : 'Choose →'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
