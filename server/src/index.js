import app from './app.js'
import { config } from './config/environment.js'

app.listen(config.port, () => {
  console.log(`Skill Guide backend listening on http://localhost:${config.port}`)
  console.log(`Health check: http://localhost:${config.port}/api/health`)
})