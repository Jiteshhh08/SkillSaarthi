import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import healthRoutes from './routes/health.routes.js'
import careerRoutes from './routes/career.routes.js'
import comparisonRoutes from './routes/comparison.routes.js'
import recommendationRoutes from './routes/recommendation.routes.js'
import githubRoutes from './routes/github.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import internshipRoutes from './routes/internship.routes.js'
import adminRoutes from './routes/admin.routes.js'
import roadmapRoutes from './routes/roadmap.routes.js'
import whatifRoutes from './routes/whatif.routes.js'
import communityRoutes from './routes/community.routes.js'
import authRoutes from './routes/auth.routes.js'
import assistantRoutes from './routes/assistant.routes.js'
import { errorHandler, notFound } from './middleware/error.middleware.js'

const app = express()

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())

// Coarse IP-based abuse protection, 30/min per prefix (matching docs).
// One instance PER prefix — a single shared instance made /api/github +
// /api/resume + /api/admin drain one bucket, so a full resume run 429'd.
// Per-user fairness is enforced inside the routers (after requireAuth).
app.use(
  '/api/github',
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests, try again shortly.' },
  }),
)
app.use(
  '/api/resume',
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests, try again shortly.' },
  }),
)
app.use(
  '/api/admin',
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests, try again shortly.' },
  }),
)

// Lightweight root + health routes for uptime monitoring (cron-job.org).
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'skillsaarthi-node' })
})
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skillsaarthi-node' })
})

app.use('/api', healthRoutes)
app.use('/api/careers', careerRoutes)
app.use('/api/careers', comparisonRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/internships', internshipRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/roadmaps', roadmapRoutes)
app.use('/api/what-if', whatifRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/assistant', assistantRoutes)

app.use(notFound)
app.use(errorHandler)

export default app