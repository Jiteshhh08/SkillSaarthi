"""Skill Guide AI service — FastAPI application.

Serves AI/ML endpoints consumed by the Node backend:
  GET  /health
  POST /ai/recommend-careers
  POST /ai/skill-gaps

The service does not handle authentication.
"""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .recommendation.scoring import analyze_skill_gaps, score_careers

app = FastAPI(
    title="Skill Guide AI Service",
    version="0.1.0",
    description="AI/ML layer: skill matching, recommendation, and skill-gap analysis.",
)


class Skill(BaseModel):
    name: str
    proficiency: int = Field(ge=0, le=5, default=1)


class RecommendRequest(BaseModel):
    education_level: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    assessment_score: float | None = Field(default=None, ge=0, le=100)
    experience_years: int | None = Field(default=None, ge=0, le=60)


class Recommendation(BaseModel):
    career_id: str
    career: str
    score: float = Field(ge=0, le=100)
    reasons: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]


class SkillGapRequest(BaseModel):
    career: str
    skills: list[Skill] = Field(default_factory=list)


class SkillGapSkill(BaseModel):
    skill: str
    required: int
    current: int


class SkillGapResponse(BaseModel):
    career_id: str
    career: str
    strong: list[SkillGapSkill] = Field(default_factory=list)
    needs_improvement: list[SkillGapSkill] = Field(default_factory=list)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service", "version": app.version}


@app.post("/ai/recommend-careers", response_model=RecommendResponse)
def recommend_careers(request: RecommendRequest):
    """Rank a small built-in career set against the provided profile.

    Uses the hybrid scoring formula from docs/main_architecture.md §23.
    """
    recommendations = score_careers(request.model_dump())
    return RecommendResponse(recommendations=recommendations)


@app.post("/ai/skill-gaps", response_model=SkillGapResponse)
def skill_gaps(request: SkillGapRequest):
    """Analyze the gap between a user's skills and one career's requirements.

    Mirrors docs/main_architecture.md §24 (Strong vs Needs Improvement).
    """
    result = analyze_skill_gaps(request.career, request.model_dump().get("skills", []))
    if result is None:
        raise HTTPException(status_code=404, detail="Unknown career")
    return result


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
