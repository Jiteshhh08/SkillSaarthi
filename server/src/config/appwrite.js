import { Client, Databases, ID, Permission, Query, Role, Storage } from 'node-appwrite'
import { config } from './environment.js'

const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)

if (config.appwrite.apiKey) {
  client.setKey(config.appwrite.apiKey)
}

export const databases = new Databases(client)
export const storage = new Storage(client)

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

export { ID, Permission, Query, Role }
