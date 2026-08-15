"""Resume analyzer for the skillsaarthi AI service.

Turns resume content (PDF text or raw text) into a structured profile:
extracted skills, estimated experience, projects, education, and career
matches (docs/main_architecture.md §27).

Only the resume text is processed here — file storage and authentication are
owned by the Node backend / Appwrite, not this service.
"""

import io
import re

from ..recommendation.careers import get_all_careers
from ..recommendation.scoring import normalize_skill

# Skill lexicon for extraction, keyed by normalized skill name -> list of
# display synonyms/triggers that commonly appear on resumes.
SKILL_SYNONYMS = {
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "python": ["python"],
    "java": ["java"],
    "c++": ["c++", "cpp", "c plus plus"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "oracle sql", "tsql"],
    "html/css": ["html", "css", "html/css"],
    "react": ["react", "react.js", "reactjs"],
    "node.js": ["node.js", "nodejs", "node"],
    "express": ["express", "express.js", "expressjs"],
    "rest apis": ["rest api", "rest apis", "rest", "api", "restful"],
    "next.js": ["next.js", "nextjs", "next"],
    "git & github": ["git", "github", "gitlab"],
    "data analysis": ["data analysis", "data analytics", "analytics"],
    "statistics": ["statistics", "statistical analysis", "stats"],
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "neural network", "neural networks"],
    "data visualization": ["data visualization", "visualization", "charts", "dashboards", "tableau", "power bi"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "docker": ["docker", "docker compose", "containerization", "containers"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda", "cloudfront"],
    "ci/cd": ["ci/cd", "ci cd", "cicd", "jenkins", "github actions", "gitlab ci"],
    "linux": ["linux", "unix", "bash", "shell scripting"],
    "network security": ["network security", "firewall", "intrusion detection", "ids/ips"],
    "penetration testing": ["penetration testing", "pentesting", "ethical hacking", "vulnerability assessment"],
    "cryptography": ["cryptography", "encryption", "crypto"],
    "security compliance": ["security compliance", "compliance", "iso 27001", "gdpr", "owasp"],
    "communication": ["communication", "presentation", "public speaking"],
    "problem solving": ["problem solving", "problem-solving", "analytical"],
    "teamwork": ["teamwork", "collaboration", "cross-functional"],
    "time management": ["time management", "prioritization", "organization"],
    "leadership": ["leadership", "mentoring", "team lead", "team leader"],
}

# Display name mapping (normalized -> canonical), for the frontend.
DISPLAY_NAME = {
    "data analysis": "Data Analysis",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "data visualization": "Data Visualization",
    "statistics": "Statistics",
    "rest apis": "REST APIs",
    "git & github": "Git & GitHub",
    "html/css": "HTML/CSS",
    "node.js": "Node.js",
    "next.js": "Next.js",
    "ci/cd": "CI/CD",
    "network security": "Network Security",
    "penetration testing": "Penetration Testing",
    "cryptography": "Cryptography",
    "security compliance": "Security Compliance",
    "problem solving": "Problem Solving",
    "time management": "Time Management",
    "problem solving": "Problem Solving",
    "communication": "Communication",
    "teamwork": "Teamwork",
    "leadership": "Leadership",
}

# Education level keywords: keyword -> education label.
EDUCATION_KEYWORDS = [
    ("phd", "doctorate"),
    ("master", "postgraduate"),
    ("bachelor", "bachelor's degree"),
    ("b.s", "bachelor's degree"),
    ("b.tech", "bachelor's degree"),
    ("b.e", "bachelor's degree"),
    ("b.a", "bachelor's degree"),
    ("b.sc", "bachelor's degree"),
    ("bcom", "bachelor's degree"),
    ("high school", "high school"),
    ("diploma", "high school"),
    ("associate", "high school"),
]

_YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")

# Detect whether a resume's text layer was rendered with one space between every
# glyph (common with certain "letter-spaced" resume fonts). When present, word
# boundaries and keyword matching break, so we densify before analysis.
# A token char is a letter/digit plus '.', '@', '_' so emails and URLs (which are
# also letter-spaced) reconstruct correctly.
_TOKEN_RE = r"\w\.@_"
_LETTER_SPACED_RE = re.compile(r"(?<=[" + _TOKEN_RE + r"]) (?=[" + _TOKEN_RE + r"])")
_SPACE_RUN_RE = re.compile(r"[ ]{2,}")
_ALNUM_RUN_RE = re.compile(r"[\w.@_]+")


def _is_letter_spaced(text):
    """Heuristic: are words rendered as isolated single characters?

    In a letter-spaced text layer, every glyph is followed by one space, so
    there are almost no multi-character runs. Normal prose, by contrast, is
    dominated by real words (multi-character runs between spaces).
    """
    if not text:
        return False
    runs = _ALNUM_RUN_RE.findall(text)
    if len(runs) < 8:
        return False
    multi_char = sum(1 for run in runs if len(run) >= 2)
    return multi_char / len(runs) < 0.05


def densify_text(text):
    """Collapse the per-glyph spaces of a letter-spaced PDF text layer.

    Words in such extractions appear as e.g. 'j a v a s c r i p t'. We remove a
    single space that sits between two word characters, leaving multi-space
    runs (which separate real words) and newlines intact.
    """
    if not text or not _is_letter_spaced(text):
        return text
    chunks = re.split(r"( {2,}|\n)", text)
    # chunks alternate: [normal, separator, normal, separator, ...]
    rebuilt = []
    for chunk in chunks:
        if chunk is None:
            continue
        if re.fullmatch(r"( {2,}|\n)", chunk):
            rebuilt.append(chunk)
        else:
            rebuilt.append(_LETTER_SPACED_RE.sub("", chunk))
    result = "".join(rebuilt)
    # Tidy the now-densified text: single spaces, no space before punctuation.
    result = re.sub(r"[ ]{2,}", " ", result)
    result = re.sub(r"\s+([.,;:!?'\"\)\]])", r"\1", result)
    result = re.sub(r"([(\[])\s+", r"\1", result)
    return result


def _proficiency_for(confidence):
    if confidence >= 90:
        return 5
    if confidence >= 75:
        return 4
    if confidence >= 60:
        return 3
    if confidence >= 40:
        return 2
    return 1


def extract_text(pdf_bytes, text=None):
    """Return resume text from PDF bytes, or the caller-provided text.

    If both are given, prefer the provided text (Node may pre-extract).
    PDFs are parsed with pypdf; any parse failure yields "".
    """
    if text:
        return text
    if not pdf_bytes:
        return ""
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for page in reader.pages:
            try:
                pages.append(page.extract_text() or "")
            except Exception:
                continue
        return densify_text("\n".join(pages))
    except Exception:
        return ""


def detect_skills(text):
    """Find skills present in the resume text with confidence scores.

    Confidence reflects how decisively a skill matches the text: strong exact
    matches and multiple synonym hits score higher. Returns up to 16 skills.
    """
    if not text:
        return []
    lowered = text.lower()
    signals = {}
    for skill_name, synonyms in SKILL_SYNONYMS.items():
        count = 0
        for syn in synonyms:
            pattern = re.compile(r"\b" + re.escape(syn) + r"\b")
            count += len(pattern.findall(lowered))
        if count == 0:
            continue
        confidence = min(95, 55 + 15 * count)
        if skill_name in signals:
            confidence = max(confidence, signals[skill_name]["confidence"])
        signals[skill_name] = {
            "skill": DISPLAY_NAME.get(skill_name, skill_name.title()),
            "confidence": confidence,
            "proficiency": _proficiency_for(confidence),
            "mentions": count,
        }
    ordered = sorted(signals.values(), key=lambda item: item["confidence"], reverse=True)
    return ordered[:16]


def detect_experience_years(text):
    """Estimate years of experience from date ranges and explicit mentions."""
    if not text:
        return None
    lowered = text.lower()
    explicit = re.search(r"(\d+)\s*\+?\s*years?(\s*of)?\s*(professional\s*)?experience", lowered)
    if explicit:
        try:
            return int(explicit.group(1))
        except ValueError:
            pass
    years = sorted(int(y) for y in _YEAR_RE.findall(text) if int(y) <= 2030)
    if len(years) >= 2:
        delta = years[-1] - years[0]
        if 0 < delta < 40:
            return max(0, delta)
    return 0


def detect_projects(text):
    """Extract likely project lines: bullet items containing project-like verbs/keywords."""
    if not text:
        return []
    # Section headings (e.g. "PROJECTS", "EXPERIENCE") are not project bullets.
    project_heading = re.compile(r"^projects?$", re.IGNORECASE)
    projects = []
    for line in text.splitlines():
        stripped = line.strip().lstrip("-•*").strip()
        if len(stripped) < 12 or len(stripped) > 240:
            continue
        if project_heading.match(stripped):
            continue
        # Skip skill-rollup lines that are mostly commas (e.g. "React, Node, SQL, ...").
        if stripped.count(",") >= 4:
            continue
        lowered = stripped.lower()
        if any(
            kw in lowered
            for kw in ("project", "built", "developed", "designed", "engineered", "implemented", "created")
        ):
            projects.append(stripped)
        if len(projects) >= 8:
            break
    return projects


def detect_education(text):
    """Return the highest education level signalled in the resume."""
    if not text:
        return "not specified"
    lowered = text.lower()
    rank = {"doctorate": 5, "postgraduate": 4, "bachelor's degree": 3, "high school": 2}
    found = None
    found_rank = -1
    for keyword, label in EDUCATION_KEYWORDS:
        if keyword in lowered and rank.get(label, 0) > found_rank:
            found = label
            found_rank = rank.get(label, 0)
    return found or "not specified"


def detect_contact(text):
    """Light contact detection: email and approximate location/name hints."""
    email = None
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text or "")
    if m:
        email = m.group(0)
    return {"email": email}


