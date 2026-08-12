/**
 * Skill_Guide — one-time Appwrite setup script.
 *
 * Creates:
 *   - the application database
 *   - all collections from docs/main_architecture.md §17
 *   - collection attributes + indexes
 *   - the resume storage bucket
 *
 * Usage:
 *   1. Create an Appwrite project + API key (Settings → API Keys, scope: databases.*, storage.*)
 *   2. cp scripts/.env.setup.example scripts/.env.setup and fill in the values
 *   3. npm run setup:appwrite
 *
 * The script is idempotent: it skips anything that already exists.
 */

import readline from 'node:readline/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Databases, Storage, Permission, Role } from 'node-appwrite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv(file) {
  const fullPath = path.resolve(__dirname, file)
  if (!existsSync(fullPath)) return
  for (const line of readFileSync(fullPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv('.env.setup')

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'skill_guide'
const DATABASE_NAME = process.env.APPWRITE_DATABASE_NAME || 'Skill_Guide'
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'resumes'
const BUCKET_NAME = process.env.APPWRITE_BUCKET_NAME || 'Resumes'

if (!PROJECT_ID || !API_KEY) {
  console.error(
    'Missing credentials. Create scripts/.env.setup from .env.setup.example with APPWRITE_PROJECT_ID and APPWRITE_API_KEY.',
  )
  process.exit(1)
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
const databases = new Databases(client)
const storage = new Storage(client)

// All authenticated users can create/read/update/delete their own-scoped documents.
const USER_SCOPE = [
  Permission.create(Role.users()),
  Permission.read(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
]

// Global catalogs are read-only for authenticated users.
const CATALOG_READ = [Permission.read(Role.users())]

const createdAt = { key: 'created_at', type: 'datetime', required: false }
const updatedAt = { key: 'updated_at', type: 'datetime', required: false }

const COLLECTIONS = [
  {
    id: 'profiles',
    name: 'Profiles',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'education_level', type: 'string', size: 100 },
      { key: 'degree', type: 'string', size: 200 },
      { key: 'branch', type: 'string', size: 200 },
      { key: 'study_year', type: 'integer' },
      { key: 'cgpa', type: 'float' },
      { key: 'career_goal', type: 'string', size: 1000 },
      { key: 'preferred_industry', type: 'string', size: 200 },
      { key: 'preferred_location', type: 'string', size: 200 },
      createdAt,
      updatedAt,
    ],
    indexes: [{ key: 'user_id_unique', type: 'unique', attributes: ['user_id'] }],
  },
  {
    id: 'skills',
    name: 'Skills',
    permissions: CATALOG_READ,
    attributes: [
      { key: 'name', type: 'string', size: 200, required: true },
      { key: 'category', type: 'string', size: 100 },
    ],
    indexes: [{ key: 'name_unique', type: 'unique', attributes: ['name'] }],
  },
  {
    id: 'user_skills',
    name: 'User Skills',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'skill_id', type: 'string', size: 100, required: true },
      { key: 'proficiency', type: 'integer', default: 0 },
      updatedAt,
    ],
    indexes: [
      { key: 'user_skill_unique', type: 'unique', attributes: ['user_id', 'skill_id'] },
    ],
  },
  {
    id: 'interests',
    name: 'Interests',
    permissions: CATALOG_READ,
    attributes: [{ key: 'name', type: 'string', size: 200, required: true }],
    indexes: [{ key: 'name_unique', type: 'unique', attributes: ['name'] }],
  },
  {
    id: 'user_interests',
    name: 'User Interests',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'interest_id', type: 'string', size: 100, required: true },
    ],
    indexes: [
      { key: 'user_interest_unique', type: 'unique', attributes: ['user_id', 'interest_id'] },
    ],
  },
  {
    id: 'careers',
    name: 'Careers',
    permissions: CATALOG_READ,
    attributes: [
      { key: 'name', type: 'string', size: 200, required: true },
      { key: 'category', type: 'string', size: 200 },
      { key: 'description', type: 'string', size: 10000 },
    ],
    indexes: [],
  },
  {
    id: 'career_skills',
    name: 'Career Skills',
    permissions: CATALOG_READ,
    attributes: [
      { key: 'career_id', type: 'string', size: 100, required: true },
      { key: 'skill_id', type: 'string', size: 100, required: true },
      { key: 'required_level', type: 'integer', default: 0 },
      { key: 'importance', type: 'integer', default: 1 },
    ],
    indexes: [{ key: 'career_idx', type: 'key', attributes: ['career_id'] }],
  },
  {
    id: 'assessments',
    name: 'Assessments',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 100, required: true },
      { key: 'score', type: 'float', default: 0 },
      { key: 'responses', type: 'string', size: 10000 },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'career_recommendations',
    name: 'Career Recommendations',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'career_id', type: 'string', size: 100, required: true },
      { key: 'match_score', type: 'float', default: 0 },
      { key: 'explanation', type: 'string', size: 10000 },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'roadmaps',
    name: 'Roadmaps',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'career_id', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'status', type: 'enum', elements: ['active', 'paused', 'completed'], default: 'active' },
      { key: 'progress_percent', type: 'integer', default: 0 },
      createdAt,
      updatedAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'roadmap_tasks',
    name: 'Roadmap Tasks',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'roadmap_id', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 300, required: true },
      { key: 'description', type: 'string', size: 5000 },
      { key: 'order_index', type: 'integer', default: 0 },
      { key: 'estimated_hours', type: 'integer', default: 0 },
      {
        key: 'status',
        type: 'enum',
        elements: ['pending', 'in_progress', 'paused', 'completed'],
        default: 'pending',
      },
      {
        key: 'completed_at',
        type: 'datetime',
        required: false,
      },
    ],
    indexes: [{ key: 'roadmap_idx', type: 'key', attributes: ['roadmap_id'] }],
  },
  {
    id: 'courses',
    name: 'Courses',
    permissions: CATALOG_READ,
    attributes: [
      { key: 'name', type: 'string', size: 300, required: true },
      { key: 'provider', type: 'string', size: 200 },
      { key: 'skill_id', type: 'string', size: 100 },
      { key: 'level', type: 'string', size: 100 },
      { key: 'duration_hours', type: 'integer', default: 0 },
      { key: 'url', type: 'string', size: 1000 },
      { key: 'cost', type: 'integer', default: 0 },
      { key: 'rating', type: 'float', default: 0 },
    ],
    indexes: [],
  },
  {
    id: 'user_courses',
    name: 'User Courses',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'course_id', type: 'string', size: 100, required: true },
      { key: 'status', type: 'enum', elements: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
      { key: 'progress', type: 'integer', default: 0 },
    ],
    indexes: [
      { key: 'user_course_unique', type: 'unique', attributes: ['user_id', 'course_id'] },
    ],
  },
  {
    id: 'internships',
    name: 'Internships',
    permissions: CATALOG_READ,
    attributes: [
      { key: 'title', type: 'string', size: 300, required: true },
      { key: 'company', type: 'string', size: 200 },
      { key: 'location', type: 'string', size: 200 },
      { key: 'description', type: 'string', size: 10000 },
      { key: 'url', type: 'string', size: 1000 },
    ],
    indexes: [],
  },
  {
    id: 'internship_recommendations',
    name: 'Internship Recommendations',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'internship_id', type: 'string', size: 100, required: true },
      { key: 'match_score', type: 'float', default: 0 },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'resume_analyses',
    name: 'Resume Analyses',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'appwrite_file_id', type: 'string', size: 100 },
      { key: 'file_name', type: 'string', size: 500 },
      { key: 'extracted_data', type: 'string', size: 10000 },
      { key: 'analysis_result', type: 'string', size: 10000 },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'github_analyses',
    name: 'GitHub Analyses',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'github_username', type: 'string', size: 100 },
      { key: 'analysis_result', type: 'string', size: 10000 },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    permissions: USER_SCOPE,
    attributes: [
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 300, required: true },
      { key: 'message', type: 'string', size: 5000 },
      { key: 'is_read', type: 'boolean', default: false },
      createdAt,
    ],
    indexes: [{ key: 'user_idx', type: 'key', attributes: ['user_id'] }],
  },
]

