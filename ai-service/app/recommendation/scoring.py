"""Hybrid career scoring and skill-gap analysis.

Implements docs/main_architecture.md §23:

    Career Score =
        Skill Match       × 0.40
      + Interest Match    × 0.20
      + Assessment Match  × 0.15
      + Education Match   × 0.10
      + Goal Match        × 0.10
      + Experience Match  × 0.05

Skill matching is importance-weighted: skills with higher importance for a
career contribute more to the match score. Each recommendation also returns
human-readable explanations (reasons), current strengths, and next steps, so
the product can show the user *why* a career matches and *what to learn next*
(docs/PRD.md §14).
"""

import re

from .careers import get_all_careers, get_career

WEIGHTS = {
    "skill": 0.40,
    "interest": 0.20,
    "assessment": 0.15,
    "education": 0.10,
    "goal": 0.10,
    "experience": 0.05,
}

_WHITESPACE_RE = re.compile(r"\s+")
# Common word adjustments so "JavaScript" and "JS", "Node.js" and "NodeJS",
# "React" and "React.js" still match against the curated dataset.
_ALIASES = {
    "js": "javascript",
    "reactjs": "react",
    "react.js": "react",
    "nodejs": "node.js",
    "expressjs": "express",
    "html": "html/css",
    "css": "html/css",
    "github": "git & github",
    "git": "git & github",
    "restapi": "rest apis",
    "rest": "rest apis",
    "data science": "data scientist",
    "ai": "artificial intelligence",
}


def normalize_skill(name):
    """Normalize a skill name for case/whitespace-insensitive matching."""
    if not name:
        return ""
    key = _WHITESPACE_RE.sub(" ", str(name).strip().lower())
    return _ALIASES.get(key, key)


def _user_skill_map(user_skills):
    return {normalize_skill(s.get("name", "")): int(s.get("proficiency", 0)) for s in user_skills}


def _educations_match(user_education, allowed):
    """True when the user education level is acceptable for a career."""
    if not allowed:
        return True
    if not user_education:
        return False
    return user_education in allowed


def _skill_match(user_skills, required):
    """Importance-weighted skill match (0-100).

    Each required skill contributes min(user, required)/required weighted by its
    importance. Skills the user has not listed count as proficiency 0.
    """
    if not required:
        return 0
    total_weight = 0
    weighted_score = 0
    for name, meta in required.items():
        req_level = int(meta.get("required", 1))
        importance = int(meta.get("importance", 1))
        user_level = user_skills.get(normalize_skill(name), 0)
        total_weight += importance
        weighted_score += importance * (min(user_level, req_level) / req_level)
    return ((weighted_score / total_weight) * 100) if total_weight else 0


def _interest_match(user_interests, interests):
    if not interests:
        return 0
    user_set = {str(i).lower() for i in user_interests}
    if not user_set:
        return 0
    matched = sum(1 for i in interests if str(i).lower() in user_set)
    return (matched / len(interests)) * 100


def _education_match(user_education, allowed):
    return 100 if _educations_match(user_education, allowed) else 0


def _goal_match(user_goals, goals):
    if not goals:
        return 0
    user_set = {str(g).lower() for g in user_goals}
    if not user_set:
        return 0
    matched = sum(1 for g in goals if str(g).lower() in user_set)
    return (matched / len(goals)) * 100


def _assessment_match(user_score, required_score):
    """Match against the minimum assessment score a career expects (0-100)."""
    if required_score is None:
        return 100
    if user_score is None:
        return 0
    return min(100, (user_score / required_score) * 100)


def _experience_match(user_years, required_years):
    """Match against the minimum years of experience a career expects."""
    if not required_years:
        return 100
    if user_years is None:
        return 0
    return min(100, (user_years / required_years) * 100)


def _skill_gap_details(user_skills, required):
    """Return ordered gap details for every required skill.

    Each item: {skill, required, current, importance}.
    """
    details = []
    for name, meta in required.items():
        req_level = int(meta.get("required", 1))
        importance = int(meta.get("importance", 1))
        current = user_skills.get(normalize_skill(name), 0)
        details.append(
            {
                "skill": name,
                "required": req_level,
                "current": current,
                "importance": importance,
            }
        )
    return sorted(details, key=lambda item: item["importance"], reverse=True)


