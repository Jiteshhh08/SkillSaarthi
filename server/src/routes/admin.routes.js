import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
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

export default router