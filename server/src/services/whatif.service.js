import { listCareers } from './career.service.js'
import { buildUserProfile } from './profile.builder.js'
import { simulateWhatIf as nodeSimulate } from './scoring.js'
import { CAREER_REQUIREMENTS } from './careerCatalog.js'
import { ApiError } from '../utils/ApiError.js'

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

export async function simulateUserScenario(userId, changes, topN = 8) {
  isValidChangeSet(changes)
  const profile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byName = new Map(catalog.map((career) => [String(career.name).toLowerCase().replace(/\s+/g, ' ').trim(), career]))

  const remap = (entry) => {
    const career = byName.get(String(entry.career).toLowerCase().replace(/\s+/g, ' ').trim())
    return {
      ...entry,
      career_id: career ? career.$id : entry.career_id,
      category: career?.category || entry.category,
      description: career?.description || entry.description,
    }
  }

  const result = nodeSimulate(profile, normalizeChanges(changes), topN, CAREER_REQUIREMENTS)

  return {
    summary: result.summary,
    changes: (result.changes || []).map(remap),
    baseline: (result.baseline || []).map(remap),
    simulated: (result.simulated || []).map(remap),
    source: 'node',
  }
}