def _reasons(career, user_skills, user_interests, user_education, user_goals, user_score, user_years):
    """Build human-readable, explainable reasons (docs/PRD.md §14 / docs §23)."""
    reasons = []
    skills = career.get("skills", {})
    for name, meta in skills.items():
        req_level = int(meta.get("required", 1))
        current = user_skills.get(normalize_skill(name), 0)
        if current >= req_level:
            reasons.append(f"Strong {name} skills ({current}/{req_level})")
    for interest in career.get("interests", []):
        if str(interest).lower() in {str(i).lower() for i in user_interests}:
            reasons.append(f"Interest in {interest}")
    if _educations_match(user_education, career.get("education_levels")):
        reasons.append("Education level is a good fit")

    goal_hits = [
        g for g in career.get("goals", []) if str(g).lower() in {str(x).lower() for x in user_goals}
    ]
    for goal in goal_hits:
        reasons.append(f"Goal aligned: {goal}")

    if career.get("assessment") is not None and user_score is not None:
        if user_score >= career["assessment"]:
            reasons.append(f"Strong assessment score ({user_score}/{career['assessment']})")
        else:
            reasons.append(f"Assessment score below career bar ({user_score}/{career['assessment']})")
    if career.get("experience") and user_years is not None:
        if user_years >= career["experience"]:
            reasons.append(f"Experience requirement met ({user_years} yrs)")
        else:
            reasons.append(f"More experience helps ({user_years}/{career['experience']} yrs)")
    return reasons


def _strengths(user_skills, required):
    """Names of skills the user already meets for a career."""
    return [
        name
        for name, meta in required.items()
        if user_skills.get(normalize_skill(name), 0) >= int(meta.get("required", 1))
    ]


def _next_steps(user_skills, required):
    """Ordered next steps for the biggest gaps (docs/PRD.md §14)."""
    steps = []
    for item in _skill_gap_details(user_skills, required):
        if item["current"] < item["required"]:
            verb = "Learn" if item["current"] == 0 else "Strengthen"
            steps.append(f"{verb} {item['skill']} (level {item['current']} → {item['required']})")
    return steps


def _score_career(career, profile):
    user_skills = _user_skill_map(profile.get("skills", []))
    user_interests = profile.get("interests", [])
    user_goals = profile.get("goals", [])
    user_education = profile.get("education_level")
    user_assessment = profile.get("assessment_score")
    user_experience = profile.get("experience_years")

    required = career.get("skills", {})

    skill_score = _skill_match(user_skills, required)
    interest_score = _interest_match(user_interests, career.get("interests", []))
    education_score = _education_match(user_education, career.get("education_levels"))
    goal_score = _goal_match(user_goals, career.get("goals", []))
    assessment_score = _assessment_match(user_assessment, career.get("assessment"))
    experience_score = _experience_match(user_experience, career.get("experience"))

    breakdown = {
        "skill": round(skill_score, 1),
        "interest": round(interest_score, 1),
        "education": round(education_score, 1),
        "goal": round(goal_score, 1),
        "assessment": round(assessment_score, 1),
        "experience": round(experience_score, 1),
    }

    score = min(
        100,
        round(
            skill_score * WEIGHTS["skill"]
            + interest_score * WEIGHTS["interest"]
            + assessment_score * WEIGHTS["assessment"]
            + education_score * WEIGHTS["education"]
            + goal_score * WEIGHTS["goal"]
            + experience_score * WEIGHTS["experience"]
        ),
    )

    gaps = _skill_gap_details(user_skills, required)

    return {
        "career_id": career["id"],
        "career": career["name"],
        "category": career.get("category", ""),
        "description": career.get("description", ""),
        "score": score,
        "breakdown": breakdown,
        "reasons": _reasons(
            career,
            user_skills,
            user_interests,
            user_education,
            user_goals,
            user_assessment,
            user_experience,
        ),
        "strengths": _strengths(user_skills, required),
        "skill_gaps": sorted(
            [item["skill"] for item in gaps if item["current"] < item["required"]],
            key=lambda name: next(
                (g["importance"] for g in gaps if g["skill"] == name), 0
            ),
            reverse=True,
        ),
        "skill_gap_details": gaps,
        "next_steps": _next_steps(user_skills, required),
    }


def score_careers(profile, careers=None, top_n=None):
    """Rank a career set against a profile dict.

    `careers` defaults to the built-in catalog. Results are sorted by score desc
    and truncated to `top_n` when provided.
    """
    catalog = careers if careers is not None else get_all_careers()
    recommendations = [_score_career(career, profile) for career in catalog]
    recommendations.sort(key=lambda item: item["score"], reverse=True)
    if top_n is not None:
        recommendations = recommendations[: int(top_n)]
    return recommendations


