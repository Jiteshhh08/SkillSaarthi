/**
 * Skill Guide — internship importer (cron / scheduler).
 *
 * Pulls internship openings from a configured source and upserts them into the
 * `internships` collection:
 *   - New openings are created with `status: "pending"` (awaiting admin approval).
 *   - Existing docs are refreshed in place and keep their current status.
 *   - Dedup is by `source_key` (e.g. `file:<title>:<company>`).
 *   - `expires_at` defaults to now + N days so stale listings drop out of the
 *     public catalog automatically.
 *
 * Sources (switch via SOURCE= or --source):
 *   file     (default) — read a JSON feed from FEED_FILE
 *                       (scripts/feeds/internships.json unless overridden).
 *   remotive           — the free Remotive remote-jobs API, search "intern".
 *
 * Usage (run on a schedule via cron / Task Scheduler / GitHub Actions):
 *   node scripts/import-internships.mjs                (default: file feed)
 *   node scripts/import-internships.mjs --source remotive
 *   node scripts/import-internships.mjs --dry-run      (fetch + report, no writes)
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Databases, ID, Permission, Query, Role } from 'node-appwrite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv(file) {
  const fullPath = path.resolve(__dirname, file)
  if (!existsSync(fullPath)) return
  for (const line of readFileSync(fullPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    process.env[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
  }
}

loadEnv('.env.setup')
loadEnv('../.env')

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY

const DEFAULT_TTL_DAYS = Number(process.env.INTERNSHIP_TTL_DAYS) || 30
const MAX_OPENINGS = Number(process.env.IMPORT_MAX) || 50

let databases = null

async function resolveDatabase() {
  const { databases: all } = await databases.list()
  for (const db of all) {
    try {
      const { collections } = await databases.listCollections(db.$id)
      if (collections.some((c) => c.$id === 'internships')) {
        return db.$id
      }
    } catch {
      // keep scanning
    }
  }
  throw new Error('Could not find the database holding the internships collection.')
}

// --- Sources ---------------------------------------------------------------
// Feed adapters. Each returns an array of { title, company, location,
// description, url, skills }. `SOURCE` picks the adapter:
//   file     (default) read a JSON feed from FEED_FILE (array of openings)
//   remotive  fetch the free Remotive remote-jobs API (may return 0 intern roles)

const DEFAULT_FEED = path.resolve(__dirname, 'feeds', 'internships.json')

async function fetchRemotive() {
  const searches = ['intern', 'internship', 'graduate']
  const seen = new Map()
  for (const term of searches) {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(term)}&limit=${MAX_OPENINGS}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    let response
    try {
      response = await fetch(url, { signal: controller.signal })
    } catch {
      clearTimeout(timer)
      throw new Error(`Remotive request failed: ${url}`)
    }
    clearTimeout(timer)
    if (!response.ok) {
      throw new Error(`Remotive returned HTTP ${response.status}`)
    }
    const body = await response.json()
    for (const job of body.jobs || []) {
      const title = String(job.title || '').toLowerCase()
      const titleMatch = /\b(intern|trainee|apprentice|graduate)\b/.test(title.replace(/[^a-z0-9 ]/g, ' '))
      const tagMatch = Array.isArray(job.tags)
        ? job.tags.some((tag) => /intern|trainee|entry/i.test(String(tag)))
        : false
      if (titleMatch || tagMatch) {
        seen.set(job.id || job.url, job)
      }
    }
  }
  return Array.from(seen.values())
    .slice(0, MAX_OPENINGS)
    .map((job) => ({
      title: String(job.title || '').slice(0, 300),
      company: String(job.company_name || 'Unknown').slice(0, 200),
      location: String(job.candidate_remote_location || job.location || 'Remote')
        .slice(0, 200),
      description: String(job.description || '').replace(/\s+/g, ' ').slice(0, 6000),
      url: String(job.url || '').slice(0, 1000),
      skills: Array.isArray(job.tags) ? job.tags.filter(Boolean).slice(0, 8) : [],
    }))
}

function loadFileFeed(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Feed file not found: ${filePath}`)
  }
  const entries = JSON.parse(readFileSync(filePath, 'utf8'))
  if (!Array.isArray(entries)) {
    throw new Error(`Feed file must contain a JSON array: ${filePath}`)
  }
  return entries.map((entry) => ({
    title: String(entry.title || '').slice(0, 300),
    company: String(entry.company || 'Unknown').slice(0, 200),
    location: String(entry.location || 'Remote').slice(0, 200),
    description: String(entry.description || '').slice(0, 6000),
    url: String(entry.url || '').slice(0, 1000),
    skills: Array.isArray(entry.skills) ? entry.skills.filter(Boolean).slice(0, 8) : [],
  }))
}

async function getSource() {
  const sourceName = (process.env.SOURCE || 'file').toLowerCase()
  if (sourceName === 'file') {
    return loadFileFeed(process.env.FEED_FILE || DEFAULT_FEED).slice(0, MAX_OPENINGS)
  }
  if (sourceName === 'remotive') {
    return (await fetchRemotive()).slice(0, MAX_OPENINGS)
  }
  throw new Error(`Unknown source "${sourceName}". Supported: file, remotive.`)
}

// --- Importer --------------------------------------------------------------

async function main() {
  if (!PROJECT_ID || !API_KEY) {
    console.error('Missing credentials. Add APPWRITE_PROJECT_ID + APPWRITE_API_KEY to scripts/.env.setup.')
    process.exitCode = 1
    return
  }

  const dryRun = process.argv.includes('--dry-run')
  const sourceFlag = process.argv.indexOf('--source')
  if (sourceFlag !== -1 && process.argv[sourceFlag + 1]) {
    process.env.SOURCE = process.argv[sourceFlag + 1]
  }

  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
  databases = new Databases(client)

  const dbId = await resolveDatabase()
  const sourceName = (process.env.SOURCE || 'file').toLowerCase()
  console.log(`Skill Guide — internship importer`)
  console.log(`Source: ${sourceName} | dry-run: ${dryRun} | DB: ${dbId}`)

  const openings = await getSource()
  console.log(`Fetched ${openings.length} opening(s).`)
  if (openings.length === 0) {
    console.warn(
      `No openings from source "${sourceName}". If this is unexpected, check ` +
        (sourceName === 'file' ? 'FEED_FILE' : 'the Remotive feed') +
        ' and re-run.',
    )
  }

  const expiry = new Date(Date.now() + DEFAULT_TTL_DAYS * 86400000).toISOString()
  const now = new Date().toISOString()

  let created = 0
  let updated = 0

  for (const opening of openings) {
    if (!opening.title) continue
    const sourceKey = `${sourceName}:${opening.title.toLowerCase()}:${opening.company.toLowerCase()}`
    const payload = {
      ...opening,
      skills: JSON.stringify(opening.skills || []),
      source: sourceName,
      source_key: sourceKey,
      expires_at: expiry,
      fetched_at: now,
    }

    let existing = null
    try {
      const { documents } = await databases.listDocuments(dbId, 'internships', [
        Query.equal('source_key', sourceKey),
        Query.limit(1),
      ])
      existing = documents[0] || null
    } catch {
      existing = null
    }

    if (existing) {
      if (dryRun) continue
      await databases.updateDocument(dbId, 'internships', existing.$id, payload)
      updated += 1
    } else {
      if (dryRun) continue
      await databases.createDocument(
        dbId,
        'internships',
        ID.unique(),
        { ...payload, status: 'pending' },
        [Permission.read(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())],
      )
      created += 1
    }
  }

  console.log(`Done. Created ${created} new (pending), refreshed ${updated} existing.`)

  if (dryRun) {
    console.log('Dry-run: no documents changed.')
  }
}

main().catch((error) => {
  console.error('Import failed:', error?.message || error)
  process.exitCode = 1
})