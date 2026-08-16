import { APPWRITE_DATABASE_ID, COLLECTIONS, Permission, Role, databases } from './appwrite'

export const EDUCATION_LEVELS = [
  {
    value: 'high_school',
    label: 'High School Student',
    description:
      'Exploring subjects, interests, and possible career directions before higher education.',
    icon: 'backpack',
  },
  {
    value: 'college',
    label: 'College Student',
    description:
      'Building skills and projects while preparing for internships, jobs, and graduation.',
    icon: 'graduation-cap',
  },
  {
    value: 'job_seeker',
    label: 'Job Seeker',
    description:
      'Looking for a first job, reskilling, or transitioning into a new career path.',
    icon: 'briefcase',
  },
]

export const WORK_PREFERENCES = [
  { value: 'onsite', label: 'On-site', icon: 'building-2' },
  { value: 'hybrid', label: 'Hybrid', icon: 'laptop' },
  { value: 'remote', label: 'Remote', icon: 'home' },
]

export const PREFERRED_INDUSTRIES = [
  'Software & Technology',
  'AI & Data',
  'Cloud',
  'Cybersecurity',
  'Finance',
  'Healthcare',
  'Education',
  'Design & Media',
  'Research',
  'Entrepreneurship',
]

// Mirrors the seeded careers catalog so the onboarding pickers always match
// what the recommender knows about — no free text, no typos, no gibberish.
export const CAREER_ROLES = [
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'ML Engineer',
  'AI Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Security Analyst',
  'Security Engineer',
]

export const GOAL_TIMEFRAMES = [
  'within 6 months',
  'within 1 year',
  'within 2 years',
  'within 3 years',
  'within 5 years',
  'as my next career move',
]

// Preferred work locations — fed to internship matching (substring match on
// the internship's location string). Covers major Indian tech hubs, common
// remote/global options, and flexibility choices.
export const PREFERRED_LOCATIONS = [
  'Remote',
  'Anywhere',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi / NCR',
  'Noida',
  'Gurugram',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
  'Indore',
  'Jaipur',
  'Chandigarh',
]

