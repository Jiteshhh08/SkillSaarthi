"""API tests for the FastAPI AI service (Phase 4 — AI)."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_careers_catalog():
    res = client.get("/ai/careers")
    assert res.status_code == 200
    body = res.json()
    assert isinstance(body, list)
    assert len(body) >= 10
    for career in body:
        assert career["career_id"]
        assert career["career"]


def test_recommend_careers_ranks_and_explains():
    payload = {
        "education_level": "college",
        "skills": [
            {"name": "javascript", "proficiency": 4},
            {"name": "react", "proficiency": 4},
            {"name": "node.js", "proficiency": 3},
        ],
        "interests": ["web development"],
        "goals": ["software engineering job"],
        "assessment_score": 72,
        "experience_years": 0,
        "top_n": 5,
    }
    res = client.post("/ai/recommend-careers", json=payload)
    assert res.status_code == 200
    recommendations = res.json()["recommendations"]
    assert len(recommendations) == 5
    scores = [rec["score"] for rec in recommendations]
    assert scores == sorted(scores, reverse=True)
    first = recommendations[0]
    for key in ("career_id", "career", "breakdown", "reasons", "next_steps"):
        assert key in first


def test_recommend_careers_validation():
    res = client.post("/ai/recommend-careers", json={"skills": [{"name": "react", "proficiency": 9}]})
    assert res.status_code == 422


def test_skill_gaps_ok():
    res = client.post(
        "/ai/skill-gaps",
        json={
            "career": "Frontend Developer",
            "skills": [{"name": "javascript", "proficiency": 4}, {"name": "react", "proficiency": 1}],
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["career"] == "Frontend Developer"
    assert body["strong"] and body["needs_improvement"]


def test_skill_gaps_unknown_career_404():
    res = client.post("/ai/skill-gaps", json={"career": "Hologram Astronaut", "skills": []})
    assert res.status_code == 404