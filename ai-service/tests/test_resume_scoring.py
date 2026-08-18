"""Deterministic scoring tests: explainable, stable numbers from LLM semantics."""

from app.resume.scoring import (
    WEIGHTS,
    build_analysis_result,
    build_match_result,
    overall_score,
    section_score,
)
from tests.fixtures import llm_analysis, llm_match, minimal_resume


def test_weights_sum_to_100():
    assert sum(WEIGHTS.values()) == 100


def test_analysis_scores_are_deterministic_given_ai_input():
    first = build_analysis_result(minimal_resume(), llm_analysis())
    second = build_analysis_result(minimal_resume(), llm_analysis())
    assert first == second


def test_analysis_overall_and_components():
    result = build_analysis_result(minimal_resume(), llm_analysis())
    assert 0 <= result["overall_score"] <= 100

    assessment = llm_analysis()["section_assessment"]
    expected = {}
    total_weight = 0
    weighted = 0
    for key, weight in WEIGHTS.items():
        status = assessment[key]["status"]
        score = section_score(key, status, llm_analysis())
        expected[key] = score
        weighted += score * weight
        total_weight += weight
    assert result["section_scores"]["skills"]["score"] == section_score(
        "skills", "complete", llm_analysis()
    )
    assert result["overall_score"] == round(weighted / total_weight)


def test_ats_issues_reduce_ats_score():
    clean = llm_analysis()
    issue_free = {**clean, "ats_issues": []}
    with_issues = {**clean, "ats_issues": ["a", "b", "c", "d"]}
    assert (
        section_score("ats", "complete", with_issues)
        < section_score("ats", "complete", issue_free)
    )


def test_missing_status_scores_low():
    assert section_score("skills", "missing", {}) == 10
    assert section_score("skills", "complete", {}) == 90


def test_match_scores_are_deterministic():
    result = build_match_result(llm_match())
    assert 0 <= result["match_score"] <= 100
    names = {s["name"] for s in result["matched_skills"]}
    assert names == {"React", "JavaScript"}
    missing = {s["name"] for s in result["missing_skills"]}
    assert "Docker" in missing


def test_match_related_not_counted_as_demonstrated():
    match = build_match_result(llm_match())
    assert "TypeScript" in {s["name"] for s in match["related_skills"]}
    assert "TypeScript" not in {s["name"] for s in match["matched_skills"]}


def test_match_level_mapping():
    assert build_match_result(llm_match())["experience_match"]["score"] == 100
    assert build_match_result(llm_match())["education_match"]["score"] == 100
    assert build_match_result(llm_match())["project_match"]["score"] == 70  # partial


def test_overall_score_empty():
    assert overall_score({}) == 0