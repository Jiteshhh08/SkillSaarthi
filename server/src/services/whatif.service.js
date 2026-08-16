import {
  getInterestCatalog,
  getProfile,
  getSkillCatalog,
  getUserInterests,
  getUserSkills,
} from './appwrite.service.js'
import { listCareers } from './career.service.js'
import { simulateWhatIf } from './ai.service.js'
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

function normalizeChanges(changes) {
  const skills = Array.isArray(changes?.skills) ? changes.skills : []
  const interests = Array.isArray(changes?.interests) ? changes.interests : []
  const goals = Array.isArray(changes?.goals) ? changes.goals : []
  return { skills, interests, goals }
}

function isValidChangeSet(changes) {
  const { skills, interests, goals } = normalizeChanges(changes)
  if (skills.length === 0 && interests.length === 0 && goals.length === 0) {
    throw new ApiError(400, 'Describe at least one change to simulate.', 'VALIDATION_ERROR')
  }
  for (const skill of skills) {
    if (!skill?.name || !String(skill.name).trim()) {
      throw new ApiError(400, 'Each simulated skill needs a name.', 'VALIDATION_ERROR')
    }
    if (typeof skill.proficiency !== 'number' || skill.proficiency < 1 || skill.proficiency > 5) {
      throw new ApiError(400, 'Simulated skill proficiency must be between 1 and 5.', 'VALIDATION_ERROR')
    }
  }
  return true
}

function applyChanges(skills, changedSkills) {
  const result = skills.map((skill) => ({ ...skill }))
  const byName = new Map(result.map((skill) => [normalizeSkillName(skill.name), skill]))
  for (const change of changedSkills) {
    const key = normalizeSkillName(change.name)
    if (byName.has(key)) {
      byName.get(key).proficiency = change.proficiency
    } else {
      const added = { name: change.name.trim(), proficiency: change.proficiency }
      byName.set(key, added)
      result.push(added)
    }
  }
  return result
}

function computeFallbackWhatIf(profile, changes, catalog, topN) {
  const userSkills = (profile.skills || []).reduce((map, entry) => {
    map[normalizeSkillName(entry.name)] = Number(entry.proficiency) || 0
    return map
  }, {})

  const simulatedSkills = applyChanges(profile.skills || [], changes.skills)
  const simulatedUserSkills = simulatedSkills.reduce((map, entry) => {
    map[normalizeSkillName(entry.name)] = Number(entry.proficiency) || 0
    return map
  }, {})

  const scoreCareer = (skillLevels) => (career) => {
    const required = career.skills || []
    let totalWeight = 0
    let weighted = 0
    for (const skill of required) {
      const req = skill.required_level ?? 1
      const importance = skill.importance ?? 1
      const current = skillLevels[normalizeSkillName(skill.name)] || 0
      totalWeight += importance
      weighted += importance * (Math.min(current, req) / req)
    }
    return {
      career_id: career.$id,
      career: career.name,
      category: career.category || '',
      description: career.description || '',
      score: totalWeight ? Math.round((weighted / totalWeight) * 100) : 0,
    }
  }

  const baseline = catalog.map(scoreCareer(userSkills)).sort((a, b) => b.score - a.score)
  const simulated = catalog
    .map(scoreCareer(simulatedUserSkills))
    .sort((a, b) => b.score - a.score)

  const byCareer = new Map(simulated.map((item) => [item.career, item]))
  const changesList = baseline.map((item) => {
    const after = byCareer.get(item.career) || item
    return {
      career_id: item.career_id,
      career: item.career,
      category: item.category,
      baseline_score: item.score,
      simulated_score: after.score,
      delta: Math.round((after.score - item.score) * 10) / 10,
    }
  })
  changesList.sort((a, b) => b.delta - a.delta)

  const biggest = changesList[0]
  const additions = (changes.skills || [])
    .map((s) => `${s.name} (level ${s.proficiency})`)
    .join(', ')
  const summary = biggest
    ? `If ${additions}, ${biggest.career} jumps the most (${biggest.baseline_score}% → ${biggest.simulated_score}%, +${biggest.delta} pts). These are estimated scores, not guaranteed outcomes.`
    : 'Describe at least one change to simulate.'

  return {
    changes: changesList,
    baseline: baseline.slice(0, topN),
    simulated: simulated.slice(0, topN),
    summary,
    source: 'fallback',
  }
}

export async function simulateUserScenario(userId, changes, topN = 8) {
  isValidChangeSet(changes)
  const profile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byName = new Map(catalog.map((career) => [normalizeSkillName(career.name), career]))

  const remapCareer = (entry) => {
    const career = byName.get(normalizeSkillName(entry.career))
    return {
      ...entry,
      career_id: career ? career.$id : entry.career_id,
      category: career?.category || entry.category,
      description: career?.description || entry.description,
    }
  }

  let result
  try {
    const aiResult = await simulateWhatIf({
      ...profile,
      changes: normalizeChanges(changes),
      top_n: topN,
    })
    result = {
      summary: aiResult.summary,
      changes: (aiResult.changes || []).map(remapCareer),
      baseline: (aiResult.baseline || []).map(remapCareer),
      simulated: (aiResult.simulated || []).map(remapCareer),
      source: 'ai',
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'AI_SERVICE_UNAVAILABLE') throw error
    result = computeFallbackWhatIf(profile, normalizeChanges(changes), catalog, topN)
  }

  return result
}