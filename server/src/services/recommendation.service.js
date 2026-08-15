import {
  getCareerById,
  getCareerSkills,
  getInterestCatalog,
  getProfile,
  getRecommendations,
  getSkillCatalog,
  getUserInterests,
  getUserSkills,
  saveRecommendations,
} from './appwrite.service.js'
import { listCareers } from './career.service.js'
import { recommendCareers, skillGaps } from './ai.service.js'
import { ApiError } from '../utils/ApiError.js'

function skillNameMap(catalog) {
  return new Map(catalog.map((skill) => [skill.$id, skill.name]))
}

function interestNameMap(catalog) {
  return new Map(catalog.map((interest) => [interest.$id, interest.name]))
}

function buildGoals(profile) {
  const goals = []
  if (profile.career_goal) goals.push(profile.career_goal)
  if (profile.preferred_role) goals.push(profile.preferred_role)
  return goals
}

async function buildUserProfile(userId) {
  const profile = await getProfile(userId)
  if (!profile) {
    throw new ApiError(404, 'Career profile not found. Complete onboarding first.', 'PROFILE_NOT_FOUND')
  }

  const [userSkills, userInterests, skillCatalog, interestCatalog] = await Promise.all([
    getUserSkills(userId),
    getUserInterests(userId),
    getSkillCatalog(),
    getInterestCatalog(),
  ])

  const names = skillNameMap(skillCatalog)
  const interestNames = interestNameMap(interestCatalog)

  return {
    education_level: profile.education_level || null,
    skills: userSkills.map((entry) => ({
      name: names.get(entry.skill_id) || entry.skill_id,
      proficiency: entry.proficiency ?? 1,
    })),
    interests: userInterests
      .map((entry) => interestNames.get(entry.interest_id) || entry.interest_id)
      .filter(Boolean),
    goals: buildGoals(profile),
    assessment_score: profile.assessment_score ?? null,
    experience_years: profile.experience_years ?? 0,
  }
}

export async function generateRecommendations(userId, topN = 6) {
  const userProfile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byName = new Map(catalog.map((career) => [career.name.toLowerCase().trim(), career]))

  let recommendations
  try {
    const result = await recommendCareers({ ...userProfile, top_n: topN })

    // The AI engine ranks against its built-in career names; map each result to the
    // Appwrite career document (by name) so `career_id` links back to the catalog and
    // skill-gap deep links resolve. Attach catalog metadata for the UI.
    recommendations = (result.recommendations || []).map((rec) => {
      const career = byName.get(String(rec.career || '').toLowerCase().trim())
      return {
        ...rec,
        career_id: career ? career.$id : rec.career_id,
        category: career?.category || rec.category,
        description: career?.description || rec.description,
        source: 'ai',
      }
    })
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'AI_SERVICE_UNAVAILABLE') throw error
    recommendations = computeFallbackRecommendations(userProfile, catalog, topN)
  }

  const saved = await saveRecommendations(userId, recommendations)
  return saved.map((doc) => ({
    $id: doc.$id,
    career_id: doc.career_id,
    match_score: doc.match_score,
    explanation: JSON.parse(doc.explanation || '{}'),
    created_at: doc.created_at,
  }))
}

export async function getSavedRecommendations(userId) {
  const docs = await getRecommendations(userId)
  return docs.map((doc) => ({
    $id: doc.$id,
    career_id: doc.career_id,
    match_score: doc.match_score,
    explanation: JSON.parse(doc.explanation || '{}'),
    created_at: doc.created_at,
  }))
}

export async function getRecommendationById(userId, recommendationId) {
  const docs = await getSavedRecommendations(userId)
  const found = docs.find((doc) => doc.$id === recommendationId)
  if (!found) {
    throw new ApiError(404, 'Recommendation not found', 'RECOMMENDATION_NOT_FOUND')
  }
  return found
}

function normalizeSkillName(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function computeFallbackRecommendations(profile, careers, topN) {
  const userSkills = (profile.skills || []).reduce((map, entry) => {
    map[normalizeSkillName(entry.name)] = Number(entry.proficiency) || 0
    return map
  }, {})

  return careers
    .map((career) => {
      const required = career.skills || []
      const details = required
        .map((skill) => ({
          skill: skill.name,
          required: skill.required_level ?? 1,
          current: userSkills[normalizeSkillName(skill.name)] || 0,
          importance: skill.importance ?? 1,
        }))
        .sort((a, b) => b.importance - a.importance)

      let totalWeight = 0
      let weighted = 0
      for (const item of details) {
        totalWeight += item.importance
        weighted += item.importance * (Math.min(item.current, item.required) / item.required)
      }
      const score = totalWeight ? Math.round((weighted / totalWeight) * 100) : 0
      const strengths = details.filter((d) => d.current >= d.required).map((d) => d.skill)
      const gaps = details.filter((d) => d.current < d.required).map((d) => d.skill)
      const nextSteps = details
        .filter((d) => d.current < d.required)
        .map((d) => `${d.current === 0 ? 'Learn' : 'Strengthen'} ${d.skill} (level ${d.current} → ${d.required})`)

      return {
        career_id: career.career_id,
        career: career.name,
        category: career.category,
        description: career.description,
        score,
        breakdown: { skill: score, interest: 0, education: 0, goal: 0, assessment: 0, experience: 0 },
        reasons: strengths.slice(0, 3).map((skill) => `Strong ${skill} skills`),
        strengths,
        skill_gaps: gaps,
        skill_gap_details: details,
        next_steps: nextSteps,
        source: 'fallback',
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

export async function analyzeCareerGaps(userId, careerId) {
  const career = await getCareerById(careerId)
  if (!career) {
    throw new ApiError(404, 'Career not found', 'CAREER_NOT_FOUND')
  }

  const [userSkills, skillCatalog, careerSkills] = await Promise.all([
    getUserSkills(userId),
    getSkillCatalog(),
    getCareerSkills(careerId),
  ])

  const names = skillNameMap(skillCatalog)
  const careerSkillNames = new Map(careerSkills.map((entry) => [entry.skill_id, entry.required_level]))

  const skills = userSkills
    .filter((entry) => careerSkillNames.has(entry.skill_id))
    .map((entry) => ({
      name: names.get(entry.skill_id) || entry.skill_id,
      proficiency: entry.proficiency ?? 1,
    }))

  try {
    return await skillGaps({ career: career.name, skills })
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'AI_SERVICE_UNAVAILABLE') throw error

    const userLevels = new Map(userSkills.map((entry) => [entry.skill_id, entry.proficiency]))
    const details = careerSkills
      .map((entry) => ({
        skill: names.get(entry.skill_id) || entry.skill_id,
        required: entry.required_level ?? 1,
        current: userLevels.get(entry.skill_id) ?? 0,
        importance: entry.importance ?? 1,
      }))
      .sort((a, b) => b.importance - a.importance)

    return {
      career_id: career.$id,
      career: career.name,
      category: career.category || '',
      description: career.description || '',
      strong: details.filter((d) => d.current >= d.required),
      needs_improvement: details.filter((d) => d.current < d.required),
      source: 'fallback',
    }
  }
}