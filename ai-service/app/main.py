"""Skill Guide AI service — FastAPI application.

Serves AI/ML endpoints consumed by the Node backend:
  GET  /health
  GET  /ai/careers
  POST /ai/recommend-careers
  POST /ai/skill-gaps
  POST /ai/github/analyze

The service does not handle authentication.
"""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .recommendation.careers import get_all_careers
from .github.analyzer import analyze as analyze_github
from .recommendation.scoring import analyze_skill_gaps, compare_careers, score_careers
from .resume.analyzer import analyze as analyze_resume

app = FastAPI(
    title="Skill Guide AI Service",
    version="0.2.0",
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
    top_n: int | None = Field(default=None, ge=1, le=100)


class ScoreBreakdown(BaseModel):
    skill: float
    interest: float
    education: float
    goal: float
    assessment: float
    experience: float


class SkillGapItem(BaseModel):
    skill: str
    required: int
    current: int
    importance: int


class Recommendation(BaseModel):
    career_id: str
    career: str
    category: str = ""
    description: str = ""
    score: float = Field(ge=0, le=100)
    breakdown: ScoreBreakdown
    reasons: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)
    skill_gap_details: list[SkillGapItem] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    recommendations: list[Recommendation]


class CareerInfo(BaseModel):
    career_id: str
    career: str
    category: str
    description: str


class SkillGapRequest(BaseModel):
    career: str
    skills: list[Skill] = Field(default_factory=list)


class SkillGapSkill(BaseModel):
    skill: str
    required: int
    current: int
    importance: int


class SkillGapResponse(BaseModel):
    career_id: str
    career: str
    category: str = ""
    description: str = ""
    strong: list[SkillGapSkill] = Field(default_factory=list)
    needs_improvement: list[SkillGapSkill] = Field(default_factory=list)


class CompareItem(BaseModel):
    career_id: str
    career: str
    category: str = ""
    description: str = ""
    score: float = Field(ge=0, le=100)
    breakdown: ScoreBreakdown
    reasons: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)
    skill_gap_details: list[SkillGapItem] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    difficulty: int = Field(ge=0, le=100, default=0)
    difficulty_label: str = "Low"
    required_skills_count: int = 0
    assessment_bar: int | None = None
    experience_required: int = 0


class CompareRequest(BaseModel):
    education_level: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    assessment_score: float | None = Field(default=None, ge=0, le=100)
    experience_years: int | None = Field(default=None, ge=0, le=60)
    career_names: list[str] = Field(default_factory=list)


class CompareResponse(BaseModel):
    summary: str
    recommended: str | None = None
    recommended_id: str | None = None
    careers: list[CompareItem]


class RepoInfo(BaseModel):
    name: str
    description: str | None = None
    language: str | None = None
    topics: list[str] = Field(default_factory=list)
    stargazers_count: int | None = None
    forks_count: int | None = None
    size: int | None = None
    fork: bool = False
    created_at: str | None = None
    updated_at: str | None = None
    pushed_at: str | None = None


class GitHubAnalyzeRequest(BaseModel):
    username: str
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    created_at: str | None = None
    repos: list[RepoInfo] = Field(default_factory=list)


class GitHubAnalyzeResponse(BaseModel):
    username: str
    source: str = "full"
    analysis: dict


class ResumeAnalyzeRequest(BaseModel):
    text: str | None = None
    pdf: str | None = None
    file_name: str | None = None


class ResumeAnalyzeResponse(BaseModel):
    file_name: str | None = None
    source: str = "full"
    analysis: dict


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service", "version": app.version}


@app.get("/ai/careers", response_model=list[CareerInfo])
def list_careers():
    """Return the career catalog the AI service scores against."""
    return [
        {
            "career_id": career["id"],
            "career": career["name"],
            "category": career.get("category", ""),
            "description": career.get("description", ""),
        }
        for career in get_all_careers()
    ]


@app.post("/ai/recommend-careers", response_model=RecommendResponse)
def recommend_careers(request: RecommendRequest):
    """Rank the career catalog against the provided profile.

    Uses the hybrid scoring formula from docs/main_architecture.md §23.
    """
    recommendations = score_careers(request.model_dump(), top_n=request.top_n)
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


@app.post("/ai/compare-careers", response_model=CompareResponse)
def career_compare(request: CompareRequest):
    """Compare careers side-by-side for a user profile (docs §23 / PRD §18).

    Accepts the same profile fields as /ai/recommend-careers plus a list of
    career names to compare; when `career_names` is empty every career is scored.
    """
    result = compare_careers(request.model_dump(), request.career_names)
    return result


@app.post("/ai/github/analyze", response_model=GitHubAnalyzeResponse)
def github_analyze(request: GitHubAnalyzeRequest):
    """Turn public GitHub data into a technical profile (docs §28)."""
    analysis = analyze_github(request.model_dump())
    return GitHubAnalyzeResponse(username=request.username, source="full", analysis=analysis)


@app.post("/ai/resume/analyze", response_model=ResumeAnalyzeResponse)
def resume_analyze(request: ResumeAnalyzeRequest):
    """Extract skills, experience, and career matches from a resume (docs §27).

    Accepts either pre-extracted text or base64-encoded PDF bytes.
    """
    analysis = analyze_resume(request.model_dump())
    return ResumeAnalyzeResponse(
        file_name=request.file_name, source="full", analysis=analysis
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)