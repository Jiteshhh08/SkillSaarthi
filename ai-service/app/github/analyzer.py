"""GitHub public-profile analyzer.

Turns publicly available GitHub data (a user profile plus repository
metadata) into a technical profile: language signals, skill signals,
activity, open-source health, and career matches.

Mirrors docs/main_architecture.md §28 — only public data is processed.
"""

from ..recommendation.careers import CAREER_REQUIREMENTS
from ..recommendation.scoring import normalize_skill

LANGUAGE_TO_SKILL = {
    "JavaScript": "JavaScript",
    "TypeScript": "TypeScript",
    "Python": "Python",
    "Java": "Java",
    "Kotlin": "Java",
    "C++": "C++",
    "C": "C++",
    "C#": "C++",
    "HTML": "HTML/CSS",
    "CSS": "HTML/CSS",
    "SCSS": "HTML/CSS",
    "SQL": "SQL",
    "PLpgSQL": "SQL",
    "Dockerfile": "Docker",
    "Shell": "Linux",
    "Go": "REST APIs",
    "Rust": "REST APIs",
    "Jupyter Notebook": "Data Visualization",
}

TOPIC_TO_SKILL = {
    "react": "React",
    "next.js": "Next.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "api": "REST APIs",
    "rest": "REST APIs",
    "rest-api": "REST APIs",
    "graphql": "REST APIs",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "machine-learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep-learning": "Deep Learning",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "python": "Python",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "sql": "SQL",
    "linux": "Linux",
    "git": "Git & GitHub",
}

TOPIC_TO_DOMAIN = {
    "web": "Web Development",
    "frontend": "Web Development",
    "front-end": "Web Development",
    "react": "Web Development",
    "next": "Web Development",
    "backend": "Backend Development",
    "back-end": "Backend Development",
    "node": "Backend Development",
    "api": "Backend Development",
    "rest": "Backend Development",
    "server": "Backend Development",
    "mobile": "Mobile Development",
    "android": "Mobile Development",
    "ios": "Mobile Development",
    "flutter": "Mobile Development",
    "data": "Data",
    "analytics": "Data",
    "visualization": "Data Visualization",
    "machine-learning": "AI/ML",
    "ai": "AI/ML",
    "nlp": "AI/ML",
    "deep-learning": "AI/ML",
    "tensorflow": "AI/ML",
    "pytorch": "AI/ML",
    "cloud": "Cloud",
    "aws": "Cloud",
    "gcp": "Cloud",
    "azure": "Cloud",
    "serverless": "Cloud",
    "devops": "DevOps & Cloud",
    "docker": "DevOps & Cloud",
    "kubernetes": "DevOps & Cloud",
    "cicd": "DevOps & Cloud",
    "infrastructure": "DevOps & Cloud",
    "terraform": "DevOps & Cloud",
    "security": "Cybersecurity",
    "vulnerability": "Cybersecurity",
    "penetration": "Cybersecurity",
    "hacking": "Cybersecurity",
    "cryptography": "Cybersecurity",
}

_DAY_MS = 86400000


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


def language_shares(repos):
    """Size-weighted language distribution from non-fork repos."""
    sizes = {}
    counts = {}
    total = 0
    for repo in repos:
        if repo.get("fork") or not repo.get("language"):
            continue
        size = int(repo.get("size") or 0)
        language = repo["language"]
        sizes[language] = sizes.get(language, 0) + size
        counts[language] = counts.get(language, 0) + 1
        total += size
    shares = []
    for language, size in sorted(sizes.items(), key=lambda item: item[1], reverse=True):
        shares.append(
            {
                "language": language,
                "share": round((size / total) * 100, 1) if total else 0,
                "repos": counts.get(language, 0),
            }
        )
    return shares


def detect_skills(repos):
    """Aggregate skill signals from languages + topics."""
    signals = {}

    def add_signal(name, confidence, evidence):
        if not name:
            return
        key = normalize_skill(name)
        if key not in signals or confidence > signals[key]["confidence"]:
            signals[key] = {"skill": name, "confidence": confidence, "evidence": evidence}

    for entry in language_shares(repos):
        language = entry["language"]
        skill = LANGUAGE_TO_SKILL.get(language)
        if skill:
            confidence = min(95, round(55 + 40 * (entry["share"] / 100)))
            add_signal(skill, confidence, f"{entry['share']}% of your public code is {language}")

    for repo in repos:
        for topic in repo.get("topics") or []:
            skill = TOPIC_TO_SKILL.get(topic.lower())
            if skill:
                add_signal(skill, 85, f'Topic "{topic}" on {repo.get("name")}')

    skills = sorted(signals.values(), key=lambda item: item["confidence"], reverse=True)[:14]
    for signal in skills:
        signal["proficiency"] = _proficiency_for(signal["confidence"])
    return skills


def detect_domains(repos):
    counts = {}
    evidence = {}
    for repo in repos:
        if repo.get("fork"):
            continue
        keywords = list(repo.get("topics") or [])
        keywords += [part for part in str(repo.get("name") or "").lower().split() if part]
        for keyword in keywords:
            domain = TOPIC_TO_DOMAIN.get(keyword.lower())
            if not domain:
                continue
            counts[domain] = counts.get(domain, 0) + 1
            evidence.setdefault(domain, repo.get("name"))
    maximum = max(counts.values(), default=0) or 1
    domains = [
        {
            "domain": domain,
            "confidence": min(95, round(50 + 45 * (count / maximum))),
            "evidence": f"{count} repo(s) signal {domain.lower()} (e.g. {evidence[domain]})",
        }
        for domain, count in sorted(counts.items(), key=lambda item: item[1], reverse=True)
    ]
    return domains


