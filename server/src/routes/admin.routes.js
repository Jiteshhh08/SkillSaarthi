import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { notify, notifyAllUsers } from '../services/notification.service.js'
import {
  createInternship,
  deleteInternship,
  listAdminInternships,
  updateInternship,
} from '../services/internship.service.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/me', (_req, res) => {
  res.json({ success: true, data: { is_admin: true } })
})

router.get(
  '/internships',
  asyncHandler(async (req, res) => {
    const { status = '', search = '' } = req.query
    const internships = await listAdminInternships({ status, search })
    res.json({ success: true, data: { internships } })
  }),
)

router.post(
  '/internships',
  asyncHandler(async (req, res) => {
    const internship = await createInternship(req.body || {})
    res.status(201).json({ success: true, data: { internship } })
  }),
)

router.patch(
  '/internships/:id',
  asyncHandler(async (req, res) => {
    const internship = await updateInternship(req.params.id, req.body || {})
    res.json({ success: true, data: { internship } })
  }),
)

router.delete(
  '/internships/:id',
  asyncHandler(async (req, res) => {
    await deleteInternship(req.params.id)
    res.json({ success: true, data: { deleted: true } })
  }),
)

// Admin → sends a notification to a single user (user_id) or broadcasts to all users.
router.post(
  '/notifications',
  asyncHandler(async (req, res) => {
    const { title, message, user_id } = req.body || {}
    if (!title || !String(title).trim()) {
      throw new ApiError(400, 'Notification title is required.', 'VALIDATION_ERROR')
    }
    let sent
    if (user_id && String(user_id).trim()) {
      sent = (await notify(String(user_id).trim(), String(title).trim(), message)) ? 1 : 0
    } else {
      sent = await notifyAllUsers(String(title).trim(), message)
    }
    res.status(201).json({ success: true, data: { sent } })
  }),
)

export default router