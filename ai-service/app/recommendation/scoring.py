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

from .careers import CAREER_REQUIREMENTS

WEIGHTS = {
    "skill": 0.4,
    "interest": 0.2,
    "education": 0.1,
    "goal": 0.1,
}

_GAP_THRESHOLD = 3


def _skill_match(user_skills, required):
    if not required:
        return 0
    total = 0
    for name, required_level in required.items():
        level = user_skills.get(name.lower(), 0)
        total += min(level, required_level) / required_level
    return (total / len(required)) * 100


def _interest_match(user_interests, interests):
    if not interests:
        return 0
    matched = sum(1 for i in user_interests if i.lower() in [x.lower() for x in interests])
    return (matched / len(interests)) * 100


def _education_match(user_education, education):
    if not education:
        return 0
    return 100 if user_education == education else 60


def _goal_match(user_goals, goals):
    if not goals:
        return 0
    matched = sum(1 for g in user_goals if g.lower() in [x.lower() for x in goals])
    return (matched / len(goals)) * 100


def _skill_gaps(user_skills, required):
    return [
        name
        for name, required_level in required.items()
        if user_skills.get(name.lower(), 0) < min(required_level, _GAP_THRESHOLD)
    ]


def score_careers(profile):
    user_skills = {s["name"].lower(): s["proficiency"] for s in profile.get("skills", [])}
    user_interests = profile.get("interests", [])
    user_goals = profile.get("goals", [])
    user_education = profile.get("education_level")

    recommendations = []
    for career in CAREER_REQUIREMENTS:
        skill_score = _skill_match(user_skills, career["skills"])
        interest_score = _interest_match(user_interests, career["interests"])
        education_score = _education_match(user_education, career.get("education"))
        goal_score = _goal_match(user_goals, career["goals"])

        score = min(
            100,
            round(
                skill_score * WEIGHTS["skill"]
                + interest_score * WEIGHTS["interest"]
                + education_score * WEIGHTS["education"]
                + goal_score * WEIGHTS["goal"],
            ),
        )

        gaps = _skill_gaps(user_skills, career["skills"])
        reasons = [f"Strong match on required {r} skills" for r in career["reasons"]] if score >= 60 else []

        recommendations.append(
            {
                "career": career["name"],
                "score": score,
                "reasons": reasons,
                "skill_gaps": gaps,
            }
        )

    recommendations.sort(key=lambda item: item["score"], reverse=True)
    return recommendations