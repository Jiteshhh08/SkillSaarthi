"""Hybrid career scoring.

Mirrors docs/main_architecture.md §23:

    Career Score =
        Skill Match       × 0.40
      + Interest Match    × 0.20
      + Assessment Match  × 0.15
      + Education Match   × 0.10
      + Goal Match        × 0.10
      + Experience Match  × 0.05

Weights are configurable and used for the built-in demo dataset until the
full career catalog is available from Appwrite.
"""

import re

from .careers import CAREER_REQUIREMENTS, get_career

WEIGHTS = {
    "skill": 0.40,
    "interest": 0.20,
    "assessment": 0.15,
    "education": 0.10,
    "goal": 0.10,
    "experience": 0.05,
}

_WHITESPACE_RE = re.compile(r"\s+")


def normalize_skill(name):
    """Normalize a skill name for case/whitespace-insensitive matching."""
    if not name:
        return ""
    return _WHITESPACE_RE.sub(" ", str(name).strip().lower())


def _skill_match(user_skills, required):
    if not required:
        return 0
    total = 0
    for name, required_level in required.items():
        level = user_skills.get(normalize_skill(name), 0)
        total += min(level, required_level) / required_level
    return (total / len(required)) * 100


def _interest_match(user_interests, interests):
    if not interests:
        return 0
    user_set = {str(i).lower() for i in user_interests}
    matched = sum(1 for i in interests if str(i).lower() in user_set)
    return (matched / len(interests)) * 100


def _education_match(user_education, education):
    if not education:
        return 100
    if not user_education:
        return 0
    return 100 if user_education == education else 0


def _goal_match(user_goals, goals):
    if not goals:
        return 0
    user_set = {str(g).lower() for g in user_goals}
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


def _skill_gaps(user_skills, required):
    """Return the names of skills the user has not yet met (per §24)."""
    return [
        name
        for name, required_level in required.items()
        if user_skills.get(normalize_skill(name), 0) < required_level
    ]


def _reasons(career, user_skills, user_interests, user_education, user_goals, user_score, user_years):
    """Build human-readable reasons from the profile data actually matched."""
    reasons = []
    for name, required_level in career["skills"].items():
        level = user_skills.get(normalize_skill(name), 0)
        if level >= required_level:
            reasons.append(f"Strong {name} skills ({level}/{required_level})")
    for interest in career["interests"]:
        if str(interest).lower() in {str(i).lower() for i in user_interests}:
            reasons.append(f"Interest in {interest}")
    if career.get("education") and user_education == career["education"]:
        reasons.append("Education level matches this career")
    for goal in career["goals"]:
        if str(goal).lower() in {str(g).lower() for g in user_goals}:
            reasons.append(f"Goal aligned: {goal}")
    if career.get("assessment") and user_score is not None and user_score >= career["assessment"]:
        reasons.append(f"Assessment score meets the bar ({user_score}/{career['assessment']})")
    if career.get("experience") and user_years is not None and user_years >= career["experience"]:
        reasons.append(f"Experience requirement met ({user_years} yrs)")
    return reasons


def _score_career(career, profile):
    user_skills = {
        normalize_skill(s["name"]): s["proficiency"] for s in profile.get("skills", [])
    }
    user_interests = profile.get("interests", [])
    user_goals = profile.get("goals", [])
    user_education = profile.get("education_level")
    user_assessment = profile.get("assessment_score")
    user_experience = profile.get("experience_years")

    skill_score = _skill_match(user_skills, career["skills"])
    interest_score = _interest_match(user_interests, career["interests"])
    education_score = _education_match(user_education, career.get("education"))
    goal_score = _goal_match(user_goals, career["goals"])
    assessment_score = _assessment_match(user_assessment, career.get("assessment"))
    experience_score = _experience_match(user_experience, career.get("experience"))

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

    return {
        "career_id": career["id"],
        "career": career["name"],
        "score": score,
        "reasons": _reasons(
            career,
            user_skills,
            user_interests,
            user_education,
            user_goals,
            user_assessment,
            user_experience,
        ),
        "skill_gaps": _skill_gaps(user_skills, career["skills"]),
    }


def score_careers(profile):
    """Rank the built-in career set against a profile dict."""
    recommendations = [_score_career(career, profile) for career in CAREER_REQUIREMENTS]
    recommendations.sort(key=lambda item: item["score"], reverse=True)
    return recommendations


def analyze_skill_gaps(career_name, skills):
    """Skill-gap analysis for a single career (docs §24).

    Returns a dict with the career name plus "strong" and "needs_improvement"
    skill lists, or None when the career is unknown.
    """
    career = get_career(career_name)
    if career is None:
        return None

    user_skills = {normalize_skill(s["name"]): s["proficiency"] for s in skills}

    strong = []
    needs_improvement = []
    for name, required_level in career["skills"].items():
        level = user_skills.get(normalize_skill(name), 0)
        if level >= required_level:
            strong.append({"skill": name, "required": required_level, "current": level})
        else:
            needs_improvement.append({"skill": name, "required": required_level, "current": level})

    return {
        "career_id": career["id"],
        "career": career["name"],
        "strong": strong,
        "needs_improvement": needs_improvement,
    }
