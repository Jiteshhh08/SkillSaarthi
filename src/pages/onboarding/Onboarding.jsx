import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  completeOnboarding,
  updateAcademicInfo,
  updateCareerPreferences,
  updateEducationLevel,
} from '../../services/profile'
import {
  getSkillCatalog,
  getUserSkills,
  removeSkill,
  setSkillProficiency,
} from '../../services/skills'
import {
  addInterest,
  getInterestCatalog,
  getUserInterests,
  removeInterest,
} from '../../services/interests'
import { submitAssessment } from '../../services/assessment'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import AcademicStep from './steps/AcademicStep'
import AssessmentStep from './steps/AssessmentStep'
import EducationStep from './steps/EducationStep'
import InterestsStep from './steps/InterestsStep'
import PreferencesStep from './steps/PreferencesStep'
import SkillsStep from './steps/SkillsStep'

const STEPS = [
  { id: 'education', label: 'Education' },
  { id: 'academic', label: 'Academics' },
  { id: 'skills', label: 'Skills' },
  { id: 'interests', label: 'Interests' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'assessment', label: 'Assessment' },
]

function academicComplete(educationLevel, profile) {
  if (!profile) return false
  if (educationLevel === 'college') {
    return Boolean(profile.degree || profile.branch || profile.cgpa != null)
  }
  if (educationLevel === 'job_seeker') {
    return Boolean(profile.experience_years > 0 || profile.academic_strengths)
  }
  return Boolean(profile.subjects || profile.academic_strengths)
}

