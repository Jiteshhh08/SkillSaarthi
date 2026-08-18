"""Versioned prompt builders for the resume LLM pipeline.

Every prompt enforces the "never invent facts" contract and demands a single
predictable JSON object so the backend can validate instead of guessing.
Prompt versions are exported from ``app/ai/client`` so stored results stay
interpretable across deployments.
"""

import json

from ..ai.client import (
    ANALYSIS_PROMPT_VERSION,
    EXTRACTION_PROMPT_VERSION,
    MATCH_PROMPT_VERSION,
    OPTIMIZATION_PROMPT_VERSION,
)

FACTS_RULES = (
    "STRICT RULES — follow every one of these:\n"
    "1. Only use information that actually appears in the supplied content.\n"
    "2. NEVER invent facts: no fake companies, job titles, dates, technologies,\n"
    "   metrics, achievements, certifications, education, projects, URLs, or contact details.\n"
    "3. If something is missing, use null (personal fields / summary) or an empty\n"
    "   array (education, experience, projects, skills, certifications, achievements).\n"
    "4. Never upgrade weak claims into unsupported strong claims. If the source says\n"
    "   \"improved system performance\", do NOT write \"improved performance by 40%\".\n"
    "5. Preserve the original wording for text you copy from the resume.\n"
    "6. If you are uncertain, prefer a null/empty value over a guess.\n"
    "7. Return ONLY a single valid JSON object matching the requested schema exactly —\n"
    "   no commentary, no markdown code fences.\n"
)

RESUME_JSON_SCHEMA = """{
  "personal": {
    "name": string|null, "title": string|null, "email": string|null,
    "phone": string|null, "location": string|null, "linkedin": string|null,
    "github": string|null, "portfolio": string|null
  },
  "summary": string|null,
  "education": [{"institution": string, "degree": string, "field": string,
    "location": string, "start_date": string, "end_date": string, "gpa": string,
    "bullets": [string]}],
  "experience": [{"company": string, "title": string, "location": string,
    "start_date": string, "end_date": string, "technologies": [string],
    "bullets": [string]}],
  "projects": [{"name": string, "link": string, "description": string,
    "technologies": [string], "bullets": [string]}],
  "skills": {
    "languages": [{"name": string, "evidence": string|null}],
    "frameworks": [{"name": string, "evidence": string|null}],
    "libraries": [{"name": string, "evidence": string|null}],
    "databases": [{"name": string, "evidence": string|null}],
    "tools": [{"name": string, "evidence": string|null}],
    "cloud": [{"name": string, "evidence": string|null}],
    "other": [{"name": string, "evidence": string|null}]
  },
  "certifications": [{"name": string, "issuer": string, "date": string}],
  "achievements": [string],
  "coursework": [string],
  "extracurriculars": [string]
}"""

ANALYSIS_SCHEMA = """{
  "section_assessment": {
    "contact":  {"status": "complete"|"partial"|"missing", "notes": [string]},
    "summary":  {"status": "complete"|"partial"|"missing", "notes": [string]},
    "education": {"status": "complete"|"partial"|"missing", "notes": [string]},
    "experience": {"status": "complete"|"partial"|"missing", "notes": [string]},
    "projects": {"status": "complete"|"partial"|"missing", "notes": [string]},
    "skills":  {"status": "complete"|"partial"|"missing", "notes": [string]},
    "ats":     {"status": "complete"|"partial"|"missing", "notes": [string]}
  },
  "strengths": [string],
  "weaknesses": [string],
  "missing_sections": [string],
  "ats_issues": [string],
  "recommendations": [string],
  "evidence": [string]
}"""

MATCH_SCHEMA = """{
  "matched_skills": [{"name": string, "evidence": string}],
  "missing_skills": [{"name": string, "why": string}],
  "related_skills": [{"name": string, "how": string}],
  "experience_match": {"level": "strong"|"partial"|"weak"|"none", "analysis": string},
  "education_match": {"level": "strong"|"partial"|"weak"|"none", "analysis": string},
  "project_match": {"level": "strong"|"partial"|"weak"|"none", "analysis": string},
  "recommendations": [string],
  "evidence": [string]
}"""


