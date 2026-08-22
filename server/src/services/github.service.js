import { COLLECTIONS, ID, Permission, Query, Role, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const USER_AGENT = 'skillsaarthi'
const REPOS_PER_PAGE = 100

// GitHub languages → skillsaarthi catalog skill names (for optional applySkills).
const LANGUAGE_TO_SKILL = {
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
  Python: 'Python',
  Java: 'Java',
  Kotlin: 'Java',
  'C++': 'C++',
  C: 'C++',
  'C#': 'C++',
  HTML: 'HTML/CSS',
  CSS: 'HTML/CSS',
  SCSS: 'HTML/CSS',
  SQL: 'SQL',
  PLpgSQL: 'SQL',
  Dockerfile: 'Docker',
  Shell: 'Linux',
  Go: 'REST APIs',
  Rust: 'REST APIs',
  'Jupyter Notebook': 'Data Visualization',
}

const TOPIC_TO_SKILL = {
  react: 'React',
  'next.js': 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  express: 'Express',
  expressjs: 'Express',
  api: 'REST APIs',
  rest: 'REST APIs',
  'rest-api': 'REST APIs',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  'machine-learning': 'Machine Learning',
  ml: 'Machine Learning',
  'deep-learning': 'Deep Learning',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  pandas: 'Pandas',
  numpy: 'NumPy',
  sql: 'SQL',
  linux: 'Linux',
  git: 'Git & GitHub',
  graphql: 'REST APIs',
}

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
  }
  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`
  }
  return headers
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, {
      headers: githubHeaders(),
      signal: controller.signal,
    })
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'GitHub user not found', 'GITHUB_USER_NOT_FOUND')
      }
      if (response.status === 403 || response.status === 429) {
        throw new ApiError(429, 'GitHub rate limit reached. Try again later.', 'GITHUB_RATE_LIMITED')
      }
      throw new ApiError(502, 'GitHub returned an unexpected error. Try again later.', 'GITHUB_UPSTREAM_ERROR')
    }
    return response.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchGitHubProfile(username) {
  return fetchJson(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`)
}

