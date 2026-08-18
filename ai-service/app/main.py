"""skillsaarthi AI service — FastAPI application.

Serves AI/ML endpoints consumed by the Node backend:
  GET  /health
  GET  /ai/careers
  POST /ai/recommend-careers
  POST /ai/skill-gaps
  POST /ai/compare-careers
  POST /ai/github/analyze
  POST /ai/resume/analyze-legacy   (rule-based analyzer, kept for compatibility)
  POST /ai/resume/extract          (LLM extraction -> structured Resume JSON)
  POST /ai/resume/analyze          (LLM semantic analysis + deterministic scoring)
  POST /ai/resume/match            (LLM job-description matching)
  POST /ai/resume/optimize         (LLM wording optimization)
  POST /ai/resume/generate         (Jake LaTeX render + optional PDF compile)

The service does not handle authentication.
"""

import base64
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .recommendation.careers import get_all_careers
from .github.analyzer import analyze as analyze_github
from .recommendation.scoring import (
    analyze_skill_gaps,
    compare_careers,
    score_careers,
    simulate_what_if,
)
from .resume.analyzer import analyze as analyze_resume_legacy
from .ai.client import (
    AIConfigurationError,
    AIGatewayError,
    AIJSONError,
    AIResponseError,
    AIUnavailableError,
    ANALYSIS_PROMPT_VERSION,
    EXTRACTION_PROMPT_VERSION,
    MATCH_PROMPT_VERSION,
    OPTIMIZATION_PROMPT_VERSION,
)
from .resume.ingest import detect_kind, extract_raw_text
from .resume.pipeline import (
    analyze_resume as ai_analyze_resume,
    extract_resume,
    match_job,
    optimize_resume,
)
from .resume.latex.renderer import RENDERER_VERSION, render_resume
from .resume.latex.compile import compile_pdf

app = FastAPI(
    title="skillsaarthi AI Service",
    version="0.2.0",
    description="AI/ML layer: skill matching, recommendation, and skill-gap analysis.",
)


@app.exception_handler(AIGatewayError)
async def ai_gateway_error_handler(request: Request, exc: AIGatewayError):
    """Map gateway failures to controlled HTTP errors for the Node backend."""
    if isinstance(exc, AIConfigurationError):
        status = 503
    elif isinstance(exc, AIUnavailableError):
        status = 503
    elif isinstance(exc, AIResponseError):
        status = exc.status or 502
    elif isinstance(exc, AIJSONError):
        status = 502
    else:
        status = 500
    return JSONResponse(
        status_code=status,
        content={"success": False, "code": exc.code, "message": str(exc)},
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


class WhatIfSkillChange(BaseModel):
    name: str
    proficiency: int = Field(ge=0, le=5, default=1)


class WhatIfChange(BaseModel):
    skills: list[WhatIfSkillChange] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)


class WhatIfRequest(BaseModel):
    education_level: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    assessment_score: float | None = Field(default=None, ge=0, le=100)
    experience_years: int | None = Field(default=None, ge=0, le=60)
    top_n: int | None = Field(default=None, ge=1, le=100)
    changes: WhatIfChange = Field(default_factory=WhatIfChange)


class WhatIfScoreChange(BaseModel):
    career_id: str
    career: str
    category: str = ""
    baseline_score: float = Field(ge=0, le=100)
    simulated_score: float = Field(ge=0, le=100)
    delta: float


class WhatIfResponse(BaseModel):
    summary: str
    changes: list[WhatIfScoreChange] = Field(default_factory=list)
    baseline: list[Recommendation] = Field(default_factory=list)
    simulated: list[Recommendation] = Field(default_factory=list)


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


class ResumeExtractRequest(BaseModel):
    text: str | None = None
    pdf: str | None = None
    file_name: str | None = None
    mime_type: str | None = None


class ResumeExtractResponse(BaseModel):
    file_name: str | None = None
    source_type: str
    raw_text: str
    resume_json: dict
    prompt_version: str


class ResumeAnalyzeLLMRequest(BaseModel):
    resume_json: dict
    raw_text: str | None = None
    job_description: str | None = None


class ResumeAnalyzeLLMResponse(BaseModel):
    analysis: dict


class ResumeMatchRequest(BaseModel):
    resume_json: dict
    job_description: str = Field(min_length=1)


class ResumeMatchResponse(BaseModel):
    job_match: dict


class ResumeOptimizeRequest(BaseModel):
    resume_json: dict
    analysis: dict | None = None
    job_description: str | None = None


class ResumeOptimizeResponse(BaseModel):
    optimized_resume_json: dict
    prompt_version: str


class ResumeGenerateRequest(BaseModel):
    resume_json: dict
    compile_pdf: bool = True


class ResumeGenerateResponse(BaseModel):
    latex: str
    renderer_version: str
    compiled: bool
    compiler: str | None = None
    error: str | None = None
    log: str | None = None
    pdf_base64: str | None = None


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


