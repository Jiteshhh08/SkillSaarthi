"""Structured resume schema, normalization, and validation.

The structured Resume JSON is the single source of truth for the whole
pipeline (analysis → matching → optimization → LaTeX). Every stage validates
and normalizes against these helpers so malformed AI output never silently
corrupts downstream stages.
"""

from ..ai.client import AIJSONError, AIGatewayError, AIResponseError

SKILL_CATEGORIES = [
    "languages",
    "frameworks",
    "libraries",
    "databases",
    "tools",
    "cloud",
    "other",
]

SECTION_KEYS = ["contact", "summary", "education", "experience", "projects", "skills", "ats"]
SECTION_STATUSES = {"complete", "partial", "missing"}

MAX_TEXT = 4000
MAX_BULLET = 800
MAX_LIST = 200


def empty_resume():
    return {
        "personal": {
            "name": None,
            "title": None,
            "email": None,
            "phone": None,
            "location": None,
            "linkedin": None,
            "github": None,
            "portfolio": None,
        },
        "summary": None,
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {category: [] for category in SKILL_CATEGORIES},
        "certifications": [],
        "achievements": [],
        "coursework": [],
        "extracurriculars": [],
    }


def _clean_text(value, max_len=MAX_TEXT):
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)
    value = value.strip()
    if not value:
        return None
    return value[:max_len]


def _list_of_strings(value, max_len=MAX_BULLET, limit=MAX_LIST):
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    cleaned = []
    for item in value:
        if isinstance(item, dict):
            item = item.get("text") or item.get("name") or item.get("title") or ""
        text = _clean_text(item, max_len)
        if text and text not in cleaned:
            cleaned.append(text)
        if len(cleaned) >= limit:
            break
    return cleaned


def _get(obj, *keys, default=None):
    if not isinstance(obj, dict):
        return default
    for key in keys:
        if isinstance(obj, dict) and key in obj and obj[key] is not None:
            return obj[key]
    return default


def _clean_object(item, allowed, limits=None):
    """Return a dict keeping only allowed keys, values text-cleaned."""
    limits = limits or {}
    if not isinstance(item, dict):
        return None
    cleaned = {}
    for key in allowed:
        value = item.get(key)
        if isinstance(value, str):
            value = _clean_text(value, limits.get(key, MAX_TEXT))
        elif isinstance(value, list):
            value = _list_of_strings(value, limits.get(key, MAX_BULLET))
        if value not in (None, [], ""):
            cleaned[key] = value
    return cleaned or None


def normalize_skill_item(item):
    if isinstance(item, str):
        name = _clean_text(item, 200)
        if not name:
            return None
        return {"name": name, "evidence": None}
    if isinstance(item, dict):
        name = _clean_text(item.get("name"), 200)
        if not name:
            name = _clean_text(item.get("skill"), 200)
        if not name:
            return None
        return {
            "name": name,
            "evidence": _clean_text(item.get("evidence"), 400),
        }
    return None


def normalize_skills(skills):
    """Coerce any skills shape into {category: [{name, evidence}, ...]}."""
    result = {category: [] for category in SKILL_CATEGORIES}
    if isinstance(skills, list):
        # Flatten a flat list of skills into "other" so nothing is lost.
        for item in skills:
            skill = normalize_skill_item(item)
            if skill and skill["name"].lower() not in {
                s["name"].lower() for s in result["other"]
            }:
                result["other"].append(skill)
        return result
    if not isinstance(skills, dict):
        return result
    for category in SKILL_CATEGORIES:
        raw = skills.get(category) or skills.get(category + "_") or []
        seen = set()
        for item in raw if isinstance(raw, list) else []:
            skill = normalize_skill_item(item)
            if skill and skill["name"].lower() not in seen:
                seen.add(skill["name"].lower())
                result[category].append(skill)
    # Fold unknown keys into "other".
    for key, raw in skills.items():
        if key in SKILL_CATEGORIES or not isinstance(raw, list):
            continue
        for item in raw:
            skill = normalize_skill_item(item)
            if skill and skill["name"].lower() not in {
                s["name"].lower() for s in result["other"]
            }:
                result["other"].append(skill)
    return result


def normalize_education(item):
    allowed = ["institution", "degree", "field", "location", "start_date", "end_date", "gpa"]
    cleaned = _clean_object(item, allowed, limits={"institution": 300, "degree": 300, "field": 300})
    if not cleaned:
        return None
    if "institution" not in cleaned and "degree" not in cleaned:
        return None
    bullets = _list_of_strings(item.get("bullets"), 600)
    if bullets:
        cleaned["bullets"] = bullets
    return cleaned


def normalize_experience(item):
    allowed = ["company", "title", "location", "start_date", "end_date"]
    cleaned = _clean_object(item, allowed, limits={"company": 300, "title": 300})
    if not cleaned:
        return None
    bullets = _list_of_strings(item.get("bullets"), 800)
    technologies = _list_of_strings(item.get("technologies"), 200, 60)
    if bullets:
        cleaned["bullets"] = bullets
    if technologies:
        cleaned["technologies"] = technologies
    return cleaned


def normalize_project(item):
    allowed = ["name", "link"]
    cleaned = _clean_object(item, allowed, limits={"name": 300})
    if not cleaned:
        return None
    description = _clean_text(item.get("description"), 1000)
    bullets = _list_of_strings(item.get("bullets"), 800)
    technologies = _list_of_strings(item.get("technologies"), 200, 60)
    if description:
        cleaned["description"] = description
    if bullets:
        cleaned["bullets"] = bullets
    if technologies:
        cleaned["technologies"] = technologies
    return cleaned


