import { useState } from 'react'
import Icon from '../common/Icon'

const SKILL_CATEGORIES = [
  ['languages', 'Languages'],
  ['frameworks', 'Frameworks'],
  ['libraries', 'Libraries'],
  ['databases', 'Databases'],
  ['tools', 'Tools'],
  ['cloud', 'Cloud'],
  ['other', 'Other'],
]

function TextField({ label, value, onChange, placeholder = '', textarea = false }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</span>
      {textarea ? (
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-base mt-1 h-auto min-h-24 py-2"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-base mt-1"
        />
      )}
    </label>
  )
}

function LinesField({ label, value, onChange, placeholder = '' }) {
  const text = (value || []).join('\n')
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</span>
      <textarea
        value={text}
        onChange={(event) =>
          onChange(
            event.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        placeholder={placeholder}
        rows={Math.max(2, Math.min((value || []).length + 1, 8))}
        className="input-base mt-1 h-auto min-h-16 py-2"
      />
    </label>
  )
}

function ItemCard({ title, children, onRemove, canRemove = true }) {
  return (
    <div className="rounded-md border border-line bg-surface-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-ink">{title}</p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-danger-soft hover:text-danger"
            aria-label={`Remove ${title}`}
          >
            <Icon name="log-out" size={16} />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-brand px-3 py-1.5 text-sm font-bold text-brand-deep hover:bg-brand-soft"
    >
      <span className="text-base leading-none">+</span> {label}
    </button>
  )
}

const blankEducation = () => ({
  institution: '',
  degree: '',
  field: '',
  location: '',
  start_date: '',
  end_date: '',
  gpa: '',
  bullets: [],
})
const blankExperience = () => ({
  company: '',
  title: '',
  location: '',
  start_date: '',
  end_date: '',
  bullets: [],
  technologies: [],
})
const blankProject = () => ({
  name: '',
  link: '',
  description: '',
  bullets: [],
  technologies: [],
})
const blankCertification = () => ({ name: '', issuer: '', date: '' })

function skillsToLines(items) {
  return (items || []).map((item) => (typeof item === 'string' ? item : item?.name || '')).filter(Boolean)
}

function linesToSkills(lines, existing) {
  const byName = new Map()
  for (const item of existing || []) {
    if (item && item.name) byName.set(item.name.toLowerCase(), item)
  }
  return lines.map((line) => {
    const prev = byName.get(line.toLowerCase())
    return prev ? { ...prev, name: line } : { name: line, evidence: null }
  })
}

export default function ResumeEditor({ resume, onChange, disabled = false }) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const data = resume || {}

  const personal = data.personal || {}
  const skills = data.skills || {}
  const education = data.education || []
  const experience = data.experience || []
  const projects = data.projects || []
  const certifications = data.certifications || []
  const achievements = data.achievements || []
  const coursework = data.coursework || []
  const extracurriculars = data.extracurriculars || []

  const update = (patch) => onChange({ ...data, ...patch })

  const updatePersonal = (key) => (value) =>
    update({ personal: { ...personal, [key]: value } })

  const updateList = (key) => (index, field) => (value) => {
    const list = data[key] || []
    const next = list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    update({ [key]: next })
  }

  const removeItem = (key) => (index) => () => {
    const list = data[key] || []
    update({ [key]: list.filter((_, i) => i !== index) })
  }

  const updateSkills = (category) => (lines) =>
    update({ skills: { ...skills, [category]: linesToSkills(lines, skills[category]) } })

  return (
    <div className="space-y-6">
      <fieldset disabled={disabled}>
        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">
            Contact &amp; profile
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Full name" value={personal.name} onChange={updatePersonal('name')} />
            <TextField label="Headline / title" value={personal.title} onChange={updatePersonal('title')} />
            <TextField label="Email" value={personal.email} onChange={updatePersonal('email')} />
            <TextField label="Phone" value={personal.phone} onChange={updatePersonal('phone')} />
            <TextField label="Location" value={personal.location} onChange={updatePersonal('location')} />
            <TextField label="LinkedIn URL" value={personal.linkedin} onChange={updatePersonal('linkedin')} />
            <TextField label="GitHub URL" value={personal.github} onChange={updatePersonal('github')} />
            <TextField label="Portfolio URL" value={personal.portfolio} onChange={updatePersonal('portfolio')} />
          </div>
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Summary</p>
          <TextField
            label="Professional summary"
            textarea
            value={data.summary}
            onChange={(value) => update({ summary: value })}
            placeholder="One or two sentences about who you are and what you bring."
          />
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Skills</p>
          <div className="grid gap-3 md:grid-cols-2">
            {SKILL_CATEGORIES.map(([key, label]) => (
              <LinesField
                key={key}
                label={label}
                value={skillsToLines(skills[key])}
                onChange={updateSkills(key)}
                placeholder="One skill per line"
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Experience</p>
          {experience.length === 0 && (
            <p className="text-sm text-ink-muted">No experience entries yet.</p>
          )}
          <div className="space-y-3">
            {experience.map((item, index) => (
              <ItemCard
                key={index}
                title={item.title || item.company || `Experience ${index + 1}`}
                onRemove={removeItem('experience')(index)}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="Company" value={item.company} onChange={updateList('experience')(index, 'company')} />
                  <TextField label="Title" value={item.title} onChange={updateList('experience')(index, 'title')} />
                  <TextField label="Location" value={item.location} onChange={updateList('experience')(index, 'location')} />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Start" value={item.start_date} onChange={updateList('experience')(index, 'start_date')} placeholder="e.g. 2023-06" />
                    <TextField label="End" value={item.end_date} onChange={updateList('experience')(index, 'end_date')} placeholder="e.g. 2025-06 or Present" />
                  </div>
                </div>
                <div className="mt-3">
                  <LinesField
                    label="Achievements / bullets"
                    value={item.bullets}
                    onChange={(value) => updateList('experience')(index, 'bullets')(value)}
                    placeholder="One bullet per line"
                  />
                </div>
                <div className="mt-3">
                  <LinesField
                    label="Technologies"
                    value={item.technologies}
                    onChange={(value) => updateList('experience')(index, 'technologies')(value)}
                  />
                </div>
              </ItemCard>
            ))}
          </div>
          <AddButton
            label="Add experience"
            onClick={() => update({ experience: [...experience, blankExperience()] })}
          />
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Projects</p>
          {projects.length === 0 && <p className="text-sm text-ink-muted">No projects yet.</p>}
          <div className="space-y-3">
            {projects.map((item, index) => (
              <ItemCard
                key={index}
                title={item.name || `Project ${index + 1}`}
                onRemove={removeItem('projects')(index)}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="Name" value={item.name} onChange={updateList('projects')(index, 'name')} />
                  <TextField label="Link" value={item.link} onChange={updateList('projects')(index, 'link')} />
                </div>
                <div className="mt-3">
                  <TextField
                    label="Description"
                    textarea
                    value={item.description}
                    onChange={(value) => updateList('projects')(index, 'description')(value)}
                  />
                </div>
                <div className="mt-3">
                  <LinesField
                    label="Highlights"
                    value={item.bullets}
                    onChange={(value) => updateList('projects')(index, 'bullets')(value)}
                    placeholder="One bullet per line"
                  />
                </div>
                <div className="mt-3">
                  <LinesField
                    label="Technologies"
                    value={item.technologies}
                    onChange={(value) => updateList('projects')(index, 'technologies')(value)}
                  />
                </div>
              </ItemCard>
            ))}
          </div>
          <AddButton label="Add project" onClick={() => update({ projects: [...projects, blankProject()] })} />
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Education</p>
          {education.length === 0 && <p className="text-sm text-ink-muted">No education entries yet.</p>}
          <div className="space-y-3">
            {education.map((item, index) => (
              <ItemCard
                key={index}
                title={item.institution || item.degree || `Education ${index + 1}`}
                onRemove={removeItem('education')(index)}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label="Institution" value={item.institution} onChange={updateList('education')(index, 'institution')} />
                  <TextField label="Degree" value={item.degree} onChange={updateList('education')(index, 'degree')} />
                  <TextField label="Field" value={item.field} onChange={updateList('education')(index, 'field')} />
                  <TextField label="Location" value={item.location} onChange={updateList('education')(index, 'location')} />
                  <TextField label="Start" value={item.start_date} onChange={updateList('education')(index, 'start_date')} placeholder="e.g. 2021" />
                  <TextField label="End" value={item.end_date} onChange={updateList('education')(index, 'end_date')} placeholder="e.g. 2025" />
                  <TextField label="GPA" value={item.gpa} onChange={updateList('education')(index, 'gpa')} />
                </div>
                <div className="mt-3">
                  <LinesField
                    label="Highlights"
                    value={item.bullets}
                    onChange={(value) => updateList('education')(index, 'bullets')(value)}
                  />
                </div>
              </ItemCard>
            ))}
          </div>
          <AddButton label="Add education" onClick={() => update({ education: [...education, blankEducation()] })} />
        </div>

        <div className="rounded-md border border-line p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-ink-muted">Certifications</p>
          {certifications.length === 0 && (
            <p className="text-sm text-ink-muted">No certifications yet.</p>
          )}
          <div className="space-y-3">
            {certifications.map((item, index) => (
              <ItemCard
                key={index}
                title={item.name || `Certification ${index + 1}`}
                onRemove={removeItem('certifications')(index)}
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <TextField label="Name" value={item.name} onChange={updateList('certifications')(index, 'name')} />
                  <TextField label="Issuer" value={item.issuer} onChange={updateList('certifications')(index, 'issuer')} />
                  <TextField label="Date" value={item.date} onChange={updateList('certifications')(index, 'date')} />
                </div>
              </ItemCard>
            ))}
          </div>
          <AddButton
            label="Add certification"
            onClick={() => update({ certifications: [...certifications, blankCertification()] })}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand-deep hover:underline"
        >
          <Icon name="gear" size={16} />
          {showAdvanced ? 'Hide' : 'Show'} optional sections
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-4">
            <div className="rounded-md border border-line p-4">
              <LinesField
                label="Achievements"
                value={achievements}
                onChange={(value) => update({ achievements: value })}
                placeholder="One per line"
              />
            </div>
            <div className="rounded-md border border-line p-4">
              <LinesField
                label="Coursework"
                value={coursework}
                onChange={(value) => update({ coursework: value })}
                placeholder="One per line"
              />
            </div>
            <div className="rounded-md border border-line p-4">
              <LinesField
                label="Extracurriculars"
                value={extracurriculars}
                onChange={(value) => update({ extracurriculars: value })}
                placeholder="One per line"
              />
            </div>
          </div>
        )}
      </fieldset>
    </div>
  )
}