// Curated degrees and engineering stream/branches for the academic pickers —
// no free text so typos and gibberish can't enter the profile.
//
// Each degree maps to the branches and study years that actually exist for it,
// so selections are always internally consistent (no "B.Tech + BA Economics").
export const DEGREE_PROFILES = {
  'B.Tech / B.E.': {
    years: [1, 2, 3, 4],
    branches: [
      'Computer Science',
      'Information Technology',
      'Artificial Intelligence',
      'Data Science',
      'Electronics & Communication',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Aerospace Engineering',
      'Automobile Engineering',
      'Electrical & Electronics',
      'Instrumentation',
      'Marine Engineering',
      'Metallurgical Engineering',
      'Mining Engineering',
      'Petroleum Engineering',
      'Robotics & Automation',
      'Other branch',
    ],
  },
  'B.Sc': {
    years: [1, 2, 3],
    branches: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Statistics',
      'Biology / Life Sciences',
      'Botany',
      'Zoology',
      'Biotechnology',
      'Microbiology',
      'Electronics',
      'Environmental Science',
      'Forensic Science',
      'Nursing',
      'Nutrition & Dietetics',
      'Agriculture',
      'Animation & Multimedia',
      'Other branch',
    ],
  },
  'B.A.': {
    years: [1, 2, 3],
    branches: [
      'English',
      'History',
      'Political Science',
      'Sociology',
      'Psychology',
      'Economics',
      'Geography',
      'Philosophy',
      'Journalism & Mass Communication',
      'Fine Arts',
      'Public Administration',
      'Social Work',
      'Foreign Languages',
      'Law (after BA)',
      'Other branch',
    ],
  },
  'B.Com': {
    years: [1, 2, 3],
    branches: [
      'Accounting & Finance',
      'Banking & Insurance',
      'Taxation',
      'Business Economics',
      'Corporate Finance',
      'Cost & Management Accounting',
      'Marketing',
      'E-Commerce',
      'Financial Markets',
      'Other branch',
    ],
  },
  BCA: {
    years: [1, 2, 3],
    branches: [
      'Computer Applications',
      'Cloud Computing',
      'Data Science',
      'Web Development',
      'Mobile App Development',
      'Database Management',
      'Cyber Security',
      'Systems & Networking',
      'Other branch',
    ],
  },
  BBA: {
    years: [1, 2, 3],
    branches: [
      'General Management',
      'Marketing',
      'Finance',
      'Human Resources',
      'Operations Management',
      'Business Analytics',
      'Entrepreneurship',
      'International Business',
      'Supply Chain Management',
      'Other branch',
    ],
  },
  Diploma: {
    years: [1, 2, 3],
    branches: [
      'Computer Engineering',
      'Information Technology',
      'Electronics Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Automobile Engineering',
      'Chemical Engineering',
      'Architecture & Interior Design',
      'Other branch',
    ],
  },
  'M.Tech / M.E.': {
    years: [1, 2],
    branches: [
      'Computer Science',
      'VLSI Design',
      'Machine Learning & AI',
      'Data Science',
      'Embedded Systems',
      'Signal Processing',
      'Power Systems',
      'Thermal Engineering',
      'Structural Engineering',
      'Transportation Engineering',
      'Environmental Engineering',
      'Robotics',
      'Other branch',
    ],
  },
  'M.Sc': {
    years: [1, 2],
    branches: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Statistics',
      'Biotechnology',
      'Microbiology',
      'Data Science',
      'Environmental Science',
      'Food Technology',
      'Other branch',
    ],
  },
  MA: {
    years: [1, 2],
    branches: [
      'English',
      'History',
      'Political Science',
      'Sociology',
      'Psychology',
      'Economics',
      'Journalism & Mass Communication',
      'Public Administration',
      'Social Work',
      'Fine Arts',
      'Other branch',
    ],
  },
  'M.Com': {
    years: [1, 2],
    branches: [
      'Accounting & Finance',
      'Banking & Insurance',
      'Taxation',
      'Business Economics',
      'Marketing',
      'Financial Management',
      'Other branch',
    ],
  },
  MCA: {
    years: [1, 2, 3],
    branches: [
      'Computer Applications',
      'Software Engineering',
      'Data Science',
      'Cloud Computing',
      'Cyber Security',
      'Systems Analysis',
      'Other branch',
    ],
  },
  MBA: {
    years: [1, 2],
    branches: [
      'Marketing',
      'Finance',
      'Human Resources',
      'Operations Management',
      'Business Analytics',
      'Entrepreneurship',
      'International Business',
      'Supply Chain Management',
      'Information Technology',
      'General Management',
      'Other branch',
    ],
  },
  PhD: {
    years: [1, 2, 3, 4, 5],
    branches: [
      'Computer Science & IT',
      'Artificial Intelligence',
      'Data Science',
      'Engineering (any stream)',
      'Sciences',
      'Commerce & Management',
      'Humanities & Social Sciences',
      'Mathematics & Statistics',
      'Law',
      'Health Sciences',
      'Other branch',
    ],
  },
  'Other degree': {
    years: [1, 2, 3, 4],
    branches: [
      'Computer Science & IT',
      'Science & Mathematics',
      'Commerce & Finance',
      'Arts & Humanities',
      'Management & Business',
      'Engineering & Technology',
      'Design & Media',
      'Other branch',
    ],
  },
}

export const DEGREES = Object.keys(DEGREE_PROFILES)

export function branchesForDegree(degree) {
  return DEGREE_PROFILES[degree]?.branches || []
}

export function yearsForDegree(degree) {
  return DEGREE_PROFILES[degree]?.years || []
}

// Kept for any code that imports the flat BRANCHES list.
export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence',
  'Data Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Economics',
  'Commerce / Finance',
  'Management',
  'Design',
  'Law',
  'Humanities',
  'Other branch',
]

