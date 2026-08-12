import { Account, Client, Databases, Storage, ID, Permission, Query, Role } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID

if (!projectId) {
  throw new Error(
    'VITE_APPWRITE_PROJECT_ID is not set. Create an Appwrite project and add it to .env',
  )
}

export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)

export const account = new Account(appwriteClient)
export const databases = new Databases(appwriteClient)
export const storage = new Storage(appwriteClient)

export const APPWRITE_DATABASE_ID = databaseId
export const RESUME_BUCKET_ID = import.meta.env.VITE_APPWRITE_RESUME_BUCKET_ID

export const COLLECTIONS = {
  profiles: 'profiles',
  skills: 'skills',
  userSkills: 'user_skills',
  interests: 'interests',
  userInterests: 'user_interests',
  careers: 'careers',
  careerSkills: 'career_skills',
  assessments: 'assessments',
  careerRecommendations: 'career_recommendations',
  roadmaps: 'roadmaps',
  roadmapTasks: 'roadmap_tasks',
  courses: 'courses',
  userCourses: 'user_courses',
  internships: 'internships',
  internshipRecommendations: 'internship_recommendations',
  resumeAnalyses: 'resume_analyses',
  githubAnalyses: 'github_analyses',
  notifications: 'notifications',
}

export { ID, Query, Permission, Role }