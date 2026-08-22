const WEIGHTS = { skill: 0.4, interest: 0.2, assessment: 0.15, education: 0.1, goal: 0.1, experience: 0.05 }

const ALIASES = {
  js: 'javascript',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node.js',
  expressjs: 'express',
  html: 'html/css',
  css: 'html/css',
  github: 'git & github',
  git: 'git & github',
  restapi: 'rest apis',
  rest: 'rest apis',
  'data science': 'data scientist',
  ai: 'artificial intelligence',
}

function normalizeSkill(name) {
  if (!name) return ''
  const key = String(name).trim().toLowerCase().replace(/\s+/g, ' ')
  return ALIASES[key] || key
}

function userSkillMap(userSkills) {
  const map = {}
  for (const s of userSkills || []) map[normalizeSkill(s.name)] = Number(s.proficiency) || 0
  return map
}

function educationsMatch(userEducation, allowed) {
  if (!allowed || allowed.length === 0) return true
  if (!userEducation) return false
  return allowed.includes(userEducation)
}

function skillMatch(userSkills, required) {
  const entries = Object.entries(required || {})
  if (entries.length === 0) return 0
  let totalWeight = 0
  let weighted = 0
  for (const [name, meta] of entries) {
    const reqLevel = Number(meta.required) || 1
    const importance = Number(meta.importance) || 1
    const userLevel = userSkills[normalizeSkill(name)] || 0
    totalWeight += importance
    weighted += importance * (Math.min(userLevel, reqLevel) / reqLevel)
  }
  return totalWeight ? (weighted / totalWeight) * 100 : 0
}

function interestMatch(userInterests, interests) {
  if (!interests || interests.length === 0) return 0
  const userSet = new Set((userInterests || []).map((i) => String(i).toLowerCase()))
  if (userSet.size === 0) return 0
  const matched = interests.filter((i) => userSet.has(String(i).toLowerCase())).length
  return (matched / interests.length) * 100
}

function educationMatch(userEducation, allowed) {
  return educationsMatch(userEducation, allowed) ? 100 : 0
}

function goalMatch(userGoals, goals) {
  if (!goals || goals.length === 0) return 0
  const userSet = new Set((userGoals || []).map((g) => String(g).toLowerCase()))
  if (userSet.size === 0) return 0
  const matched = goals.filter((g) => userSet.has(String(g).toLowerCase())).length
  return (matched / goals.length) * 100
}

function assessmentMatch(userScore, requiredScore) {
  if (requiredScore == null) return 100
  if (userScore == null) return 0
  return Math.min(100, (userScore / requiredScore) * 100)
}

function experienceMatch(userYears, requiredYears) {
  if (!requiredYears) return 100
  if (userYears == null) return 0
  return Math.min(100, (userYears / requiredYears) * 100)
}

function skillGapDetails(userSkills, required) {
  const details = []
  for (const [name, meta] of Object.entries(required || {})) {
    const reqLevel = Number(meta.required) || 1
    const importance = Number(meta.importance) || 1
    const current = userSkills[normalizeSkill(name)] || 0
    details.push({ skill: name, required: reqLevel, current, importance })
  }
  return details.sort((a, b) => b.importance - a.importance)
}

function reasons(career, userSkills, userInterests, userEducation, userGoals, userScore, userYears) {
  const out = []
  const skills = career.skills || {}
  for (const [name, meta] of Object.entries(skills)) {
    const reqLevel = Number(meta.required) || 1
    const current = userSkills[normalizeSkill(name)] || 0
    if (current >= reqLevel) out.push(`Strong ${name} skills (${current}/${reqLevel})`)
  }
  for (const interest of career.interests || []) {
    if ((userInterests || []).some((i) => String(i).toLowerCase() === String(interest).toLowerCase())) {
      out.push(`Interest in ${interest}`)
    }
  }
  if (educationsMatch(userEducation, career.education_levels)) out.push('Education level is a good fit')
  const goalHits = (career.goals || []).filter((g) => (userGoals || []).some((x) => String(x).toLowerCase() === String(g).toLowerCase()))
  for (const g of goalHits) out.push(`Goal aligned: ${g}`)
  if (career.assessment != null && userScore != null) {
    if (userScore >= career.assessment) out.push(`Strong assessment score (${userScore}/${career.assessment})`)
    else out.push(`Assessment score below career bar (${userScore}/${career.assessment})`)
  }
  if (career.experience && userYears != null) {
    if (userYears >= career.experience) out.push(`Experience requirement met (${userYears} yrs)`)
    else out.push(`More experience helps (${userYears}/${career.experience} yrs)`)
  }
  return out
}

function strengths(userSkills, required) {
  return Object.entries(required || {})
    .filter(([name, meta]) => (userSkills[normalizeSkill(name)] || 0) >= Number(meta.required) || 1)
    .map(([name]) => name)
}

