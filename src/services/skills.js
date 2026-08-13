import {
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  ID,
  Permission,
  Query,
  Role,
  databases,
} from './appwrite'

export const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', hint: 'Just getting started' },
  { value: 2, label: 'Learning', hint: 'Practicing the basics' },
  { value: 3, label: 'Working', hint: 'Comfortable building with it' },
  { value: 4, label: 'Advanced', hint: 'Confident and productive' },
  { value: 5, label: 'Expert', hint: 'Can teach and lead others' },
]

export function proficiencyLabel(value) {
  const level = PROFICIENCY_LEVELS.find((item) => item.value === value)
  return level?.label || ''
}

export function proficiencyHint(value) {
  const level = PROFICIENCY_LEVELS.find((item) => item.value === value)
  return level?.hint || ''
}

// Mirror of the seeded catalog (scripts/seed-catalog.mjs) so the UI still works
// before `npm run seed:catalog` has been run against the Appwrite project.
export const FALLBACK_SKILLS = [
  { name: 'JavaScript', category: 'Programming' },
  { name: 'TypeScript', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'Java', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'SQL', category: 'Programming' },
  { name: 'HTML/CSS', category: 'Programming' },
  { name: 'React', category: 'Web Development' },
  { name: 'Node.js', category: 'Web Development' },
  { name: 'Express', category: 'Web Development' },
  { name: 'REST APIs', category: 'Web Development' },
  { name: 'Next.js', category: 'Web Development' },
  { name: 'Git & GitHub', category: 'Web Development' },
  { name: 'Data Analysis', category: 'Data & AI' },
  { name: 'Statistics', category: 'Data & AI' },
  { name: 'Machine Learning', category: 'Data & AI' },
  { name: 'Deep Learning', category: 'Data & AI' },
  { name: 'Data Visualization', category: 'Data & AI' },
  { name: 'Pandas', category: 'Data & AI' },
  { name: 'NumPy', category: 'Data & AI' },
  { name: 'Docker', category: 'Cloud & DevOps' },
  { name: 'Kubernetes', category: 'Cloud & DevOps' },
  { name: 'AWS', category: 'Cloud & DevOps' },
  { name: 'CI/CD', category: 'Cloud & DevOps' },
  { name: 'Linux', category: 'Cloud & DevOps' },
  { name: 'Network Security', category: 'Cybersecurity' },
  { name: 'Penetration Testing', category: 'Cybersecurity' },
  { name: 'Cryptography', category: 'Cybersecurity' },
  { name: 'Security Compliance', category: 'Cybersecurity' },
  { name: 'Communication', category: 'Soft Skills' },
  { name: 'Problem Solving', category: 'Soft Skills' },
  { name: 'Teamwork', category: 'Soft Skills' },
  { name: 'Time Management', category: 'Soft Skills' },
  { name: 'Leadership', category: 'Soft Skills' },
]

export async function getSkillCatalog() {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.skills,
      [Query.limit(200)],
    )
    if (documents.length > 0) {
      return documents.map((doc) => ({
        $id: doc.$id,
        name: doc.name,
        category: doc.category || 'General',
      }))
    }
  } catch {
    // catalog not reachable — fall back below
  }
  return FALLBACK_SKILLS.map((skill) => ({
    $id: skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    ...skill,
  }))
}

async function findUserSkill(userId, skillId) {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.userSkills,
      [Query.equal('user_id', userId), Query.equal('skill_id', skillId), Query.limit(1)],
    )
    return documents[0]
  } catch {
    return undefined
  }
}

export async function getUserSkills(userId) {
  try {
    const { documents } = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.userSkills,
      [Query.equal('user_id', userId), Query.limit(200)],
    )
    if (documents.length === 0) return []

    const catalog = await getSkillCatalog()
    const byId = Object.fromEntries(catalog.map((skill) => [skill.$id, skill]))

    return documents.map((doc) => ({
      $id: doc.$id,
      skill_id: doc.skill_id,
      proficiency: doc.proficiency ?? 1,
      skill: byId[doc.skill_id] || { $id: doc.skill_id, name: doc.skill_id, category: 'General' },
    }))
  } catch {
    return []
  }
}

export async function setSkillProficiency(userId, skillId, proficiency) {
  const existing = await findUserSkill(userId, skillId)
  if (existing) {
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.userSkills, existing.$id, {
      proficiency,
      updated_at: new Date().toISOString(),
    })
  }
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.userSkills,
    ID.unique(),
    { user_id: userId, skill_id: skillId, proficiency },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
}

export async function removeSkill(userId, skillId) {
  const existing = await findUserSkill(userId, skillId)
  if (existing) {
    return databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.userSkills, existing.$id)
  }
}