const INDEX_TYPES = { key: 'key', unique: 'unique', fulltext: 'fulltext' }

function isAlreadyExists(error) {
  const message = (error && (error.message || error.type)) || ''
  return (
    message.includes('already exists') ||
    message.includes('already taken') ||
    error?.code === 409 ||
    error?.type === 'database_collection_already_exists' ||
    error?.type === 'database_attribute_already_exists' ||
    error?.type === 'database_index_already_exists' ||
    error?.type === 'storage_bucket_already_exists' ||
    error?.type === 'database_already_exists'
  )
}

async function ensureAttribute(collectionId, attr) {
  const { type, key, size = 255, required = false, default: def, min, max, elements } = attr
  try {
    switch (type) {
      case 'string':
        await databases.createStringAttribute(DATABASE_ID, collectionId, key, size, required, def)
        break
      case 'integer':
        await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required, min, max, def)
        break
      case 'float':
        await databases.createFloatAttribute(DATABASE_ID, collectionId, key, required, min, max, def)
        break
      case 'boolean':
        await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required, def)
        break
      case 'datetime':
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, key, required, def)
        break
      case 'enum':
        await databases.createEnumAttribute(DATABASE_ID, collectionId, key, elements, required, def)
        break
      default:
        console.warn(`    unknown attribute type: ${type} ('${key}')`)
        return
    }
    console.log(`    + attribute ${key} (${type})`)
  } catch (error) {
    if (!isAlreadyExists(error)) throw error
    console.log(`    = attribute ${key} already exists`)
  }
}

