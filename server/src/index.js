import app from './app.js'
import { config } from './config/environment.js'

app.listen(config.port, () => {
  console.log(`skillsaarthi backend listening on http://0.0.0.0:${config.port}`)
  console.log(`Health check: http://0.0.0.0:${config.port}/api/health`)
})