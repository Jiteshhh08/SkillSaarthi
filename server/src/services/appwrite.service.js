import { Client, Databases, Query } from 'node-appwrite'
import { config } from '../config/environment.js'

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey)

export const databases = new Databases(client)

export const COLLECTIONS = {
  profiles: 'profiles',
  skills: 'skills',
  userSkills: 'user_skills',
  interests: 'interests',
  userInterests: 'user_interests',
  careers: 'careers',
  careerSkills: 'career_skills',
  assessments: 'assessments',
  careerRecommendations: 'career_recommendations',
  roadmaps: 'roadmaps',
  roadmapTasks: 'roadmap_tasks',
}

async function listAll(collectionId, queries = []) {
  const docs = []
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await databases.listDocuments(config.appwrite.databaseId, collectionId, [
      Query.limit(100),
      Query.offset(offset),
      ...queries,
    ])
    docs.push(...page.documents)
    if (page.documents.length < 100) break
    offset += 100
  }
  return docs
}

export async function getProfile(userId) {
  if (!userId) return null
  try {
    return await databases.getDocument(config.appwrite.databaseId, COLLECTIONS.profiles, userId)
  } catch {
    return null
  }
}

export async function getUserSkills(userId) {
  try {
    return await listAll(COLLECTIONS.userSkills, [Query.equal('user_id', userId)])
  } catch {
    return []
  }
}

export async function getUserInterests(userId) {
  try {
    return await listAll(COLLECTIONS.userInterests, [Query.equal('user_id', userId)])
  } catch {
    return []
  }
}

export async function getSkillCatalog() {
  try {
    return await listAll(COLLECTIONS.skills)
  } catch {
    return []
  }
}

export async function getInterestCatalog() {
  try {
    return await listAll(COLLECTIONS.interests)
  } catch {
    return []
  }
}

export async function getCareers() {
  try {
    return await listAll(COLLECTIONS.careers)
  } catch {
    return []
  }
}

export async function getCareerById(careerId) {
  try {
    return await databases.getDocument(config.appwrite.databaseId, COLLECTIONS.careers, careerId)
  } catch {
    return null
  }
}

export async function getCareerSkills(careerId) {
  try {
    return await listAll(COLLECTIONS.careerSkills, [Query.equal('career_id', careerId)])
  } catch {
    return []
  }
}

export async function getAllCareerSkills() {
  try {
    return await listAll(COLLECTIONS.careerSkills)
  } catch {
    return []
  }
}

export async function getRecommendations(userId) {
  try {
    return await listAll(COLLECTIONS.careerRecommendations, [Query.equal('user_id', userId)])
  } catch {
    return []
  }
}

export async function saveRecommendations(userId, recommendations) {
  const existing = await getRecommendations(userId)
  for (const doc of existing) {
    try {
      await databases.deleteDocument(config.appwrite.databaseId, COLLECTIONS.careerRecommendations, doc.$id)
    } catch {
      // best-effort cleanup
    }
  }

  const saved = []
  for (const rec of recommendations) {
    const created = await databases.createDocument(
      config.appwrite.databaseId,
      COLLECTIONS.careerRecommendations,
      'unique()',
      {
        user_id: userId,
        career_id: rec.career_id,
        match_score: rec.score,
        explanation: JSON.stringify({
          career: rec.career,
          category: rec.category,
          description: rec.description,
          breakdown: rec.breakdown,
          reasons: rec.reasons,
          strengths: rec.strengths,
          skill_gaps: rec.skill_gaps,
          skill_gap_details: rec.skill_gap_details,
          next_steps: rec.next_steps,
          source: rec.source || 'ai',
        }),
        created_at: new Date().toISOString(),
      },
    )
    saved.push(created)
  }
  return saved
}

export async function createRoadmap(userId, { career_id, title }) {
  const now = new Date().toISOString()
  return databases.createDocument(config.appwrite.databaseId, COLLECTIONS.roadmaps, 'unique()', {
    user_id: userId,
    career_id,
    title,
    status: 'active',
    progress_percent: 0,
    created_at: now,
    updated_at: now,
  })
}

export async function listRoadmaps(userId) {
  try {
    return await listAll(COLLECTIONS.roadmaps, [Query.equal('user_id', userId)])
  } catch {
    return []
  }
}

export async function getRoadmap(roadmapId) {
  try {
    return await databases.getDocument(config.appwrite.databaseId, COLLECTIONS.roadmaps, roadmapId)
  } catch {
    return null
  }
}

export async function updateRoadmap(roadmapId, data) {
  return databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.roadmaps, roadmapId, {
    ...data,
    updated_at: new Date().toISOString(),
  })
}

export async function deleteRoadmap(roadmapId) {
  await databases.deleteDocument(config.appwrite.databaseId, COLLECTIONS.roadmaps, roadmapId)
}

export async function listRoadmapTasks(roadmapId) {
  try {
    return await listAll(COLLECTIONS.roadmapTasks, [Query.equal('roadmap_id', roadmapId)])
  } catch {
    return []
  }
}

export async function createRoadmapTask(roadmapId, data) {
  return databases.createDocument(config.appwrite.databaseId, COLLECTIONS.roadmapTasks, 'unique()', {
    roadmap_id: roadmapId,
    ...data,
  })
}

export async function updateRoadmapTask(taskId, data) {
  return databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.roadmapTasks, taskId, data)
}

export async function deleteRoadmapTask(taskId) {
  await databases.deleteDocument(config.appwrite.databaseId, COLLECTIONS.roadmapTasks, taskId)
}