"""Skill Guide AI service — FastAPI application.

Serves AI/ML endpoints consumed by the Node backend:
  GET  /health
  POST /ai/recommend-careers
  POST /ai/skill-gaps

The service does not handle authentication.
"""

import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .recommendation.scoring import score_careers

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


class Recommendation(BaseModel):
    career: str
    score: float = Field(ge=0, le=100)
    reasons: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]


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


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)