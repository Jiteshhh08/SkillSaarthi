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

// Prevent spam: 30 posts/comments per minute, 60 likes/bookmarks per minute, 120 reads per minute
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: 'Too many requests. Slow down.' })
const interactionLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: 'Too many likes/bookmarks. Slow down.' })
const readLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, message: 'Too many requests. Slow down.' })

router.get('/posts', readLimiter, listPostsHandler)
router.post('/posts', writeLimiter, createPostHandler)
router.get('/saved', readLimiter, listSavedHandler)
router.get('/profile', readLimiter, getMyProfileHandler)
router.put('/profile', writeLimiter, updateMyProfileHandler)
router.get('/users/:userId', readLimiter, getUserProfileHandler)
router.put('/comments/:commentId', writeLimiter, updateCommentHandler)
router.delete('/comments/:commentId', writeLimiter, deleteCommentHandler)
router.get('/posts/:id/comments', readLimiter, listCommentsHandler)
router.post('/posts/:id/comments', writeLimiter, addCommentHandler)
router.post('/posts/:id/like', interactionLimiter, toggleLikeHandler)
router.post('/posts/:id/bookmark', interactionLimiter, toggleBookmarkHandler)
router.get('/posts/:id', readLimiter, getPostHandler)
router.put('/posts/:id', writeLimiter, updatePostHandler)
router.delete('/posts/:id', writeLimiter, deletePostHandler)

export default router