def normalize_certification(item):
    allowed = ["name", "issuer", "date"]
    cleaned = _clean_object(item, allowed, limits={"name": 300, "issuer": 300})
    return cleaned


def normalize_resume(data):
    """Normalize arbitrary AI output into the canonical resume structure.

    Raises :class:`AIGatewayError` only for a structurally unusable top level
    (which triggers the client's repair loop); otherwise it coerces everything.
    """
    if not isinstance(data, dict):
        raise AIJSONError(
            "The model returned resume data that is not a JSON object."
        )
    resume = empty_resume()

    personal = data.get("personal") or {}
    if isinstance(personal, dict):
        for key in resume["personal"]:
            resume["personal"][key] = _clean_text(personal.get(key), 500)

    resume["summary"] = _clean_text(data.get("summary"), 2000)

    for key, normalize in (
        ("education", normalize_education),
        ("experience", normalize_experience),
        ("projects", normalize_project),
        ("certifications", normalize_certification),
    ):
        raw = data.get(key)
        if isinstance(raw, str):
            raw = [raw]
        if not isinstance(raw, list):
            continue
        for item in raw:
            cleaned = normalize(item)
            if cleaned:
                resume[key].append(cleaned)

    resume["skills"] = normalize_skills(data.get("skills"))

    for key in ("achievements", "coursework", "extracurriculars"):
        resume[key] = _list_of_strings(data.get(key), 800)

    return resume


def skills_flat(resume):
    """Flatten all skill categories into a single list of skill dicts."""
    flat = []
    for category in SKILL_CATEGORIES:
        for skill in (resume.get("skills") or {}).get(category, []):
            flat.append(skill)
    return flat


def _skill_classified_list(value, detail_key):
    """Normalize [{name, evidence|why|how}] entries."""
    if not isinstance(value, list):
        return []
    result = []
    for item in value:
        if isinstance(item, str):
            result.append({"name": item})
            continue
        if not isinstance(item, dict):
            continue
        name = _clean_text(item.get("name") or item.get("skill"), 200)
        if not name:
            continue
        detail = _clean_text(item.get(detail_key), 500)
        entry = {"name": name}
        if detail:
            entry[detail_key] = detail
        result.append(entry)
    return result


def _is_boilerplate_issue(item):
    """True for generic/self-referential LLM filler that never applies.

    Flagged phrases reference the parsing/document step itself — which is
    irrelevant because the resume already parsed successfully before analysis
    runs. Everything else we keep for human review.
    """
    text = item.lower()
    return any(
        phrase in text
        for phrase in (
            "text-based pdf",
            "standard pdf",
            "parsing errors",
            "word processor",
            "save as pdf",
            "export as pdf",
            "convert to pdf",
            "open in a text",
        )
    )


def normalize_analysis(data):
    """Normalize the LLM's resume-analysis output into a usable structure."""
    if not isinstance(data, dict):
        raise AIJSONError("The model returned analysis data that is not a JSON object.")
    assessment = data.get("section_assessment") or {}
    if not isinstance(assessment, dict):
        assessment = {}
    clean_assessment = {}
    for key in SECTION_KEYS:
        item = assessment.get(key) or {}
        if not isinstance(item, dict):
            item = {}
        status = item.get("status")
        if status not in SECTION_STATUSES:
            status = "missing"
        clean_assessment[key] = {
            "status": status,
            "notes": _list_of_strings(item.get("notes"), 500, 12),
        }
    return {
        "section_assessment": clean_assessment,
        "strengths": _list_of_strings(data.get("strengths"), 600, 12),
        "weaknesses": _list_of_strings(data.get("weaknesses"), 600, 12),
        "missing_sections": _list_of_strings(data.get("missing_sections"), 300, 10),
        "ats_issues": [
            item
            for item in _list_of_strings(data.get("ats_issues"), 600, 12)
            if not _is_boilerplate_issue(item)
        ],
        "recommendations": [
            item
            for item in _list_of_strings(data.get("recommendations"), 700, 12)
            if not _is_boilerplate_issue(item)
        ],
        "evidence": _list_of_strings(data.get("evidence"), 500, 20),
    }


def normalize_match(data):
    """Normalize the LLM's job-match output into a usable structure."""
    if not isinstance(data, dict):
        raise AIJSONError("The model returned match data that is not a JSON object.")

    def level_of(item):
        if not isinstance(item, dict):
            return "none", None
        level = item.get("level")
        if level not in {"strong", "partial", "weak", "none"}:
            level = "none"
        analysis = _clean_text(item.get("analysis"), 1000)
        return level, analysis

    def build(item):
        level, analysis = level_of(item)
        return {"level": level, "analysis": analysis}

    return {
        "matched_skills": _skill_classified_list(data.get("matched_skills"), "evidence"),
        "missing_skills": _skill_classified_list(data.get("missing_skills"), "why"),
        "related_skills": _skill_classified_list(data.get("related_skills"), "how"),
        "experience_match": build(data.get("experience_match")),
        "education_match": build(data.get("education_match")),
        "project_match": build(data.get("project_match")),
        "recommendations": _list_of_strings(data.get("recommendations"), 700, 12),
        "evidence": _list_of_strings(data.get("evidence"), 500, 20),
    }


def contact_completeness(resume):
    """Deterministic contact signals used by the scorer."""
    personal = resume.get("personal") or {}
    signals = {
        "name": bool(personal.get("name")),
        "email": bool(personal.get("email")),
        "phone": bool(personal.get("phone")),
        "location": bool(personal.get("location")),
        "linkedin": bool(personal.get("linkedin")),
        "github": bool(personal.get("github")),
        "portfolio": bool(personal.get("portfolio")),
    }
    return signals
