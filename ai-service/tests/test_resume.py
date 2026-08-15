"""Tests for the resume analyzer (Phase 6 — Resume Analysis)."""

from fastapi.testclient import TestClient

from app.main import app
from app.resume.analyzer import (
    analyze,
    career_matches,
    detect_education,
    detect_experience_years,
    detect_skills,
    densify_text,
    extract_text,
)

client = TestClient(app)

RESUME_TEXT = """
Frontend Developer
jane.doe@example.com

Professional Experience
2020 - 2023  Acme Corp
Software Engineer focused on web development.

Skills
- JavaScript, TypeScript, React, HTML, CSS
- Node.js, Express, SQL, REST APIs
- Git & GitHub, Docker

Projects
- Built a React dashboard for analytics
- Created a REST API using Node.js and Express

Education
B.Tech in Computer Science
"""


def test_detect_skills_finds_present_and_drops_absent():
    skills = detect_skills(RESUME_TEXT)
    names = {s["skill"].lower() for s in skills}
    assert "react" in names
    assert "javascript" in names
    assert "node.js" in names
    # Skills that never appear must not be detected.
    assert "kubernetes" not in names


def test_detect_skills_empty_text():
    assert detect_skills("") == []


def test_detect_experience_years_from_range():
    assert detect_experience_years(RESUME_TEXT) == 3


def test_detect_experience_years_explicit():
    assert detect_experience_years("5 years of professional experience") == 5


def test_detect_experience_years_none():
    assert detect_experience_years("no dates here") == 0


def test_detect_education():
    assert detect_education(RESUME_TEXT) == "bachelor's degree"
    assert detect_education("Just a list of skills, no school") == "not specified"


def test_career_matches_ranks_and_caps():
    matches = career_matches(detect_skills(RESUME_TEXT))
    assert isinstance(matches, list)
    assert len(matches) <= 4
    confidences = [m["confidence"] for m in matches]
    assert confidences == sorted(confidences, reverse=True)
    for m in matches:
        assert m["career"]
        assert m["reasons"]
        assert m["skill_gaps"]


def test_analyze_full_shape():
    result = analyze({"text": RESUME_TEXT, "file_name": "resume.pdf"})
    for key in (
        "summary",
        "skills",
        "experience_years",
        "projects",
        "education",
        "contact",
        "strengths",
        "areas_to_improve",
        "career_matches",
    ):
        assert key in result
    assert result["education"] == "bachelor's degree"
    assert result["experience_years"] == 3
    assert result["contact"]["email"] == "jane.doe@example.com"


def test_analyze_empty_resume():
    result = analyze({"text": ""})
    assert result["skills"] == []
    assert result["career_matches"] == []
    assert "couldn't detect" in result["summary"].lower()


def test_extract_text_prefers_provided():
    assert extract_text(b"NON-PDF", "hello text") == "hello text"


def test_extract_text_garbage_bytes_ok():
    assert extract_text(b"\x00\x01\x02 not a pdf") == ""


def test_api_resume_analyze_text():
    res = client.post(
        "/ai/resume/analyze",
        json={"text": RESUME_TEXT, "file_name": "jane.pdf"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "full"
    assert body["file_name"] == "jane.pdf"
    assert body["analysis"]["experience_years"] == 3
    assert body["analysis"]["skills"]
    assert body["analysis"]["career_matches"]


def test_api_resume_analyze_empty():
    res = client.post("/ai/resume/analyze", json={"text": ""})
    assert res.status_code == 200
    assert res.json()["analysis"]["skills"] == []


def test_densify_text_reconstructs_letter_spaced_words():
    spaced = "J a v a S c r i p t  d e v e l o p e r  w i t h  3  y e a r s"
    dense = densify_text(spaced)
    assert "javascript" in dense.lower()
    assert "developer" in dense.lower()


def test_densify_text_merges_spaced_email():
    spaced = "j i t e s h . j h a 2 0 0 8 @ g m a i l . c o m"
    dense = densify_text(spaced)
    assert "jitesh.jha2008@gmail.com" in dense


def test_densify_text_leaves_normal_text_alone():
    normal = "JavaScript developer with 3 years of experience"
    assert densify_text(normal) == normal


def test_densify_text_does_not_touch_short_or_unspaced():
    assert densify_text("") == ""
    assert densify_text("hi") == "hi"


def test_letter_spaced_pdf_analyzes_via_extract_text():
    # Simulate the letter-spaced extraction the analyzer now densifies
    # (real resumes preserve 2+ space word separators alongside per-glyph
    # single spaces), and confirm skills survive.
    spaced = "R e a c t  d e v e l o p e r  i n  J a v a S c r i p t  w i t h  2  y e a r s"
    skills = detect_skills(densify_text(spaced))
    names = {s["skill"].lower() for s in skills}
    assert "react" in names
    assert "javascript" in names
