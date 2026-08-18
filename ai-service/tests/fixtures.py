"""Shared resume fixtures for the pipeline tests."""


def sample_resume():
    return {
        "personal": {
            "name": "Jane Doe",
            "title": "Frontend Developer",
            "email": "jane.doe@example.com",
            "phone": "+1 555 0100",
            "location": "Mumbai, India",
            "linkedin": "https://linkedin.com/in/janedoe",
            "github": "https://github.com/janedoe",
            "portfolio": None,
        },
        "summary": "Frontend developer focused on React and TypeScript.",
        "education": [
            {
                "institution": "Acme College",
                "degree": "B.Tech",
                "field": "Computer Science",
                "location": "Mumbai",
                "start_date": "2019",
                "end_date": "2023",
                "gpa": "8.5",
                "bullets": [],
            }
        ],
        "experience": [
            {
                "company": "Acme Corp",
                "title": "Software Engineer",
                "location": "Mumbai",
                "start_date": "2020",
                "end_date": "2023",
                "technologies": ["React", "Node.js"],
                "bullets": ["Built a React dashboard for analytics."],
            }
        ],
        "projects": [
            {
                "name": "Analytics Dashboard",
                "link": "https://github.com/janedoe/dashboard",
                "description": "Realtime analytics dashboard.",
                "technologies": ["React", "TypeScript"],
                "bullets": ["Created a REST API using Node.js and Express."],
            }
        ],
        "skills": {
            "languages": [{"name": "JavaScript", "evidence": "Used for dashboard"}],
            "frameworks": [{"name": "React", "evidence": "Built a React dashboard"}],
            "libraries": [],
            "databases": [{"name": "SQL", "evidence": None}],
            "tools": [{"name": "Git", "evidence": None}],
            "cloud": [],
            "other": [],
        },
        "certifications": [],
        "achievements": [],
        "coursework": [],
        "extracurriculars": [],
    }


def minimal_resume():
    return {
        "personal": {"name": "Alex", "email": "alex@example.com"},
        "summary": None,
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {"languages": [], "frameworks": [], "libraries": [], "databases": [], "tools": [], "cloud": [], "other": []},
        "certifications": [],
        "achievements": [],
        "coursework": [],
        "extracurriculars": [],
    }


def llm_analysis():
    return {
        "section_assessment": {
            "contact": {"status": "complete", "notes": ["Email and phone present."]},
            "summary": {"status": "complete", "notes": ["Clear professional summary."]},
            "education": {"status": "complete", "notes": ["Degree and institution listed."]},
            "experience": {"status": "partial", "notes": ["Relevant role but only one position."]},
            "projects": {"status": "complete", "notes": ["Projects show relevant skills."]},
            "skills": {"status": "complete", "notes": ["Strong technology match."]},
            "ats": {"status": "partial", "notes": ["Mostly standard formatting.", "Consider clearer section headings."]},
        },
        "strengths": ["Clear skills section.", "Relevant work history."],
        "weaknesses": ["Only a single role listed."],
        "missing_sections": [],
        "ats_issues": ["Heading size inconsistent in places."],
        "recommendations": ["Quantify project impact where the resume already supports it."],
        "evidence": ["email: jane.doe@example.com"],
    }


def llm_match():
    return {
        "matched_skills": [
            {"name": "React", "evidence": "Built a React dashboard"},
            {"name": "JavaScript", "evidence": "Used throughout"},
        ],
        "missing_skills": [{"name": "Docker", "why": "Required by the job, absent from the resume."}],
        "related_skills": [{"name": "TypeScript", "how": "Similar to JavaScript, not explicitly required."}],
        "experience_match": {"level": "strong", "analysis": "Relevant role for the required experience."},
        "education_match": {"level": "strong", "analysis": "Matches the degree requirement."},
        "project_match": {"level": "partial", "analysis": "Projects are relevant but small."},
        "recommendations": ["Highlight deployment work."],
        "evidence": ["React from dashboard project"],
    }