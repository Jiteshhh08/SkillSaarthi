import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { rateLimit } from '../middleware/rateLimit.middleware.js'
import {
  addCommentHandler,
  createPostHandler,
  deleteCommentHandler,
  deletePostHandler,
  getMyProfileHandler,
  getPostHandler,
  getUserProfileHandler,
  listCommentsHandler,
  listPostsHandler,
  listSavedHandler,
  toggleBookmarkHandler,
  toggleLikeHandler,
  updateCommentHandler,
  updateMyProfileHandler,
  updatePostHandler,
} from '../controllers/community.controller.js'

const router = Router()

router.use(requireAuth)

// Prevent spam: 30 posts/comments per minute, 60 likes/bookmarks per minute
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: 'Too many requests. Slow down.' })
const interactionLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: 'Too many likes/bookmarks. Slow down.' })

router.get('/posts', listPostsHandler)
router.post('/posts', writeLimiter, createPostHandler)
router.get('/saved', listSavedHandler)
router.get('/profile', getMyProfileHandler)
router.put('/profile', writeLimiter, updateMyProfileHandler)
router.get('/users/:userId', getUserProfileHandler)
router.put('/comments/:commentId', writeLimiter, updateCommentHandler)
router.delete('/comments/:commentId', deleteCommentHandler)
router.get('/posts/:id/comments', listCommentsHandler)
router.post('/posts/:id/comments', writeLimiter, addCommentHandler)
router.post('/posts/:id/like', interactionLimiter, toggleLikeHandler)
router.post('/posts/:id/bookmark', interactionLimiter, toggleBookmarkHandler)
router.get('/posts/:id', getPostHandler)
router.put('/posts/:id', updatePostHandler)
router.delete('/posts/:id', deletePostHandler)

export default router