function preferencesComplete(profile) {
  if (!profile) return false
  return Boolean(
    profile.career_goal ||
      profile.preferred_industry ||
      profile.preferred_role ||
      profile.preferred_location ||
      profile.work_preference,
  )
}

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const profileRef = useRef(profile)

  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [educationLevel, setEducationLevel] = useState(profile?.education_level || '')
  const [skillCatalog, setSkillCatalog] = useState([])
  const [userSkills, setUserSkills] = useState({})
  const [interestCatalog, setInterestCatalog] = useState([])
  const [userInterests, setUserInterests] = useState({})

  useEffect(() => {
    let mounted = true

    Promise.all([
      getSkillCatalog(),
      getUserSkills(user.$id),
      getInterestCatalog(),
      getUserInterests(user.$id),
    ])
      .then(([skills, mySkills, interests, myInterests]) => {
        if (!mounted) return
        const skillMap = Object.fromEntries(
          mySkills.map((entry) => [entry.skill_id, entry.proficiency]),
        )
        const interestSet = Object.fromEntries(
          myInterests.map((entry) => [entry.interest_id, true]),
        )
        setSkillCatalog(skills)
        setUserSkills(skillMap)
        setInterestCatalog(interests)
        setUserInterests(interestSet)

        const snapshot = profileRef.current
        const level = snapshot?.education_level || ''
        setEducationLevel(level)

        let initialStep = 0
        if (level) {
          if (!academicComplete(level, snapshot)) {
            initialStep = 1
          } else if (Object.keys(skillMap).length === 0) {
            initialStep = 2
          } else if (Object.keys(interestSet).length === 0) {
            initialStep = 3
          } else if (!preferencesComplete(snapshot)) {
            initialStep = 4
          } else if (!(snapshot?.assessment_score > 0)) {
            initialStep = 5
          } else {
            initialStep = 2
          }
        }
        setStep(initialStep)
        setReady(true)
      })
      .catch(() => {
        if (mounted) {
          setReady(true)
        }
      })

    return () => {
      mounted = false
    }
  }, [user.$id])

  const handleError = useCallback((err) => {
    setError(err?.message || 'Something went wrong. Please try again.')
  }, [])

  const advance = useCallback(() => {
    setError('')
    setStep((current) => Math.min(STEPS.length - 1, current + 1))
  }, [])

  const skip = useCallback(() => {
    advance()
  }, [advance])

  const saveEducation = useCallback(
    async (value) => {
      setSaving(true)
      try {
        await updateEducationLevel(user.$id, value)
        await refreshProfile(user.$id)
        advance()
      } catch (err) {
        handleError(err)
      } finally {
        setSaving(false)
      }
    },
    [advance, handleError, refreshProfile, user.$id],
  )

  const saveAcademic = useCallback(
    async (data) => {
      setSaving(true)
      try {
        await updateAcademicInfo(user.$id, data)
        await refreshProfile(user.$id)
        advance()
      } catch (err) {
        handleError(err)
      } finally {
        setSaving(false)
      }
    },
    [advance, handleError, refreshProfile, user.$id],
  )

  const saveSkills = useCallback(
    async (skills) => {
      setSaving(true)
      try {
        await Promise.all(
          skills.removed.map((skillId) => removeSkill(user.$id, skillId)),
        )
        await Promise.all(
          Object.entries(skills.updated).map(([skillId, proficiency]) =>
            setSkillProficiency(user.$id, skillId, proficiency),
          ),
        )
        advance()
      } catch (err) {
        handleError(err)
      } finally {
        setSaving(false)
      }
    },
    [advance, handleError, user.$id],
  )

  const saveInterests = useCallback(
    async (interests) => {
      setSaving(true)
      try {
        await Promise.all(
          interests.removed.map((interestId) => removeInterest(user.$id, interestId)),
        )
        await Promise.all(interests.added.map((interestId) => addInterest(user.$id, interestId)))
        advance()
      } catch (err) {
        handleError(err)
      } finally {
        setSaving(false)
      }
    },
    [advance, handleError, user.$id],
  )

  const savePreferences = useCallback(
    async (data) => {
      setSaving(true)
      try {
        await updateCareerPreferences(user.$id, data)
        await refreshProfile(user.$id)
        advance()
      } catch (err) {
        handleError(err)
      } finally {
        setSaving(false)
      }
    },
    [advance, handleError, refreshProfile, user.$id],
  )

  const finish = useCallback(
    async (responses) => {
      setSaving(true)
      try {
        await submitAssessment(user.$id, responses)
        await completeOnboarding(user.$id)
        await refreshProfile(user.$id)
        navigate('/dashboard')
      } catch (err) {
        handleError(err)
        setSaving(false)
      }
    },
    [handleError, navigate, refreshProfile, user.$id],
  )

  const finishLater = useCallback(async () => {
    setSaving(true)
    try {
      await completeOnboarding(user.$id)
      await refreshProfile(user.$id)
      navigate('/dashboard')
    } catch (err) {
      handleError(err)
      setSaving(false)
    }
  }, [handleError, navigate, refreshProfile, user.$id])

  const stepContent = useMemo(() => {
    switch (STEPS[step].id) {
      case 'education':
        return (
          <EducationStep value={educationLevel} saving={saving} onSelect={saveEducation} />
        )
      case 'academic':
        return (
          <AcademicStep
            educationLevel={educationLevel}
            initial={profile}
            saving={saving}
            onSave={saveAcademic}
            onSkip={skip}
          />
        )
      case 'skills':
        return (
          <SkillsStep
            catalog={skillCatalog}
            selected={userSkills}
            saving={saving}
            onSave={saveSkills}
            onSkip={skip}
          />
        )
      case 'interests':
        return (
          <InterestsStep
            catalog={interestCatalog}
            selected={userInterests}
            saving={saving}
            onSave={saveInterests}
            onSkip={skip}
          />
        )
      case 'preferences':
        return (
          <PreferencesStep
            initial={profile}
            saving={saving}
            onSave={savePreferences}
            onSkip={skip}
          />
        )
      case 'assessment':
        return <AssessmentStep saving={saving} onComplete={finish} onSkip={finishLater} />
      default:
        return null
    }
  }, [
    step,
    educationLevel,
    saving,
    profile,
    skillCatalog,
    userSkills,
    interestCatalog,
    userInterests,
    saveEducation,
    saveAcademic,
    saveSkills,
    saveInterests,
    savePreferences,
    finish,
    finishLater,
    skip,
  ])

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Let&apos;s set up your profile</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Career onboarding</h1>
          <p className="mt-3 text-lg text-ink-muted">
            {ready
              ? 'A few short steps so we can personalise your career matches and roadmap.'
              : 'Loading your profile…'}
          </p>
        </header>

        {ready && (
          <>
            <ol className="mx-auto mt-8 flex max-w-2xl items-center gap-2">
              {STEPS.map((item, index) => (
                <li key={item.id} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className="flex flex-1 items-center gap-2 text-left"
                    aria-label={`Go to ${item.label} step`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                        index < step
                          ? 'bg-brand text-white'
                          : index === step
                            ? 'border-2 border-brand bg-brand-soft text-brand-deep'
                            : 'border border-line bg-white text-ink-soft'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`hidden text-xs font-bold sm:block ${
                        index <= step ? 'text-ink' : 'text-ink-soft'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <span className={`h-0.5 flex-1 ${index < step ? 'bg-brand' : 'bg-line'}`} />
                  )}
                </li>
              ))}
            </ol>

            {error && (
              <p className="mx-auto mt-6 max-w-xl rounded-md bg-danger-soft px-4 py-3 text-center text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-10">{stepContent}</div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
