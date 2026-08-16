"""Unit tests for the hybrid scoring and skill-gap engine (docs §23 / §24)."""

from app.recommendation.scoring import (
    WEIGHTS,
    analyze_skill_gaps,
    compare_careers,
    normalize_skill,
    score_careers,
    simulate_what_if,
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


def test_compare_careers_filters_by_name_case_insensitive():
    profile = {
        "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 3}],
        "interests": ["web development"],
        "assessment_score": 70,
        "experience_years": 1,
    }
    result = compare_careers(profile, ["frontend developer", "DATA SCIENTIST"])
    names = [item["career"] for item in result["careers"]]
    assert names == ["Frontend Developer", "Data Scientist"]
    assert result["recommended"] == "Frontend Developer"
    assert result["recommended_id"] == "frontend_developer"


def test_compare_careers_unknown_names_returns_empty():
    result = compare_careers({}, ["Nonexistent Career XYZ"])
    assert result["careers"] == []
    assert result["summary"] == "Select at least one career to compare."
    assert result["recommended"] is None


def test_compare_careers_empty_names_uses_full_catalog():
    result = compare_careers({}, [])
    assert len(result["careers"]) == len(get_all_careers())
    assert result["careers"] == sorted(result["careers"], key=lambda c: c["score"], reverse=True)


def test_compare_careers_entry_has_compare_metadata():
    profile = {
        "skills": [{"name": "javascript", "proficiency": 4}],
        "interests": ["web development"],
    }
    result = compare_careers(profile, ["Frontend Developer"])
    entry = result["careers"][0]
    assert entry["difficulty"] >= 0 and entry["difficulty"] <= 100
    assert entry["difficulty_label"] in {"Low", "Moderate", "High"}
    assert entry["skill_gap_details"]
    assert entry["assessment_bar"] is not None
    assert entry["experience_required"] >= 0
    assert entry["required_skills_count"] >= 1
    assert entry["required_skills_count"] == len(entry["skill_gap_details"]) + len(entry["strengths"])


def test_compare_careers_gap_details_show_progress():
    profile = {
        "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 3}],
    }
    result = compare_careers(profile, ["Frontend Developer"])
    details = result["careers"][0]["skill_gap_details"]
    react = next(item for item in details if item["skill"] == "react")
    assert react["current"] == 3
    assert react["required"] == 4
    assert react["importance"] >= 1
    gap_names = {item["skill"] for item in details}
    assert "javascript" not in gap_names  # met requirement, not a gap


def test_compare_careers_recommended_is_highest_score():
    profile = {
        "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 3}],
        "interests": ["web development"],
    }
    result = compare_careers(profile, ["Frontend Developer", "Backend Developer", "Data Scientist"])
    scores = [item["score"] for item in result["careers"]]
    assert scores == sorted(scores, reverse=True)
    assert any(item["career"] == result["recommended"] and item["score"] == scores[0] for item in result["careers"])


def test_what_if_learning_skill_raises_relevant_career():
    profile = {
        "education_level": "college",
        "skills": [{"name": "python", "proficiency": 2}],
        "interests": [],
        "goals": [],
        "assessment_score": 70,
        "experience_years": 0,
    }
    changes = {"skills": [{"name": "machine learning", "proficiency": 4}]}
    result = simulate_what_if(profile, changes)
    before = {c["career_id"]: c["baseline_score"] for c in result["changes"]}
    after = {c["career_id"]: c["simulated_score"] for c in result["changes"]}
    assert "data_scientist" in before
    assert after["data_scientist"] >= before["data_scientist"]


def test_what_if_does_not_mutate_original_profile():
    profile = {
        "skills": [{"name": "python", "proficiency": 2}],
        "interests": [],
        "goals": [],
    }
    changes = {"skills": [{"name": "python", "proficiency": 5}, {"name": "react", "proficiency": 4}]}
    simulate_what_if(profile, changes)
    assert profile["skills"] == [{"name": "python", "proficiency": 2}]
    assert profile["interests"] == []
    assert profile["goals"] == []


def test_what_if_returns_changes_baseline_and_simulated():
    profile = {
        "skills": [{"name": "javascript", "proficiency": 4}],
        "interests": [],
        "goals": [],
    }
    changes = {"skills": [{"name": "react", "proficiency": 4}]}
    result = simulate_what_if(profile, changes)
    assert len(result["changes"]) == len(get_all_careers())
    assert result["baseline"] and result["simulated"]
    assert len(result["baseline"]) == len(result["simulated"])
    for item in result["changes"]:
        assert 0 <= item["baseline_score"] <= 100
        assert 0 <= item["simulated_score"] <= 100
        assert item["delta"] == round(item["simulated_score"] - item["baseline_score"], 1)


def test_what_if_top_n_limits_each_rank():
    profile = {"skills": [], "interests": [], "goals": []}
    result = simulate_what_if(profile, {}, top_n=5)
    assert len(result["baseline"]) == 5
    assert len(result["simulated"]) == 5
    assert len(result["changes"]) == len(get_all_careers())


def test_what_if_interest_change_reflected():
    profile = {
        "education_level": "college",
        "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 4}],
        "interests": [],
        "goals": [],
        "assessment_score": 90,
        "experience_years": 0,
    }
    before = simulate_what_if(profile, {})
    after = simulate_what_if(profile, {"interests": ["web development"]})
    frontend_after = next(
        c for c in after["changes"] if c["career_id"] == "frontend_developer"
    )
    frontend_before = next(
        c for c in before["changes"] if c["career_id"] == "frontend_developer"
    )
    assert frontend_after["simulated_score"] >= frontend_before["simulated_score"]