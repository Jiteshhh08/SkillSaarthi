import { COLLECTIONS, ID, Permission, Query, Role, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

const GITHUB_API_BASE = 'https://api.github.com'
const USER_AGENT = 'skillsaarthi'
const REPOS_PER_PAGE = 100

// GitHub languages → skillsaarthi catalog skill names.
const LANGUAGE_TO_SKILL = {
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
  Python: 'Python',
  Java: 'Java',
  Kotlin: 'Java',
  'C++': 'C++',
  C: 'C++',
  'C#': 'C++',
  'HTML': 'HTML/CSS',
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

// Repository topics → buried skill signals.
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

// Repository topics / name keywords → high-level domains.
const TOPIC_TO_DOMAIN = {
  web: 'Web Development',
  frontend: 'Web Development',
  'front-end': 'Web Development',
  react: 'Web Development',
  next: 'Web Development',
  backend: 'Backend Development',
  'back-end': 'Backend Development',
  node: 'Backend Development',
  api: 'Backend Development',
  rest: 'Backend Development',
  server: 'Backend Development',
  mobile: 'Mobile Development',
  android: 'Mobile Development',
  ios: 'Mobile Development',
  flutter: 'Mobile Development',
  data: 'Data',
  analytics: 'Data',
  visualization: 'Data Visualization',
  'machine-learning': 'AI/ML',
  ai: 'AI/ML',
  nlp: 'AI/ML',
  'deep-learning': 'AI/ML',
  tensorflow: 'AI/ML',
  pytorch: 'AI/ML',
  cloud: 'Cloud',
  aws: 'Cloud',
  gcp: 'Cloud',
  azure: 'Cloud',
  serverless: 'Cloud',
  devops: 'DevOps & Cloud',
  docker: 'DevOps & Cloud',
  kubernetes: 'DevOps & Cloud',
  cicd: 'DevOps & Cloud',
  infrastructure: 'DevOps & Cloud',
  terraform: 'DevOps & Cloud',
  security: 'Cybersecurity',
  vulnerability: 'Cybersecurity',
  penetration: 'Cybersecurity',
  hacking: 'Cybersecurity',
  cryptography: 'Cybersecurity',
}

// Mirror of ai-service/app/recommendation/careers.py used for the fallback
// that runs when the Python AI service is unavailable.
const FALLBACK_CAREERS = [
  {
    id: 'career_full_stack_developer',
    name: 'Full Stack Developer',
    skills: {
      javascript: 4,
      react: 3,
      'node.js': 4,
      express: 4,
      'rest apis': 4,
      sql: 3,
      'git & github': 3,
    },
  },
  {
    id: 'career_data_analyst',
    name: 'Data Analyst',
    skills: { sql: 4, python: 3, 'data analysis': 4, statistics: 4, 'data visualization': 4, pandas: 3 },
  },
  {
    id: 'career_cloud_engineer',
    name: 'Cloud Engineer',
    skills: { aws: 4, linux: 4, docker: 4, kubernetes: 4, 'ci/cd': 4 },
  },
  {
    id: 'career_security_analyst',
    name: 'Security Analyst',
    skills: {
      'network security': 4,
      'security compliance': 4,
      linux: 3,
      cryptography: 3,
      'penetration testing': 4,
    },
  },
]

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
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
      throw new ApiError(
        502,
        'GitHub returned an unexpected error. Try again later.',
        'GITHUB_UPSTREAM_ERROR',
      )
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
    if (repo.fork || !repo.language) continue
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

function detectSkills(repos) {
  const signals = {}
  const addSignal = (name, confidence, evidence) => {
    if (!name) return
    const key = normalizeName(name)
    const current = signals[key]
    if (!current || confidence > current.confidence) {
      signals[key] = { skill: name, confidence, evidence }
    }
  }

  const languages = languageShare(repos)
  for (const { language, share } of languages) {
    const skill = LANGUAGE_TO_SKILL[language]
    if (skill) {
      const confidence = Math.min(95, Math.round(55 + 40 * (share / 100)))
      addSignal(skill, confidence, `${share}% of your public code is ${language}`)
    }
  }

  for (const repo of repos) {
    if (repo.topics?.length) {
      for (const topic of repo.topics) {
        const skill = TOPIC_TO_SKILL[topic.toLowerCase()]
        if (skill) addSignal(skill, 85, `Topic "${topic}" on ${repo.name}`)
      }
    }
  }

  return Object.values(signals).sort((a, b) => b.confidence - a.confidence).slice(0, 14)
}

function detectDomains(repos) {
  const counts = {}
  const evidence = {}
  for (const repo of repos) {
    if (repo.fork) continue
    const keywords = [...(repo.topics || []), ...String(repo.name || '').toLowerCase().split(/[-_ ]/)]
    for (const keyword of keywords) {
      const domain = TOPIC_TO_DOMAIN[keyword.toLowerCase()]
      if (!domain) continue
      counts[domain] = (counts[domain] || 0) + 1
      if (!evidence[domain]) evidence[domain] = repo.name
    }
  }
  const max = Math.max(1, ...Object.values(counts))
  return Object.entries(counts)
    .map(([domain, count]) => ({
      domain,
      confidence: Math.min(95, Math.round(50 + 45 * (count / max))),
      evidence: `${count} repo(s) signal ${domain.toLowerCase()} (e.g. ${evidence[domain]})`,
    }))
    .sort((a, b) => b.confidence - a.confidence)
}

function detectActivity(repos) {
  const own = repos.filter((repo) => !repo.fork)
  const now = Date.now()
  const active = own.filter((repo) => repo.pushed_at && now - Date.parse(repo.pushed_at) < 180 * 86400000)
  let lastPushDays = null
  for (const repo of own) {
    if (!repo.pushed_at) continue
    const days = Math.max(0, Math.round((now - Date.parse(repo.pushed_at)) / 86400000))
    if (lastPushDays === null || days < lastPushDays) lastPushDays = days
  }
  const recent = lastPushDays !== null && lastPushDays <= 60
  let level = 'Low'
  if (active.length >= 6 || (recent && active.length >= 3)) level = 'High'
  else if (active.length >= 2 || recent) level = 'Moderate'
  return {
    repo_count: own.length,
    active_repos: active.length,
    last_push_days: lastPushDays,
    recent_activity: recent,
    level,
  }
}

function detectStrengths(analysis) {
  const strengths = []
  for (const { skill, confidence, evidence } of analysis.skills || []) {
    if (confidence >= 70) strengths.push(`Strong ${skill} signal — ${evidence.toLowerCase()}`)
  }
  for (const { domain, confidence } of analysis.domains || []) {
    if (strengths.length >= 5) break
    if (confidence >= 70) strengths.push(`Active in ${domain}`)
  }
  return strengths.slice(0, 5)
}

function fallbackCareerMatches(userSkills) {
  const matches = []
  for (const career of FALLBACK_CAREERS) {
    let total = 0
    const matched = []
    const gaps = []
    for (const [skill, required] of Object.entries(career.skills)) {
      const level = userSkills[skill] || 0
      total += Math.min(level, required) / required
      if (level > 0) matched.push(skill)
      else gaps.push(skill)
    }
    const score = Math.round((total / Object.keys(career.skills).length) * 100)
    if (score >= 30) {
      matches.push({
        career: career.name,
        confidence: score,
        reasons: matched.slice(0, 4).map((s) => `Experience with ${s}`),
        skill_gaps: gaps.slice(0, 5),
      })
    }
  }
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 4)
}

export function computeFallbackAnalysis(profile, repos) {
  const languages = languageShare(repos)
  const skills = detectSkills(repos)
  const domains = detectDomains(repos)
  const activity = detectActivity(repos)
  const userSkills = {}
  for (const { skill, confidence } of skills) {
    userSkills[normalizeName(skill)] = confidenceToProficiency(confidence)
  }
  const careerMatches = fallbackCareerMatches(userSkills)
  const strengths = detectStrengths({ skills, domains })
  const areasToImprove = []
  if (!activity.recent_activity) {
    areasToImprove.push('No repositories pushed in the last 60 days — commit regularly to show an active profile')
  }
  if (repos.filter((r) => !r.fork && r.topics?.length).length < 2) {
    areasToImprove.push('Add topics and descriptions to your repositories for better discoverability')
  }
  const topCareer = careerMatches[0]
  if (topCareer?.skill_gaps?.length) {
    areasToImprove.push(
      `Learn ${topCareer.skill_gaps.slice(0, 3).join(', ')} to grow your ${topCareer.career} profile`,
    )
  }
  if (areasToImprove.length === 0) {
    areasToImprove.push('Roughly balanced — keep exploring new technologies and ship more projects')
  }
  const openSource = {
    score: Math.min(
      95,
      20 + (activity.recent_activity ? 15 : 0) + (repos.some((r) => r.stargazers_count > 0) ? 15 : 0) + (repos.some((r) => r.forks_count > 0) ? 10 : 0),
    ),
    indicator: 'Building',
    evidence: [
      `${activity.repo_count} public repo(s)`,
      activity.active_repos > 0 ? `${activity.active_repos} repo(s) updated in the last 6 months` : 'Mostly dormant repositories',
    ],
  }
  const primary = languages[0]?.language || 'software'
  const topDomain = domains[0]?.domain
  const summary = topCareer
    ? `Active ${topDomain ? topDomain.toLowerCase() : 'technical'} profile with strong ${primary} skills. Best current match: ${topCareer.career}.`
    : `Technical profile built around ${primary} with ${repos.length} public repos. Add more focused projects to unlock career matches.`

  return {
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
      public_repos: profile.public_repos || 0,
      public_gists: profile.public_gists || 0,
    },
    summary,
    languages,
    skills,
    domains,
    activity,
    open_source: openSource,
    strengths,
    areas_to_improve: areasToImprove,
    career_matches: careerMatches,
  }
}

