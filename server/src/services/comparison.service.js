import {
  getInterestCatalog,
  getProfile,
  getSkillCatalog,
  getUserInterests,
  getUserSkills,
} from './appwrite.service.js'
import { listCareers } from './career.service.js'
import { compareCareers } from './ai.service.js'
import { ApiError } from '../utils/ApiError.js'

function skillNameMap(catalog) {
  return new Map(catalog.map((skill) => [skill.$id, skill.name]))
}

function interestNameMap(catalog) {
  return new Map(catalog.map((interest) => [interest.$id, interest.name]))
}

function normalizeSkillName(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
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

function computeDifficulty(career) {
  const required = career.skills || []
  if (!required.length) return { difficulty: 0, difficulty_label: 'Low' }
  const avg = required.reduce((sum, skill) => sum + (skill.required_level ?? 1), 0) / required.length
  let difficulty = (avg / 5) * 70
  if (career.assessment_bar) difficulty += 10
  if (career.experience_required) difficulty += 20
  difficulty = Math.min(100, Math.round(difficulty))
  if (difficulty >= 75) return { difficulty, difficulty_label: 'High' }
  if (difficulty >= 45) return { difficulty, difficulty_label: 'Moderate' }
  return { difficulty, difficulty_label: 'Low' }
}

function computeFallbackComparison(profile, selected) {
  const userSkills = (profile.skills || []).reduce((map, entry) => {
    map[normalizeSkillName(entry.name)] = Number(entry.proficiency) || 0
    return map
  }, {})

  const entries = selected
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
      const gaps = details.filter((d) => d.current < d.required)
      const nextSteps = gaps.map(
        (d) => `${d.current === 0 ? 'Learn' : 'Strengthen'} ${d.skill} (level ${d.current} → ${d.required})`,
      )

      return {
        career_id: career.$id,
        career: career.name,
        category: career.category || '',
        description: career.description || '',
        score,
        breakdown: { skill: score, interest: 0, education: 0, goal: 0, assessment: 0, experience: 0 },
        reasons: [],
        strengths,
        skill_gaps: gaps.map((d) => d.skill),
        skill_gap_details: gaps,
        next_steps: nextSteps,
        difficulty: computeDifficulty(career).difficulty,
        difficulty_label: computeDifficulty(career).difficulty_label,
        required_skills_count: required.length,
        assessment_bar: career.assessment_bar ?? null,
        experience_required: career.experience_required ?? 0,
      }
    })
    .sort((a, b) => b.score - a.score)

  const best = entries[0]
  const summary = best
    ? `Of the careers compared, ${best.career} fits you best at ${best.score}% match — ${best.difficulty_label.toLowerCase()} difficulty${best.strengths.length ? `, with ${best.strengths.slice(0, 2).join(', ').toLowerCase()} as strengths.` : '.'}`
    : 'Select at least one career to compare.'

  return {
    summary,
    recommended: best?.career || null,
    recommended_id: best?.career_id || null,
    careers: entries,
  }
}

export async function compareSelectedCareers(userId, careerIds) {
  if (!Array.isArray(careerIds) || careerIds.length < 2) {
    throw new ApiError(400, 'Select at least two careers to compare.', 'VALIDATION_ERROR')
  }

  const userProfile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byId = new Map(catalog.map((career) => [career.$id, career]))

  // Preserve the user's chosen order when mapping back to catalog entries.
  const selected = careerIds.map((id) => byId.get(id)).filter(Boolean)
  if (selected.length < 2) {
    throw new ApiError(400, 'One or more selected careers were not found.', 'VALIDATION_ERROR')
  }

  const desiredOrder = new Map(selected.map((career, index) => [career.$id, index]))

  let result
  try {
    const aiResult = await compareCareers({
      ...userProfile,
      career_names: selected.map((career) => career.name),
    })

    const byName = new Map(
      selected.map((career) => [normalizeSkillName(career.name), career]),
    )

    const mapped = (aiResult.careers || []).map((rec) => {
      const career = byName.get(normalizeSkillName(rec.career))
      return {
        ...rec,
        career_id: career ? career.$id : rec.career_id,
        category: career?.category || rec.category,
        description: career?.description || rec.description,
        source: 'ai',
      }
    })

    // Remap the best-pick id the same way: the AI reports its own catalog id,
    // which must be translated to the Appwrite doc id used everywhere else.
    const recommendedCareer = byName.get(normalizeSkillName(aiResult.recommended || ''))

    // Re-sort by the user's chosen order so the UI shows selection order.
    mapped.sort((a, b) => {
      const ai = desiredOrder.get(a.career_id)
      const bi = desiredOrder.get(b.career_id)
      if (ai == null || bi == null) return 0
      return ai - bi
    })

    result = {
      ...aiResult,
      recommended_id: recommendedCareer ? recommendedCareer.$id : aiResult.recommended_id,
      careers: mapped,
      source: 'ai',
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'AI_SERVICE_UNAVAILABLE') throw error
    result = { ...computeFallbackComparison(userProfile, selected), source: 'fallback' }
  }

  return result
}