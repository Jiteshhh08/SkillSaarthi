/**
 * Skill_Guide — catalog seed script.
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
      ['JavaScript', 70, 4],
      ['React', 70, 3],
      ['Node.js', 60, 4],
      ['Express', 60, 4],
      ['REST APIs', 60, 4],
      ['SQL', 60, 3],
      ['Git & GitHub', 50, 3],
      ['Problem Solving', 50, 3],
    ],
  },
  {
    name: 'Backend Developer',
    category: 'Software & Technology',
    description:
      'Designs and implements server-side logic, databases, and API integrations that power web and mobile applications.',
    skills: [
      ['Node.js', 70, 4],
      ['Express', 70, 4],
      ['SQL', 70, 4],
      ['REST APIs', 70, 4],
      ['Python', 60, 3],
      ['Docker', 50, 3],
      ['Git & GitHub', 50, 3],
      ['Problem Solving', 50, 3],
    ],
  },
  {
    name: 'Frontend Developer',
    category: 'Software & Technology',
    description:
      'Creates responsive user interfaces and interactive experiences using modern web technologies and frameworks.',
    skills: [
      ['JavaScript', 80, 4],
      ['React', 75, 4],
      ['HTML/CSS', 80, 4],
      ['TypeScript', 60, 3],
      ['Next.js', 50, 3],
      ['Git & GitHub', 50, 3],
      ['Communication', 50, 3],
      ['Problem Solving', 50, 3],
    ],
  },
  {
    name: 'Mobile Developer',
    category: 'Software & Technology',
    description:
      'Builds cross-platform or native mobile applications for iOS and Android, focusing on performance and user experience.',
    skills: [
      ['JavaScript', 70, 4],
      ['TypeScript', 60, 3],
      ['REST APIs', 60, 3],
      ['Git & GitHub', 50, 3],
      ['Problem Solving', 50, 3],
      ['Communication', 40, 2],
    ],
  },
  {
    name: 'Software Engineer',
    category: 'Software & Technology',
    description:
      'Applies engineering principles to design, develop, test, and maintain software systems of varying scale and complexity.',
    skills: [
      ['JavaScript', 70, 4],
      ['Python', 60, 3],
      ['Java', 60, 3],
      ['SQL', 60, 3],
      ['C++', 50, 2],
      ['Git & GitHub', 60, 3],
      ['Docker', 50, 3],
      ['Problem Solving', 70, 4],
      ['Teamwork', 50, 3],
    ],
  },
  {
    name: 'Data Analyst',
    category: 'AI & Data',
    description:
      'Collects, cleans, and interprets data to help organizations make informed decisions, producing reports and dashboards.',
    skills: [
      ['SQL', 75, 4],
      ['Python', 60, 3],
      ['Data Analysis', 70, 4],
      ['Statistics', 60, 4],
      ['Data Visualization', 70, 4],
      ['Pandas', 60, 3],
      ['Communication', 60, 3],
      ['Problem Solving', 60, 3],
    ],
  },
  {
    name: 'Data Scientist',
    category: 'AI & Data',
    description:
      'Uses advanced statistics and machine learning on large datasets to discover patterns and build predictive models.',
    skills: [
      ['Python', 80, 4],
      ['Statistics', 70, 4],
      ['Machine Learning', 70, 4],
      ['Data Analysis', 70, 4],
      ['Data Visualization', 60, 3],
      ['Pandas', 70, 4],
      ['NumPy', 70, 4],
      ['Deep Learning', 50, 3],
      ['Problem Solving', 70, 4],
    ],
  },
  {
    name: 'ML Engineer',
    category: 'AI & Data',
    description:
      'Designs, trains, and deploys machine learning models into production systems with focus on scalability and reliability.',
    skills: [
      ['Python', 80, 4],
      ['Machine Learning', 80, 4],
      ['Deep Learning', 70, 4],
      ['Statistics', 60, 3],
      ['Data Analysis', 60, 3],
      ['NumPy', 70, 4],
      ['Pandas', 70, 4],
      ['Docker', 60, 3],
      ['Problem Solving', 70, 4],
    ],
  },
  {
    name: 'AI Engineer',
    category: 'AI & Data',
    description:
      'Builds AI-powered products and services, integrating machine learning models with application-level systems.',
    skills: [
      ['Python', 80, 4],
      ['Machine Learning', 75, 4],
      ['Deep Learning', 70, 4],
      ['REST APIs', 60, 3],
      ['Git & GitHub', 50, 3],
      ['Docker', 50, 3],
      ['NumPy', 60, 3],
      ['Problem Solving', 70, 4],
    ],
  },
  {
    name: 'Cloud Engineer',
    category: 'Cloud',
    description:
      'Designs and manages cloud infrastructure and services, ensuring security, scalability, and cost efficiency.',
    skills: [
      ['AWS', 75, 4],
      ['Linux', 70, 4],
      ['Docker', 65, 4],
      ['Kubernetes', 60, 4],
      ['CI/CD', 65, 4],
      ['Network Security', 55, 3],
      ['Git & GitHub', 50, 3],
      ['Problem Solving', 60, 3],
    ],
  },
  {
    name: 'DevOps Engineer',
    category: 'Cloud',
    description:
      'Automates software delivery and infrastructure to accelerate releases while maintaining stability and security.',
    skills: [
      ['Linux', 70, 4],
      ['Docker', 75, 4],
      ['Kubernetes', 65, 4],
      ['CI/CD', 75, 4],
      ['AWS', 65, 4],
      ['Git & GitHub', 65, 4],
      ['Python', 50, 3],
      ['Problem Solving', 60, 3],
    ],
  },
  {
    name: 'Security Analyst',
    category: 'Cybersecurity',
    description:
      'Monitors systems for security threats, conducts vulnerability assessments, and implements protective measures.',
    skills: [
      ['Network Security', 75, 4],
      ['Security Compliance', 70, 4],
      ['Linux', 60, 3],
      ['Cryptography', 55, 3],
      ['Penetration Testing', 60, 4],
      ['Problem Solving', 60, 3],
      ['Communication', 50, 3],
    ],
  },
  {
    name: 'Security Engineer',
    category: 'Cybersecurity',
    description:
      'Designs and engineers secure systems and infrastructure, building security tooling and automating defenses.',
    skills: [
      ['Network Security', 75, 4],
      ['Penetration Testing', 75, 4],
      ['Cryptography', 65, 4],
      ['Linux', 70, 4],
      ['Security Compliance', 65, 4],
      ['Python', 60, 3],
      ['Docker', 50, 3],
      ['Problem Solving', 65, 3],
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

// { title, company, location, description, url }
const INTERNSHIPS = [
  {
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA / Remote',
    description:
      'Work on real products alongside experienced engineers, focusing on full-stack or backend software development across Google services.',
    url: 'https://careers.google.com/students/internships/',
  },
  {
    title: 'Data Science Intern',
    company: 'Microsoft',
    location: 'Redmond, WA / Remote',
    description:
      'Partner with data scientists to analyze production datasets and build models that improve Microsoft products and services.',
    url: 'https://careers.microsoft.com/students/explore',
  },
  {
    title: 'Frontend Engineering Intern',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    description:
      'Contribute to Airbnb web platforms including design systems, performance improvements, and new user-facing features.',
    url: 'https://careers.airbnb.com/students/',
  },
  {
    title: 'DevOps Intern',
    company: 'Amazon',
    location: 'Seattle, WA',
    description:
      'Support AWS infrastructure automation, CI/CD pipelines, and reliability engineering while learning cloud best practices.',
    url: 'https://www.amazon.jobs/en/students',
  },
  {
    title: 'Cybersecurity Analyst Intern',
    company: 'Palo Alto Networks',
    location: 'Santa Clara, CA',
    description:
      'Assist the security operations team with threat monitoring, incident analysis, and vulnerability assessments.',
    url: 'https://www.paloaltonetworks.com/company/employment/internships',
  },
  {
    title: 'AI/ML Research Intern',
    company: 'IBM Research',
    location: 'Yorktown Heights, NY',
    description:
      'Collaborate with research scientists on applied machine learning projects spanning NLP, computer vision, and reasoning systems.',
    url: 'https://research.ibm.com/careers',
  },
  {
    title: 'Backend Developer Intern',
    company: 'Stripe',
    location: 'Remote',
    description:
      'Build and scale APIs and financial infrastructure that power payments for millions of businesses worldwide.',
    url: 'https://stripe.com/jobs#students-and-graduates',
  },
  {
    title: 'Cloud Engineering Intern',
    company: 'Oracle',
    location: 'Austin, TX / Remote',
    description:
      'Work with cloud infrastructure teams on networking, storage, and container orchestration for OCI services.',
    url: 'https://www.oracle.com/careers/students/',
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
    'Could not find the Skill_Guide database. Run npm run setup:appwrite first, or set APPWRITE_DATABASE_ID in scripts/.env.setup.',
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
  try {
    const { documents } = await databases.listDocuments(dbId, 'career_skills', [
      Query.equal('career_id', careerId),
      Query.equal('skill_id', skillId),
      Query.limit(1),
    ])
    if (documents.length > 0) return
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
  const { documents } = await databases.listDocuments(dbId, 'internships', [
    Query.equal('title', internship.title),
    Query.limit(1),
  ])
  if (documents.length > 0) {
    console.log(`  = internship ${internship.title}`)
    return
  }
  const id = internship.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  await databases.createDocument(
    dbId,
    'internships',
    id,
    {
      title: internship.title,
      company: internship.company,
      location: internship.location,
      description: internship.description,
      url: internship.url,
    },
    CATALOG_READ,
  )
  console.log(`  + internship ${internship.title}`)
}

async function main() {
  console.log('Skill_Guide — catalog seed\n')
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