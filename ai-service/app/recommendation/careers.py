"""Built-in demo career dataset for the AI service.

Mirrors the careers seeded into Appwrite (scripts/seed-catalog.mjs).
Kept small and local until the recommendation pipeline reads the
catalog directly from Appwrite Databases.
"""

CAREER_REQUIREMENTS = [
    {
        "name": "Full Stack Developer",
        "education": "college",
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
        "name": "Data Analyst",
        "education": "college",
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
        "name": "Cloud Engineer",
        "education": "college",
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
        "name": "Security Analyst",
        "education": "college",
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