"""Deterministic scoring for resume sections and job matching.

The LLM provides semantic understanding (per-section status + notes, skill
classification with evidence). All numbers below are computed deterministically
from the stored structured data, so scores are consistent, explainable, and
unit-testable. The LLM never produces a raw final score.
"""

from ..ai.client import (
    ANALYSIS_PROMPT_VERSION,
    MATCH_PROMPT_VERSION,
)

# Weights adapted from the product's scoring direction. Sums to 100.
WEIGHTS = {
    "skills": 35,
    "experience": 25,
    "projects": 15,
    "education": 10,
    "contact": 5,
    "summary": 5,
    "ats": 5,
}

STATUS_SCORE = {"complete": 90, "partial": 55, "missing": 10}
MATCH_LEVEL_SCORE = {"strong": 100, "partial": 70, "weak": 35, "none": 10}


def section_score(key, status, analysis):
    """Deterministic per-section score from an LLM-provided status."""
    base = STATUS_SCORE.get(status, STATUS_SCORE["missing"])
    if key == "ats":
        issue_count = len(analysis.get("ats_issues") or [])
        penalty = min(40, 8 * issue_count)
    else:
        penalty = 0
    return max(0, min(100, base - penalty))


def overall_score(section_scores):
    """Weighted overall score from per-section {score, weight} entries."""
    if not section_scores:
        return 0
    total_weight = sum(
        entry.get("weight", 0) for entry in section_scores.values()
    )
    if total_weight <= 0:
        return 0
    weighted = sum(
        entry.get("score", 0) * entry.get("weight", 0)
        for entry in section_scores.values()
    )
    return round(weighted / total_weight)


def build_analysis_result(resume_json, llm_analysis):
    """Combine LLM semantics with deterministic weighting into the final analysis."""
    assessment = llm_analysis.get("section_assessment", {})
    section_scores = {}
    for key, weight in WEIGHTS.items():
        item = assessment.get(key) or {}
        status = item.get("status") or "missing"
        notes = item.get("notes") or []
        section_scores[key] = {
            "score": section_score(key, status, llm_analysis),
            "weight": weight,
            "status": status,
            "reason": notes if notes else [f"The {key} section is {status}."],
        }
    return {
        "overall_score": overall_score(section_scores),
        "weights": WEIGHTS,
        "section_scores": section_scores,
        "strengths": llm_analysis.get("strengths", []),
        "weaknesses": llm_analysis.get("weaknesses", []),
        "missing_sections": llm_analysis.get("missing_sections", []),
        "ats_issues": llm_analysis.get("ats_issues", []),
        "recommendations": llm_analysis.get("recommendations", []),
        "evidence": llm_analysis.get("evidence", []),
        "prompt_version": ANALYSIS_PROMPT_VERSION,
        "source": "llm",
    }


def _skill_ratio(matched, related, missing):
    """Deterministic skill-match ratio.

    Explicitly demonstrated skills count fully, related skills half, missing
    skills nothing — so a candidate is never credited with a technology they
    merely resemble.
    """
    points = len(matched) + 0.5 * len(related)
    total = len(matched) + len(related) + len(missing)
    if total == 0:
        return 100.0
    return min(100.0, (points / total) * 100)


def build_match_result(llm_match):
    """Combine LLM skill classification with deterministic match scoring."""
    matched = llm_match.get("matched_skills", [])
    related = llm_match.get("related_skills", [])
    missing = llm_match.get("missing_skills", [])

    def level_entry(name):
        item = llm_match.get(name) or {}
        level = item.get("level") or "none"
        score = MATCH_LEVEL_SCORE.get(level, MATCH_LEVEL_SCORE["none"])
        return {
            "score": score,
            "level": level,
            "analysis": item.get("analysis"),
        }

    experience = level_entry("experience_match")
    education = level_entry("education_match")
    project = level_entry("project_match")

    skill_score = _skill_ratio(matched, related, missing)
    match_score = round(
        skill_score * 0.60
        + experience["score"] * 0.20
        + education["score"] * 0.10
        + project["score"] * 0.10
    )

    return {
        "match_score": min(100, max(0, match_score)),
        "matched_skills": matched,
        "missing_skills": missing,
        "related_skills": related,
        "experience_match": experience,
        "education_match": education,
        "project_match": project,
        "recommendations": llm_match.get("recommendations", []),
        "evidence": llm_match.get("evidence", []),
        "prompt_version": MATCH_PROMPT_VERSION,
        "source": "llm",
    }