// Curated academic subjects. Each maps to catalog skill names that the
// onboarding flow auto-adds to the user's skill profile, so academic input
// actually feeds the career recommender.
export const ACADEMIC_SUBJECTS = [
  { name: 'Mathematics', skills: ['Statistics'] },
  { name: 'Statistics', skills: ['Statistics', 'Data Analysis'] },
  { name: 'Computer Science', skills: ['Python', 'JavaScript'] },
  { name: 'Computer Applications', skills: ['JavaScript', 'Python'] },
  { name: 'Physics', skills: [] },
  { name: 'Chemistry', skills: [] },
  { name: 'Biology', skills: [] },
  { name: 'English', skills: ['Communication'] },
  { name: 'Economics', skills: ['Data Analysis'] },
  { name: 'Business Studies', skills: [] },
  { name: 'Accountancy', skills: [] },
  { name: 'Design', skills: ['HTML/CSS'] },
  { name: 'History', skills: [] },
  { name: 'Psychology', skills: [] },
  { name: 'Sociology', skills: [] },
  { name: 'Geography', skills: [] },
]

// Curated academic strengths mapped to soft-skill catalog entries.
export const ACADEMIC_STRENGTHS = [
  { name: 'Analytical thinking', skills: ['Problem Solving'] },
  { name: 'Problem solving', skills: ['Problem Solving'] },
  { name: 'Communication', skills: ['Communication'] },
  { name: 'Writing & documentation', skills: ['Communication'] },
  { name: 'Public speaking', skills: ['Communication'] },
  { name: 'Teamwork & collaboration', skills: ['Teamwork'] },
  { name: 'Leadership', skills: ['Leadership'] },
  { name: 'Time management', skills: ['Time Management'] },
  { name: 'Adaptability', skills: [] },
  { name: 'Creativity', skills: [] },
  { name: 'Attention to detail', skills: [] },
  { name: 'Research', skills: ['Data Analysis'] },
]

export function educationLevelLabel(value) {
  const level = EDUCATION_LEVELS.find((item) => item.value === value)
  return level?.label || ''
}

export function workPreferenceLabel(value) {
  const pref = WORK_PREFERENCES.find((item) => item.value === value)
  return pref?.label || ''
}

export async function getProfile(userId) {
  if (!userId) return null
  try {
    return await databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.profiles, userId)
  } catch {
    return null
  }
}

export async function createProfile(userId, data = {}) {
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.profiles,
    userId,
    { user_id: userId, ...data },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
}

export async function updateProfile(userId, fields = {}) {
  const existing = await getProfile(userId)
  if (existing) {
    return databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.profiles,
      userId,
      { ...fields, updated_at: new Date().toISOString() },
    )
  }
  return createProfile(userId, fields)
}

export async function updateEducationLevel(userId, educationLevel) {
  return updateProfile(userId, { education_level: educationLevel })
}

export async function updateAcademicInfo(userId, data = {}) {
  const fields = {}
  if (data.degree) fields.degree = data.degree
  if (data.branch) fields.branch = data.branch
  if (data.study_year !== '' && data.study_year != null) fields.study_year = Number(data.study_year)
  if (data.cgpa !== '' && data.cgpa != null) fields.cgpa = Number(data.cgpa)
  if (data.subjects) fields.subjects = data.subjects
  if (data.academic_strengths) fields.academic_strengths = data.academic_strengths
  if (data.experience_years !== '' && data.experience_years != null) {
    fields.experience_years = Number(data.experience_years)
  }
  return updateProfile(userId, fields)
}

export async function updateCareerPreferences(userId, data = {}) {
  const fields = {}
  if (data.career_goal) fields.career_goal = data.career_goal
  if (data.preferred_industry) fields.preferred_industry = data.preferred_industry
  if (data.preferred_role) fields.preferred_role = data.preferred_role
  if (data.preferred_location) fields.preferred_location = data.preferred_location
  if (data.work_preference) fields.work_preference = data.work_preference
  if (data.experience_years !== '' && data.experience_years != null) {
    fields.experience_years = Number(data.experience_years)
  }
  return updateProfile(userId, fields)
}

export async function updateAssessmentScore(userId, score) {
  return updateProfile(userId, { assessment_score: score })
}

export async function completeOnboarding(userId) {
  return updateProfile(userId, { onboarding_completed: true })
}

export function isProfileComplete(profile) {
  return Boolean(profile?.onboarding_completed)
}