async function getSkillCatalogMap() {
  const { documents } = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.skills, [
    Query.limit(300),
  ])
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
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
      )
      existing.add(skillId)
      added += 1
    }
    return added
  } catch {
    return 0
  }
}

async function saveGitHubAnalysis(userId, username, analysis) {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.githubAnalyses,
    [Query.equal('user_id', userId), Query.limit(1)],
  )
  const payload = {
    user_id: userId,
    github_username: username,
    analysis_result: JSON.stringify(analysis),
  }
  if (documents.length > 0) {
    await databases.updateDocument(
      config.appwrite.databaseId,
      COLLECTIONS.githubAnalyses,
      documents[0].$id,
      payload,
    )
    return documents[0].$id
  }
  const created = await databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.githubAnalyses,
    ID.unique(),
    { ...payload, created_at: new Date().toISOString() },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
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
    // profile may not exist yet — the username is persisted with the analysis anyway
  }
}

async function requestAiAnalysis(payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`${config.aiServiceUrl}/ai/github/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const body = await response.json()
    return body?.analysis || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

export async function analyzeGitHub(userId, username, { applySkills = false } = {}) {
  const [profile, repos] = await Promise.all([fetchGitHubProfile(username), fetchGitHubRepos(username)])

  const payload = {
    username,
    public_repos: profile.public_repos || 0,
    public_gists: profile.public_gists || 0,
    followers: profile.followers || 0,
    following: profile.following || 0,
    created_at: profile.created_at,
    repos: repos.map((repo) => ({
      name: repo.name,
      description: repo.description || '',
      language: repo.language,
      topics: repo.topics || [],
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      size: repo.size || 0,
      fork: Boolean(repo.fork),
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
    })),
  }

  const aiAnalysis = await requestAiAnalysis(payload)
  const source = aiAnalysis ? 'full' : 'fallback'
  const analysis = aiAnalysis || computeFallbackAnalysis(profile, repos)

  const analysisId = await saveGitHubAnalysis(userId, username, analysis)
  await saveGithubUsername(userId, username)

  let added = 0
  if (applySkills) {
    added = await applyDetectedSkills(userId, analysis.skills || [])
  }

  return {
    username,
    source,
    analysis,
    analysis_id: analysisId,
    skills_added: added,
  }
}