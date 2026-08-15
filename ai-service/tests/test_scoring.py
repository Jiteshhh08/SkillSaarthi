"""Unit tests for the hybrid scoring and skill-gap engine (docs §23 / §24)."""

from app.recommendation.scoring import (
    WEIGHTS,
    analyze_skill_gaps,
    normalize_skill,
    score_careers,
)
from app.recommendation.careers import get_all_careers

FRONTEND = {
    "id": "frontend",
    "name": "Frontend Developer",
    "category": "Engineering",
    "description": "Builds UIs",
    "skills": {
        "javascript": {"required": 4, "importance": 5},
        "react": {"required": 3, "importance": 5},
        "html/css": {"required": 3, "importance": 4},
    },
    "interests": ["web development"],
    "education_levels": ["high_school", "college", "job_seeker"],
    "goals": ["frontend developer"],
    "assessment": 65,
    "experience": None,
}


def test_normalize_skill_alias():
    assert normalize_skill("JS") == "javascript"
    assert normalize_skill("  React.JS ") == "react"
    assert normalize_skill("Git") == "git & github"


def test_weights_sum_to_one():
    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


def test_score_is_bounded_and_sorted():
    profile = {
        "education_level": "college",
        "skills": [{"name": "javascript", "proficiency": 5}],
        "interests": [],
        "goals": [],
        "assessment_score": 90,
        "experience_years": 0,
    }
    results = score_careers(profile, careers=[FRONTEND])
    assert len(results) == 1
    rec = results[0]
    assert 0 <= rec["score"] <= 100
    for key in ("skill", "interest", "education", "goal", "assessment", "experience"):
        assert key in rec["breakdown"]
    assert rec["career_id"] == "frontend"


def test_perfect_profile_scores_high():
    profile = {
        "education_level": "college",
        "skills": [
            {"name": "javascript", "proficiency": 4},
            {"name": "react", "proficiency": 4},
            {"name": "html", "proficiency": 4},
        ],
        "interests": ["web development"],
        "goals": ["frontend developer"],
        "assessment_score": 90,
        "experience_years": 0,
    }
    rec = score_careers(profile, careers=[FRONTEND])[0]
    assert rec["score"] >= 90
    assert rec["strengths"] == ["javascript", "react", "html/css"]
    assert rec["next_steps"] == []


def test_weak_profile_produces_next_steps():
    profile = {
        "education_level": "college",
        "skills": [{"name": "react", "proficiency": 1}],
        "interests": [],
        "goals": [],
        "assessment_score": None,
        "experience_years": None,
    }
    rec = score_careers(profile, careers=[FRONTEND])[0]
    assert rec["score"] < 50
    assert any("Learn javascript" in step for step in rec["next_steps"])
    assert rec["skill_gaps"]  # non-empty


def test_top_n_truncates_and_sorts():
    profile = {
        "education_level": "college",
        "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 4}],
        "interests": ["web development"],
        "goals": [],
        "assessment_score": 70,
        "experience_years": 0,
    }
    ranked = score_careers(profile, top_n=3)
    assert len(ranked) == 3
    scores = [rec["score"] for rec in ranked]
    assert scores == sorted(scores, reverse=True)


def test_catalog_has_expected_careers():
    catalog = get_all_careers()
    names = {c["name"] for c in catalog}
    assert len(catalog) == 13
    assert {"Full Stack Developer", "Data Scientist", "AI Engineer"} <= names


def test_skill_gaps_classification_is_self_consistent():
    result = analyze_skill_gaps(
        "Frontend Developer",
        [
            {"name": "javascript", "proficiency": 4},
            {"name": "react", "proficiency": 2},
            {"name": "html", "proficiency": 4},
        ],
    )
    assert result["career"] == "Frontend Developer"
    assert result["strong"] and result["needs_improvement"]
    for item in result["strong"]:
        assert item["current"] >= item["required"]
    for item in result["needs_improvement"]:
        assert item["current"] < item["required"]


def test_skill_gaps_unknown_career_returns_none():
    assert analyze_skill_gaps("Hologram Astronaut", []) is None