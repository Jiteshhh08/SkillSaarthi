import { APPWRITE_DATABASE_ID, COLLECTIONS, ID, Permission, Role, databases } from './appwrite'
import { updateAssessmentScore } from './profile'

export const ASSESSMENT_DIMENSIONS = [
  { id: 'technical', label: 'Technical inclination', icon: '💻' },
  { id: 'analytical', label: 'Problem solving & aptitude', icon: '🧩' },
  { id: 'creative', label: 'Creativity & design', icon: '🎨' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'people', label: 'Teamwork & leadership', icon: '🤝' },
  { id: 'business', label: 'Career ambition', icon: '🚀' },
]

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'coding',
    question: 'How do you feel about learning to code?',
    dimension: 'technical',
    options: [
      { label: 'I love it and already build things', level: 5 },
      { label: 'I enjoy it and want to go deeper', level: 4 },
      { label: 'I am curious but find it challenging', level: 2 },
      { label: 'I prefer careers with little coding', level: 1 },
    ],
  },
  {
    id: 'puzzles',
    question: 'When faced with a tricky puzzle or logic problem, you usually…',
    dimension: 'analytical',
    options: [
      { label: 'Keep going until I crack it — I enjoy the challenge', level: 5 },
      { label: 'Work through it step by step and usually solve it', level: 4 },
      { label: 'Try a few approaches and sometimes need a hint', level: 2 },
      { label: 'Get frustrated quickly and move on', level: 1 },
    ],
  },
  {
    id: 'making',
    question: 'How do you feel about making or building things from scratch?',
    dimension: 'creative',
    options: [
      { label: 'I constantly create new things — designs, projects, content', level: 5 },
      { label: 'I enjoy hands-on creative work now and then', level: 4 },
      { label: 'I mostly follow existing templates and examples', level: 2 },
      { label: 'I rarely build or create things', level: 1 },
    ],
  },
  {
    id: 'teams',
    question: 'How do you work best?',
    dimension: 'people',
    options: [
      { label: 'Leading a team towards a shared goal', level: 5 },
      { label: 'Collaborating closely with others', level: 4 },
      { label: 'Working independently but checking in with others', level: 2 },
      { label: 'Fully solo — I do my best work alone', level: 1 },
    ],
  },
  {
    id: 'presenting',
    question: 'When presenting ideas to a group, you…',
    dimension: 'communication',
    options: [
      { label: 'Love it — I can explain anything clearly and persuasively', level: 5 },
      { label: 'Feel comfortable with good preparation', level: 4 },
      { label: 'Get nervous but manage with practice', level: 2 },
      { label: 'Avoid it as much as possible', level: 1 },
    ],
  },
  {
    id: 'problems',
    question: 'How do you approach a large, unfamiliar problem?',
    dimension: 'analytical',
    options: [
      { label: 'Break it into small parts and investigate each one', level: 5 },
      { label: 'Research examples first, then adapt the best fit', level: 4 },
      { label: 'Try an obvious solution and adjust if needed', level: 2 },
      { label: 'Wait for guidance or skip it', level: 1 },
    ],
  },
  {
    id: 'gadgets',
    question: 'You discover how the tech around you works…',
    dimension: 'technical',
    options: [
      { label: 'I take gadgets apart and understand the internals', level: 5 },
      { label: 'I explore settings and customizations', level: 4 },
      { label: 'I learn features only when I need them', level: 2 },
      { label: 'I rarely care how it works underneath', level: 1 },
    ],
  },
  {
    id: 'design',
    question: 'When something looks visually unappealing or confusing, you…',
    dimension: 'creative',
    options: [
      { label: 'Redesign it — I have a strong eye for look and feel', level: 5 },
      { label: 'Notice it and can suggest improvements', level: 4 },
      { label: 'Notice it but do not know how to fix it', level: 2 },
      { label: 'Do not really notice aesthetics', level: 1 },
    ],
  },
  {
    id: 'leading',
    question: 'When a group project has no clear leader, you…',
    dimension: 'people',
    options: [
      { label: 'Step up, assign roles, and keep everyone on track', level: 5 },
      { label: 'Offer to organize and help out where needed', level: 4 },
      { label: 'Do my assigned part and wait for direction', level: 2 },
      { label: 'Prefer others to take charge', level: 1 },
    ],
  },
  {
    id: 'ambition',
    question: 'Five years from now, you would most like to…',
    dimension: 'business',
    options: [
      { label: 'Start or run my own venture', level: 5 },
      { label: 'Grow into a senior or specialised role', level: 4 },
      { label: 'Have a stable, well-balanced career', level: 2 },
      { label: 'Still be figuring things out', level: 1 },
    ],
  },
]

const QUESTION_WEIGHT = 100 / (ASSESSMENT_QUESTIONS.length * 5)

export function scoreAssessment(responses) {
  const dimensionTotals = {}
  const dimensionCounts = {}
  let totalLevel = 0

  for (const question of ASSESSMENT_QUESTIONS) {
    const optionIndex = responses?.[question.id]
    const option = question.options[optionIndex]
    const level = option?.level ?? 0
    totalLevel += level

    if (option && question.dimension) {
      dimensionTotals[question.dimension] = (dimensionTotals[question.dimension] || 0) + level
      dimensionCounts[question.dimension] = (dimensionCounts[question.dimension] || 0) + 1
    }
  }

  const score = Math.round(totalLevel * QUESTION_WEIGHT)
  const dimensions = ASSESSMENT_DIMENSIONS.map((dim) => {
    const sum = dimensionTotals[dim.id] || 0
    const count = dimensionCounts[dim.id] || 0
    return {
      ...dim,
      score: count ? Math.round((sum / (count * 5)) * 100) : 0,
    }
  }).sort((a, b) => b.score - a.score)

  return {
    score,
    dimensions,
    answered: Object.keys(responses || {}).filter((key) => responses[key] !== undefined).length,
  }
}

export async function submitAssessment(userId, responses) {
  const result = scoreAssessment(responses)

  await databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.assessments,
    ID.unique(),
    {
      user_id: userId,
      type: 'career',
      score: result.score,
      responses: JSON.stringify(responses),
      created_at: new Date().toISOString(),
    },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )

  await updateAssessmentScore(userId, result.score)
  return result
}
