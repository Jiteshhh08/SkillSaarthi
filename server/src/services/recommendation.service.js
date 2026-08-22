import { getCareerById, getCareerSkills, getSkillCatalog, getUserSkills, getRecommendations, saveRecommendations } from './appwrite.service.js'
import { listCareers } from './career.service.js'
import { buildUserProfile } from './profile.builder.js'
import { scoreCareers as nodeScoreCareers, analyzeSkillGaps as nodeAnalyzeSkillGaps } from './scoring.js'
import { CAREER_REQUIREMENTS } from './careerCatalog.js'
import { ApiError } from '../utils/ApiError.js'

function skillNameMap(catalog) {
  return new Map(catalog.map((skill) => [skill.$id, skill.name]))
}

export async function generateRecommendations(userId, topN = 6) {
  const userProfile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byName = new Map(catalog.map((career) => [career.name.toLowerCase().trim(), career]))

  const scored = nodeScoreCareers(userProfile, CAREER_REQUIREMENTS, topN)
  const recommendations = scored.map((rec) => {
    const career = byName.get(String(rec.career || '').toLowerCase().trim())
    return {
      ...rec,
      career_id: career ? career.$id : rec.career_id,
      category: career?.category || rec.category,
      description: career?.description || rec.description,
      source: 'node',
    }
  })

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
  const skills = userSkills
    .filter((entry) => careerSkills.some((cs) => cs.skill_id === entry.skill_id))
    .map((entry) => ({ name: names.get(entry.skill_id) || entry.skill_id, proficiency: entry.proficiency ?? 1 }))

  // Use Node hybrid scorer for gap details via catalog, but keep Appwrite career id
  const result = nodeAnalyzeSkillGaps(career.name, skills, CAREER_REQUIREMENTS)
  if (result) {
    return {
      career_id: career.$id,
      career: career.name,
      category: career.category || result.category || '',
      description: career.description || result.description || '',
      strong: result.strong,
      needs_improvement: result.needs_improvement,
      source: 'node',
    }
  }

  // Fallback to Appwrite-derived gaps if not in hardcoded catalog
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
    source: 'node',
  }
}