@app.post("/ai/what-if/simulate", response_model=WhatIfResponse)
def what_if_simulate(request: WhatIfRequest):
    """Simulate hypothetical profile changes (docs/main_architecture.md §26).

    Reuses the same hybrid scoring engine as recommendations and returns a
    full catalog ranking for the current profile (baseline) plus a simulated
    profile ranking, with per-career score deltas and a plain-language summary.
    The real profile is never modified — changes stay in memory.
    """
    payload = dict(request.model_dump())
    result = simulate_what_if(
        payload,
        changes=payload.get("changes"),
        top_n=payload.get("top_n"),
    )
    return result


@app.post("/ai/github/analyze", response_model=GitHubAnalyzeResponse)
def github_analyze(request: GitHubAnalyzeRequest):
    """Turn public GitHub data into a technical profile (docs §28)."""
    analysis = analyze_github(request.model_dump())
    return GitHubAnalyzeResponse(username=request.username, source="full", analysis=analysis)


@app.post("/ai/resume/analyze-legacy", response_model=ResumeAnalyzeResponse)
def resume_analyze_legacy(request: ResumeAnalyzeRequest):
    """Legacy rule-based resume read (docs §27).

    Kept for compatibility with the older Node flow. The LLM pipeline is the
    primary resume intelligence; this deterministic path only backs the old
    endpoint and is reported as `source: "legacy"`.
    """
    analysis = analyze_resume_legacy(request.model_dump())
    return ResumeAnalyzeResponse(
        file_name=request.file_name, source="legacy", analysis=analysis
    )


@app.post("/ai/resume/extract", response_model=ResumeExtractResponse)
def resume_extract(request: ResumeExtractRequest):
    """Ingest a resume and convert it into structured Resume JSON (LLM).

    Accepts pre-extracted text or base64-encoded PDF/DOCX bytes. Returns the
    source type, the raw text, and the structured Resume JSON.
    """
    raw = request.text if request.text is not None else ""
    if request.text is not None:
        source_type = "text"
    else:
        data = None
        if request.pdf:
            try:
                data = base64.b64decode(request.pdf)
            except Exception as error:  # noqa: BLE001
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded resume bytes were not valid base64.",
                ) from error
        raw = extract_raw_text(data=data, text=None, mime_type=request.mime_type)
        source_type = detect_kind(data or b"", request.mime_type)

    resume = extract_resume(raw)
    return ResumeExtractResponse(
        file_name=request.file_name,
        source_type=source_type,
        raw_text=raw,
        resume_json=resume,
        prompt_version=EXTRACTION_PROMPT_VERSION,
    )


@app.post("/ai/resume/analyze", response_model=ResumeAnalyzeLLMResponse)
def resume_analyze_llm(request: ResumeAnalyzeLLMRequest):
    """Semantic resume analysis + deterministic component scoring."""
    analysis = ai_analyze_resume(
        request.resume_json,
        raw_text=request.raw_text,
        job_description=request.job_description,
    )
    return ResumeAnalyzeLLMResponse(analysis=analysis)


@app.post("/ai/resume/match", response_model=ResumeMatchResponse)
def resume_match(request: ResumeMatchRequest):
    """Semantic job-description matching against the structured resume."""
    job_match = match_job(request.resume_json, request.job_description)
    return ResumeMatchResponse(job_match=job_match)


@app.post("/ai/resume/optimize", response_model=ResumeOptimizeResponse)
def resume_optimize(request: ResumeOptimizeRequest):
    """Improve resume wording without inventing facts."""
    optimized = optimize_resume(
        request.resume_json,
        analysis_json=request.analysis,
        job_description=request.job_description,
    )
    return ResumeOptimizeResponse(
        optimized_resume_json=optimized,
        prompt_version=OPTIMIZATION_PROMPT_VERSION,
    )


@app.post("/ai/resume/generate", response_model=ResumeGenerateResponse)
def resume_generate(request: ResumeGenerateRequest):
    """Render structured Resume JSON into Jake-style LaTeX (deterministic).

    Optional server-side PDF compilation; when no LaTeX compiler is available
    the endpoint still returns the .tex source with `compiled: false`.
    """
    latex = render_resume(request.resume_json)
    result = {
        "latex": latex,
        "renderer_version": RENDERER_VERSION,
        "compiled": False,
        "compiler": None,
        "error": None,
        "log": None,
        "pdf_base64": None,
    }
    if request.compile_pdf:
        compiled = compile_pdf(latex)
        result["compiled"] = compiled["ok"]
        result["compiler"] = compiled["compiler"]
        result["log"] = compiled.get("log")
        if compiled["ok"]:
            result["pdf_base64"] = base64.b64encode(compiled["pdf_bytes"]).decode("ascii")
        else:
            result["error"] = compiled["error"]
            result["log"] = compiled.get("log")
    return ResumeGenerateResponse(**result)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)