import {
  getAllCareerSkills,
  getCareerById,
  getCareerSkills,
  getCareers,
  getSkillCatalog,
} from './appwrite.service.js'
import { ApiError } from '../utils/ApiError.js'

function attachSkills(careers, careerSkills, skillCatalog) {
  const skillNames = new Map(skillCatalog.map((skill) => [skill.$id, skill.name]))
  const skillsByCareer = new Map()
  for (const entry of careerSkills) {
    if (!skillsByCareer.has(entry.career_id)) skillsByCareer.set(entry.career_id, [])
    skillsByCareer.get(entry.career_id).push({
      skill_id: entry.skill_id,
      name: skillNames.get(entry.skill_id) || entry.skill_id,
      required_level: entry.required_level ?? 0,
      importance: entry.importance ?? 1,
    })
  }

  return careers.map((career) => ({
    $id: career.$id,
    career_id: career.$id,
    name: career.name,
    category: career.category || '',
    description: career.description || '',
    skills: skillsByCareer.get(career.$id) || [],
  }))
}

export async function listCareers() {
  const [careers, careerSkills, skillCatalog] = await Promise.all([
    getCareers(),
    getAllCareerSkills(),
    getSkillCatalog(),
  ])
  return attachSkills(careers, careerSkills, skillCatalog)
}

export async function getCareer(careerId) {
  const career = await getCareerById(careerId)
  if (!career) {
    throw new ApiError(404, 'Career not found', 'CAREER_NOT_FOUND')
  }
  const [careerSkills, skillCatalog] = await Promise.all([
    getCareerSkills(careerId),
    getSkillCatalog(),
  ])
  return attachSkills([career], careerSkills, skillCatalog)[0]
}