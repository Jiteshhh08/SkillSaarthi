import { ApiError } from '../utils/ApiError.js'
import { hasNotification, notify } from './notification.service.js'
import {
  createCommunityBookmark,
  createCommunityComment,
  createCommunityLike,
  createCommunityPost,
  deleteCommunityBookmark,
  deleteCommunityComment,
  deleteCommunityLike,
  deleteCommunityPost,
  getAppwriteUser,
  getCommunityComment,
  getCommunityPost,
  getCommunityProfile,
  listCommunityBookmarks,
  listCommunityComments,
  listCommunityLikes,
  listCommunityPosts,
  updateCommunityComment,
  updateCommunityPost,
  upsertCommunityProfile,
} from './appwrite.service.js'
import { COLLECTIONS, Query, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'

export const POST_CATEGORIES = [
  'Career Guidance',
  'Skill Building',
  'Internship',
  'Success Story',
  'Resource',
  'General',
]
const POST_STATUSES = ['draft', 'published']
const MAX_TAGS = 8
const MAX_POST_TITLE = 300
const MAX_POST_CONTENT = 20000
const MAX_COMMENT_CONTENT = 4000
const FEED_PAGE_SIZE = 20

const authorCache = new Map()
const AUTHOR_CACHE_TTL = 120_000

export function sanitizeTags(tags) {
  const raw = Array.isArray(tags) ? tags : []
  const seen = new Set()
  const cleaned = []
  for (const tag of raw) {
    const normalized = String(tag || '').trim().replace(/\s+/g, ' ').slice(0, 50)
    if (!normalized || seen.has(normalized.toLowerCase())) continue
    seen.add(normalized.toLowerCase())
    cleaned.push(normalized)
    if (cleaned.length >= MAX_TAGS) break
  }
  return cleaned
}

function parseTags(csv) {
  if (!csv) return []
  return String(csv)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function cacheKeyedGet(userId) {
  const cached = authorCache.get(userId)
  if (cached && Date.now() - cached.fetchedAt < AUTHOR_CACHE_TTL) {
    return Promise.resolve(cached.user)
  }
  return getAppwriteUser(userId).then((user) => {
    if (user) authorCache.set(userId, { user, fetchedAt: Date.now() })
    return user
  })
}

function mapAuthor(user) {
  if (!user) return null
  return {
    $id: user.$id,
    name: user.name || user.email || 'Community member',
    avatar_file_id: user.prefs?.avatar_file_id || '',
    email: user.email || '',
  }
}

async function loadProfilesForUsers(userIds) {
  if (userIds.length === 0) return {}
  try {
    const profiles = await databases.listDocuments(
      config.appwrite.databaseId,
      COLLECTIONS.communityProfiles,
      [Query.equal('user_id', userIds)],
    )
    const byUser = {}
    for (const profile of profiles.documents) byUser[profile.user_id] = profile
    return byUser
  } catch {
    return {}
  }
}

function decoratePost(post, { author, profile, likedSet, bookmarkedSet }) {
  return {
    ...post,
    tags: parseTags(post.tags),
    author,
    community_profile: profile
      ? {
          $id: profile.$id,
          bio: profile.bio || '',
          location: profile.location || '',
          role: profile.role || '',
          interests: parseTags(profile.interests),
        }
      : null,
    liked_by_me: likedSet ? likedSet.has(post.$id) : false,
    bookmarked_by_me: bookmarkedSet ? bookmarkedSet.has(post.$id) : false,
  }
}

async function decoratePosts(posts, viewerId) {
  if (posts.length === 0) return []

  const userIds = [...new Set(posts.map((post) => post.user_id))]
  const [authors, profiles, likedRows, bookmarkedRows] = await Promise.all([
    Promise.all(userIds.map((id) => cacheKeyedGet(id))),
    loadProfilesForUsers(userIds),
    viewerId ? listCommunityLikes([Query.equal('user_id', viewerId)]) : Promise.resolve([]),
    viewerId
      ? listCommunityBookmarks([Query.equal('user_id', viewerId)])
      : Promise.resolve([]),
  ])
  const authorById = {}
  authors.forEach((author, i) => {
    if (author) authorById[userIds[i]] = author
  })
  const likedSet = new Set(likedRows.map((row) => row.post_id))
  const bookmarkedSet = new Set(bookmarkedRows.map((row) => row.post_id))

  return posts.map((post) =>
    decoratePost(post, {
      author: mapAuthor(authorById[post.user_id]),
      profile: profiles[post.user_id],
      likedSet,
      bookmarkedSet,
    }),
  )
}

function paginate(items, offset, limit) {
  const start = Math.max(0, Number(offset) || 0)
  const size = Math.min(Math.max(Number(limit) || FEED_PAGE_SIZE, 1), 50)
  return { items: items.slice(start, start + size), total: items.length, offset: start, limit: size }
}

export async function listPosts(userId, filters = {}) {
  const { category, sort = 'newest', search = '', scope = 'published', offset = 0, limit = FEED_PAGE_SIZE } = filters

  const queries = []
  if (scope === 'drafts') {
    queries.push(Query.equal('user_id', userId), Query.equal('status', 'draft'))
  } else if (scope === 'mine') {
    queries.push(Query.equal('user_id', userId))
  } else {
    queries.push(Query.equal('status', 'published'))
  }
  if (category && POST_CATEGORIES.includes(category)) {
    queries.push(Query.equal('category', category))
  }

  let posts = await listCommunityPosts(queries)

  const q = String(search || '').trim().toLowerCase()
  if (q) {
    posts = posts.filter((post) => {
      const haystack = `${post.title} ${post.content} ${post.category} ${post.tags || ''}`.toLowerCase()
      return q.split(/\s+/).every((term) => haystack.includes(term))
    })
  }

  posts.sort((a, b) => {
    if (sort === 'popular') {
      const score = (post) => (post.likes_count || 0) * 2 + (post.comments_count || 0)
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })

  const { items, total } = paginate(posts, offset, limit)
  const decorated = await decoratePosts(items, userId)
  return { posts: decorated, total, offset: Number(offset) || 0, limit }
}

export async function getPostDetail(userId, postId) {
  const post = await getCommunityPost(postId)
  if (!post) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (post.status !== 'published' && post.user_id !== userId) {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }

  const viewerId = userId
  const [author, profile, likedRows, bookmarkedRows] = await Promise.all([
    cacheKeyedGet(post.user_id),
    getCommunityProfile(post.user_id),
    viewerId ? listCommunityLikes([Query.equal('user_id', viewerId)]) : Promise.resolve([]),
    viewerId ? listCommunityBookmarks([Query.equal('user_id', viewerId)]) : Promise.resolve([]),
  ])

  const likedSet = new Set(likedRows.map((row) => row.post_id))
  const bookmarkedSet = new Set(bookmarkedRows.map((row) => row.post_id))

  return decoratePost(post, {
    author: mapAuthor(author),
    profile,
    likedSet,
    bookmarkedSet,
  })
}

export async function createPost(userId, input = {}) {
  const title = String(input.title || '').trim()
  const content = String(input.content || '').trim()

  if (!title) throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR')
  if (title.length > MAX_POST_TITLE) {
    throw new ApiError(400, `Title must be ${MAX_POST_TITLE} characters or fewer`, 'VALIDATION_ERROR')
  }
  if (!content) throw new ApiError(400, 'Post content is required', 'VALIDATION_ERROR')
  if (content.length > MAX_POST_CONTENT) {
    throw new ApiError(400, `Post content must be ${MAX_POST_CONTENT} characters or fewer`, 'VALIDATION_ERROR')
  }

  const category = input.category && POST_CATEGORIES.includes(input.category) ? input.category : 'General'
  const status = POST_STATUSES.includes(input.status) ? input.status : 'published'
  const tags = sanitizeTags(input.tags)

  return createCommunityPost(userId, {
    title,
    content,
    category,
    tags: tags.join(','),
    status,
  })
}

async function assertPostOwner(userId, postId) {
  const post = await getCommunityPost(postId)
  if (!post || post.user_id !== userId) {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }
  return post
}

export async function updatePost(userId, postId, input = {}) {
  await assertPostOwner(userId, postId)

  const update = {}
  if (input.title !== undefined) {
    const title = String(input.title).trim()
    if (!title) throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR')
    if (title.length > MAX_POST_TITLE) {
      throw new ApiError(400, `Title must be ${MAX_POST_TITLE} characters or fewer`, 'VALIDATION_ERROR')
    }
    update.title = title
  }
  if (input.content !== undefined) {
    const content = String(input.content).trim()
    if (!content) throw new ApiError(400, 'Post content is required', 'VALIDATION_ERROR')
    if (content.length > MAX_POST_CONTENT) {
      throw new ApiError(400, `Post content must be ${MAX_POST_CONTENT} characters or fewer`, 'VALIDATION_ERROR')
    }
    update.content = content
  }
  if (input.category !== undefined) {
    if (!POST_CATEGORIES.includes(input.category)) {
      throw new ApiError(400, `Invalid category. Choose one of: ${POST_CATEGORIES.join(', ')}`, 'VALIDATION_ERROR')
    }
    update.category = input.category
  }
  if (input.status !== undefined) {
    if (!POST_STATUSES.includes(input.status)) {
      throw new ApiError(400, `status must be one of ${POST_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
    }
    update.status = input.status
  }
  if (input.tags !== undefined) {
    update.tags = sanitizeTags(input.tags).join(',')
  }

  await updateCommunityPost(postId, update)
  return getPostDetail(userId, postId)
}

export async function deletePost(userId, postId) {
  await assertPostOwner(userId, postId)

  const [comments, likes, bookmarks] = await Promise.all([
    listCommunityComments(postId),
    listCommunityLikes([Query.equal('post_id', postId)]),
    listCommunityBookmarks([Query.equal('post_id', postId)]),
  ])

  await Promise.all([
    ...comments.map((comment) => deleteCommunityComment(comment.$id)),
    ...likes.map((like) => deleteCommunityLike(like.$id)),
    ...bookmarks.map((bookmark) => deleteCommunityBookmark(bookmark.$id)),
    deleteCommunityPost(postId),
  ])
  return true
}

export async function toggleLike(userId, postId) {
  const post = await getCommunityPost(postId)
  if (!post || post.status !== 'published') {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }

  const existing = await listCommunityLikes([
    Query.equal('user_id', userId),
    Query.equal('post_id', postId),
  ])

  if (existing.length > 0) {
    await deleteCommunityLike(existing[0].$id)
    const likesCount = Math.max(0, (post.likes_count || 0) - 1)
    await updateCommunityPost(postId, { likes_count: likesCount })
    return { liked: false, likes_count: likesCount }
  }

  await createCommunityLike(userId, postId)
  const likesCount = (post.likes_count || 0) + 1
  await updateCommunityPost(postId, { likes_count: likesCount })

  if (post.user_id && post.user_id !== userId) {
    try {
      const alreadyNotified = await hasNotification(post.user_id, {
        actor_id: userId,
        post_id: postId,
      })
      if (!alreadyNotified) {
        const liker = await cacheKeyedGet(userId)
        await notify(
          post.user_id,
          'New like on your post',
          `${liker?.name || 'Someone'} liked your post "${post.title}".`,
          { actor_id: userId, post_id: postId },
        )
      }
    } catch {
      // a failed notification must never break the like
    }
  }

  return { liked: true, likes_count: likesCount }
}

export async function toggleBookmark(userId, postId) {
  const post = await getCommunityPost(postId)
  if (!post || post.status !== 'published') {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }

  const existing = await listCommunityBookmarks([
    Query.equal('user_id', userId),
    Query.equal('post_id', postId),
  ])

  if (existing.length > 0) {
    await deleteCommunityBookmark(existing[0].$id)
    return { bookmarked: false }
  }

  await createCommunityBookmark(userId, postId)
  return { bookmarked: true }
}

export async function listSavedPosts(userId) {
  const bookmarks = await listCommunityBookmarks([Query.equal('user_id', userId)])
  if (bookmarks.length === 0) return { posts: [], total: 0 }

  const sorted = bookmarks.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  const postIds = sorted.map((row) => row.post_id)
  const posts = await listCommunityPosts([Query.equal('$id', postIds)])
  const ordered = postIds
    .map((id) => posts.find((post) => post.$id === id))
    .filter(Boolean)
    .filter((post) => post.status === 'published')

  const decorated = await decoratePosts(ordered, userId)
  return { posts: decorated, total: decorated.length }
}

export async function listComments(userId, postId) {
  const post = await getCommunityPost(postId)
  if (!post) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (post.status !== 'published' && post.user_id !== userId) {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }

  const comments = await listCommunityComments(postId)
  comments.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))

  const userIds = [...new Set(comments.map((comment) => comment.user_id))]
  const authors = {}
  const rows = await Promise.all(userIds.map((id) => cacheKeyedGet(id)))
  userIds.forEach((id, i) => {
    if (rows[i]) authors[id] = mapAuthor(rows[i])
  })

  return comments.map((comment) => ({
    ...comment,
    author: authors[comment.user_id] || null,
  }))
}

export async function addComment(userId, postId, input = {}) {
  const content = String(input.content || '').trim()
  if (!content) throw new ApiError(400, 'Comment cannot be empty', 'VALIDATION_ERROR')
  if (content.length > MAX_COMMENT_CONTENT) {
    throw new ApiError(400, `Comment must be ${MAX_COMMENT_CONTENT} characters or fewer`, 'VALIDATION_ERROR')
  }

  const post = await getCommunityPost(postId)
  if (!post || post.status !== 'published') {
    throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  }

  const comment = await createCommunityComment(userId, postId, content)
  const commentsCount = (post.comments_count || 0) + 1
  await updateCommunityPost(postId, { comments_count: commentsCount })

  const author = await cacheKeyedGet(userId)
  return { ...comment, author: mapAuthor(author) }
}

async function assertCommentOwner(userId, commentId) {
  const comment = await getCommunityComment(commentId)
  if (!comment || comment.user_id !== userId) {
    throw new ApiError(404, 'Comment not found', 'COMMENT_NOT_FOUND')
  }
  return comment
}

export async function updateComment(userId, commentId, input = {}) {
  const content = String(input.content || '').trim()
  if (!content) throw new ApiError(400, 'Comment cannot be empty', 'VALIDATION_ERROR')
  if (content.length > MAX_COMMENT_CONTENT) {
    throw new ApiError(400, `Comment must be ${MAX_COMMENT_CONTENT} characters or fewer`, 'VALIDATION_ERROR')
  }
  await assertCommentOwner(userId, commentId)
  await updateCommunityComment(commentId, content)
  return getCommunityComment(commentId)
}

export async function deleteComment(userId, commentId) {
  const comment = await assertCommentOwner(userId, commentId)
  await deleteCommunityComment(commentId)
  const post = await getCommunityPost(comment.post_id)
  if (post) {
    const commentsCount = Math.max(0, (post.comments_count || 0) - 1)
    await updateCommunityPost(post.$id, { comments_count: commentsCount })
  }
  return true
}

export async function getMyProfile(userId) {
  const [user, profile] = await Promise.all([cacheKeyedGet(userId), getCommunityProfile(userId)])
  return {
    user: mapAuthor(user),
    profile: profile
      ? { ...profile, interests: parseTags(profile.interests) }
      : null,
  }
}

export async function updateMyProfile(userId, input = {}) {
  const update = {}
  if (input.bio !== undefined) {
    const bio = String(input.bio).trim().slice(0, 2000)
    update.bio = bio
  }
  if (input.location !== undefined) {
    update.location = String(input.location).trim().slice(0, 200)
  }
  if (input.role !== undefined) {
    update.role = String(input.role).trim().slice(0, 200)
  }
  if (input.interests !== undefined) {
    update.interests = sanitizeTags(input.interests).join(',')
  }

  await upsertCommunityProfile(userId, update)
  return getMyProfile(userId)
}

export async function getUserProfile(userId, targetUserId) {
  if (!targetUserId) throw new ApiError(400, 'user_id is required', 'VALIDATION_ERROR')
  const [user, profile] = await Promise.all([cacheKeyedGet(targetUserId), getCommunityProfile(targetUserId)])

  const postsResult = await listCommunityPosts([Query.equal('user_id', targetUserId)])
  const published = postsResult
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 20)

  const decorated = await decoratePosts(published, userId)

  return {
    user: mapAuthor(user),
    profile: profile ? { ...profile, interests: parseTags(profile.interests) } : null,
    posts: decorated,
  }
}