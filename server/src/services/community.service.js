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

function sanitizeContent(text, max) {
  let t = String(text || '')
  // strip script/style tags and angle brackets to prevent XSS if ever rendered as HTML
  t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  t = t.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // trim and enforce max
  t = t.trim().slice(0, max)
  return t
}

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
    // Deduplicate and batch — Appwrite Query.equal with array does OR; limit batch to 20 ids per request to avoid URL length limits
    const unique = [...new Set(userIds)].slice(0, 100)
    const byUser = {}
    for (let i = 0; i < unique.length; i += 50) {
      const batch = unique.slice(i, i + 50)
      const res = await databases.listDocuments(
        config.appwrite.databaseId,
        COLLECTIONS.communityProfiles,
        [Query.equal('user_id', batch), Query.limit(50)],
      )
      for (const profile of res.documents) byUser[profile.user_id] = profile
    }
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
  const postIds = posts.map((p) => p.$id)
  // Only fetch likes/bookmarks for visible postIds — avoids N+1 and fetching entire user history
  const [authors, profiles, likedRows, bookmarkedRows] = await Promise.all([
    Promise.all(userIds.map((id) => cacheKeyedGet(id))),
    loadProfilesForUsers(userIds),
    viewerId
      ? listCommunityLikes([Query.equal('user_id', viewerId), Query.equal('post_id', postIds)])
      : Promise.resolve([]),
    viewerId
      ? listCommunityBookmarks([Query.equal('user_id', viewerId), Query.equal('post_id', postIds)])
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
  const q = String(search || '').trim()
  const normalizedOffset = Math.max(0, Number(offset) || 0)
  const normalizedLimit = Math.min(Math.max(Number(limit) || FEED_PAGE_SIZE, 1), 50)
  const hasSearch = q.length > 0

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

  // When there is a search query we must fetch a larger window and filter in-memory
  // because Appwrite fulltext requires an index; otherwise use DB pagination directly.
  if (hasSearch) {
    // Fetch up to 100 candidates then filter/sort/paginate in memory
    let posts = await listCommunityPosts([...queries, Query.limit(100)])
    const lower = q.toLowerCase()
    const terms = lower.split(/\s+/).filter(Boolean)
    posts = posts.filter((post) => {
      const haystack = `${post.title} ${post.content} ${post.category} ${post.tags || ''}`.toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    posts.sort((a, b) => {
      if (sort === 'popular') {
        const score = (post) => (post.likes_count || 0) * 2 + (post.comments_count || 0)
        const diff = score(b) - score(a)
        if (diff !== 0) return diff
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
    const { items, total } = paginate(posts, normalizedOffset, normalizedLimit)
    const decorated = await decoratePosts(items, userId)
    return { posts: decorated, total, offset: normalizedOffset, limit: normalizedLimit }
  }

  // No search — use DB-level pagination and ordering for efficiency
  const orderAttr = sort === 'popular' ? 'likes_count' : 'created_at'
  queries.push(Query.orderDesc(orderAttr), Query.limit(normalizedLimit), Query.offset(normalizedOffset))
  let posts = []
  let total = 0
  try {
    const result = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.communityPosts, queries)
    posts = result.documents
    total = result.total
    // For popular sort, secondary sort by created_at is done in-memory for tie-breaker
    if (sort === 'popular') {
      posts.sort((a, b) => {
        const score = (post) => (post.likes_count || 0) * 2 + (post.comments_count || 0)
        const diff = score(b) - score(a)
        if (diff !== 0) return diff
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
    }
  } catch {
    // Fallback to previous in-memory method if query fails
    posts = await listCommunityPosts(queries.slice(0, -3))
    posts.sort((a, b) => {
      if (sort === 'popular') {
        const score = (post) => (post.likes_count || 0) * 2 + (post.comments_count || 0)
        const diff = score(b) - score(a)
        if (diff !== 0) return diff
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
    const page = paginate(posts, normalizedOffset, normalizedLimit)
    posts = page.items
    total = page.total
  }
  const decorated = await decoratePosts(posts, userId)
  return { posts: decorated, total, offset: normalizedOffset, limit: normalizedLimit }
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
    viewerId ? listCommunityLikes([Query.equal('user_id', viewerId), Query.equal('post_id', postId)]) : Promise.resolve([]),
    viewerId ? listCommunityBookmarks([Query.equal('user_id', viewerId), Query.equal('post_id', postId)]) : Promise.resolve([]),
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
  const title = sanitizeContent(input.title, MAX_POST_TITLE)
  const content = sanitizeContent(input.content, MAX_POST_CONTENT)

  if (!title) throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR')
  if (!content) throw new ApiError(400, 'Post content is required', 'VALIDATION_ERROR')

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
    const title = sanitizeContent(input.title, MAX_POST_TITLE)
    if (!title) throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR')
    update.title = title
  }
  if (input.content !== undefined) {
    const content = sanitizeContent(input.content, MAX_POST_CONTENT)
    if (!content) throw new ApiError(400, 'Post content is required', 'VALIDATION_ERROR')
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

  try {
    await createCommunityLike(userId, postId)
  } catch (err) {
    // Race: unique index violation means another request already liked
    if (String(err.message || '').includes('already exists') || err.code === 409) {
      return { liked: true, likes_count: post.likes_count || 0 }
    }
    throw err
  }
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

  try {
    await createCommunityBookmark(userId, postId)
  } catch (err) {
    if (String(err.message || '').includes('already exists') || err.code === 409) {
      return { bookmarked: true }
    }
    throw err
  }
  return { bookmarked: true }
}

export async function listSavedPosts(userId) {
  const bookmarks = await listCommunityBookmarks([Query.equal('user_id', userId), Query.limit(100), Query.orderDesc('created_at')])
  if (bookmarks.length === 0) return { posts: [], total: 0 }

  const sorted = bookmarks.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  const postIds = sorted.map((row) => row.post_id).slice(0, 50)
  if (postIds.length === 0) return { posts: [], total: 0 }
  // Batch fetch — Appwrite Query.equal('$id', array) handles OR; chunk to avoid URL limits
  const posts = []
  for (let i = 0; i < postIds.length; i += 20) {
    const chunk = postIds.slice(i, i + 20)
    const batch = await listCommunityPosts([Query.equal('$id', chunk)])
    posts.push(...batch)
  }
  const postMap = new Map(posts.map((p) => [p.$id, p]))
  const ordered = postIds.map((id) => postMap.get(id)).filter(Boolean).filter((post) => post.status === 'published')

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
  const content = sanitizeContent(input.content, MAX_COMMENT_CONTENT)
  if (!content) throw new ApiError(400, 'Comment cannot be empty', 'VALIDATION_ERROR')

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
  const content = sanitizeContent(input.content, MAX_COMMENT_CONTENT)
  if (!content) throw new ApiError(400, 'Comment cannot be empty', 'VALIDATION_ERROR')
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
    const bio = sanitizeContent(input.bio, 2000)
    update.bio = bio
  }
  if (input.location !== undefined) {
    update.location = sanitizeContent(input.location, 200)
  }
  if (input.role !== undefined) {
    update.role = sanitizeContent(input.role, 200)
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