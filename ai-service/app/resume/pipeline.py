"""Resume LLM pipeline: extraction → analysis → matching → optimization.

Each stage is a thin, separated function. The AI service owns the LLM calls;
scoring is deterministic (see :mod:`app.resume.scoring`).
"""

import logging

from ..ai.client import (
    AIJSONError,
    AIGatewayError,
    complete_json,
)
from .prompts import (
    analysis_messages,
    extraction_messages,
    match_messages,
    optimization_messages,
)
from .schema import empty_resume, normalize_analysis, normalize_match, normalize_resume
from .scoring import build_analysis_result, build_match_result

logger = logging.getLogger(__name__)

EXTRACT_MAX_TOKENS = 4000
ANALYSIS_MAX_TOKENS = 2600
MATCH_MAX_TOKENS = 2600
OPTIMIZE_MAX_TOKENS = 5000


def extract_resume(raw_text):
    """Stage 2 — convert raw resume text into structured Resume JSON.

    An empty resume returns the empty structure without spending an AI call.
    """
    if not raw_text or not raw_text.strip():
        return empty_resume()
    messages = extraction_messages(raw_text)
    return complete_json(
        messages,
        validator=normalize_resume,
        max_tokens=EXTRACT_MAX_TOKENS,
        enable_thinking=False,
    )


def analyze_resume(resume_json, raw_text=None, job_description=None):
    """Stage 3 — semantic analysis + deterministic scoring."""
    messages = analysis_messages(resume_json, raw_text=raw_text, job_description=job_description)
    llm_analysis = complete_json(
        messages,
        validator=normalize_analysis,
        max_tokens=ANALYSIS_MAX_TOKENS,
    )
    return build_analysis_result(resume_json, llm_analysis)


def match_job(resume_json, job_description):
    """Stage 4 — semantic job-description matching."""
    if not job_description or not job_description.strip():
        raise ValueError("A job description is required for matching.")
    messages = match_messages(resume_json, job_description)
    llm_match = complete_json(
        messages,
        validator=normalize_match,
        max_tokens=MATCH_MAX_TOKENS,
    )
    return build_match_result(llm_match)


def optimize_resume(resume_json, analysis_json=None, job_description=None):
    """Stage 5 — improve wording without changing facts."""
    messages = optimization_messages(resume_json, analysis_json, job_description)
    return complete_json(
        messages,
        validator=normalize_resume,
        max_tokens=OPTIMIZE_MAX_TOKENS,
        enable_thinking=False,
    )


__all__ = [
    "AIJSONError",
    "AIGatewayError",
    "analyze_resume",
    "extract_resume",
    "match_job",
    "optimize_resume",
]
