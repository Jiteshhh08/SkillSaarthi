/**
 * Skill Guide— catalog seed script.
 *
 * Populates the global (read-only) catalogs with starter data so the app
 * has something to recommend from:
 *   - skills + interests
 *   - careers + career_skills (career → required skill mapping)
 *   - courses (linked to skills)
 *   - internships
 *
 * Usage:
 *   1. Complete the Appwrite setup (npm run setup:appwrite)
 *   2. npm run seed:catalog
 *
 * The script is idempotent: existing documents are skipped by unique name.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Databases, Permission, Query, Role } from 'node-appwrite'

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
loadEnv('../.env')

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
const databases = new Databases(client)

// Global catalogs are read-only for authenticated users.
const CATALOG_READ = [Permission.read(Role.users())]

const SKILLS = [
  // Programming
  ['JavaScript', 'Programming'],
  ['TypeScript', 'Programming'],
  ['Python', 'Programming'],
  ['Java', 'Programming'],
  ['C++', 'Programming'],
  ['SQL', 'Programming'],
  ['HTML/CSS', 'Programming'],

  // Web development
  ['React', 'Web Development'],
  ['Node.js', 'Web Development'],
  ['Express', 'Web Development'],
  ['REST APIs', 'Web Development'],
  ['Next.js', 'Web Development'],
  ['Git & GitHub', 'Web Development'],

  // Data & AI
  ['Data Analysis', 'Data & AI'],
  ['Statistics', 'Data & AI'],
  ['Machine Learning', 'Data & AI'],
  ['Deep Learning', 'Data & AI'],
  ['Data Visualization', 'Data & AI'],
  ['Pandas', 'Data & AI'],
  ['NumPy', 'Data & AI'],

  // Cloud & DevOps
  ['Docker', 'Cloud & DevOps'],
  ['Kubernetes', 'Cloud & DevOps'],
  ['AWS', 'Cloud & DevOps'],
  ['CI/CD', 'Cloud & DevOps'],
  ['Linux', 'Cloud & DevOps'],

  // Cybersecurity
  ['Network Security', 'Cybersecurity'],
  ['Penetration Testing', 'Cybersecurity'],
  ['Cryptography', 'Cybersecurity'],
  ['Security Compliance', 'Cybersecurity'],

  // Soft skills
  ['Communication', 'Soft Skills'],
  ['Problem Solving', 'Soft Skills'],
  ['Teamwork', 'Soft Skills'],
  ['Time Management', 'Soft Skills'],
  ['Leadership', 'Soft Skills'],
]

const INTERESTS = [
  ['Web Development'],
  ['AI/ML'],
  ['Cybersecurity'],
  ['Cloud'],
  ['Data'],
  ['Design'],
  ['Finance'],
  ['Research'],
  ['Entrepreneurship'],
  ['Gaming'],
  ['Education'],
  ['Healthcare'],
]

// Careers from docs/PRD.md §7.4
const CAREERS = [
  {
    name: 'Full Stack Developer',
    category: 'Software & Technology',
    description:
      'Builds and maintains both front-end and back-end of web applications, working across the full technology stack from databases and APIs to user interfaces.',
    skills: [
      ['JavaScript', 4, 5],
      ['React', 3, 5],
      ['Node.js', 4, 4],
      ['Express', 4, 4],
      ['REST APIs', 4, 4],
      ['SQL', 3, 4],
      ['Git & GitHub', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'Backend Developer',
    category: 'Software & Technology',
    description:
      'Designs and implements server-side logic, databases, and API integrations that power web and mobile applications.',
    skills: [
      ['Node.js', 4, 5],
      ['Express', 4, 5],
      ['SQL', 4, 4],
      ['REST APIs', 4, 5],
      ['Python', 3, 3],
      ['Docker', 3, 3],
      ['Git & GitHub', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'Frontend Developer',
    category: 'Software & Technology',
    description:
      'Creates responsive user interfaces and interactive experiences using modern web technologies and frameworks.',
    skills: [
      ['JavaScript', 4, 5],
      ['React', 4, 5],
      ['HTML/CSS', 4, 5],
      ['TypeScript', 3, 3],
      ['Next.js', 3, 3],
      ['Git & GitHub', 3, 3],
      ['Communication', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'Mobile Developer',
    category: 'Software & Technology',
    description:
      'Builds cross-platform or native mobile applications for iOS and Android, focusing on performance and user experience.',
    skills: [
      ['JavaScript', 4, 4],
      ['TypeScript', 3, 3],
      ['REST APIs', 3, 3],
      ['Git & GitHub', 3, 3],
      ['Problem Solving', 3, 3],
      ['Communication', 2, 2],
    ],
  },
  {
    name: 'Software Engineer',
    category: 'Software & Technology',
    description:
      'Applies engineering principles to design, develop, test, and maintain software systems of varying scale and complexity.',
    skills: [
      ['JavaScript', 4, 4],
      ['Python', 3, 4],
      ['Java', 3, 3],
      ['SQL', 3, 3],
      ['C++', 2, 2],
      ['Git & GitHub', 3, 3],
      ['Docker', 3, 3],
      ['Problem Solving', 4, 5],
      ['Teamwork', 3, 3],
    ],
  },
  {
    name: 'Data Analyst',
    category: 'AI & Data',
    description:
      'Collects, cleans, and interprets data to help organizations make informed decisions, producing reports and dashboards.',
    skills: [
      ['SQL', 4, 5],
      ['Python', 3, 3],
      ['Data Analysis', 4, 5],
      ['Statistics', 4, 4],
      ['Data Visualization', 4, 4],
      ['Pandas', 3, 3],
      ['Communication', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'Data Scientist',
    category: 'AI & Data',
    description:
      'Uses advanced statistics and machine learning on large datasets to discover patterns and build predictive models.',
    skills: [
      ['Python', 4, 5],
      ['Statistics', 4, 4],
      ['Machine Learning', 4, 5],
      ['Data Analysis', 4, 4],
      ['Data Visualization', 3, 3],
      ['Pandas', 4, 4],
      ['NumPy', 4, 3],
      ['Deep Learning', 3, 3],
      ['Problem Solving', 4, 4],
    ],
  },
  {
    name: 'ML Engineer',
    category: 'AI & Data',
    description:
      'Designs, trains, and deploys machine learning models into production systems with focus on scalability and reliability.',
    skills: [
      ['Python', 4, 5],
      ['Machine Learning', 4, 5],
      ['Deep Learning', 4, 4],
      ['Statistics', 3, 3],
      ['Data Analysis', 3, 3],
      ['NumPy', 4, 4],
      ['Pandas', 4, 4],
      ['Docker', 3, 3],
      ['Problem Solving', 4, 4],
    ],
  },
  {
    name: 'AI Engineer',
    category: 'AI & Data',
    description:
      'Builds AI-powered products and services, integrating machine learning models with application-level systems.',
    skills: [
      ['Python', 4, 5],
      ['Machine Learning', 4, 5],
      ['Deep Learning', 4, 4],
      ['REST APIs', 3, 3],
      ['Git & GitHub', 3, 3],
      ['Docker', 3, 3],
      ['NumPy', 3, 3],
      ['Problem Solving', 4, 4],
    ],
  },
  {
    name: 'Cloud Engineer',
    category: 'Cloud',
    description:
      'Designs and manages cloud infrastructure and services, ensuring security, scalability, and cost efficiency.',
    skills: [
      ['AWS', 4, 5],
      ['Linux', 4, 4],
      ['Docker', 4, 4],
      ['Kubernetes', 4, 4],
      ['CI/CD', 4, 4],
      ['Network Security', 3, 3],
      ['Git & GitHub', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'DevOps Engineer',
    category: 'Cloud',
    description:
      'Automates software delivery and infrastructure to accelerate releases while maintaining stability and security.',
    skills: [
      ['Linux', 4, 4],
      ['Docker', 4, 5],
      ['Kubernetes', 4, 4],
      ['CI/CD', 4, 5],
      ['AWS', 4, 4],
      ['Git & GitHub', 4, 4],
      ['Python', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
  {
    name: 'Security Analyst',
    category: 'Cybersecurity',
    description:
      'Monitors systems for security threats, conducts vulnerability assessments, and implements protective measures.',
    skills: [
      ['Network Security', 4, 5],
      ['Security Compliance', 4, 4],
      ['Linux', 3, 3],
      ['Cryptography', 3, 3],
      ['Penetration Testing', 4, 4],
      ['Problem Solving', 3, 3],
      ['Communication', 3, 3],
    ],
  },
  {
    name: 'Security Engineer',
    category: 'Cybersecurity',
    description:
      'Designs and engineers secure systems and infrastructure, building security tooling and automating defenses.',
    skills: [
      ['Network Security', 4, 5],
      ['Penetration Testing', 4, 5],
      ['Cryptography', 4, 4],
      ['Linux', 4, 4],
      ['Security Compliance', 4, 4],
      ['Python', 3, 3],
      ['Docker', 3, 3],
      ['Problem Solving', 3, 3],
    ],
  },
]

// Courses mapped to a skill name. { skill, name, provider, level, duration_hours, url, cost, rating }
const COURSES = [
  { skill: 'JavaScript', name: 'JavaScript Algorithms and Data Structures', provider: 'freeCodeCamp', level: 'beginner', duration_hours: 300, url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', cost: 0, rating: 4.7 },
  { skill: 'React', name: 'React - The Complete Guide', provider: 'Udemy', level: 'intermediate', duration_hours: 48, url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', cost: 95, rating: 4.7 },
  { skill: 'Node.js', name: 'Node.js and Express Full Course', provider: 'freeCodeCamp', level: 'intermediate', duration_hours: 3, url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', cost: 0, rating: 4.6 },
  { skill: 'Python', name: 'Python for Everybody Specialization', provider: 'Coursera', level: 'beginner', duration_hours: 80, url: 'https://www.coursera.org/specializations/python', cost: 49, rating: 4.8 },
  { skill: 'Machine Learning', name: 'Machine Learning Specialization', provider: 'Coursera', level: 'intermediate', duration_hours: 60, url: 'https://www.coursera.org/specializations/machine-learning-introduction', cost: 49, rating: 4.9 },
  { skill: 'Data Analysis', name: 'Google Data Analytics Professional Certificate', provider: 'Coursera', level: 'beginner', duration_hours: 240, url: 'https://www.coursera.org/professional-certificates/google-data-analytics', cost: 49, rating: 4.8 },
  { skill: 'AWS', name: 'AWS Cloud Practitioner Essentials', provider: 'AWS Training', level: 'beginner', duration_hours: 10, url: 'https://aws.amazon.com/training/learn-about/cloud-practitioner/', cost: 0, rating: 4.6 },
  { skill: 'Docker', name: 'Docker Mastery: with Kubernetes + Swarm', provider: 'Udemy', level: 'intermediate', duration_hours: 22, url: 'https://www.udemy.com/course/docker-mastery-with-kubernetes-swarm-from-a-docker-captain/', cost: 95, rating: 4.7 },
  { skill: 'Kubernetes', name: 'Kubernetes for the Absolute Beginners', provider: 'KodeKloud', level: 'beginner', duration_hours: 8, url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/', cost: 0, rating: 4.7 },
  { skill: 'Network Security', name: 'Introduction to Cybersecurity', provider: 'Cisco NetAcad', level: 'beginner', duration_hours: 15, url: 'https://www.netacad.com/courses/introduction-to-cybersecurity', cost: 0, rating: 4.6 },
  { skill: 'Penetration Testing', name: 'Practical Ethical Hacking', provider: 'TCM Security', level: 'intermediate', duration_hours: 33, url: 'https://academy.tcm-sec.com/p/practical-ethical-hacking', cost: 30, rating: 4.7 },
  { skill: 'C++', name: 'C++ For C Programmers', provider: 'Coursera', level: 'intermediate', duration_hours: 30, url: 'https://www.coursera.org/learn/c-plus-plus-a', cost: 49, rating: 4.5 },
]

// { title, company, location, description, url, skills, eligibility }
const INTERNSHIPS = [
  {
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA / Remote',
    description:
      'Work on real products alongside experienced engineers, focusing on full-stack or backend software development across Google services.',
    url: 'https://careers.google.com/students/internships/',
    skills: ['JavaScript', 'Python', 'Java', 'C++', 'SQL', 'Git & GitHub', 'Problem Solving'],
    eligibility: 'Open to undergraduate and graduate students in CS or related fields.',
  },
  {
    title: 'Data Science Intern',
    company: 'Microsoft',
    location: 'Redmond, WA / Remote',
    description:
      'Partner with data scientists to analyze production datasets and build models that improve Microsoft products and services.',
    url: 'https://careers.microsoft.com/students/explore',
    skills: ['Python', 'SQL', 'Data Analysis', 'Statistics', 'Machine Learning', 'Pandas', 'NumPy'],
    eligibility: 'Open to undergraduate and graduate students with a quantitative background.',
  },
  {
    title: 'Frontend Engineering Intern',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    description:
      'Contribute to Airbnb web platforms including design systems, performance improvements, and new user-facing features.',
    url: 'https://careers.airbnb.com/students/',
    skills: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Next.js', 'Git & GitHub'],
    eligibility: 'Open to undergraduate students with web development experience.',
  },
  {
    title: 'DevOps Intern',
    company: 'Amazon',
    location: 'Seattle, WA',
    description:
      'Support AWS infrastructure automation, CI/CD pipelines, and reliability engineering while learning cloud best practices.',
    url: 'https://www.amazon.jobs/en/students',
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Git & GitHub', 'Python'],
    eligibility: 'Open to undergraduate and graduate students in CS or IT.',
  },
  {
    title: 'Cybersecurity Analyst Intern',
    company: 'Palo Alto Networks',
    location: 'Santa Clara, CA',
    description:
      'Assist the security operations team with threat monitoring, incident analysis, and vulnerability assessments.',
    url: 'https://www.paloaltonetworks.com/company/employment/internships',
    skills: ['Network Security', 'Security Compliance', 'Linux', 'Cryptography', 'Penetration Testing'],
    eligibility: 'Open to students pursuing a degree in cybersecurity, CS, or related fields.',
  },
  {
    title: 'AI/ML Research Intern',
    company: 'IBM Research',
    location: 'Yorktown Heights, NY',
    description:
      'Collaborate with research scientists on applied machine learning projects spanning NLP, computer vision, and reasoning systems.',
    url: 'https://research.ibm.com/careers',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'Data Analysis', 'NumPy'],
    eligibility: 'Open to graduate students with strong ML and Python skills.',
  },
  {
    title: 'Backend Developer Intern',
    company: 'Stripe',
    location: 'Remote',
    description:
      'Build and scale APIs and financial infrastructure that power payments for millions of businesses worldwide.',
    url: 'https://stripe.com/jobs#students-and-graduates',
    skills: ['Node.js', 'Express', 'SQL', 'REST APIs', 'Python', 'Docker', 'Git & GitHub'],
    eligibility: 'Open to students with strong systems and API development experience.',
  },
  {
    title: 'Cloud Engineering Intern',
    company: 'Oracle',
    location: 'Austin, TX / Remote',
    description:
      'Work with cloud infrastructure teams on networking, storage, and container orchestration for OCI services.',
    url: 'https://www.oracle.com/careers/students/',
    skills: ['AWS', 'Linux', 'Docker', 'Kubernetes', 'Network Security', 'CI/CD'],
    eligibility: 'Open to undergraduate and graduate students in CS or related fields.',
  },
]

async function resolveDatabase() {
  try {
    if (DATABASE_ID) {
      await databases.get(DATABASE_ID)
      return DATABASE_ID
    }
  } catch {
    // fall through to the lookup below
  }

  const { databases: all } = await databases.list()
  for (const db of all) {
    try {
      const { collections } = await databases.listCollections(db.$id)
      if (collections.some((c) => c.$id === 'skills')) {
        return db.$id
      }
    } catch {
      // not the right database, continue
    }
  }
  throw new Error(
    'Could not find the Skill Guidedatabase. Run npm run setup:appwrite first, or set APPWRITE_DATABASE_ID in scripts/.env.setup.',
  )
}

async function listDocuments(dbId, collectionId) {
  const docs = []
  let offset = 0
  while (true) {
    const page = await databases.listDocuments(dbId, collectionId, [Query.limit(100), Query.offset(offset)])
    docs.push(...page.documents)
    if (page.documents.length < 100) break
    offset += 100
  }
  return docs
}

async function findDoc(dbId, collectionId, name) {
  try {
    const { documents } = await databases.listDocuments(dbId, collectionId, [
      Query.equal('name', name),
      Query.limit(1),
    ])
    return documents[0]
  } catch {
    return undefined
  }
}

async function ensureSkill(dbId, skillId, name, category) {
  const existing = await findDoc(dbId, 'skills', name)
  if (existing) {
    console.log(`  = skill ${name}`)
    return existing.$id
  }
  const created = await databases.createDocument(dbId, 'skills', skillId, { name, category }, CATALOG_READ)
  console.log(`  + skill ${name}`)
  return created.$id
}

async function ensureInterest(dbId, name) {
  const existing = await findDoc(dbId, 'interests', name)
  if (existing) {
    console.log(`  = interest ${name}`)
    return existing.$id
  }
  const created = await databases.createDocument(dbId, 'interests', name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), { name }, CATALOG_READ)
  console.log(`  + interest ${name}`)
  return created.$id
}

async function ensureCareer(dbId, career) {
  const existing = await findDoc(dbId, 'careers', career.name)
  if (existing) {
    console.log(`  = career ${career.name}`)
    return existing.$id
  }
  const id = career.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const created = await databases.createDocument(
    dbId,
    'careers',
    id,
    { name: career.name, category: career.category, description: career.description },
    CATALOG_READ,
  )
  console.log(`  + career ${career.name}`)
  return created.$id
}

async function ensureCareerSkill(dbId, careerId, skillId, requiredLevel, importance) {
  // required_level is on the user proficiency scale (1-5), importance on 1-5.
  try {
    const { documents } = await databases.listDocuments(dbId, 'career_skills', [
      Query.equal('career_id', careerId),
      Query.equal('skill_id', skillId),
      Query.limit(1),
    ])
    if (documents.length > 0) {
      const existing = documents[0]
      const needsUpdate =
        existing.required_level !== requiredLevel || existing.importance !== importance
      if (needsUpdate) {
        await databases.updateDocument(dbId, 'career_skills', existing.$id, {
          required_level: requiredLevel,
          importance,
        })
        console.log(`  ~ career_skill ${careerId} → skill ${skillId} updated`)
      }
      return
    }
  } catch {
    // fall through and create
  }
  await databases.createDocument(
    dbId,
    'career_skills',
    'unique()',
    { career_id: careerId, skill_id: skillId, required_level: requiredLevel, importance },
    CATALOG_READ,
  )
  console.log(`  + career_skill ${careerId} → skill ${skillId}`)
}

async function ensureCourse(dbId, skillId, course) {
  const { documents } = await databases.listDocuments(dbId, 'courses', [
    Query.equal('name', course.name),
    Query.limit(1),
  ])
  if (documents.length > 0) {
    console.log(`  = course ${course.name}`)
    return
  }
  await databases.createDocument(
    dbId,
    'courses',
    'unique()',
    {
      name: course.name,
      provider: course.provider,
      skill_id: skillId,
      level: course.level,
      duration_hours: course.duration_hours,
      url: course.url,
      cost: course.cost,
      rating: course.rating,
    },
    CATALOG_READ,
  )
  console.log(`  + course ${course.name}`)
}

async function ensureInternship(dbId, internship) {
  const id = internship.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const sourceKey = `manual:${internship.title.toLowerCase()}:${(internship.company || '').toLowerCase()}`
  const payload = {
    title: internship.title,
    company: internship.company,
    location: internship.location,
    description: internship.description,
    url: internship.url,
    skills: JSON.stringify(internship.skills || []),
    eligibility: internship.eligibility || '',
    status: 'active',
    source: 'manual',
    source_key: sourceKey,
    fetched_at: new Date().toISOString(),
  }
  const { documents } = await databases.listDocuments(dbId, 'internships', [
    Query.equal('title', internship.title),
    Query.limit(1),
  ])
  if (documents.length > 0) {
    await databases.updateDocument(dbId, 'internships', documents[0].$id, payload)
    console.log(`  ~ internship ${internship.title}`)
    return
  }
  await databases.createDocument(dbId, 'internships', id, payload, CATALOG_READ)
  console.log(`  + internship ${internship.title}`)
}

async function main() {
  console.log('Skill Guide— catalog seed\n')
  console.log(`Endpoint: ${ENDPOINT}`)
  console.log(`Project:  ${PROJECT_ID}`)

  const dbId = await resolveDatabase()
  console.log(`Database: ${dbId}\n`)

  console.log('1) Skills')
  const skillIds = {}
  for (const [name, category] of SKILLS) {
    skillIds[name] = await ensureSkill(dbId, name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), name, category)
  }

  console.log('\n2) Interests')
  for (const [name] of INTERESTS) {
    await ensureInterest(dbId, name)
  }

  console.log('\n3) Careers + career_skills')
  const careerIds = {}
  for (const career of CAREERS) {
    careerIds[career.name] = await ensureCareer(dbId, career)
  }
  for (const career of CAREERS) {
    for (const [skillName, requiredLevel, importance] of career.skills) {
      const skillId = skillIds[skillName]
      if (!skillId) {
        console.warn(`    ! missing skill reference: ${skillName}`)
        continue
      }
      await ensureCareerSkill(dbId, careerIds[career.name], skillId, requiredLevel, importance)
    }
  }

  console.log('\n4) Courses')
  for (const course of COURSES) {
    const skillId = skillIds[course.skill]
    if (!skillId) {
      console.warn(`    ! skipped course with missing skill: ${course.name}`)
      continue
    }
    await ensureCourse(dbId, skillId, course)
  }

  console.log('\n5) Internships')
  for (const internship of INTERNSHIPS) {
    await ensureInternship(dbId, internship)
  }

  const counts = {}
  for (const c of ['skills', 'interests', 'careers', 'career_skills', 'courses', 'internships']) {
    counts[c] = (await listDocuments(dbId, c)).length
  }
  console.log('\nDone. Catalog totals:')
  for (const [c, n] of Object.entries(counts)) {
    console.log(`  ${c}: ${n}`)
  }
}

if (!PROJECT_ID || !API_KEY) {
  console.error(
    'Missing credentials. Create scripts/.env.setup from .env.setup.example with APPWRITE_PROJECT_ID and APPWRITE_API_KEY.',
  )
  process.exitCode = 1
} else {
  main().catch((error) => {
    console.error('\nSeed failed:', error?.message || error)
    process.exitCode = 1
  })
}