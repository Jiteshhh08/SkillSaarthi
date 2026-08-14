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
  const result = await recommendCareers({ ...userProfile, top_n: topN })

  // The AI engine ranks against its built-in career names; map each result to the
  // Appwrite career document (by name) so `career_id` links back to the catalog and
  // skill-gap deep links resolve. Attach catalog metadata for the UI.
  const catalog = await listCareers()
  const byName = new Map(catalog.map((career) => [career.name.toLowerCase().trim(), career]))

  const enriched = (result.recommendations || []).map((rec) => {
    const career = byName.get(String(rec.career || '').toLowerCase().trim())
    return {
      ...rec,
      career_id: career ? career.$id : rec.career_id,
      category: career?.category || rec.category,
      description: career?.description || rec.description,
    }
  })

  const saved = await saveRecommendations(userId, enriched)
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

  return skillGaps({ career: career.name, skills })
}