"""Career dataset for the AI service.

Mirrors the careers seeded into Appwrite (scripts/seed-catalog.mjs). The
document IDs match the Appwrite `careers` collection so the Node backend can
correlate recommendations with the database.

Skill metadata uses two fields per skill:
  - required: minimum proficiency (1-5) expected for the career
  - importance: relative weight of the skill for the career (1-5)
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


def get_all_careers():
    """Return the full career catalog (with skill metadata)."""
    return CAREER_REQUIREMENTS


# Skills: normalized name -> {"required": 1-5, "importance": 1-5}
CAREER_REQUIREMENTS = [
    {
        "id": "full_stack_developer",
        "name": "Full Stack Developer",
        "category": "Software & Technology",
        "description": (
            "Builds and maintains both front-end and back-end of web applications, "
            "working across the full technology stack from databases and APIs to user interfaces."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 70,
        "experience": 0,
        "skills": {
            "javascript": {"required": 4, "importance": 5},
            "react": {"required": 3, "importance": 5},
            "node.js": {"required": 4, "importance": 4},
            "express": {"required": 4, "importance": 4},
            "rest apis": {"required": 4, "importance": 4},
            "sql": {"required": 3, "importance": 4},
            "git & github": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Web Development"],
        "goals": ["internship", "software engineering job", "web development job"],
    },
    {
        "id": "backend_developer",
        "name": "Backend Developer",
        "category": "Software & Technology",
        "description": (
            "Designs and implements server-side logic, databases, and API integrations "
            "that power web and mobile applications."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 70,
        "experience": 0,
        "skills": {
            "node.js": {"required": 4, "importance": 5},
            "express": {"required": 4, "importance": 5},
            "sql": {"required": 4, "importance": 4},
            "rest apis": {"required": 4, "importance": 5},
            "python": {"required": 3, "importance": 3},
            "docker": {"required": 3, "importance": 3},
            "git & github": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Web Development"],
        "goals": ["internship", "software engineering job", "backend job"],
    },
    {
        "id": "frontend_developer",
        "name": "Frontend Developer",
        "category": "Software & Technology",
        "description": (
            "Creates responsive user interfaces and interactive experiences using "
            "modern web technologies and frameworks."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 65,
        "experience": 0,
        "skills": {
            "javascript": {"required": 4, "importance": 5},
            "react": {"required": 4, "importance": 5},
            "html/css": {"required": 4, "importance": 5},
            "typescript": {"required": 3, "importance": 3},
            "next.js": {"required": 3, "importance": 3},
            "git & github": {"required": 3, "importance": 3},
            "communication": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Web Development", "Design"],
        "goals": ["internship", "frontend job", "web development job"],
    },
    {
        "id": "mobile_developer",
        "name": "Mobile Developer",
        "category": "Software & Technology",
        "description": (
            "Builds cross-platform or native mobile applications for iOS and Android, "
            "focusing on performance and user experience."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 65,
        "experience": 0,
        "skills": {
            "javascript": {"required": 4, "importance": 4},
            "typescript": {"required": 3, "importance": 3},
            "rest apis": {"required": 3, "importance": 3},
            "git & github": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
            "communication": {"required": 2, "importance": 2},
        },
        "interests": ["Web Development", "Gaming", "Design"],
        "goals": ["internship", "mobile developer job", "software engineering job"],
    },
    {
        "id": "software_engineer",
        "name": "Software Engineer",
        "category": "Software & Technology",
        "description": (
            "Applies engineering principles to design, develop, test, and maintain "
            "software systems of varying scale and complexity."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 75,
        "experience": 0,
        "skills": {
            "javascript": {"required": 4, "importance": 4},
            "python": {"required": 3, "importance": 4},
            "java": {"required": 3, "importance": 3},
            "sql": {"required": 3, "importance": 3},
            "c++": {"required": 2, "importance": 2},
            "git & github": {"required": 3, "importance": 3},
            "docker": {"required": 3, "importance": 3},
            "problem solving": {"required": 4, "importance": 5},
            "teamwork": {"required": 3, "importance": 3},
        },
        "interests": ["Web Development", "Gaming", "Research"],
        "goals": ["software engineering job", "internship"],
    },
    {
        "id": "data_analyst",
        "name": "Data Analyst",
        "category": "AI & Data",
        "description": (
            "Collects, cleans, and interprets data to help organizations make informed "
            "decisions, producing reports and dashboards."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 65,
        "experience": 0,
        "skills": {
            "sql": {"required": 4, "importance": 5},
            "python": {"required": 3, "importance": 3},
            "data analysis": {"required": 4, "importance": 5},
            "statistics": {"required": 4, "importance": 4},
            "data visualization": {"required": 4, "importance": 4},
            "pandas": {"required": 3, "importance": 3},
            "communication": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Data", "Research"],
        "goals": ["internship", "data analyst job", "data job"],
    },
    {
        "id": "data_scientist",
        "name": "Data Scientist",
        "category": "AI & Data",
        "description": (
            "Uses advanced statistics and machine learning on large datasets to discover "
            "patterns and build predictive models."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 75,
        "experience": 0,
        "skills": {
            "python": {"required": 4, "importance": 5},
            "statistics": {"required": 4, "importance": 4},
            "machine learning": {"required": 4, "importance": 5},
            "data analysis": {"required": 4, "importance": 4},
            "data visualization": {"required": 3, "importance": 3},
            "pandas": {"required": 4, "importance": 4},
            "numpy": {"required": 4, "importance": 3},
            "deep learning": {"required": 3, "importance": 3},
            "problem solving": {"required": 4, "importance": 4},
        },
        "interests": ["Data", "AI/ML", "Research"],
        "goals": ["data scientist job", "data job", "research job"],
    },
    {
        "id": "ml_engineer",
        "name": "ML Engineer",
        "category": "AI & Data",
        "description": (
            "Designs, trains, and deploys machine learning models into production systems "
            "with focus on scalability and reliability."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 80,
        "experience": 1,
        "skills": {
            "python": {"required": 4, "importance": 5},
            "machine learning": {"required": 4, "importance": 5},
            "deep learning": {"required": 4, "importance": 4},
            "statistics": {"required": 3, "importance": 3},
            "data analysis": {"required": 3, "importance": 3},
            "numpy": {"required": 4, "importance": 4},
            "pandas": {"required": 4, "importance": 4},
            "docker": {"required": 3, "importance": 3},
            "problem solving": {"required": 4, "importance": 4},
        },
        "interests": ["AI/ML", "Data", "Research"],
        "goals": ["ml engineer job", "data scientist job", "research job"],
    },
    {
        "id": "ai_engineer",
        "name": "AI Engineer",
        "category": "AI & Data",
        "description": (
            "Builds AI-powered products and services, integrating machine learning models "
            "with application-level systems."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 80,
        "experience": 1,
        "skills": {
            "python": {"required": 4, "importance": 5},
            "machine learning": {"required": 4, "importance": 5},
            "deep learning": {"required": 4, "importance": 4},
            "rest apis": {"required": 3, "importance": 3},
            "git & github": {"required": 3, "importance": 3},
            "docker": {"required": 3, "importance": 3},
            "numpy": {"required": 3, "importance": 3},
            "problem solving": {"required": 4, "importance": 4},
        },
        "interests": ["AI/ML", "Research", "Data"],
        "goals": ["ai engineer job", "ml engineer job", "research job"],
    },
    {
        "id": "cloud_engineer",
        "name": "Cloud Engineer",
        "category": "Cloud",
        "description": (
            "Designs and manages cloud infrastructure and services, ensuring security, "
            "scalability, and cost efficiency."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 75,
        "experience": 1,
        "skills": {
            "aws": {"required": 4, "importance": 5},
            "linux": {"required": 4, "importance": 4},
            "docker": {"required": 4, "importance": 4},
            "kubernetes": {"required": 4, "importance": 4},
            "ci/cd": {"required": 4, "importance": 4},
            "network security": {"required": 3, "importance": 3},
            "git & github": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Cloud"],
        "goals": ["cloud job", "devops internship"],
    },
    {
        "id": "devops_engineer",
        "name": "DevOps Engineer",
        "category": "Cloud",
        "description": (
            "Automates software delivery and infrastructure to accelerate releases while "
            "maintaining stability and security."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 75,
        "experience": 1,
        "skills": {
            "linux": {"required": 4, "importance": 4},
            "docker": {"required": 4, "importance": 5},
            "kubernetes": {"required": 4, "importance": 4},
            "ci/cd": {"required": 4, "importance": 5},
            "aws": {"required": 4, "importance": 4},
            "git & github": {"required": 4, "importance": 4},
            "python": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Cloud"],
        "goals": ["devops job", "cloud job"],
    },
    {
        "id": "security_analyst",
        "name": "Security Analyst",
        "category": "Cybersecurity",
        "description": (
            "Monitors systems for security threats, conducts vulnerability assessments, "
            "and implements protective measures."
        ),
        "education_levels": ["high_school", "college", "job_seeker"],
        "assessment": 70,
        "experience": 0,
        "skills": {
            "network security": {"required": 4, "importance": 5},
            "security compliance": {"required": 4, "importance": 4},
            "linux": {"required": 3, "importance": 3},
            "cryptography": {"required": 3, "importance": 3},
            "penetration testing": {"required": 4, "importance": 4},
            "problem solving": {"required": 3, "importance": 3},
            "communication": {"required": 3, "importance": 3},
        },
        "interests": ["Cybersecurity"],
        "goals": ["security job", "internship"],
    },
    {
        "id": "security_engineer",
        "name": "Security Engineer",
        "category": "Cybersecurity",
        "description": (
            "Designs and engineers secure systems and infrastructure, building security "
            "tooling and automating defenses."
        ),
        "education_levels": ["college", "job_seeker"],
        "assessment": 75,
        "experience": 1,
        "skills": {
            "network security": {"required": 4, "importance": 5},
            "penetration testing": {"required": 4, "importance": 5},
            "cryptography": {"required": 4, "importance": 4},
            "linux": {"required": 4, "importance": 4},
            "security compliance": {"required": 4, "importance": 4},
            "python": {"required": 3, "importance": 3},
            "docker": {"required": 3, "importance": 3},
            "problem solving": {"required": 3, "importance": 3},
        },
        "interests": ["Cybersecurity"],
        "goals": ["security job", "internship"],
    },
]