async function ensureIndex(collectionId, index) {
  try {
    await databases.createIndex(
      DATABASE_ID,
      collectionId,
      index.key,
      INDEX_TYPES[index.type],
      index.attributes,
    )
    console.log(`    + index ${index.key} (${index.type})`)
  } catch (error) {
    if (!isAlreadyExists(error)) throw error
    console.log(`    = index ${index.key} already exists`)
  }
}

async function ensureCollection(collection) {
  try {
    await databases.createCollection(
      DATABASE_ID,
      collection.id,
      collection.name,
      collection.permissions,
    )
    console.log(`  + collection ${collection.id}`)
  } catch (error) {
    if (!isAlreadyExists(error)) throw error
    console.log(`  = collection ${collection.id} already exists`)
  }

  for (const attribute of collection.attributes) {
    await ensureAttribute(collection.id, attribute)
  }
  for (const index of collection.indexes || []) {
    await ensureIndex(collection.id, index)
  }
}

async function main() {
  console.log('Skill_Guide — Appwrite setup\n')
  console.log(`Endpoint:  ${ENDPOINT}`)
  console.log(`Project:   ${PROJECT_ID}`)
  console.log(`Database:  ${DATABASE_ID} (${DATABASE_NAME})\n`)

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    'This will create real resources in your Appwrite project. Continue? [y/N] ',
  )
  rl.close()

  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log('Aborted.')
    process.exit(0)
  }

  console.log('\n1) Database')
  try {
    await databases.create(DATABASE_ID, DATABASE_NAME)
    console.log(`  + database ${DATABASE_ID}`)
  } catch (error) {
    if (!isAlreadyExists(error)) throw error
    console.log(`  = database ${DATABASE_ID} already exists`)
  }

  console.log('\n2) Collections')
  for (const collection of COLLECTIONS) {
    await ensureCollection(collection)
  }

  console.log('\n3) Storage bucket')
  try {
    await storage.createBucket(
      BUCKET_ID,
      BUCKET_NAME,
      [Permission.read(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())],
      false,
      true,
      5 * 1024 * 1024,
      ['pdf', 'docx', 'doc'],
      'gzip',
      false,
      false,
      false,
    )
    console.log(`  + bucket ${BUCKET_ID}`)
  } catch (error) {
    if (!isAlreadyExists(error)) throw error
    console.log(`  = bucket ${BUCKET_ID} already exists`)
  }

  console.log('\nDone. Copy these into your .env:\n')
  console.log(`VITE_APPWRITE_ENDPOINT=${ENDPOINT}`)
  console.log(`VITE_APPWRITE_PROJECT_ID=${PROJECT_ID}`)
  console.log(`VITE_APPWRITE_DATABASE_ID=${DATABASE_ID}`)
  console.log(`VITE_APPWRITE_RESUME_BUCKET_ID=${BUCKET_ID}`)
}

main().catch((error) => {
  console.error('\nSetup failed:', error?.message || error)
  process.exit(1)
})