def detect_activity(repos):
    import time

    now = time.time() * 1000
    own = [repo for repo in repos if not repo.get("fork")]
    active = [
        repo
        for repo in own
        if repo.get("pushed_at")
        and now - _parse_date(repo["pushed_at"]) < 180 * _DAY_MS
    ]
    last_push_days = None
    for repo in own:
        if not repo.get("pushed_at"):
            continue
        days = max(0, round((now - _parse_date(repo["pushed_at"])) / _DAY_MS))
        if last_push_days is None or days < last_push_days:
            last_push_days = days
    recent = last_push_days is not None and last_push_days <= 60
    level = "Low"
    if len(active) >= 6 or (recent and len(active) >= 3):
        level = "High"
    elif len(active) >= 2 or recent:
        level = "Moderate"
    return {
        "repo_count": len(own),
        "active_repos": len(active),
        "last_push_days": last_push_days,
        "recent_activity": recent,
        "level": level,
    }


def _parse_date(value):
    import time

    if not value:
        return time.time() * 1000
    try:
        return time.mktime(time.strptime(value[:19], "%Y-%m-%dT%H:%M:%S")) * 1000
    except ValueError:
        return time.time() * 1000


def detect_open_source(repos, activity):
    has_stars = any(int(repo.get("stargazers_count") or 0) > 0 for repo in repos)
    has_forks = any(int(repo.get("forks_count") or 0) > 0 for repo in repos)
    has_topics = any(repo.get("topics") for repo in repos if not repo.get("fork"))
    score = 20
    if activity.get("recent_activity"):
        score += 15
    if has_stars:
        score += 15
    if has_forks:
        score += 10
    if has_topics:
        score += 10
    score = min(95, score)
    if score >= 80:
        indicator = "Gifted"
    elif score >= 60:
        indicator = "Strong"
    elif score >= 40:
        indicator = "Growing"
    else:
        indicator = "Getting started"
    evidence = [f"{activity['repo_count']} public repo(s)"]
    if activity.get("active_repos", 0) > 0:
        evidence.append(f"{activity['active_repos']} repo(s) updated in the last 6 months")
    else:
        evidence.append("Mostly dormant repositories")
    return {"score": score, "indicator": indicator, "evidence": evidence}


def career_matches(user_skills):
    """Reuse the built-in career dataset to score GitHub-only skills."""
    matches = []
    for career in CAREER_REQUIREMENTS:
        required = career["skills"]
        total = 0
        matched = []
        gaps = []
        for skill, required_level in required.items():
            level = user_skills.get(normalize_skill(skill), 0)
            total += min(level, required_level) / required_level
            if level >= 3:
                matched.append(skill)
            elif level == 0:
                gaps.append(skill)
        confidence = round((total / len(required)) * 100)
        if confidence >= 25:
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


def build_areas_to_improve(activity, repos, matches):
    areas = []
    if not activity.get("recent_activity"):
        areas.append(
            "No repositories pushed in the last 60 days — commit regularly to show an active profile"
        )
    topical = [repo for repo in repos if not repo.get("fork") and repo.get("topics")]
    if len(topical) < 2:
        areas.append("Add topics and descriptions to your repositories for better discoverability")
    top = matches[0] if matches else None
    if top and top.get("skill_gaps"):
        gaps = ", ".join(top["skill_gaps"][:3])
        areas.append(f"Growing your {top['career']} profile — consider learning {gaps}")
    if not areas:
        areas.append("Roughly balanced — keep exploring new technologies and shipping projects")
    return areas


def build_strengths(skills, domains, langs):
    strengths = []
    for signal in skills:
        if signal["confidence"] >= 70:
            strengths.append(
                f"Strong {signal['skill']} signal — {signal['evidence'].lower()}"
            )
    for entry in domains:
        if len(strengths) >= 5:
            break
        if entry["confidence"] >= 70:
            strengths.append(f"Active in {entry['domain']}")
    return strengths[:5]


def analyze(payload):
    repos = payload.get("repos") or []
    languages = language_shares(repos)
    skills = detect_skills(repos)
    domains = detect_domains(repos)
    activity = detect_activity(repos)
    open_source = detect_open_source(repos, activity)

    user_skills = {normalize_skill(signal["skill"]): signal["proficiency"] for signal in skills}
    matches = career_matches(user_skills)
    strengths = build_strengths(skills, domains, languages)
    areas = build_areas_to_improve(activity, repos, matches)

    primary = languages[0]["language"] if languages else "software"
    top_domain = domains[0]["domain"] if domains else None
    top_match = matches[0]["career"] if matches else None

    if top_match:
        summary = (
            f"Active {top_domain.lower() if top_domain else 'technical'} profile with strong "
            f"{primary} skills. Best current match: {top_match}."
        )
    else:
        summary = (
            f"Technical profile built around {primary} with {len(repos)} public repos. "
            "Add more focused projects to unlock career matches."
        )

    return {
        "summary": summary,
        "languages": languages,
        "skills": skills,
        "domains": domains,
        "activity": activity,
        "open_source": open_source,
        "strengths": strengths,
        "areas_to_improve": areas,
        "career_matches": matches,
    }