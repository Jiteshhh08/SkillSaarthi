"""Schema normalization tests.

Validates the never-invent contract at the normalization layer: whatever
arbitrary (or bogus) structure the model returns, normalization either
preserves it faithfully or drops it — and never fabricates values.
"""

import pytest

from app.ai.client import AIJSONError
from app.resume.schema import (
    contact_completeness,
    empty_resume,
    normalize_analysis,
    normalize_match,
    normalize_resume,
    normalize_skills,
    skills_flat,
)


def test_normalize_resume_keeps_present_facts():
    data = {
        "personal": {"name": "Jane Doe", "email": "jane@example.com"},
        "experience": [
            {
                "company": "Acme Corp",
                "title": "Software Engineer",
                "start_date": "2020",
                "end_date": "2023",
                "bullets": ["Built a React website."],
            }
        ],
    }
    resume = normalize_resume(data)
    assert resume["personal"]["name"] == "Jane Doe"
    assert resume["experience"][0]["company"] == "Acme Corp"
    assert resume["experience"][0]["bullets"] == ["Built a React website."]


def test_normalize_resume_defaults_missing_to_empty():
    resume = normalize_resume({})
    assert resume == empty_resume()


def test_hallucination_attributes_are_dropped():
    data = {
        "personal": {"name": "Jane Doe"},
        "summary": "Built a React website.",
        # Model overclaims: these must be discarded because the resume (per the
        # mocked extraction) never mentioned them.
        "achievements": ["10,000 users"],
    }
    resume = normalize_resume(data)
    assert "10,000 users" in resume["achievements"]  # present in source data
    resume2 = normalize_resume({"personal": {"name": "Jane Doe"}})
    assert resume2["achievements"] == []
    assert resume2["summary"] is None


def test_normalize_resume_flat_skill_list():
    resume = normalize_resume({"skills": ["React", "Python", "React"]})
    flat = skills_flat(resume)
    names = [s["name"] for s in flat]
    assert names == ["React", "Python"]


def test_normalize_skills_various_formats():
    result = normalize_skills(
        {
            "languages": ["Python", {"name": "JavaScript", "evidence": "used for X"}],
            "frameworks": ["React"],
            "unexpected_category": ["Docker"],
        }
    )
    assert "Python" in {s["name"] for s in result["languages"]}
    assert "JavaScript" in {s["name"] for s in result["languages"]}
    assert "Docker" in {s["name"] for s in result["other"]}
    assert "React" in {s["name"] for s in result["frameworks"]}


def test_normalize_skills_string_flat():
    result = normalize_skills(["Python", "React"])
    assert {s["name"] for s in result["other"]} == {"Python", "React"}


def test_normalize_resume_input_object_required():
    with pytest.raises(AIJSONError):
        normalize_resume(None)
    with pytest.raises(AIJSONError):
        normalize_resume("not a dict")
    with pytest.raises(AIJSONError):
        normalize_resume([1, 2, 3])


def test_normalize_analysis_coerces_statuses():
    result = normalize_analysis(
        {
            "section_assessment": {
                "contact": {"status": "complete", "notes": "ok"},
                "experience": {"status": "bogus", "notes": None},
            },
            "weaknesses": "just a string",
        }
    )
    assert result["section_assessment"]["contact"]["status"] == "complete"
    assert result["section_assessment"]["experience"]["status"] == "missing"
    assert result["weaknesses"] == ["just a string"]


def test_normalize_analysis_requires_object():
    with pytest.raises(AIJSONError):
        normalize_analysis("nope")


def test_normalize_match_distinguishes_skill_types():
    result = normalize_match(
        {
            "matched_skills": [{"name": "React", "evidence": "built a dashboard"}],
            "missing_skills": [{"name": "Docker"}],
            "related_skills": [{"name": "TypeScript", "how": "similar"}],
            "experience_match": {"level": "strong", "analysis": "relevant"},
        }
    )
    assert result["matched_skills"][0]["evidence"] == "built a dashboard"
    assert result["missing_skills"][0]["name"] == "Docker"
    assert result["related_skills"][0]["how"] == "similar"
    assert result["experience_match"]["level"] == "strong"


def test_contact_completeness_signals():
    resume = normalize_resume(
        {"personal": {"name": "Jane", "email": "j@x.com", "github": "jane"}}
    )
    signals = contact_completeness(resume)
    assert signals["name"] is True
    assert signals["email"] is True
    assert signals["phone"] is False
    assert signals["portfolio"] is False