def career_matches(skills):
    """Score the career catalog against extracted skills (mirrors §23 skill factor).

    Returns career matches with a confidence score, reasons, and skill gaps.
    """
    skill_map = {normalize_skill(item["skill"]): item["proficiency"] for item in skills}
    matches = []
    for career in get_all_careers():
        required = career["skills"]
        total = 0
        matched = []
        gaps = []
        for skill, meta in required.items():
            required_level = meta["required"]
            importance = meta.get("importance", 1)
            level = skill_map.get(normalize_skill(skill), 0)
            ratio = min(level, required_level) / required_level if required_level else 0
            total += ratio * importance
            if level >= 3:
                matched.append(skill)
            elif level == 0:
                gaps.append(skill)
        total_importances = sum(meta.get("importance", 1) for meta in required.values())
        confidence = round((total / total_importances) * 100) if total_importances else 0
        if confidence >= 40:
            matches.append(
                {
                    "career": career["name"],
                    "confidence": confidence,
                    "reasons": [f"Experience with {skill}" for skill in matched[:4]],
                    "skill_gaps": gaps[:5],
                }
            )
    matches.sort(key=lambda item: item["confidence"], reverse=True)
    return matches[:4]


def build_strengths(skills):
    strengths = []
    for item in skills:
        if item["confidence"] >= 70:
            strengths.append(f"Strong {item['skill']} skills listed on your resume")
    return strengths[:5]


