/**
 * Skill Guide— one-time Appwrite setup script.
 *
 * Creates:
 *   - all collections from docs/main_architecture.md §17
 *   - collection attributes + indexes
 *   - the resume storage bucket
 *
 * If your plan is at its database limit, the script reuses an existing
 * database instead of creating a new one.
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
    let value = trimmed.slice(eq + 1).replace(/\s+#.*$/, '').trim()
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
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'Skill Guide'
const DATABASE_NAME = process.env.APPWRITE_DATABASE_NAME || 'Skill Guide'
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'resumes'
const BUCKET_NAME = process.env.APPWRITE_BUCKET_NAME || 'Resumes'

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
      { key: 'subjects', type: 'string', size: 2000 },
      { key: 'academic_strengths', type: 'string', size: 2000 },
      { key: 'career_goal', type: 'string', size: 1000 },
      { key: 'preferred_industry', type: 'string', size: 200 },
      { key: 'preferred_role', type: 'string', size: 200 },
      { key: 'preferred_location', type: 'string', size: 200 },
      { key: 'work_preference', type: 'enum', elements: ['onsite', 'hybrid', 'remote'] },
      { key: 'experience_years', type: 'integer', default: 0 },
      { key: 'assessment_score', type: 'float', default: 0 },
      { key: 'onboarding_completed', type: 'boolean', default: false },
      { key: 'github_username', type: 'string', size: 100 },
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
      { key: 'responses', type: 'string', size: 8000 },
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
      { key: 'explanation', type: 'string', size: 8000 },
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
      { key: 'description', type: 'string', size: 4000 },
      { key: 'order_index', type: 'integer', default: 0 },
      { key: 'estimated_hours', type: 'integer', default: 0 },
      {
        key: 'status',
        type: 'enum',
        elements: ['pending', 'in_progress', 'paused', 'completed'],
        default: 'pending',
      },
      { key: 'completed_at', type: 'datetime' },
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
      { key: 'description', type: 'string', size: 6000 },
      { key: 'url', type: 'string', size: 1000 },
      { key: 'skills', type: 'string', size: 2000 },
      { key: 'eligibility', type: 'string', size: 500 },
      {
        key: 'status',
        type: 'enum',
        elements: ['pending', 'active', 'rejected'],
        default: 'active',
      },
      { key: 'source', type: 'string', size: 100 },
      { key: 'source_key', type: 'string', size: 200 },
      { key: 'expires_at', type: 'datetime' },
      { key: 'fetched_at', type: 'datetime' },
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
      { key: 'extracted_data', type: 'string', size: 2000 },
      { key: 'analysis_result', type: 'string', size: 6000 },
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
      { key: 'analysis_result', type: 'string', size: 8000 },
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

async function createAttribute(dbId, collectionId, attr) {
  const { type, key, size = 255, required = false, default: def, min, max, elements } = attr
  switch (type) {
    case 'string':
      await databases.createStringAttribute(dbId, collectionId, key, size, required, def)
      break
    case 'integer':
      await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, def)
      break
    case 'float':
      await databases.createFloatAttribute(dbId, collectionId, key, required, min, max, def)
      break
    case 'boolean':
      await databases.createBooleanAttribute(dbId, collectionId, key, required, def)
      break
    case 'datetime':
      await databases.createDatetimeAttribute(dbId, collectionId, key, required, def)
      break
    case 'enum':
      await databases.createEnumAttribute(dbId, collectionId, key, elements, required, def)
      break
    default:
      console.warn(`    unknown attribute type: ${type} ('${key}')`)
      return
  }
  console.log(`    + attribute ${key} (${type})`)
}

async function createIndex(dbId, collectionId, index) {
  await databases.createIndex(
    dbId,
    collectionId,
    index.key,
    INDEX_TYPES[index.type],
    index.attributes,
  )
  console.log(`    + index ${index.key} (${index.type})`)
}

async function ensureCollection(dbId, collection) {
  const existingAttributes = new Set()
  const existingIndexes = new Set()
  const createdKeys = []

  try {
    const info = await databases.getCollection(dbId, collection.id)
    ;(info.attributes || []).forEach((a) => existingAttributes.add(a.key))
    ;(info.indexes || []).forEach((i) => existingIndexes.add(i.key))
    console.log(`  = collection ${collection.id} already exists`)
  } catch {
    await databases.createCollection(dbId, collection.id, collection.name, collection.permissions)
    console.log(`  + collection ${collection.id}`)
  }

  for (const attribute of collection.attributes) {
    if (existingAttributes.has(attribute.key)) {
      console.log(`    = attribute ${attribute.key} already exists`)
      continue
    }
    await createAttribute(dbId, collection.id, attribute)
    createdKeys.push(attribute.key)
  }

  if (createdKeys.length > 0) {
    await waitForAttributes(dbId, collection.id, createdKeys)
  }

  for (const index of collection.indexes || []) {
    if (existingIndexes.has(index.key)) {
      console.log(`    = index ${index.key} already exists`)
      continue
    }
    await createIndex(dbId, collection.id, index)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForAttributes(dbId, collectionId, keys, timeoutMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const info = await databases.getCollection(dbId, collectionId)
    const attributes = info.attributes || []
    const allAvailable = keys.every((key) => {
      const attribute = attributes.find((a) => a.key === key)
      return attribute && attribute.status === 'available'
    })
    if (allAvailable) return
    await sleep(800)
  }
  throw new Error(
    `Timed out waiting for attributes to become available in collection ${collectionId}: ${keys.join(', ')}`,
  )
}

async function resolveDatabase(rl) {
  console.log('\n1) Database')

  try {
    await databases.get(DATABASE_ID)
    console.log(`  = using existing database ${DATABASE_ID}`)
    return DATABASE_ID
  } catch {
    // not found — try to find an existing database to reuse
  }

  const { databases: existing } = await databases.list()
  const FLAG_YES = process.argv.includes('--yes')
  const DB_INDEX = process.env.APPWRITE_SETUP_DB_INDEX

  if (existing.length > 0) {
    let index

    if (FLAG_YES) {
      index = DB_INDEX !== undefined ? Number.parseInt(DB_INDEX, 10) : 0
    } else {
      console.log(
        `  The requested database ${DATABASE_ID} was not found, and the plan is at its database limit.`,
      )
      console.log('  Available databases:')
      existing.forEach((db, i) => console.log(`    [${i}] ${db.$id} — ${db.name}`))

      const choice = await rl.question(
        `  Which database should hold the Skill Guidecollections? [0-${existing.length - 1}] `,
      )
      index = Number.parseInt(choice, 10)
    }

    if (Number.isNaN(index) || index < 0 || index >= existing.length) {
      throw new Error(
        'Invalid database choice. Re-run the script and choose a valid database, or change APPWRITE_DATABASE_ID in scripts/.env.setup.',
      )
    }
    console.log(`  = reusing database ${existing[index].$id}`)
    return existing[index].$id
  }

  try {
    await databases.create(DATABASE_ID, DATABASE_NAME)
    console.log(`  + created database ${DATABASE_ID}`)
    return DATABASE_ID
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`  = using existing database ${DATABASE_ID}`)
      return DATABASE_ID
    }
    throw new Error(
      `Could not create a database (${error.message}). Create one manually in the Appwrite console and set APPWRITE_DATABASE_ID in scripts/.env.setup.`,
    )
  }
}

async function main() {
  console.log('Skill Guide— Appwrite setup\n')
  console.log(`Endpoint:  ${ENDPOINT}`)
  console.log(`Project:   ${PROJECT_ID}`)

  const FLAG_YES = process.argv.includes('--yes')

  let confirmed = FLAG_YES
  let rl = null

  if (!FLAG_YES) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question(
      'This will create real resources in your Appwrite project. Continue? [y/N] ',
    )
    confirmed = /^y(es)?$/i.test(answer.trim())
    if (!confirmed) {
      rl.close()
    }
  }

  if (!confirmed) {
    console.log('Aborted.')
    return
  }

  const dbId = await resolveDatabase(rl)

  console.log('\n2) Collections')
  for (const collection of COLLECTIONS) {
    await ensureCollection(dbId, collection)
  }

  console.log('\n3) Storage bucket')
  let resolvedBucketId = BUCKET_ID
  try {
    const { buckets } = await storage.listBuckets()
    if (buckets.length > 0) {
      console.log(`  = reusing existing bucket ${buckets[0].$id} — ${buckets[0].name}`)
      resolvedBucketId = buckets[0].$id
    } else {
      await storage.createBucket(
        BUCKET_ID,
        BUCKET_NAME,
        [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
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
    }
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`  = bucket ${BUCKET_ID} already exists`)
    } else {
      throw error
    }
  }

  console.log('\nDone. Copy these into your .env:\n')
  console.log(`VITE_APPWRITE_ENDPOINT=${ENDPOINT}`)
  console.log(`VITE_APPWRITE_PROJECT_ID=${PROJECT_ID}`)
  console.log(`VITE_APPWRITE_DATABASE_ID=${dbId}`)
  console.log(`VITE_APPWRITE_RESUME_BUCKET_ID=${resolvedBucketId}`)

  rl?.close()
}

if (!PROJECT_ID || !API_KEY) {
  console.error(
    'Missing credentials. Create scripts/.env.setup from .env.setup.example with APPWRITE_PROJECT_ID and APPWRITE_API_KEY.',
  )
  process.exitCode = 1
} else {
  main().catch((error) => {
    console.error('\nSetup failed:', error?.message || error)
    process.exitCode = 1
  })
}