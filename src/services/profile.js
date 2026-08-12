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

export function educationLevelLabel(value) {
  const level = EDUCATION_LEVELS.find((item) => item.value === value)
  return level?.label || ''
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

export async function updateEducationLevel(userId, educationLevel) {
  const existing = await getProfile(userId)
  if (existing) {
    return databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.profiles,
      userId,
      {
        education_level: educationLevel,
        updated_at: new Date().toISOString(),
      },
    )
  }
  return createProfile(userId, { education_level: educationLevel })
}