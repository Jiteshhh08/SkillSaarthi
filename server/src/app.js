import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import githubRoutes from './routes/github.routes.js'
import internshipRoutes from './routes/internship.routes.js'
import { errorHandler, notFound } from './middleware/error.middleware.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/internships', internshipRoutes)

app.use(notFound)
app.use(errorHandler)

export default app