def _system(schema, version, extra=""):
    return (
        f"You are an expert resume analyst. Return ONLY a single valid JSON object "
        f"conforming exactly to this schema:\n{schema}\n\n"
        f"prompt_version={version}\n\n"
        f"{FACTS_RULES}{extra}"
    )


def extraction_messages(raw_text):
    system = _system(
        RESUME_JSON_SCHEMA,
        EXTRACTION_PROMPT_VERSION,
        extra=(
            "Extract information from the resume text exactly as written. "
            "For every extracted skill include an 'evidence' field quoting the "
            "resume text that supports it (or null if the skill appears only in "
            "a plain skills list).\n"
        ),
    )
    user = (
        "Here is the raw resume text:\n\n"
        f"{raw_text or ''}\n\n"
        "Return the structured resume JSON object."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def analysis_messages(resume_json, raw_text=None, job_description=None):
    context = f"STRUCTURED RESUME JSON (source of truth):\n{json.dumps(resume_json, ensure_ascii=False)}\n"
    if raw_text:
        context += f"\nRAW RESUME TEXT (trimmed, for reference):\n{raw_text[:6000]}\n"
    if job_description:
        context += f"\nOPTIONAL JOB DESCRIPTION:\n{job_description}\n"
    system = _system(
        ANALYSIS_SCHEMA,
        ANALYSIS_PROMPT_VERSION,
        extra=(
            "Assess each resume section. 'complete' = present and reasonably filled, "
            "'partial' = present but thin or could be stronger, 'missing' = absent. "
            "For 'ats', evaluate common ATS heuristics (clear section headings, "
            "standard sections, keyword alignment, formatting, dates) — present these "
            "as heuristics/recommendations, never as a guarantee about any specific ATS. "
            "Do not invent facts in notes, strengths, weaknesses, or recommendations.\n"
        ),
    )
    user = (
        f"Analyze this resume.\n{context}\n\n"
        "Return the analysis JSON object."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def match_messages(resume_json, job_description):
    system = _system(
        MATCH_SCHEMA,
        MATCH_PROMPT_VERSION,
        extra=(
            "Compare the resume against the job description semantically, not by "
            "exact string matching. Distinguish:\n"
            "  - matched_skills: explicitly demonstrated or mentioned in the resume.\n"
            "  - missing_skills: required by the job but absent from the resume.\n"
            "  - related_skills: adjacent/similar to what the job needs but not the "
            "  exact technology (do NOT claim the candidate has a technology that is "
            "  merely semantically related).\n"
            "experience_match/education_match/project_match use the level scale "
            "strong|partial|weak|none based only on what the resume shows.\n"
        ),
    )
    user = (
        "JOB DESCRIPTION:\n"
        f"{job_description or ''}\n\n"
        "RESUME JSON:\n"
        f"{json.dumps(resume_json, ensure_ascii=False)}\n\n"
        "Return the job-match JSON object."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


def optimization_messages(resume_json, analysis_json=None, job_description=None):
    context = (
        "ORIGINAL RESUME JSON (preserve every fact verbatim — dates, company names, "
        "degrees, institutions, GPA, certifications, project names, URLs):\n"
        f"{json.dumps(resume_json, ensure_ascii=False)}\n"
    )
    if analysis_json:
        context += (
            "\nANALYSIS (use its recommendations to guide improvements, but never "
            "add facts it does not back up):\n"
            f"{json.dumps(analysis_json, ensure_ascii=False)}\n"
        )
    if job_description:
        context += f"\nTARGET JOB DESCRIPTION (align wording/keywords without inventing facts):\n{job_description}\n"
    system = _system(
        RESUME_JSON_SCHEMA,
        OPTIMIZATION_PROMPT_VERSION,
        extra=(
            "Rewrite the resume for quality: improve wording, clarity, conciseness, "
            "action-oriented language, bullet quality, and keyword relevance. "
            "NEVER change factual information. NEVER add technologies, metrics, "
            "companies, titles, or achievements that are not already in the resume. "
            "For example, 'Worked on backend APIs' may become 'Developed backend "
            "APIs using FastAPI' ONLY IF FastAPI appears in the original resume.\n"
        ),
    )
    user = (
        f"Produce an optimized version of this resume.\n{context}\n\n"
        "Return the improved resume JSON object using the same schema."
    )
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]