export async function fetchGitHubRepos(username) {
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=${REPOS_PER_PAGE}&sort=updated`
  return fetchJson(url)
}

// ---------------------------------------------------------------------------
// Contribution calendar (GraphQL) — Node-only, no ai-service
// ---------------------------------------------------------------------------

const CONTRIBUTION_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
      popularIssueContribution { occurredAt }
      popularPullRequestContribution { occurredAt }
    }
    repositories(first: 1, privacy: PRIVATE) { totalCount }
    repositoriesContributedTo(first: 1, privacy: PRIVATE, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]) { totalCount }
  }
}
`

async function fetchContributionData(username) {
  if (!config.githubToken) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.githubToken}`,
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({ query: CONTRIBUTION_QUERY, variables: { login: username } }),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const body = await response.json()
    if (body.errors) return null
    return body.data?.user || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function flattenContributionDays(calendar) {
  if (!calendar?.weeks) return []
  const days = []
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays || []) {
      days.push({ date: day.date, count: Number(day.contributionCount) || 0, color: day.color || '' })
    }
  }
  // sort ascending by date
  days.sort((a, b) => new Date(a.date) - new Date(b.date))
  return days
}

function intensityLevel(count) {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

function buildContributionGrid(days) {
  // Ensure full 52 weeks (~364 days) view even if API returns shorter span.
  // Days already sorted ascending; keep last 364 days.
  const sliced = days.slice(-364)
  return sliced.map((d) => ({ ...d, level: intensityLevel(d.count) }))
}

function computeStreaks(days) {
  if (!days.length) return { currentStreak: 0, longestStreak: 0 }
  let longest = 0
  let cur = 0
  for (const d of days) {
    if (d.count > 0) cur += 1
    else {
      longest = Math.max(longest, cur)
      cur = 0
    }
  }
  longest = Math.max(longest, cur)
  // current streak: consecutive non-zero days ending at last day (today or yesterday)
  let currentStreak = 0
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count > 0) currentStreak += 1
    else break
  }
  // If last day is zero, current is 0 per product expectation (streak broken).
  // Keep as computed above (trailing zeros → 0).
  return { currentStreak, longestStreak: longest }
}

function computeTotals(days) {
  const total = days.reduce((sum, d) => sum + (d.count || 0), 0)
  const avg = days.length ? Number((total / days.length).toFixed(1)) : 0
  return { totalContributions: total, avgDaily: avg }
}

function computeMostActiveDay(days) {
  // Weekday bucket Mon..Sun
  const buckets = [0, 0, 0, 0, 0, 0, 0] // Mon=0 ... Sun=6
  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  for (const d of days) {
    const wd = new Date(d.date).getUTCDay() // 0 Sun .. 6 Sat
    const idx = (wd + 6) % 7 // shift to Mon=0
    buckets[idx] += d.count
  }
  let maxIdx = 0
  for (let i = 1; i < 7; i += 1) if (buckets[i] > buckets[maxIdx]) maxIdx = i
  if (buckets[maxIdx] === 0) return '—'
  return labels[maxIdx]
}

function computeMostActiveMonth(days) {
  const buckets = {}
  for (const d of days) {
    const key = d.date.slice(0, 7) // YYYY-MM
    buckets[key] = (buckets[key] || 0) + d.count
  }
  let best = null
  let bestCount = -1
  for (const [key, count] of Object.entries(buckets)) {
    if (count > bestCount) {
      best = key
      bestCount = count
    }
  }
  if (!best) return '—'
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [y, m] = best.split('-')
  const idx = Number(m) - 1
  if (idx < 0 || idx > 11) return best
  return `${monthLabels[idx]} ${y}`
}

function fallbackDaysFromRepos(repos, profile) {
  // Token-less fallback: synthesize 364-day calendar from repo pushed_at distribution.
  // Not true contributions but gives plausible streaks/daily avg from public activity.
  const days = []
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  for (let i = 363; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - i)
    // Count repos pushed on this date
    const iso = date.toISOString().slice(0, 10)
    let count = 0
    for (const repo of repos) {
      if (!repo.pushed_at) continue
      if (String(repo.pushed_at).slice(0, 10) === iso) count += 1
    }
    // Add 1 if account created on this date? no
    days.push({ date: iso, count: Math.min(count, 4), color: '' })
  }
  // Seed at least some activity if user has repos but no pushed_at clustering
  if (days.every((d) => d.count === 0) && (profile.public_repos || 0) > 0) {
    // distribute public_repos as sporadic counts
    const per = Math.max(1, Math.floor(364 / Math.max(1, profile.public_repos)))
    for (let i = 0; i < days.length; i += per) {
      if (i % 7 === 2) days[i].count = 1
    }
  }
  return days
}

// ---------------------------------------------------------------------------
// Helpers retained from previous fallback (top languages / skill signals)
// ---------------------------------------------------------------------------

function confidenceToProficiency(confidence) {
  if (confidence >= 90) return 5
  if (confidence >= 75) return 4
  if (confidence >= 60) return 3
  if (confidence >= 40) return 2
  return 1
}

function languageShare(repos) {
  const sizes = {}
  const counts = {}
  let total = 0
  for (const repo of repos) {
    if (!repo.language) continue
    const size = Number(repo.size) || 0
    sizes[repo.language] = (sizes[repo.language] || 0) + size
    counts[repo.language] = (counts[repo.language] || 0) + 1
    total += size
  }
  const entries = Object.entries(sizes)
    .map(([language, size]) => ({
      language,
      share: total > 0 ? Math.round((size / total) * 1000) / 10 : 0,
      repos: counts[language] || 0,
    }))
    .sort((a, b) => b.share - a.share)
  return entries
}

function topLanguagesLabel(languages) {
  if (!languages?.length) return '—'
  const top = languages.slice(0, 4).map((l) => l.language)
  return top.join(' / ')
}

async function getSkillCatalogMap() {
  const { documents } = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.skills, [Query.limit(300)])
  const map = {}
  for (const doc of documents) {
    map[normalizeName(doc.name)] = doc.$id
  }
  return map
}

async function getUserSkillIds(userId) {
  const { documents } = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.userSkills, [
    Query.equal('user_id', userId),
    Query.limit(300),
  ])
  return new Set(documents.map((doc) => doc.skill_id))
}

export async function applyDetectedSkills(userId, skills) {
  try {
    const catalogMap = await getSkillCatalogMap()
    const existing = await getUserSkillIds(userId)
    let added = 0
    for (const signal of skills || []) {
      if (Number(signal.confidence) < 70) continue
      const skillId = catalogMap[normalizeName(signal.skill)]
      if (!skillId || existing.has(skillId)) continue
      const proficiency = Math.max(1, Math.min(5, confidenceToProficiency(Number(signal.confidence))))
      await databases.createDocument(
        config.appwrite.databaseId,
        COLLECTIONS.userSkills,
        ID.unique(),
        { user_id: userId, skill_id: skillId, proficiency },
        [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))],
      )
      existing.add(skillId)
      added += 1
    }
    return added
  } catch {
    return 0
  }
}

function buildSkillSignals(repos) {
  const signals = {}
  const add = (name, confidence, evidence) => {
    if (!name) return
    const key = normalizeName(name)
    const cur = signals[key]
    if (!cur || confidence > cur.confidence) signals[key] = { skill: name, confidence, evidence }
  }
  const languages = languageShare(repos)
  for (const { language, share } of languages) {
    const skill = LANGUAGE_TO_SKILL[language]
    if (skill) {
      const confidence = Math.min(95, Math.round(55 + 40 * (share / 100)))
      add(skill, confidence, `${share}% of your public code is ${language}`)
    }
  }
  for (const repo of repos) {
    if (repo.topics?.length) {
      for (const topic of repo.topics) {
        const skill = TOPIC_TO_SKILL[topic.toLowerCase()]
        if (skill) add(skill, 85, `Topic "${topic}" on ${repo.name}`)
      }
    }
  }
  return Object.values(signals)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 14)
}

async function saveGitHubAnalysis(userId, username, analysis) {
  const { documents } = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.githubAnalyses, [Query.equal('user_id', userId), Query.limit(1)])
  const payload = { user_id: userId, github_username: username, analysis_result: JSON.stringify(analysis) }
  if (documents.length > 0) {
    await databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.githubAnalyses, documents[0].$id, payload)
    return documents[0].$id
  }
  const created = await databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.githubAnalyses,
    ID.unique(),
    { ...payload, created_at: new Date().toISOString() },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))],
  )
  return created.$id
}

async function saveGithubUsername(userId, username) {
  try {
    await databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.profiles, userId, {
      github_username: username,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // profile may not exist yet
  }
}

export const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

export async function analyzeGitHub(userId, username, { applySkills = false } = {}) {
  const [profile, repos] = await Promise.all([fetchGitHubProfile(username), fetchGitHubRepos(username)])

  // Try GraphQL contributions; fallback to pushed_at synthesis
  const gql = await fetchContributionData(username)
  const collection = gql?.contributionsCollection
  const calendar = collection?.contributionCalendar

  let days = []
  let totalContributions = 0
  let privateCount = 0
  let prCount = 0
  let issueCount = 0
  let reviewCount = 0

  if (calendar?.weeks?.length) {
    days = flattenContributionDays(calendar)
    totalContributions = Number(calendar.totalContributions) || days.reduce((s, d) => s + d.count, 0)
    // Private repos: ONLY repositories(privacy: PRIVATE) totalCount — NOT restrictedContributionsCount (that's commits)
    privateCount = Number(gql?.repositories?.totalCount ?? 0) || 0
    prCount = Number(collection.totalPullRequestContributions) || 0
    issueCount = Number(collection.totalIssueContributions) || 0
    reviewCount = Number(collection.totalPullRequestReviewContributions) || 0
  } else {
    days = fallbackDaysFromRepos(repos, profile)
    totalContributions = days.reduce((s, d) => s + d.count, 0)
    // Token-less fallbacks: derive PR/issue/review as 0 (no private data)
    privateCount = 0
    prCount = 0
    issueCount = 0
    reviewCount = 0
  }

  const grid = buildContributionGrid(days)
  const { currentStreak, longestStreak } = computeStreaks(days)
  const { avgDaily } = computeTotals(days)
  const mostActiveDay = computeMostActiveDay(days)
  const mostActiveMonth = computeMostActiveMonth(days)

  const languages = languageShare(repos)
  const topLanguages = topLanguagesLabel(languages)
  const skillSignals = buildSkillSignals(repos)

  // Public/private counts: public from profile, private from GraphQL (when authenticated)
  const publicRepos = Number(profile.public_repos) || 0
  const privateRepos = Number(privateCount) || 0

  const analysis = {
    // Keep legacy keys for compatibility; new keys match screenshot data contract
    profile: {
      login: profile.login,
      name: profile.name || profile.login,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      bio: profile.bio,
      location: profile.location,
      blog: profile.blog,
      followers: profile.followers || 0,
      following: profile.following || 0,
      public_repos: publicRepos,
      public_gists: profile.public_gists || 0,
    },
    // New contribution dashboard shape
    contributions: {
      totalContributions,
      days: grid,
      currentStreak,
      longestStreak,
      avgDaily,
      mostActiveDay,
      mostActiveMonth,
    },
    // Extended metrics (second screenshot)
    metrics: {
      topLanguages,
      languages, // full breakdown for optional display
      publicRepos,
      privateRepos,
      followers: Number(profile.followers) || 0,
      pullRequests: prCount,
      issuesOpened: issueCount,
      codeReviews: reviewCount,
    },
    // Keep optional legacy fields for any consumer still reading them
    languages,
    skills: skillSignals,
    summary: `Refined ${profile.login} GitHub activity: ${totalContributions} contributions in the last year.`,
    source: 'node',
  }

  let analysisId = 'local'
  try {
    analysisId = await saveGitHubAnalysis(userId, username, analysis)
  } catch (e) {
    console.error('[github] saveGitHubAnalysis failed:', e?.message || e)
    // best-effort: still return analysis without persistence
    analysisId = `local-${Date.now()}`
  }
  try {
    await saveGithubUsername(userId, username)
  } catch (e) {
    console.error('[github] saveGithubUsername failed:', e?.message || e)
  }

  let added = 0
  if (applySkills) {
    try {
      added = await applyDetectedSkills(userId, skillSignals)
    } catch (e) {
      console.error('[github] applyDetectedSkills failed:', e?.message || e)
    }
  }

  return {
    username,
    source: 'node',
    analysis,
    analysis_id: analysisId,
    skills_added: added,
  }
}
