/**
 * SkillSaarthi — Appwrite security migration.
 *
 * Upgrades an EXISTING Appwrite project to the hardened permission model used
 * by scripts/setup-appwrite.mjs:
 *
 *   1. Backfills per-document permissions on user-scoped collections.
 *   2. Enables documentSecurity on those collections and reduces collection
 *      permissions to "authenticated users may create".
 *   3. Removes all client access from server-only token collections.
 *   4. Backfills per-file permissions and enables fileSecurity on the bucket
 *      (resume files = owner only, avatars = any signed-in user).
 *
 * Safety:
 *   - Runs as a DRY RUN by default. Nothing is changed unless you pass --apply.
 *   - Idempotent: safe to run more than once.
 *   - Each document/file is updated independently; failures are logged and the
 *     run continues.
 *
 * Usage:
 *   1. Fill in scripts/.env.setup (APPWRITE_* values).
 *   2. node scripts/migrate-appwrite-security.mjs          (dry run — review output)
 *   3. node scripts/migrate-appwrite-security.mjs --apply  (perform the changes)
 *
 * IMPORTANT: test on a staging copy of the project first.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Databases, Permission, Query, Role, Storage, Users } from 'node-appwrite'

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
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'resumes'

const APPLY = process.argv.includes('--apply')

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
const databases = new Databases(client)
const storage = new Storage(client)
const users = new Users(client)

// ---- Permission helpers -----------------------------------------------------

const ownerPerms = (userId) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

const communityReadPerms = (userId) => [
  Permission.read(Role.users()),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

const CREATE_ONLY = [Permission.create(Role.users())]
const CATALOG_READ = [Permission.read(Role.users())]
const SERVER_ONLY = []

// Collections whose documents belong to a single user (private by default).
// `community: true` marks collections that should be readable by every
// signed-in user.
const COLLECTIONS = [
  { id: 'profiles', userField: 'user_id' },
  { id: 'user_skills', userField: 'user_id' },
  { id: 'user_interests', userField: 'user_id' },
  { id: 'assessments', userField: 'user_id' },
  { id: 'career_recommendations', userField: 'user_id' },
  { id: 'roadmaps', userField: 'user_id' },
  { id: 'roadmap_tasks', userField: null }, // resolved via parent roadmap (server-read only)
  { id: 'user_courses', userField: 'user_id' },
  { id: 'internship_recommendations', userField: 'user_id' },
  { id: 'resume_analyses', userField: 'user_id' },
  { id: 'github_analyses', userField: 'user_id' },
  { id: 'notifications', userField: 'user_id' },
  { id: 'community_profiles', userField: 'user_id', community: true },
  { id: 'community_posts', userField: 'user_id', community: true },
  { id: 'community_comments', userField: 'user_id', community: true },
  { id: 'post_likes', userField: 'user_id' },
  { id: 'post_bookmarks', userField: 'user_id' },
]

const SERVER_ONLY_COLLECTIONS = [
  'email_verification_tokens',
  'password_reset_tokens',
  'pending_registrations',
]

const CATALOG_COLLECTIONS = ['skills', 'interests', 'careers', 'career_skills', 'courses', 'internships']

function log(...args) {
  console.log(...args)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function listAll(collectionId, queries = []) {
  const docs = []
  let offset = 0
  for (;;) {
    const page = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.limit(100),
      Query.offset(offset),
      ...queries,
    ])
    docs.push(...page.documents)
    if (page.documents.length < 100) break
    offset += 100
  }
  return docs
}

async function backfillCollectionDocs(collection) {
  let docs
  try {
    docs = await listAll(collection.id)
  } catch (error) {
    log(`  ! ${collection.id}: could not list documents (${error.message}) — skipped`)
    return
  }

  if (collection.userField == null) {
    log(`  ~ ${collection.id}: ${docs.length} docs — no direct owner field, left to server-side reads`)
    return
  }

  log(`  → ${collection.id}: ${docs.length} documents`)
  let updated = 0
  let skipped = 0

  for (const doc of docs) {
    const userId = doc[collection.userField]
    if (!userId) {
      skipped += 1
      continue
    }
    const permissions = collection.community ? communityReadPerms(userId) : ownerPerms(userId)
    if (!APPLY) {
      updated += 1
      continue
    }
    try {
      await databases.updateDocument(DATABASE_ID, collection.id, doc.$id, {}, permissions)
      updated += 1
    } catch (error) {
      log(`    ! ${collection.id}/${doc.$id} failed: ${error.message}`)
    }
    await sleep(20)
  }

  log(`    ${APPLY ? 'updated' : 'would update'} ${updated}${skipped ? `, skipped ${skipped} (no owner)` : ''}`)
}

async function updateCollectionSecurity(id, permissions, documentSecurity) {
  try {
    const info = await databases.getCollection(DATABASE_ID, id)
    if (!APPLY) {
      log(`  ~ ${id}: would set documentSecurity=${documentSecurity}`)
      return
    }
    await databases.updateCollection(
      DATABASE_ID,
      id,
      info.name,
      permissions,
      documentSecurity,
      info.enabled ?? true,
    )
    log(`  ✓ ${id}: documentSecurity=${documentSecurity}`)
  } catch (error) {
    log(`  ! ${id}: update failed (${error.message})`)
  }
}

async function backfillStorage(userIdToFileIds, resumeFileIds) {
  log(`  → avatars: ${userIdToFileIds.size} candidate files`)
  for (const [fileId, userId] of userIdToFileIds) {
    if (!APPLY) continue
    try {
      const file = await storage.getFile(BUCKET_ID, fileId)
      await storage.updateFile(BUCKET_ID, fileId, file.name, communityReadPerms(userId))
    } catch (error) {
      log(`    ! avatar ${fileId} failed: ${error.message}`)
    }
    await sleep(20)
  }

  log(`  → resume files: ${resumeFileIds.size} candidate files`)
  for (const [fileId, userId] of resumeFileIds) {
    if (!APPLY) continue
    try {
      const file = await storage.getFile(BUCKET_ID, fileId)
      await storage.updateFile(BUCKET_ID, fileId, file.name, ownerPerms(userId))
    } catch (error) {
      log(`    ! resume ${fileId} failed: ${error.message}`)
    }
    await sleep(20)
  }
}

async function main() {
  log(`\nSkillSaarthi — Appwrite security migration (${APPLY ? 'APPLY' : 'DRY RUN'})\n`)
  log(`Endpoint: ${ENDPOINT}`)
  log(`Project:  ${PROJECT_ID}`)
  log(`Database: ${DATABASE_ID}\n`)

  if (!APPLY) {
    log('Nothing will be changed. Re-run with --apply to perform the migration.\n')
  }

  log('1) Backfilling document permissions')
  for (const collection of COLLECTIONS) {
    await backfillCollectionDocs(collection)
  }

  log('\n2) Enabling document security')
  for (const collection of COLLECTIONS) {
    await updateCollectionSecurity(collection.id, CREATE_ONLY, true)
  }
  for (const id of SERVER_ONLY_COLLECTIONS) {
    await updateCollectionSecurity(id, SERVER_ONLY, true)
  }
  for (const id of CATALOG_COLLECTIONS) {
    await updateCollectionSecurity(id, CATALOG_READ, false)
  }

  log('\n3) Storage file permissions')
  const avatarFiles = new Map()
  try {
    let offset = 0
    for (;;) {
      const page = await users.list([Query.limit(100), Query.offset(offset)])
      for (const user of page.users) {
        const fileId = user.prefs?.avatar_file_id
        if (fileId) avatarFiles.set(fileId, user.$id)
      }
      if (page.users.length < 100) break
      offset += 100
    }
  } catch (error) {
    log(`  ! could not list users (${error.message})`)
  }

  const resumeFiles = new Map()
  try {
    const docs = await listAll('resume_analyses')
    for (const doc of docs) {
      for (const field of ['appwrite_file_id', 'data_file_id', 'pdf_file_id']) {
        if (doc[field] && doc.user_id) resumeFiles.set(doc[field], doc.user_id)
      }
    }
  } catch (error) {
    log(`  ! could not list resume_analyses (${error.message})`)
  }

  await backfillStorage(avatarFiles, resumeFiles)

  if (APPLY) {
    try {
      const bucket = await storage.getBucket(BUCKET_ID)
      await storage.updateBucket(
        BUCKET_ID,
        bucket.name,
        CREATE_ONLY,
        true,
        bucket.enabled,
        bucket.maximumFileSize,
        bucket.allowedFileExtensions,
        bucket.compression,
        bucket.encryption,
        bucket.antivirus,
        bucket.transformations,
      )
      log(`  ✓ bucket ${BUCKET_ID}: fileSecurity=true`)
    } catch (error) {
      log(`  ! bucket ${BUCKET_ID} update failed: ${error.message}`)
    }
  } else {
    log(`  ~ bucket ${BUCKET_ID}: would set fileSecurity=true`)
  }

  log(`\n${APPLY ? 'Migration complete.' : 'Dry run complete. Re-run with --apply to apply.'}\n`)
}

if (!PROJECT_ID || !API_KEY) {
  console.error(
    'Missing credentials. Create scripts/.env.setup from .env.setup.example with APPWRITE_PROJECT_ID and APPWRITE_API_KEY.',
  )
  process.exitCode = 1
} else {
  main().catch((error) => {
    console.error('\nMigration failed:', error?.message || error)
    process.exitCode = 1
  })
}
