"""skillsaarthi AI service — FastAPI application.

Serves resume intelligence (LLM) — extract, analyze, match, optimize, generate.

Endpoints:
  GET  /health
  POST /ai/resume/extract
  POST /ai/resume/analyze
  POST /ai/resume/match
  POST /ai/resume/optimize
  POST /ai/resume/generate

The service does not handle authentication.
"""

import base64
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

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
    chat as ai_chat,
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
    description="Resume intelligence (LLM) — extract, analyze, match, optimize, generate.",
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


@app.post("/ai/resume/extract", response_model=ResumeExtractResponse)
def resume_extract(request: ResumeExtractRequest):
    """Ingest a resume and convert it into structured Resume JSON (LLM)."""
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
    """Render structured Resume JSON into Jake-style LaTeX (deterministic)."""
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


class AssistantChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    profile: dict | None = None
    history: list | None = None


class AssistantChatResponse(BaseModel):
    reply: str
    model: str


@app.post("/ai/assistant/chat", response_model=AssistantChatResponse)
def assistant_chat(request: AssistantChatRequest):
    from .assistant.prompts import build_assistant_messages
    from .ai.client import AI_MODEL

    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")
    messages = build_assistant_messages(request.profile or {}, request.history or [], request.message.strip())
    try:
        reply = ai_chat(messages, temperature=0.6, max_tokens=1200)
    except Exception as exc:  # handled by ai_gateway_error_handler if AIGatewayError
        if isinstance(exc, (AIConfigurationError, AIGatewayError, AIJSONError, AIResponseError, AIUnavailableError)):
            raise
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return AssistantChatResponse(reply=reply, model=AI_MODEL)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
