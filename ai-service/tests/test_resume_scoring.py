"""Deterministic scoring tests: explainable, stable numbers from LLM semantics."""

from app.resume.scoring import (
    WEIGHTS,
    ats_checklist,
    ats_issues,
    ats_score,
    build_analysis_result,
    build_match_result,
    overall_score,
    section_score,
)
from tests.fixtures import llm_analysis, llm_match, minimal_resume, sample_resume, strong_resume


def test_weights_sum_to_100():
    assert sum(WEIGHTS.values()) == 100


def test_analysis_scores_are_deterministic_given_ai_input():
    first = build_analysis_result(sample_resume(), llm_analysis())
    second = build_analysis_result(sample_resume(), llm_analysis())
    assert first == second


def test_analysis_overall_and_components():
    result = build_analysis_result(sample_resume(), llm_analysis())
    assert 0 <= result["overall_score"] <= 100

    assessment = llm_analysis()["section_assessment"]
    scores = {}
    for key, weight in WEIGHTS.items():
        if key == "ats":
            scores[key] = ats_score(sample_resume())
        else:
            status = assessment[key]["status"]
            scores[key] = section_score(key, status)
    assert result["section_scores"]["skills"]["score"] == section_score("skills", "complete")
    weighted = sum(scores[k] * WEIGHTS[k] for k in WEIGHTS)
    assert result["overall_score"] == round(weighted / sum(WEIGHTS.values()))


def test_ats_score_is_content_derived_not_llm_judged():
    """GS: ATS must come from resume content, not LLM ats_issues."""
    clean = llm_analysis()
    with_issues = {**clean, "ats_issues": ["a", "b", "c", "d"]}
    assert ats_score(sample_resume()) == ats_score(sample_resume())
    result_with = build_analysis_result(sample_resume(), with_issues)
    result_clean = build_analysis_result(sample_resume(), clean)
    assert result_with["section_scores"]["ats"]["score"] == result_clean["section_scores"]["ats"]["score"]


def test_ats_strong_resume_scores_high():
    score = ats_score(strong_resume())
    assert score >= 75


def test_ats_minimal_resume_scores_low():
    assert ats_score(minimal_resume()) < 40


def test_ats_good_resume_beats_minimal():
    assert ats_score(strong_resume()) > ats_score(minimal_resume())


def test_ats_checklist_weights_sum_to_100():
    assert sum(c["max"] for c in ats_checklist(strong_resume())) == 100


def test_ats_checklist_exposes_failed_checks():
    checks = ats_checklist(minimal_resume())
    failed = [c for c in checks if c["earned"] < c["max"]]
    assert failed, "A minimal resume should fail multiple ATS checks"
    assert all(c["max"] > 0 for c in checks)
    assert all(0 <= c["earned"] <= c["max"] for c in checks)


def test_ats_adds_points_for_real_content():
    base = minimal_resume()
    step1 = {**base, "summary": "A clear professional summary describing the candidate."}
    assert ats_score(step1) > ats_score(base)
    step2 = {
        **step1,
        "experience": [
            {
                "company": "Acme",
                "title": "Developer",
                "start_date": "2020",
                "end_date": "2023",
                "bullets": ["Built a dashboard that reduced load time by 40%."],
                "technologies": ["React"],
            }
        ],
    }
    assert ats_score(step2) > ats_score(step1)


def test_ats_reason_reflects_content_not_llm():
    result = build_analysis_result(minimal_resume(), llm_analysis())
    ats_entry = result["section_scores"]["ats"]
    assert ats_entry["status"] == "missing"
    assert any("phone" in r.lower() for r in ats_entry["reason"])


def test_ats_detects_misspellings_chronology_and_buzzwords():
    resume = sample_resume()
    resume["summary"] = "Hardworking and detail-oriented developer with good experiance."
    resume["experience"][0]["start_date"] = "2023"
    resume["experience"][0]["end_date"] = "2020"
    issues = ats_issues(resume)
    joined = "\n".join(issues).lower()
    assert "experiance" in joined
    assert "hardworking" in joined
    assert "chronological" in joined
    assert any(c["earned"] < c["max"] for c in ats_checklist(resume) if "spelling" in c["label"] or "buzzword" in c["label"])


def test_ats_punishes_duplicated_content():
    resume = sample_resume()
    resume["experience"][0]["bullets"] = ["Built a React dashboard.", "Built a React dashboard."]
    assert ats_score(resume) < ats_score(sample_resume())


def test_ats_scores_stay_in_expected_range():
    for fixture in (minimal_resume, sample_resume, strong_resume):
        score = ats_score(fixture())
        assert 0 <= score <= 100


def test_missing_status_scores_low():
    assert section_score("skills", "missing") == 10
    assert section_score("skills", "complete") == 90


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