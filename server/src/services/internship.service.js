import { COLLECTIONS, ID, Permission, Query, Role, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function parseInternshipSkills(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return String(raw)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

async function listAllInternships() {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.internships,
    [Query.limit(100)],
  )
  return documents.map((doc) => ({
    $id: doc.$id,
    title: doc.title,
    company: doc.company || '',
    location: doc.location || '',
    description: doc.description || '',
    url: doc.url || '',
    skills: parseInternshipSkills(doc.skills),
    eligibility: doc.eligibility || '',
  }))
}

async function getUserSkillsMap(userId) {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.userSkills,
    [Query.equal('user_id', userId), Query.limit(300)],
  )
  if (documents.length === 0) return {}

  const { documents: catalog } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.skills,
    [Query.limit(300)],
  )
  const namesById = {}
  for (const skill of catalog) {
    namesById[skill.$id] = skill.name
  }

  const map = {}
  for (const doc of documents) {
    const name = namesById[doc.skill_id]
    if (name) map[normalizeName(name)] = Number(doc.proficiency) || 1
  }
  return map
}

async function getUserInterestNames(userId) {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.userInterests,
    [Query.equal('user_id', userId), Query.limit(100)],
  )
  if (documents.length === 0) return []

  const interestIds = documents.map((doc) => doc.interest_id)
  const { documents: catalog } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.interests,
    [Query.limit(100)],
  )
  const namesById = {}
  for (const interest of catalog) {
    namesById[interest.$id] = interest.name
  }
  return interestIds.map((id) => namesById[id]).filter(Boolean)
}

function skillScore(userSkills, internshipSkills) {
  if (internshipSkills.length === 0) return { score: 55, reasons: [] }
  let total = 0
  const reasons = []
  for (const skillName of internshipSkills) {
    const proficiency = userSkills[normalizeName(skillName)] || 0
    total += Math.min(proficiency, 4) / 4
    if (proficiency >= 3) {
      reasons.push(`You have solid ${skillName}`)
    } else if (proficiency === 0) {
      reasons.push(`Missing ${skillName}`)
    }
  }
  return {
    score: Math.round((total / internshipSkills.length) * 100),
    reasons: reasons.slice(0, 3),
  }
}

function roleScore(internship, profile, interests) {
  const haystack = `${internship.title} ${internship.description}`.toLowerCase()
  const tokens = new Set()
  for (const part of [profile.preferred_role, profile.career_goal]) {
    if (!part) continue
    for (const word of String(part).toLowerCase().split(/[^a-z0-9+.#]+/)) {
      if (word.length > 2) tokens.add(word)
    }
  }
  for (const interest of interests) {
    tokens.add(String(interest).toLowerCase())
  }
  if (tokens.size === 0) return { score: 40, reasons: [] }

  const reasons = []
  let matched = 0
  for (const token of tokens) {
    if (haystack.includes(token)) {
      matched += 1
      if (reasons.length < 2) reasons.push(`Aligns with "${token}"`)
    }
  }
  return { score: Math.round((matched / tokens.size) * 100), reasons }
}

function educationScore(internship, educationLevel) {
  const eligibility = String(internship.eligibility || '').toLowerCase()
  if (!eligibility) return { score: 60, reasons: [] }
  if (eligibility.includes('graduate') && !eligibility.includes('undergraduate')) {
    if (educationLevel === 'job_seeker') return { score: 100, reasons: ['Open to graduates'] }
    if (educationLevel === 'college') return { score: 75, reasons: ['Grad-focused — best for final years'] }
    return { score: 35, reasons: ['Prefers graduates'] }
  }
  if (eligibility.includes('undergraduate') || eligibility.includes('student')) {
    if (educationLevel === 'college' || educationLevel === 'high_school') {
      return { score: 100, reasons: ['Open to students'] }
    }
    return { score: 60, reasons: ['Student-focused'] }
  }
  return { score: 60, reasons: [] }
}

function locationScore(internship, profile) {
  const location = String(internship.location || '').toLowerCase()
  const reasons = []
  let score = 50

  const preferredLocation = String(profile.preferred_location || '').trim()
  if (preferredLocation && location.includes(preferredLocation.toLowerCase())) {
    score = 100
    reasons.push(`Matches your preferred location (${preferredLocation})`)
  }
  if (profile.work_preference === 'remote' && /remote|hybrid/.test(location)) {
    score = Math.max(score, 100)
    reasons.push('Remote-friendly')
  }
  return { score, reasons }
}

function scoreInternship(internship, profile, userSkills, interests) {
  const skill = skillScore(userSkills, internship.skills)
  const role = roleScore(internship, profile, interests)
  const education = educationScore(internship, profile.education_level)
  const location = locationScore(internship, profile)

  const matchScore = Math.min(
    100,
    Math.round(
      skill.score * 0.55 + role.score * 0.2 + education.score * 0.15 + location.score * 0.1,
    ),
  )

  const reasons = [...skill.reasons, ...role.reasons, ...education.reasons, ...location.reasons].slice(0, 4)

  return { match_score: matchScore, reasons }
}

async function upsertRecommendation(userId, internshipId, matchScore) {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.internshipRecommendations,
    [
      Query.equal('user_id', userId),
      Query.equal('internship_id', internshipId),
      Query.limit(1),
    ],
  )
  const payload = { user_id: userId, internship_id: internshipId, match_score: matchScore }
  if (documents.length > 0) {
    return databases.updateDocument(
      config.appwrite.databaseId,
      COLLECTIONS.internshipRecommendations,
      documents[0].$id,
      payload,
    )
  }
  return databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.internshipRecommendations,
    ID.unique(),
    { ...payload, created_at: new Date().toISOString() },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
}

export async function listInternships({ search = '', company = '', location = '' } = {}) {
  const internships = await listAllInternships()
  const query = search.trim().toLowerCase()
  const companyQuery = company.trim().toLowerCase()
  const locationQuery = location.trim().toLowerCase()
  return internships.filter((internship) => {
    if (query) {
      const haystack = `${internship.title} ${internship.description} ${internship.skills.join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (companyQuery && !internship.company.toLowerCase().includes(companyQuery)) return false
    if (locationQuery && !internship.location.toLowerCase().includes(locationQuery)) return false
    return true
  })
}

export async function recommendInternships(userId) {
  let profile = null
  try {
    profile = await databases.getDocument(config.appwrite.databaseId, COLLECTIONS.profiles, userId)
  } catch {
    profile = {}
  }

  const [userSkills, interests, internships] = await Promise.all([
    getUserSkillsMap(userId),
    getUserInterestNames(userId),
    listAllInternships(),
  ])

  const results = internships.map((internship) => {
    const { match_score, reasons } = scoreInternship(internship, profile, userSkills, interests)
    return { internship, match_score, reasons }
  })

  results.sort((a, b) => b.match_score - a.match_score)
  const top = results.slice(0, 10)

  await Promise.all(
    top.map(({ internship, match_score }) => upsertRecommendation(userId, internship.$id, match_score)),
  )

  return top.map(({ internship, match_score, reasons }) => ({
    $id: internship.$id,
    title: internship.title,
    company: internship.company,
    location: internship.location,
    description: internship.description,
    url: internship.url,
    skills: internship.skills,
    eligibility: internship.eligibility,
    match_score,
    reasons,
  }))
}