function nextSteps(userSkills, required) {
  const steps = []
  for (const item of skillGapDetails(userSkills, required)) {
    if (item.current < item.required) {
      const verb = item.current === 0 ? 'Learn' : 'Strengthen'
      steps.push(`${verb} ${item.skill} (level ${item.current} → ${item.required})`)
    }
  }
  return steps
}

function scoreCareer(career, profile) {
  const userSkills = userSkillMap(profile.skills)
  const userInterests = profile.interests || []
  const userGoals = profile.goals || []
  const userEducation = profile.education_level
  const userAssessment = profile.assessment_score
  const userExperience = profile.experience_years

  const required = career.skills || {}
  const skillScore = skillMatch(userSkills, required)
  const interestScore = interestMatch(userInterests, career.interests)
  const educationScore = educationMatch(userEducation, career.education_levels)
  const goalScore = goalMatch(userGoals, career.goals)
  const assessmentScore = assessmentMatch(userAssessment, career.assessment)
  const experienceScore = experienceMatch(userExperience, career.experience)

  const breakdown = {
    skill: Math.round(skillScore * 10) / 10,
    interest: Math.round(interestScore * 10) / 10,
    education: Math.round(educationScore * 10) / 10,
    goal: Math.round(goalScore * 10) / 10,
    assessment: Math.round(assessmentScore * 10) / 10,
    experience: Math.round(experienceScore * 10) / 10,
  }

  const score = Math.min(
    100,
    Math.round(
      skillScore * WEIGHTS.skill +
        interestScore * WEIGHTS.interest +
        assessmentScore * WEIGHTS.assessment +
        educationScore * WEIGHTS.education +
        goalScore * WEIGHTS.goal +
        experienceScore * WEIGHTS.experience,
    ),
  )

  const gaps = skillGapDetails(userSkills, required)

  return {
    career_id: career.id,
    career: career.name,
    category: career.category || '',
    description: career.description || '',
    score,
    breakdown,
    reasons: reasons(career, userSkills, userInterests, userEducation, userGoals, userAssessment, userExperience),
    strengths: Object.entries(required)
      .filter(([n, m]) => (userSkills[normalizeSkill(n)] || 0) >= Number(m.required) || 1)
      .map(([n]) => n),
    skill_gaps: [...gaps]
      .filter((g) => g.current < g.required)
      .sort((a, b) => b.importance - a.importance)
      .map((g) => g.skill),
    skill_gap_details: gaps,
    next_steps: nextSteps(userSkills, required),
  }
}

export function scoreCareers(profile, careers, topN) {
  const catalog = careers
  const recommendations = catalog.map((c) => scoreCareer(c, profile))
  recommendations.sort((a, b) => b.score - a.score)
  if (topN != null) return recommendations.slice(0, Number(topN))
  return recommendations
}

