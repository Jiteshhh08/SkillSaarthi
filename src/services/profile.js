import { APPWRITE_DATABASE_ID, COLLECTIONS, Permission, Role, databases } from './appwrite'

export const EDUCATION_LEVELS = [
  {
    value: 'high_school',
    label: 'High School Student',
    description:
      'Exploring subjects, interests, and possible career directions before higher education.',
    icon: '🎒',
  },
  {
    value: 'college',
    label: 'College Student',
    description:
      'Building skills and projects while preparing for internships, jobs, and graduation.',
    icon: '🎓',
  },
  {
    value: 'job_seeker',
    label: 'Job Seeker',
    description:
      'Looking for a first job, reskilling, or transitioning into a new career path.',
    icon: '💼',
  },
]

export const WORK_PREFERENCES = [
  { value: 'onsite', label: 'On-site', icon: '🏢' },
  { value: 'hybrid', label: 'Hybrid', icon: '🌗' },
  { value: 'remote', label: 'Remote', icon: '🏠' },
]

export const PREFERRED_INDUSTRIES = [
  'Software & Technology',
  'AI & Data',
  'Cloud',
  'Cybersecurity',
  'Finance',
  'Healthcare',
  'Education',
  'Design & Media',
  'Research',
  'Entrepreneurship',
]

export function educationLevelLabel(value) {
  const level = EDUCATION_LEVELS.find((item) => item.value === value)
  return level?.label || ''
}

export function workPreferenceLabel(value) {
  const pref = WORK_PREFERENCES.find((item) => item.value === value)
  return pref?.label || ''
}

export async function getProfile(userId) {
  if (!userId) return null
  try {
    return await databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.profiles, userId)
  } catch {
    return null
  }
}

export async function createProfile(userId, data = {}) {
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.profiles,
    userId,
    { user_id: userId, ...data },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
}

export async function updateProfile(userId, fields = {}) {
  const existing = await getProfile(userId)
  if (existing) {
    return databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.profiles,
      userId,
      { ...fields, updated_at: new Date().toISOString() },
    )
  }
  return createProfile(userId, fields)
}

export async function updateEducationLevel(userId, educationLevel) {
  return updateProfile(userId, { education_level: educationLevel })
}

export async function updateAcademicInfo(userId, data = {}) {
  const fields = {}
  if (data.degree) fields.degree = data.degree
  if (data.branch) fields.branch = data.branch
  if (data.study_year !== '' && data.study_year != null) fields.study_year = Number(data.study_year)
  if (data.cgpa !== '' && data.cgpa != null) fields.cgpa = Number(data.cgpa)
  if (data.subjects) fields.subjects = data.subjects
  if (data.academic_strengths) fields.academic_strengths = data.academic_strengths
  return updateProfile(userId, fields)
}

export async function updateCareerPreferences(userId, data = {}) {
  const fields = {}
  if (data.career_goal) fields.career_goal = data.career_goal
  if (data.preferred_industry) fields.preferred_industry = data.preferred_industry
  if (data.preferred_role) fields.preferred_role = data.preferred_role
  if (data.preferred_location) fields.preferred_location = data.preferred_location
  if (data.work_preference) fields.work_preference = data.work_preference
  if (data.experience_years !== '' && data.experience_years != null) {
    fields.experience_years = Number(data.experience_years)
  }
  return updateProfile(userId, fields)
}

export async function updateAssessmentScore(userId, score) {
  return updateProfile(userId, { assessment_score: score })
}

export async function completeOnboarding(userId) {
  return updateProfile(userId, { onboarding_completed: true })
}

export function isProfileComplete(profile) {
  return Boolean(profile?.onboarding_completed)
}
