import { listCareers } from './career.service.js'
import { buildUserProfile } from './profile.builder.js'
import { compareCareers as nodeCompare } from './scoring.js'
import { CAREER_REQUIREMENTS } from './careerCatalog.js'
import { ApiError } from '../utils/ApiError.js'

export async function compareSelectedCareers(userId, careerIds) {
  if (!Array.isArray(careerIds) || careerIds.length < 2) {
    throw new ApiError(400, 'Select at least two careers to compare.', 'VALIDATION_ERROR')
  }

  const userProfile = await buildUserProfile(userId)
  const catalog = await listCareers()
  const byId = new Map(catalog.map((career) => [career.$id, career]))

  const selected = careerIds.map((id) => byId.get(id)).filter(Boolean)
  if (selected.length < 2) {
    throw new ApiError(400, 'One or more selected careers were not found.', 'VALIDATION_ERROR')
  }

  const desiredOrder = new Map(selected.map((career, index) => [career.$id, index]))
  const careerNames = selected.map((c) => c.name)

  const result = nodeCompare(userProfile, careerNames, CAREER_REQUIREMENTS)

  // Map scored entries back to Appwrite ids
  const byName = new Map(selected.map((c) => [String(c.name).toLowerCase().replace(/\s+/g, ' ').trim(), c]))

  const mapped = (result.careers || []).map((rec) => {
    const career = byName.get(String(rec.career).toLowerCase().replace(/\s+/g, ' ').trim())
    return {
      ...rec,
      career_id: career ? career.$id : rec.career_id,
      category: career?.category || rec.category,
      description: career?.description || rec.description,
      source: 'node',
    }
  })

  const recommendedCareer = byName.get(String(result.recommended || '').toLowerCase().replace(/\s+/g, ' ').trim())

  mapped.sort((a, b) => {
    const ai = desiredOrder.get(a.career_id)
    const bi = desiredOrder.get(b.career_id)
    if (ai == null || bi == null) return 0
    return ai - bi
  })

  return {
    ...result,
    recommended_id: recommendedCareer ? recommendedCareer.$id : result.recommended_id,
    careers: mapped,
    source: 'node',
  }
}
