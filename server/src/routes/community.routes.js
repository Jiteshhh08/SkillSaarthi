import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
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

router.get('/posts', listPostsHandler)
router.post('/posts', createPostHandler)
router.get('/saved', listSavedHandler)
router.get('/profile', getMyProfileHandler)
router.put('/profile', updateMyProfileHandler)
router.get('/users/:userId', getUserProfileHandler)
router.put('/comments/:commentId', updateCommentHandler)
router.delete('/comments/:commentId', deleteCommentHandler)
router.get('/posts/:id/comments', listCommentsHandler)
router.post('/posts/:id/comments', addCommentHandler)
router.post('/posts/:id/like', toggleLikeHandler)
router.post('/posts/:id/bookmark', toggleBookmarkHandler)
router.get('/posts/:id', getPostHandler)
router.put('/posts/:id', updatePostHandler)
router.delete('/posts/:id', deletePostHandler)

export default router