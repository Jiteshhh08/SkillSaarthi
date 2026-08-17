import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { POST_CATEGORIES } from '../services/community.service.js'
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getMyProfile,
  getPostDetail,
  getUserProfile,
  listComments,
  listPosts,
  listSavedPosts,
  toggleBookmark,
  toggleLike,
  updateComment,
  updateMyProfile,
  updatePost,
} from '../services/community.service.js'

export const listPostsHandler = asyncHandler(async (req, res) => {
  const { category, sort, search, scope, offset, limit } = req.query
  if (category && !POST_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Choose one of: ${POST_CATEGORIES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (sort && !['newest', 'popular'].includes(sort)) {
    throw new ApiError(400, 'sort must be newest or popular', 'VALIDATION_ERROR')
  }
  const result = await listPosts(req.user.$id, {
    category,
    sort,
    search,
    scope,
    offset: Number(offset) || 0,
    limit: Number(limit) || undefined,
  })
  res.json({ success: true, data: result })
})

export const getPostHandler = asyncHandler(async (req, res) => {
  const post = await getPostDetail(req.user.$id, req.params.id)
  res.json({ success: true, data: { post } })
})

export const createPostHandler = asyncHandler(async (req, res) => {
  const post = await createPost(req.user.$id, req.body)
  res.status(201).json({ success: true, data: { post } })
})

export const updatePostHandler = asyncHandler(async (req, res) => {
  const post = await updatePost(req.user.$id, req.params.id, req.body)
  res.json({ success: true, data: { post } })
})

export const deletePostHandler = asyncHandler(async (req, res) => {
  await deletePost(req.user.$id, req.params.id)
  res.json({ success: true })
})

export const toggleLikeHandler = asyncHandler(async (req, res) => {
  const result = await toggleLike(req.user.$id, req.params.id)
  res.json({ success: true, data: result })
})

export const toggleBookmarkHandler = asyncHandler(async (req, res) => {
  const result = await toggleBookmark(req.user.$id, req.params.id)
  res.json({ success: true, data: result })
})

export const listSavedHandler = asyncHandler(async (req, res) => {
  const result = await listSavedPosts(req.user.$id)
  res.json({ success: true, data: result })
})

export const listCommentsHandler = asyncHandler(async (req, res) => {
  const comments = await listComments(req.user.$id, req.params.id)
  res.json({ success: true, data: { comments } })
})

export const addCommentHandler = asyncHandler(async (req, res) => {
  const comment = await addComment(req.user.$id, req.params.id, req.body)
  res.status(201).json({ success: true, data: { comment } })
})

export const updateCommentHandler = asyncHandler(async (req, res) => {
  const comment = await updateComment(req.user.$id, req.params.commentId, req.body)
  res.json({ success: true, data: { comment } })
})

export const deleteCommentHandler = asyncHandler(async (req, res) => {
  await deleteComment(req.user.$id, req.params.commentId)
  res.json({ success: true })
})

export const getMyProfileHandler = asyncHandler(async (req, res) => {
  const result = await getMyProfile(req.user.$id)
  res.json({ success: true, data: result })
})

export const updateMyProfileHandler = asyncHandler(async (req, res) => {
  const result = await updateMyProfile(req.user.$id, req.body)
  res.json({ success: true, data: result })
})

export const getUserProfileHandler = asyncHandler(async (req, res) => {
  const result = await getUserProfile(req.user.$id, req.params.userId)
  res.json({ success: true, data: result })
})