def build_areas_to_improve(skills, experience_years, top_match):
    areas = []
    if experience_years == 0:
        areas.append("No clear work experience dates found — add dates to your roles for a stronger signal")
    if not skills:
        areas.append("Add an explicit skills section so tools can detect them automatically")
    elif len(skills) < 5:
        areas.append("Add more keywords to your skills section to improve match accuracy")
    if top_match and top_match.get("skill_gaps"):
        gaps = ", ".join(top_match["skill_gaps"][:3])
        areas.append(f"To grow your {top_match['career']} match, highlight or learn: {gaps}")
    if not areas:
        areas.append("Your resume is in good shape — keep it focused and current")
    return areas


def analyze(payload):
    """Main analysis entrypoint.

    payload keys:
      - "text": pre-extracted resume text (optional)
      - "pdf": base64-encoded PDF bytes (optional)
      - file_name: original file name (pass-through)
    """
    import base64

    text = payload.get("text") or ""
    pdf_raw = payload.get("pdf")
    pdf_bytes = None
    if pdf_raw:
        try:
            pdf_bytes = base64.b64decode(pdf_raw)
        except Exception:
            pdf_bytes = None

    final_text = extract_text(pdf_bytes, text)

    skills = detect_skills(final_text)
    experience_years = detect_experience_years(final_text)
    projects = detect_projects(final_text)
    education = detect_education(final_text)
    contact = detect_contact(final_text)
    matches = career_matches(skills)
    strengths = build_strengths(skills)
    top_match = matches[0] if matches else None
    areas = build_areas_to_improve(skills, experience_years, top_match)

    if matches and skills:
        top = matches[0]
        primary = ", ".join(s["skill"] for s in skills[:3])
        summary = (
            f"Your resume shows strong {primary} experience. Best current career match: "
            f"{top['career']} ({top['confidence']}%)."
        )
    elif skills:
        summary = (
            f"Your resume lists {len(skills)} skills, but no strong career match yet. "
            "Filling the highlighted skill gaps will unlock stronger matches."
        )
    else:
        summary = (
            "We couldn't detect clear skills or experience in this resume. "
            "Make sure it contains a skills section and date ranges for each role."
        )

    return {
        "summary": summary,
        "skills": skills,
        "experience_years": experience_years,
        "projects": projects,
        "education": education,
        "contact": contact,
        "strengths": strengths,
        "areas_to_improve": areas,
        "career_matches": matches,
    }
