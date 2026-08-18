"""Pipeline tests with a mocked AI service.

The LLM is mocked (``complete_json`` returns canned structured data) so the
tests are deterministic and offline. They exercise ingestion → extraction →
analysis → match → optimize → LaTeX and the HTTP endpoints.
"""

import base64

from fastapi.testclient import TestClient

import app.main as main_module
from app.main import app
from app.resume.pipeline import analyze_resume, extract_resume, match_job, optimize_resume
from app.resume.prompts import extraction_messages
from app.resume.schema import skills_flat
from tests.fixtures import llm_analysis, llm_match, minimal_resume, sample_resume

client = TestClient(app)


# ---------------------------------------------------------------- extraction


def test_extract_empty_text_returns_empty_without_ai(monkeypatch):
    def boom(*args, **kwargs):
        raise AssertionError("AI must not be called for empty resumes")

    monkeypatch.setattr("app.resume.pipeline.complete_json", boom)
    resume = extract_resume("   ")
    assert resume["personal"]["name"] is None
    assert resume["skills"] == {
        k: [] for k in ("languages", "frameworks", "libraries", "databases", "tools", "cloud", "other")
    }


def _fake_complete(canned):
    """Return a complete_json stub that runs the validator like the client does."""

    def fake(messages, **kwargs):
        validator = kwargs.get("validator")
        return validator(canned) if validator else canned

    return fake


def test_extract_normalizes_ai_output(monkeypatch):
    canned = {"personal": {"name": "Jane Doe"}, "skills": ["React", "Python"]}
    monkeypatch.setattr("app.resume.pipeline.complete_json", _fake_complete(canned))
    resume = extract_resume("some raw resume text")
    assert resume["personal"]["name"] == "Jane Doe"
    names = {s["name"] for s in skills_flat(resume)}
    assert names == {"React", "Python"}


def test_hallucination_prevention_pipeline(monkeypatch):
    """The pipeline must not add facts the resume never contained."""
    canned = {
        "personal": {"name": "Jane"},
        "summary": "Built a React website.",
        "experience": [{"company": "Acme", "title": "Developer", "bullets": ["Built a React website."]}],
        "skills": ["React"],
    }

    monkeypatch.setattr("app.resume.pipeline.complete_json", _fake_complete(canned))
    resume = extract_resume("Built a React website.")
    blob = str(resume).lower()
    assert "react" in blob
    # Never present in the source -> must not appear.
    assert "aws" not in blob
    assert "docker" not in blob
    assert "10,000" not in blob
    assert "30%" not in blob
    assert resume["experience"][0]["bullets"] == ["Built a React website."]


def test_extraction_prompt_forbids_invention():
    text = "\n".join(m["content"] for m in extraction_messages("sample"))
    assert "NEVER invent" in text
    assert "empty" in text
    assert "evidence" in text


# ---------------------------------------------------------------- analysis


def test_analysis_builds_explainable_scores(monkeypatch):
    monkeypatch.setattr("app.resume.pipeline.complete_json", lambda m, **k: llm_analysis())
    result = analyze_resume(sample_resume())
    assert "overall_score" in result
    assert "section_scores" in result
    for key, entry in result["section_scores"].items():
        assert "score" in entry
        assert "reason" in entry
    assert result["source"] == "llm"


# ---------------------------------------------------------------- matching


def test_match_distinguishes_skill_types(monkeypatch):
    monkeypatch.setattr("app.resume.pipeline.complete_json", lambda m, **k: llm_match())
    result = match_job(sample_resume(), "Backend developer job description")
    matched = {s["name"] for s in result["matched_skills"]}
    missing = {s["name"] for s in result["missing_skills"]}
    related = {s["name"] for s in result["related_skills"]}
    assert "React" in matched
    assert "Docker" in missing
    assert "TypeScript" in related
    assert result["match_score"] >= 0


# ---------------------------------------------------------------- optimize


def test_optimize_preserves_facts(monkeypatch):
    canned = dict(sample_resume())
    canned["experience"][0]["bullets"] = [
        "Developed backend APIs using React and Node.js."
    ]

    def fake(messages, **kwargs):
        return canned

    monkeypatch.setattr("app.resume.pipeline.complete_json", fake)
    optimized = optimize_resume(sample_resume(), llm_analysis())
    assert optimized["personal"]["name"] == "Jane Doe"
    assert optimized["experience"][0]["company"] == "Acme Corp"
    assert optimized["experience"][0]["start_date"] == "2020"
    assert "React" in optimized["experience"][0]["bullets"][0]


# ---------------------------------------------------------------- HTTP API


def test_api_extract_with_text(monkeypatch):
    def fake_extract(raw):
        assert "raw resume" in raw
        return sample_resume()

    monkeypatch.setattr(main_module, "extract_resume", fake_extract)
    res = client.post(
        "/ai/resume/extract",
        json={"text": "raw resume text here", "file_name": "jane.pdf"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["source_type"] == "text"
    assert body["resume_json"]["personal"]["name"] == "Jane Doe"
    assert body["prompt_version"]


def test_api_extract_empty(monkeypatch):
    monkeypatch.setattr(main_module, "extract_resume", lambda raw: minimal_resume())
    res = client.post("/ai/resume/extract", json={"text": ""})
    assert res.status_code == 200
    assert res.json()["source_type"] == "text"


def test_api_analyze(monkeypatch):
    monkeypatch.setattr(main_module, "ai_analyze_resume", lambda *a, **k: {"overall_score": 80, "section_scores": {}})
    res = client.post(
        "/ai/resume/analyze",
        json={"resume_json": sample_resume()},
    )
    assert res.status_code == 200
    assert res.json()["analysis"]["overall_score"] == 80


def test_api_match(monkeypatch):
    monkeypatch.setattr(main_module, "match_job", lambda *a, **k: {"match_score": 75})
    res = client.post(
        "/ai/resume/match",
        json={"resume_json": sample_resume(), "job_description": "a job"},
    )
    assert res.status_code == 200
    assert res.json()["job_match"]["match_score"] == 75


def test_api_match_requires_job_description():
    res = client.post("/ai/resume/match", json={"resume_json": sample_resume()})
    assert res.status_code == 422


def test_api_optimize(monkeypatch):
    monkeypatch.setattr(main_module, "optimize_resume", lambda *a, **k: sample_resume())
    res = client.post(
        "/ai/resume/optimize",
        json={"resume_json": sample_resume()},
    )
    assert res.status_code == 200
    assert res.json()["optimized_resume_json"]["personal"]["name"] == "Jane Doe"


def test_api_generate_returns_latex(monkeypatch):
    monkeypatch.setattr(main_module, "compile_pdf", lambda tex: {"ok": False, "error": "no compiler", "compiler": None, "log": ""})
    res = client.post(
        "/ai/resume/generate",
        json={"resume_json": sample_resume(), "compile_pdf": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert "\\documentclass" in body["latex"]
    assert body["compiled"] is False
    assert "compiler" in body


def test_api_extract_bad_base64():
    res = client.post("/ai/resume/extract", json={"pdf": "not base64!!", "file_name": "x.pdf"})
    assert res.status_code == 400


def test_api_extract_invalid_pdf_returns_empty_resume(monkeypatch):
    monkeypatch.setattr(main_module, "extract_resume", lambda raw: minimal_resume())
    res = client.post(
        "/ai/resume/extract",
        json={"pdf": base64.b64encode(b"garbage bytes").decode(), "file_name": "x.pdf", "mime_type": "application/pdf"},
    )
    assert res.status_code == 200
    assert res.json()["source_type"] == "pdf"
