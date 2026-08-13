"""Built-in demo career dataset for the AI service.

Mirrors the careers seeded into Appwrite (scripts/seed-catalog.mjs).
Kept small and local until the recommendation pipeline reads the
catalog directly from Appwrite Databases.
"""


def _normalize(name):
    return " ".join(str(name).strip().lower().split())


def get_career(career_name):
    """Look up a career by name or stable id. Returns None if not found."""
    target = _normalize(career_name)
    for career in CAREER_REQUIREMENTS:
        if career["id"] == career_name or _normalize(career["name"]) == target:
            return career
    return None


CAREER_REQUIREMENTS = [
    {
        "id": "career_full_stack_developer",
        "name": "Full Stack Developer",
        "education": "college",
        "assessment": 70,
        "experience": 0,
        "skills": {
            "javascript": 4,
            "react": 3,
            "node.js": 4,
            "express": 4,
            "rest apis": 4,
            "sql": 3,
            "git & github": 3,
        },
        "interests": ["web development"],
        "goals": ["internship", "software engineering job"],
        "reasons": ["full-stack", "web"],
    },
    {
        "id": "career_data_analyst",
        "name": "Data Analyst",
        "education": "college",
        "assessment": 70,
        "experience": 0,
        "skills": {
            "sql": 4,
            "python": 3,
            "data analysis": 4,
            "statistics": 4,
            "data visualization": 4,
            "pandas": 3,
        },
        "interests": ["data"],
        "goals": ["internship", "data job"],
        "reasons": ["data", "analytics"],
    },
    {
        "id": "career_cloud_engineer",
        "name": "Cloud Engineer",
        "education": "college",
        "assessment": 75,
        "experience": 1,
        "skills": {
            "aws": 4,
            "linux": 4,
            "docker": 4,
            "kubernetes": 4,
            "ci/cd": 4,
        },
        "interests": ["cloud"],
        "goals": ["cloud job", "devops internship"],
        "reasons": ["cloud", "infrastructure"],
    },
    {
        "id": "career_security_analyst",
        "name": "Security Analyst",
        "education": "college",
        "assessment": 75,
        "experience": 0,
        "skills": {
            "network security": 4,
            "security compliance": 4,
            "linux": 3,
            "cryptography": 3,
            "penetration testing": 4,
        },
        "interests": ["cybersecurity"],
        "goals": ["security job", "internship"],
        "reasons": ["security"],
    },
]