export function analyzeSkillGaps(careerName, skills, careers) {
  const target = String(careerName || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const career = careers.find((c) => c.id === careerName || String(c.name).trim().toLowerCase().replace(/\s+/g, ' ') === target)
  if (!career) return null
  const userSkills = userSkillMap(skills)
  const required = career.skills || {}
  const details = skillGapDetails(userSkills, required)
  const strong = []
  const needs = []
  for (const item of details) {
    const entry = { skill: item.skill, required: item.required, current: item.current, importance: item.importance }
    if (item.current >= item.required) strong.push(entry)
    else needs.push(entry)
  }
  return {
    career_id: career.id,
    career: career.name,
    category: career.category || '',
    description: career.description || '',
    strong,
    needs_improvement: needs,
  }
}

function applyWhatIfChanges(profile, changes) {
  const simulated = {
    education_level: profile.education_level,
    assessment_score: profile.assessment_score,
    experience_years: profile.experience_years,
    skills: (profile.skills || []).map((s) => ({ ...s })),
    interests: [...(profile.interests || [])],
    goals: [...(profile.goals || [])],
  }
  const byName = {}
  for (const s of simulated.skills) byName[normalizeSkill(s.name)] = s
  for (const change of (changes?.skills || [])) {
    const name = change.name || ''
    if (!name) continue
    const key = normalizeSkill(name)
    const prof = Number(change.proficiency) || 1
    if (byName[key]) byName[key].proficiency = prof
    else {
      const added = { name, proficiency: prof }
      byName[key] = added
      simulated.skills.push(added)
    }
  }
  const interestSet = new Set(simulated.interests.map((i) => String(i).toLowerCase()))
  for (const interest of changes?.interests || []) {
    if (!interestSet.has(String(interest).toLowerCase())) {
      simulated.interests.push(String(interest))
      interestSet.add(String(interest).toLowerCase())
    }
  }
  const goalSet = new Set(simulated.goals.map((g) => String(g).toLowerCase()))
  for (const goal of changes?.goals || []) {
    if (!goalSet.has(String(goal).toLowerCase())) {
      simulated.goals.push(String(goal))
      goalSet.add(String(goal).toLowerCase())
    }
  }
  return simulated
}

function whatIfSummary(changes, changesApplied) {
  if (!changes || changes.length === 0) return 'No career scores to compare.'
  const top = [...changes].sort((a, b) => b.delta - a.delta)
  const biggest = top[0]
  const added = (changesApplied?.skills || []).map((s) => `${s.name} (level ${s.proficiency})`).join(', ')
  const scenario = added || 'the changes'
  return `If ${scenario}, ${biggest.career} jumps the most (${Math.round(biggest.baseline_score)}% → ${Math.round(biggest.simulated_score)}%, ${biggest.delta >= 0 ? '+' : ''}${Math.round(biggest.delta)} pts). These are estimated scores, not guaranteed outcomes.`
}

export function simulateWhatIf(profile, changes, topN, careers) {
  const baseline = scoreCareers(profile, careers, null)
  const simulatedProfile = applyWhatIfChanges(profile, changes)
  const simulated = scoreCareers(simulatedProfile, careers, null)
  const baseById = Object.fromEntries(baseline.map((i) => [i.career_id, i]))
  const simById = Object.fromEntries(simulated.map((i) => [i.career_id, i]))
  const careerChanges = []
  for (const before of baseline) {
    const after = simById[before.career_id] || before
    careerChanges.push({
      career_id: before.career_id,
      career: after.career,
      category: after.category || '',
      baseline_score: before.score,
      simulated_score: after.score,
      delta: Math.round((after.score - before.score) * 10) / 10,
    })
  }
  careerChanges.sort((a, b) => b.delta - a.delta)
  const cutoff = topN != null ? Number(topN) : null
  return {
    changes: careerChanges,
    baseline: cutoff ? baseline.slice(0, cutoff) : baseline,
    simulated: cutoff ? simulated.slice(0, cutoff) : simulated,
    summary: whatIfSummary(careerChanges, changes),
  }
}

function careerDifficulty(career) {
  const required = career.skills || {}
  const vals = Object.values(required)
  if (vals.length === 0) return 0
  const avg = vals.reduce((s, m) => s + (Number(m.required) || 1), 0) / vals.length
  let d = (avg / 5) * 70
  if (career.assessment) d += 10
  if (career.experience) d += 20
  return Math.min(100, Math.round(d))
}

function difficultyLabel(d) {
  if (d >= 75) return 'High'
  if (d >= 45) return 'Moderate'
  return 'Low'
}

export function compareCareers(profile, careerNames, careers) {
  let catalog = careers
  if (careerNames && careerNames.length > 0) {
    const wanted = new Set(careerNames.map((n) => String(n).trim().toLowerCase().replace(/\s+/g, ' ')))
    catalog = catalog.filter((c) => wanted.has(String(c.name).toLowerCase().replace(/\s+/g, ' ')))
  }
  const userSkills = userSkillMap(profile.skills)
  const entries = catalog.map((career) => {
    const scored = scoreCareer(career, profile)
    const required = career.skills || {}
    const userHas = Object.entries(required).map(([name, meta]) => ({
      skill: name,
      required: Number(meta.required) || 1,
      current: userSkills[normalizeSkill(name)] || 0,
      importance: Number(meta.importance) || 1,
    }))
    const gaps = userHas.filter((x) => x.current < x.required).sort((a, b) => b.importance - a.importance)
    const difficulty = careerDifficulty(career)
    return {
      career_id: career.id,
      career: career.name,
      category: career.category || '',
      description: career.description || '',
      score: scored.score,
      breakdown: scored.breakdown,
      reasons: scored.reasons,
      strengths: scored.strengths,
      skill_gaps: scored.skill_gaps,
      skill_gap_details: gaps,
      next_steps: scored.next_steps,
      difficulty,
      difficulty_label: difficultyLabel(difficulty),
      required_skills_count: Object.keys(required).length,
      assessment_bar: career.assessment,
      experience_required: career.experience || 0,
    }
  })
  entries.sort((a, b) => b.score - a.score)
  const best = entries[0] || null
  let summary = 'Select at least one career to compare.'
  if (best) {
    const strengths = best.strengths || []
    const clause = strengths.length ? `, with ${strengths.slice(0, 2).join(', ').toLowerCase()} as strengths` : ''
    summary = `Of the careers compared, ${best.career} fits you best at ${best.score}% match — ${best.difficulty_label.toLowerCase()} difficulty${clause}.`
  }
  return { summary, recommended: best?.career || null, recommended_id: best?.career_id || null, careers: entries }
}
