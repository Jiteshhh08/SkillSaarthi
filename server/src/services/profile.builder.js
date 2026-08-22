import { getInterestCatalog, getProfile, getSkillCatalog, getUserInterests, getUserSkills } from './appwrite.service.js'
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

export async function buildUserProfile(userId) {
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
    interests: userInterests.map((entry) => interestNames.get(entry.interest_id) || entry.interest_id).filter(Boolean),
    goals: buildGoals(profile),
    assessment_score: profile.assessment_score ?? null,
    experience_years: profile.experience_years ?? 0,
  }
}

export function normalizeSkillName(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
}
