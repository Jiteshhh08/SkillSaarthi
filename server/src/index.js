import app from './app.js'
import { config } from './config/environment.js'

app.listen(config.port, () => {
  console.log(`skillsaarthi backend listening on http://localhost:${config.port}`)
  console.log(`Health check: http://localhost:${config.port}/api/health`)
})