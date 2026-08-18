"""Deterministic scoring for resume sections and job matching.

The LLM provides semantic understanding (per-section status + notes, skill
classification with evidence). All numbers below are computed deterministically
from the stored structured data, so scores are consistent, explainable, and
unit-testable. The LLM never produces a raw final score.

The ATS section score is an exception to the LLM rule: it is computed purely
from the resume's *content* via :func:`ats_checklist` (contact presence,
standard sections, experience depth, quantified impact, extras, and
consistency). The LLM's ats status/notes are surfaced only as qualitative
advice and never influence the ats number.
"""

import re

from ..ai.client import (
    ANALYSIS_PROMPT_VERSION,
    MATCH_PROMPT_VERSION,
)
from .schema import skills_flat

# Weights adapted from the product's scoring direction. Sums to 100.
WEIGHTS = {
    "skills": 35,
    "experience": 25,
    "projects": 15,
    "education": 10,
    "contact": 5,
    "summary": 5,
    "ats": 5,
}

STATUS_SCORE = {"complete": 90, "partial": 55, "missing": 10}
MATCH_LEVEL_SCORE = {"strong": 100, "partial": 70, "weak": 35, "none": 10}

ATS_ACTION_VERBS = frozenset({
    "accelerated",
    "architected",
    "authored",
    "automated",
    "built",
    "coordinated",
    "created",
    "deployed",
    "delivered",
    "designed",
    "developed",
    "engineered",
    "established",
    "implemented",
    "improved",
    "increased",
    "integrated",
    "launched",
    "led",
    "maintained",
    "managed",
    "mentored",
    "migrated",
    "optimized",
    "published",
    "reduced",
    "scaled",
    "shipped",
})

# Overused / generic terms that add no signal, with scored weights.
BUZZWORDS = {
    "detail-oriented": 0,
    "hardworking": 0,
    "hard-working": 0,
    "self-starter": 0,
    "team player": 0,
    "results-driven": 0,
    "go-getter": 0,
    "dynamic": 0,
    "highly motivated": 0,
    "passionate": 0,
    "proactive": 0,
    "synergy": 0,
    "out-of-the-box": 0,
    "think outside the box": 0,
    "excellent communication skills": 0,
    "fast-paced": 0,
    "multi-tasking": 0,
    "responsible for": 0,
}

# Common resume misspellings: word -> correction.
COMMON_MISSPELLINGS = {
    "acheived": "achieved",
    "achieved": "achieved",
    "adress": "address",
    "calender": "calendar",
    "carrer": "career",
    "definately": "definitely",
    "experiance": "experience",
    "imporoved": "improved",
    "intereted": "interested",
    "lenght": "length",
    "managment": "management",
    "mangager": "manager",
    "neccessary": "necessary",
    "occured": "occurred",
    "organistaion": "organisation",
    "priviledge": "privilege",
    "profesional": "professional",
    "reccomend": "recommend",
    "recieve": "receive",
    "seperate": "separate",
    "sucessful": "successful",
    "successfull": "successful",
    "traning": "training",
}

# In-demand / current technologies (skills check).
MODERN_STACK = frozenset({
    "aws", "azure", "django", "docker", "fastapi", "flask", "flutter", "gcp",
    "git", "go", "golang", "graphql", "java", "javascript", "kubernetes",
    "mongodb", "nextjs", "node.js", "nodejs", "postgresql", "python", "react",
    "redis", "rust", "sql", "tailwind", "terraform", "tensorflow", "typescript",
    "vue",
})


def section_score(key, status, analysis=None):
    """Deterministic per-section score from an LLM-provided status."""
    base = STATUS_SCORE.get(status, STATUS_SCORE["missing"])
    return max(0, min(100, base))


def _has_text(value):
    return bool(value and str(value).strip())


def _year_of(value):
    match = re.search(r"(?:19|20)\d{2}", str(value or ""))
    return int(match.group(0)) if match else None


