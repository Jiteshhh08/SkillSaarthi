import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 5000,
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    resumeBucketId: process.env.APPWRITE_RESUME_BUCKET_ID || 'resumes',
    adminEmails: (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  githubToken: process.env.GITHUB_TOKEN || '',
  llmApiKey: process.env.LLM_API_KEY || '',
}