import { Client, Databases, Query, Users } from 'node-appwrite'
import { config } from '../config/environment.js'

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey)

export const databases = new Databases(client)
export const users = new Users(client)

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
  communityProfiles: 'community_profiles',
  communityPosts: 'community_posts',
  communityComments: 'community_comments',
  postLikes: 'post_likes',
  postBookmarks: 'post_bookmarks',
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

export async function getCommunityProfile(userId) {
  if (!userId) return null
  try {
    return await databases.getDocument(
      config.appwrite.databaseId,
      COLLECTIONS.communityProfiles,
      userId,
    )
  } catch {
    return null
  }
}

export async function upsertCommunityProfile(userId, data) {
  const existing = await getCommunityProfile(userId)
  const now = new Date().toISOString()
  if (existing) {
    return databases.updateDocument(
      config.appwrite.databaseId,
      COLLECTIONS.communityProfiles,
      userId,
      { ...data, updated_at: now },
    )
  }
  return databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityProfiles,
    userId,
    { user_id: userId, ...data, created_at: now, updated_at: now },
  )
}

export async function listCommunityPosts(queries = []) {
  try {
    return await listAll(COLLECTIONS.communityPosts, queries)
  } catch {
    return []
  }
}

export async function getCommunityPost(postId) {
  try {
    return await databases.getDocument(
      config.appwrite.databaseId,
      COLLECTIONS.communityPosts,
      postId,
    )
  } catch {
    return null
  }
}

export async function createCommunityPost(userId, data) {
  const now = new Date().toISOString()
  return databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityPosts,
    'unique()',
    {
      user_id: userId,
      ...data,
      likes_count: 0,
      comments_count: 0,
      created_at: now,
      updated_at: now,
    },
  )
}

export async function updateCommunityPost(postId, data) {
  return databases.updateDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityPosts,
    postId,
    { ...data, updated_at: new Date().toISOString() },
  )
}

export async function deleteCommunityPost(postId) {
  await databases.deleteDocument(config.appwrite.databaseId, COLLECTIONS.communityPosts, postId)
}

export async function listCommunityComments(postId) {
  try {
    return await listAll(COLLECTIONS.communityComments, [
      Query.equal('post_id', postId),
    ])
  } catch {
    return []
  }
}

export async function getCommunityComment(commentId) {
  try {
    return await databases.getDocument(
      config.appwrite.databaseId,
      COLLECTIONS.communityComments,
      commentId,
    )
  } catch {
    return null
  }
}

export async function createCommunityComment(userId, postId, content) {
  return databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityComments,
    'unique()',
    {
      user_id: userId,
      post_id: postId,
      content,
      created_at: new Date().toISOString(),
    },
  )
}

export async function updateCommunityComment(commentId, content) {
  return databases.updateDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityComments,
    commentId,
    { content },
  )
}

export async function deleteCommunityComment(commentId) {
  await databases.deleteDocument(
    config.appwrite.databaseId,
    COLLECTIONS.communityComments,
    commentId,
  )
}

export async function listCommunityLikes(queries = []) {
  try {
    return await listAll(COLLECTIONS.postLikes, queries)
  } catch {
    return []
  }
}

export async function createCommunityLike(userId, postId) {
  return databases.createDocument(config.appwrite.databaseId, COLLECTIONS.postLikes, 'unique()', {
    user_id: userId,
    post_id: postId,
    created_at: new Date().toISOString(),
  })
}

export async function deleteCommunityLike(likeId) {
  await databases.deleteDocument(config.appwrite.databaseId, COLLECTIONS.postLikes, likeId)
}

export async function listCommunityBookmarks(queries = []) {
  try {
    return await listAll(COLLECTIONS.postBookmarks, queries)
  } catch {
    return []
  }
}

export async function createCommunityBookmark(userId, postId) {
  return databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.postBookmarks,
    'unique()',
    {
      user_id: userId,
      post_id: postId,
      created_at: new Date().toISOString(),
    },
  )
}

export async function deleteCommunityBookmark(bookmarkId) {
  await databases.deleteDocument(
    config.appwrite.databaseId,
    COLLECTIONS.postBookmarks,
    bookmarkId,
  )
}

export async function getAppwriteUser(userId) {
  try {
    return await users.get(userId)
  } catch {
    return null
  }
}