def _format_kind(value):
    text = str(value or "").strip()
    if not text:
        return None
    if re.fullmatch(r"(?:19|20)\d{2}-\d{2}", text):
        return "year-month"
    if re.fullmatch(r"(?:19|20)\d{2}", text):
        return "year"
    if re.search(r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[.,]?\s+\d{4}", text, re.IGNORECASE):
        return "month-year"
    if re.search(r"\d{1,2}/\d{4}", text):
        return "mm/yyyy"
    return None


def _scannable_bullet(bullet):
    return bool(re.search(r"\d|%|\$\s?\d", bullet))


def _all_bullets(resume):
    bullets = []
    for entry in (resume.get("experience") or []) + (resume.get("projects") or []):
        bullets.extend(entry.get("bullets") or [])
    return [str(b) for b in bullets if str(b).strip()]


def _text_blob(resume):
    """All free-form text of the resume, lowercased, for issue scanning."""
    parts = []
    if _has_text(resume.get("summary")):
        parts.append(resume["summary"])
    for entry in (resume.get("experience") or []) + (resume.get("projects") or []) + (resume.get("education") or []):
        parts.extend(entry.get("bullets") or [])
    for key in ("achievements", "coursework", "extracurriculars", "certifications"):
        values = resume.get(key) or []
        if isinstance(values, list):
            for item in values:
                if isinstance(item, dict):
                    parts.append(item.get("name") or "")
                else:
                    parts.append(str(item))
    for skill in skills_flat(resume):
        parts.append(skill.get("name") or "")
    return " ".join(str(p) for p in parts).lower()


def _trigger_scan(resume):
    """Deterministic issue scan -> {typos, buzzwords, dup, chronological, uncapped}."""
    text = _text_blob(resume)
    typos = sorted({w for w in re.findall(r"[A-Za-z]+", text) if w in COMMON_MISSPELLINGS})
    buzz = sorted({w for _, w in [(w in text, w) for w in BUZZWORDS] if w in text})
    bullets = _all_bullets(resume)
    dup = [b for b in bullets if bullets.count(b) > 1]
    lower = [b.lower() for b in bullets]
    dup = sorted({lower[i] for i, b in enumerate(bullets) if lower.count(b.lower()) > 1})
    entries = (resume.get("experience") or []) + (resume.get("education") or [])
    chronological = [
        (e.get("title") or e.get("company") or e.get("institution") or "entry")
        for e in entries
        if (lambda s, en: s and en and s > en)(_year_of(e.get("start_date")), _year_of(e.get("end_date")))
    ]
    exp_bullets = [b for e in resume.get("experience") or [] for b in (e.get("bullets") or [])]
    uncapped = [b for b in exp_bullets if b[:1].islower()]
    return {"typos": typos, "buzzwords": buzz, "dup": dup, "chronological": chronological, "uncapped": uncapped}


def ats_checklist(resume):
    """Deterministic ATS heuristics derived from the resume's actual content.

    Returns a list of ``{"label", "max", "earned", "detail"}`` entries whose
    ``max`` values sum to 100. Computed purely from the structured resume —
    no LLM judgment, no free-form flags — so a genuinely good resume scores
    high and a thin one scores low, explainably.

    Coverage mirrors a professional ATS review: contact, section coverage,
    impact, brevity/depth, use of bullets, style & formatting, buzzwords,
    readability, skills, plus common-issue scanning (spelling, chronology,
    duplication, capitalization).
    """
    personal = (resume or {}).get("personal") or {}
    checks = []
    issues = _trigger_scan(resume)

    def add(label, weight, earned, detail=""):
        earned = max(0, min(weight, earned))
        checks.append({"label": label, "max": weight, "earned": earned, "detail": detail})

    def frac(values, pred):
        if not values:
            return 0.0
        return sum(1 for v in values if pred(v)) / len(values)

    experience = resume.get("experience") or []
    projects = resume.get("projects") or []
    education = resume.get("education") or []
    bullets = _all_bullets(resume)

    # ------------------------------------------------------------ contact (15)
    add("Email address present", 4, 4 if _has_text(personal.get("email")) else 0)
    add("Phone number present", 3, 3 if _has_text(personal.get("phone")) else 0)
    add("Location present", 3, 3 if _has_text(personal.get("location")) else 0)
    has_profile = any(_has_text(personal.get(k)) for k in ("linkedin", "github", "portfolio"))
    add("LinkedIn/GitHub/portfolio link", 3, 3 if has_profile else 0)
    add("Name and professional title listed", 2, 2 if _has_text(personal.get("name")) else 0)

    # ------------------------------------------------------ section coverage (15)
    add("Professional summary included", 3, 3 if _has_text(resume.get("summary")) else 0)
    add("Education section included", 3, 3 if education else 0)
    add("Work experience section included", 3, 3 if experience else 0)
    add("Projects section included", 3, 3 if projects else 0)
    add("Skills section included", 3, 3 if skills_flat(resume) else 0)

    # ---------------------------------------------------------------- impact (12)
    if bullets:
        add("Achievements quantified with metrics/numbers", 5, round(5 * frac(bullets, _scannable_bullet)))
        impacted = [
            b for b in bullets
            if _scannable_bullet(b) and any(v in b.lower().split() for v in
                {"to", "by", "from", "reduced", "increased", "improved", "cut", "grew", "achieved"})
        ]
        add("Impact statements (what changed, by how much)", 4, round(4 * frac(bullets, lambda b: b in impacted)))
        add("Outcome/results-oriented wording", 3, round(3 * frac(bullets, lambda b: _scannable_bullet(b) or any(
            w in b.lower() for w in ("led", "built", "created", "developed", "shipped", "delivered")))))
    else:
        add("Achievements quantified with metrics/numbers", 5, 0)
        add("Impact statements (what changed, by how much)", 4, 0)
        add("Outcome/results-oriented wording", 3, 0)

    # --------------------------------------------------- brevity/length/depth (12)
    summary_words = len(str(resume.get("summary") or "").split())
    add("Summary is concise but informative (10-60 words)", 4, 4 if 10 <= summary_words <= 60 else (2 if summary_words else 0))
    if bullets:
        avg_words = sum(len(b.split()) for b in bullets) / len(bullets)
        add("Bullets are concise (not walls of text)", 4, 4 if avg_words <= 30 else (2 if avg_words <= 50 else 0))
        entries = experience or projects
        per_entry = len(bullets) / max(1, len(entries))
        add("Adequate depth (2+ bullets per entry)", 4, min(4, round(per_entry * 1.5)))
    else:
        add("Bullets are concise (not walls of text)", 4, 0)
        add("Adequate depth (2+ bullets per entry)", 4, 0)

    # ------------------------------------------------------- use of bullets (10)
    add("Bullets used to structure experience/projects", 4, 4 if bullets else 0)
    add(
        "Bullets start with strong action verbs",
        3,
        round(3 * frac(bullets, lambda b: (b.strip().split()[0].lower() if b.strip() else "") in ATS_ACTION_VERBS)),
    )
    entries = experience + projects
    per_entry = len(bullets) / max(1, len(entries)) if bullets else 0
    add("Consistent bullet density across entries", 3, min(3, round(per_entry * 1.5)) if bullets else 0)

    # ------------------------------------------------- style & formatting (10)
    formats = {
        kind
        for e in experience + education
        for kind in (_format_kind(e.get("start_date")), _format_kind(e.get("end_date")))
        if kind
    }
    chronological_bad = len(issues["chronological"])
    if formats:
        date_pts = 3 if len(formats) == 1 and not chronological_bad else (1 if not chronological_bad else 0)
        add("Consistent, chronological date formatting", 3, date_pts)
    else:
        add("Consistent, chronological date formatting", 3, 0)
    exp_bullets = [b for e in experience for b in (e.get("bullets") or [])]
    capped = sum(1 for b in exp_bullets if b[:1].isupper())
    add("Professional capitalization", 2, 2 if exp_bullets and capped == len(exp_bullets) else (1 if exp_bullets else 0))
    add("No duplicated bullets/content", 2, 2 if not issues["dup"] else 0)
    add("No spelling errors found", 3, 3 if not issues["typos"] else 0)

    # -------------------------------------------------------------- buzzwords (8)
    add(
        "Avoids generic overused buzzwords",
        8,
        max(0, 8 - 2 * len(issues["buzzwords"])),
    )

    # ------------------------------------------------------------ readability (8)
    if bullets:
        avg_words = sum(len(b.split()) for b in bullets) / len(bullets)
        longest = max(len(b.split()) for b in bullets)
        add("Bullets are scannable (short lines)", 4, 4 if avg_words <= 25 else (2 if avg_words <= 40 else 0))
        add("No single oversized paragraph", 4, 4 if longest <= 40 else 1)
    else:
        add("Bullets are scannable (short lines)", 4, 0)
        add("No single oversized paragraph", 4, 0)

    # ----------------------------------------------------------------- skills (10)
    flat = skills_flat(resume)
    categories = (resume.get("skills") or {})
    categorized = sum(1 for values in categories.values() if values)
    add("Skills grouped in relevant categories", 4, min(4, categorized) if flat else 0)
    add("Skills are current/in-demand (modern stack)", 3, 3 if any(
        item.get("name", "").lower() in MODERN_STACK for item in flat
    ) else 0)
    add("Skills backed by usage evidence", 3, round(3 * frac(flat, lambda s: _has_text(s.get("evidence")))))

    return checks


def ats_score(resume):
    """Deterministic ATS score (0-100) derived from resume content."""
    return sum(check["earned"] for check in ats_checklist(resume))


def ats_issues(resume):
    """Deterministic issue list for the analysis output (never scored)."""
    found = _trigger_scan(resume)
    issues = []
    if found["typos"]:
        issues.append("Possible misspellings: " + ", ".join(sorted(set(found["typos"]))))
    if found["buzzwords"]:
        issues.append("Overused generic terms: " + ", ".join(sorted(set(found["buzzwords"]))))
    if found["dup"]:
        issues.append("Repetitive or duplicated bullet content.")
    if found["chronological"]:
        issues.append("Chronological date issues in: " + ", ".join(found["chronological"]))
    return issues


def overall_score(section_scores):
    """Weighted overall score from per-section {score, weight} entries."""
    if not section_scores:
        return 0
    total_weight = sum(
        entry.get("weight", 0) for entry in section_scores.values()
    )
    if total_weight <= 0:
        return 0
    weighted = sum(
        entry.get("score", 0) * entry.get("weight", 0)
        for entry in section_scores.values()
    )
    return round(weighted / total_weight)


def build_analysis_result(resume_json, llm_analysis):
    """Combine LLM semantics with deterministic weighting into the final analysis."""
    assessment = llm_analysis.get("section_assessment", {})
    section_scores = {}
    ats_checks = ats_checklist(resume_json)
    ats = ats_score(resume_json)
    for key, weight in WEIGHTS.items():
        item = assessment.get(key) or {}
        status = item.get("status") or "missing"
        notes = item.get("notes") or []
        if key == "ats":
            failed = [c for c in ats_checks if c["earned"] < c["max"]]
            reasons = [f"{c['label']} ({c['earned']}/{c['max']})" for c in failed]
            completed = [c for c in ats_checks if c["earned"] == c["max"]]
            section_scores[key] = {
                "score": ats,
                "weight": weight,
                "status": "complete" if ats >= 75 else ("partial" if ats >= 40 else "missing"),
                "reason": (reasons if reasons else [f"All ATS checks passed ({len(completed)}/{len(ats_checks)})."]),
                "checks": ats_checks,
                "issues": ats_issues(resume_json),
            }
            continue
        section_scores[key] = {
            "score": section_score(key, status),
            "weight": weight,
            "status": status,
            "reason": notes if notes else [f"The {key} section is {status}."],
        }
    return {
        "overall_score": overall_score(section_scores),
        "weights": WEIGHTS,
        "section_scores": section_scores,
        "strengths": llm_analysis.get("strengths", []),
        "weaknesses": llm_analysis.get("weaknesses", []),
        "missing_sections": llm_analysis.get("missing_sections", []),
        "ats_issues": llm_analysis.get("ats_issues", []),
        "recommendations": llm_analysis.get("recommendations", []),
        "evidence": llm_analysis.get("evidence", []),
        "prompt_version": ANALYSIS_PROMPT_VERSION,
        "source": "llm",
    }


def _skill_ratio(matched, related, missing):
    """Deterministic skill-match ratio.

    Explicitly demonstrated skills count fully, related skills half, missing
    skills nothing — so a candidate is never credited with a technology they
    merely resemble.
    """
    points = len(matched) + 0.5 * len(related)
    total = len(matched) + len(related) + len(missing)
    if total == 0:
        return 100.0
    return min(100.0, (points / total) * 100)


def build_match_result(llm_match):
    """Combine LLM skill classification with deterministic match scoring."""
    matched = llm_match.get("matched_skills", [])
    related = llm_match.get("related_skills", [])
    missing = llm_match.get("missing_skills", [])

    def level_entry(name):
        item = llm_match.get(name) or {}
        level = item.get("level") or "none"
        score = MATCH_LEVEL_SCORE.get(level, MATCH_LEVEL_SCORE["none"])
        return {
            "score": score,
            "level": level,
            "analysis": item.get("analysis"),
        }

    experience = level_entry("experience_match")
    education = level_entry("education_match")
    project = level_entry("project_match")

    skill_score = _skill_ratio(matched, related, missing)
    match_score = round(
        skill_score * 0.60
        + experience["score"] * 0.20
        + education["score"] * 0.10
        + project["score"] * 0.10
    )

    return {
        "match_score": min(100, max(0, match_score)),
        "matched_skills": matched,
        "missing_skills": missing,
        "related_skills": related,
        "experience_match": experience,
        "education_match": education,
        "project_match": project,
        "recommendations": llm_match.get("recommendations", []),
        "evidence": llm_match.get("evidence", []),
        "prompt_version": MATCH_PROMPT_VERSION,
        "source": "llm",
    }