def analyze_skill_gaps(career_name, skills):
    """Skill-gap analysis for a single career (docs §24).

    Returns a dict with the career name plus "strong" and "needs_improvement"
    skill lists, or None when the career is unknown.
    """
    career = get_career(career_name)
    if career is None:
        return None

    user_skills = _user_skill_map(skills)
    required = career.get("skills", {})
    details = _skill_gap_details(user_skills, required)

    strong = []
    needs_improvement = []
    for item in details:
        entry = {
            "skill": item["skill"],
            "required": item["required"],
            "current": item["current"],
            "importance": item["importance"],
        }
        if item["current"] >= item["required"]:
            strong.append(entry)
        else:
            needs_improvement.append(entry)

    return {
        "career_id": career["id"],
        "career": career["name"],
        "category": career.get("category", ""),
        "description": career.get("description", ""),
        "strong": strong,
        "needs_improvement": needs_improvement,
    }


def _career_difficulty(career):
    """Estimate a career's difficulty from its skill expectations.

    0-100 scale: higher means more demanding (higher required proficiency,
    stricter education bar, and years of experience expected).
    """
    required = career.get("skills", {})
    if not required:
        return 0
    avg_level = sum(int(meta.get("required", 1)) for meta in required.values()) / len(required)
    difficulty = (avg_level / 5) * 70
    if career.get("assessment"):
        difficulty += 10
    if career.get("experience"):
        difficulty += 20
    return min(100, round(difficulty))


def _difficulty_label(difficulty):
    if difficulty >= 75:
        return "High"
    if difficulty >= 45:
        return "Moderate"
    return "Low"


def compare_careers(profile, career_names=None, careers=None):
    """Compare two or more careers side-by-side for a single user profile.

    Scores each career with the same hybrid formula as recommendations, then
    adds compare-focused metadata: difficulty, the skills the user already has
    vs. each career, and a recommended "best pick" for the user.

    `career_names` filters the catalog by name (case-insensitive); when omitted
    (or empty) every catalog career is included. `careers` overrides the catalog
    (used by tests / callers with a subset).
    """
    catalog = careers if careers is not None else get_all_careers()
    if career_names:
        wanted = {_WHITESPACE_RE.sub(" ", str(name).strip().lower()) for name in career_names}
        catalog = [
            career
            for career in catalog
            if _WHITESPACE_RE.sub(" ", str(career["name"]).lower()) in wanted
        ]

    user_skills = _user_skill_map(profile.get("skills", []))

    entries = []
    for career in catalog:
        scored = _score_career(career, profile)
        required = career.get("skills", {})
        user_has = [
            {
                "skill": name,
                "required": int(meta.get("required", 1)),
                "current": user_skills.get(normalize_skill(name), 0),
                "importance": int(meta.get("importance", 1)),
            }
            for name, meta in required.items()
        ]
        gaps = sorted(
            (item for item in user_has if item["current"] < item["required"]),
            key=lambda item: item["importance"],
            reverse=True,
        )
        difficulty = _career_difficulty(career)
        entries.append(
            {
                "career_id": career["id"],
                "career": career["name"],
                "category": career.get("category", ""),
                "description": career.get("description", ""),
                "score": scored["score"],
                "breakdown": scored["breakdown"],
                "reasons": scored["reasons"],
                "strengths": scored["strengths"],
                "skill_gaps": scored["skill_gaps"],
                "skill_gap_details": gaps,
                "next_steps": scored["next_steps"],
                "difficulty": difficulty,
                "difficulty_label": _difficulty_label(difficulty),
                "required_skills_count": len(required),
                "assessment_bar": career.get("assessment"),
                "experience_required": career.get("experience", 0),
            }
        )

    entries.sort(key=lambda item: item["score"], reverse=True)

    best = entries[0] if entries else None
    if best:
        strengths = best.get("strengths", [])
        strength_clause = (
            f", with {', '.join(strengths[:2]).lower()} as strengths"
            if strengths
            else ""
        )
        summary = (
            f"Of the careers compared, {best['career']} fits you best at {best['score']}% "
            f"match — {best['difficulty_label'].lower()} difficulty{strength_clause}."
        )
    else:
        summary = "Select at least one career to compare."

    return {
        "summary": summary,
        "recommended": best["career"] if best else None,
        "recommended_id": best["career_id"] if best else None,
        "careers": entries,
    }