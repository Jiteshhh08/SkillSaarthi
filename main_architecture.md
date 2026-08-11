# Product Requirements Document (PRD)

# One-Stop Personalized Career & Education Advisor

**Project Type:** Smart India Hackathon
**Problem Statement:** PS-09 — One-Stop Personalized Career & Education Advisor
**PS ID:** SIH25094
**Source listed in provided problem-statement document:** Smart India Hackathon 2025 — Government of Jammu & Kashmir.

---

# 1. Product Overview

## 1.1 Product Name

**One-Stop Personalized Career & Education Advisor**

Working product name:

**CareerCompass**

> The product name can be changed later.

---

## 1.2 Product Vision

To build an intelligent, personalized career and education guidance platform that helps students, learners, and job seekers understand:

* Which career paths suit them
* Why those careers suit them
* What skills they currently possess
* Which skills they are missing
* What they should learn next
* Which courses and certifications can help them
* Which projects they should build
* Which internships/jobs may suit them
* How their career options change when they acquire new skills

The platform should not simply tell users:

> "You should become a Software Engineer."

Instead, it should answer:

> "Based on your profile, this career is a strong match because of X, Y, and Z. These are your current skill gaps, and this is the personalized roadmap you can follow to become career-ready."

---

# 2. Problem Statement

Students and learners often struggle with:

* Choosing an appropriate career
* Understanding available career paths
* Knowing which skills are required for a career
* Understanding their current skill gaps
* Finding relevant courses
* Finding suitable projects
* Finding relevant internships
* Understanding how different skills affect career opportunities
* Receiving personalized guidance instead of generic career advice

Existing platforms frequently provide isolated services such as:

* Course discovery
* Job search
* Resume creation
* Career quizzes
* Skill learning

The proposed platform combines these capabilities into a **single personalized career guidance ecosystem**.

---

# 3. Target Users

The platform targets three primary categories.

## 3.1 High School Students

Students who are beginning to explore possible career paths.

Possible information:

* Grade/class
* Academic performance
* Favorite subjects
* Interests
* Strengths
* Career interests
* Preferred fields

---

## 3.2 College Students

Students who are actively developing skills and preparing for internships/jobs.

Possible information:

* Degree
* Branch
* Year
* CGPA
* Subjects
* Technical skills
* Soft skills
* Projects
* Certifications
* Interests
* Career preferences
* Internship goals

---

## 3.3 Job Seekers

Users who have completed their education and are looking for employment or career transitions.

Possible information:

* Education
* Experience
* Current skills
* Previous roles
* Projects
* Certifications
* Resume
* Target role
* Preferred industry
* Location preferences

---

# 4. Product Goals

## Primary Goals

1. Provide personalized career recommendations.
2. Identify user skill gaps.
3. Generate personalized learning roadmaps.
4. Help users understand career requirements.
5. Recommend relevant learning resources.
6. Recommend projects and certifications.
7. Recommend relevant internships/jobs.
8. Allow users to compare career paths.
9. Allow users to simulate "what-if" career scenarios.
10. Track roadmap progress.
11. Continuously improve recommendations based on user progress.
12. Provide explainable recommendations.

---

# 5. Product Philosophy

The platform should follow one central principle:

> **"We don't just tell students what career to choose — we show them what they need to do next to reach it."**

The entire system should revolve around:

```text
User Profile
      ↓
Career Recommendation
      ↓
Skill Gap Analysis
      ↓
Personalized Roadmap
      ↓
Learning / Projects / Certifications
      ↓
Internships / Jobs
      ↓
Progress Tracking
      ↓
Updated Career Readiness
```

---

# 6. High-Level User Workflow

```text
User
 ↓
Home Page
 ↓
Login / Signup
 ↓
Select Education Level
 ↓
Career Onboarding
 ↓
Personal Career Profile
 ↓
Assessment
 ↓
AI / Recommendation Engine
 ↓
Career Recommendations
 ↓
Skill Gap Analysis
 ↓
Personalized Roadmap
 ↓
Dashboard
 ↓
Track / Modify / Complete Roadmap
 ↓
Additional Career Tools
```

---

# 7. Public Pages

The following pages are accessible without authentication.

## 7.1 Home

The homepage should explain:

* What the platform does
* Who it is for
* How it works
* Key features
* Benefits
* Call-to-action

Primary CTAs:

* Get Started
* Login
* Sign Up

---

## 7.2 About

Explain:

* Product vision
* Problem being solved
* Target audience
* Core capabilities
* How personalization works

---

## 7.3 How It Works

Recommended flow:

```text
Create Profile
      ↓
Complete Assessment
      ↓
Get Career Recommendations
      ↓
Discover Skill Gaps
      ↓
Get Personalized Roadmap
      ↓
Track Progress
```

---

## 7.4 Explore Careers

Public career exploration page.

Users can browse career categories.

Example:

```text
Software & Technology
 ├── Full Stack Developer
 ├── Backend Developer
 ├── Frontend Developer
 ├── Mobile Developer
 └── Software Engineer

AI & Data
 ├── Data Analyst
 ├── Data Scientist
 ├── ML Engineer
 └── AI Engineer

Cloud
 ├── Cloud Engineer
 └── DevOps Engineer

Cybersecurity
 ├── Security Analyst
 └── Security Engineer
```

Each career should contain:

* Career description
* Required skills
* Recommended skills
* Education requirements
* Typical roadmap
* Related careers
* Recommended projects
* Recommended certifications
* Relevant courses

Authenticated users should additionally see:

> **Your current match: XX%**

---

# 8. Authentication

## Public Authentication Pages

* Login
* Signup
* Forgot Password
* Reset Password

Authentication should protect all private user data.

---

# 9. Education-Level Selection

After signup, the user must select their current stage.

Options:

```text
High School Student
College Student
Job Seeker
```

The platform should dynamically configure the onboarding experience based on the selected category.

Users must be able to modify their education level later from their profile.

---

# 10. Career Onboarding

The onboarding process should be divided into multiple steps rather than presenting one large form.

## Step 1 — Education

Fields vary according to education level.

## Step 2 — Academic Information

* Subjects
* Grades/CGPA
* Academic strengths

## Step 3 — Skills

* Technical skills
* Soft skills
* Skill proficiency

## Step 4 — Interests

Examples:

* Web Development
* AI/ML
* Cybersecurity
* Cloud
* Data
* Design
* Finance
* Research
* Entrepreneurship

## Step 5 — Career Preferences

* Preferred industry
* Preferred role
* Work preference
* Location preference
* Internship/job goals

## Step 6 — Projects & Experience

* Projects
* Experience
* Certifications
* Achievements

## Step 7 — Career Assessment

A personalized questionnaire evaluates:

* Interests
* Aptitude
* Work preferences
* Problem-solving orientation
* Technical inclination
* Creativity
* Communication
* Career preferences

---

# 11. Personal Career Profile

The system converts user input into a structured profile.

Example:

```json
{
  "education": "B.Tech",
  "branch": "Computer Science",
  "year": 2,
  "cgpa": 8.1,
  "skills": {
    "javascript": 4,
    "react": 4,
    "python": 2,
    "sql": 1
  },
  "interests": [
    "web development",
    "software engineering"
  ],
  "goals": [
    "internship",
    "software engineering job"
  ]
}
```

The profile becomes the primary input to the recommendation system.

---

# 12. AI / Recommendation Engine

The platform will use a **hybrid intelligent recommendation architecture**.

It should not depend entirely on machine learning.

## Layer 1 — Rule-Based Engine

Used for deterministic relationships.

Example:

```text
IF
JavaScript = Advanced
React = Advanced
Web Development Interest = High

THEN

increase Full Stack Developer compatibility
```

---

## Layer 2 — Skill Matching

Compare:

```text
User Skills
      ↓
Career Required Skills
      ↓
Skill Similarity
      ↓
Career Match Score
```

---

## Layer 3 — Optional ML

The Python service may use lightweight machine-learning algorithms such as:

* Logistic Regression
* Decision Trees
* Random Forest
* Similarity-based recommendation

The exact model should be selected after dataset evaluation.

Deep learning is not required for the MVP.

---

## Layer 4 — LLM

An LLM may optionally be used for:

* Explaining recommendations
* Conversational career guidance
* Roadmap explanations
* Answering career-related questions
* Transforming structured recommendations into natural-language guidance

The LLM must not be treated as the source of truth for structured career data.

---

# 13. Career Recommendation

The system should generate multiple recommendations rather than only one.

Example:

```text
1. Full Stack Developer — 87%
2. Software Engineer — 82%
3. Backend Developer — 76%
4. Data Analyst — 64%
```

Each recommendation should include:

* Match score
* Why it matches
* Strong existing skills
* Missing skills
* Recommended next steps

---

# 14. Explainable Recommendations

For every recommendation, the system should explain:

### Why?

Example:

> Your recommendation is based on your JavaScript and React proficiency, interest in web development, problem-solving preference, and stated software-industry goal.

### What is missing?

Example:

> Your primary gaps are backend development, SQL, and API development.

### What should you do?

Example:

> Learn Node.js → Learn SQL → Build a REST API → Build a full-stack project.

---

# 15. Skill Gap Analysis

The system compares:

```text
Current User Skill
        VS
Career Required Skill
```

Example:

```text
JavaScript       █████████░ 90%
React            ████████░░ 80%
SQL              ████░░░░░░ 40%
Backend          ███░░░░░░░ 30%
```

Skill status:

* 🟢 Strong
* 🟡 Moderate
* 🟠 Developing
* 🔴 Missing

---

# 16. Personalized Roadmap

The roadmap should be generated based on:

* Current skill level
* Target career
* Available time
* Career goals
* Learning preferences
* Existing projects
* Skill gaps

Example:

```text
Month 1
Node.js

Month 2
Express + REST APIs

Month 3
PostgreSQL

Month 4
Authentication

Month 5
Full-Stack Project

Month 6
Resume + Interview Preparation
```

Users should be able to:

* Start tasks
* Pause tasks
* Complete tasks
* Modify tasks
* Reorder tasks
* Add custom tasks
* Track progress

---

# 17. Career What-If Simulator

One of the major differentiating features.

Users can simulate:

> "What happens if I learn Python?"

or:

> "What happens if I learn AWS?"

The system recalculates career compatibility.

Example:

```text
Before:

Full Stack Developer   86%
Data Analyst           64%
Data Scientist         51%

After learning Python:

Full Stack Developer   87%
Data Analyst           76%
Data Scientist         68%
```

The simulator should clearly indicate that these are **estimated recommendation scores**, not guaranteed career outcomes.

---

# 18. Career Comparison

Users can compare multiple careers.

Example:

| Attribute            | Full Stack | Data Scientist |
| -------------------- | ---------- | -------------- |
| Current Match        | 87%        | 51%            |
| Skills Missing       | 3          | 6              |
| Learning Effort      | Medium     | High           |
| Recommended Projects | 3          | 4              |
| Current Strength     | High       | Low            |

---

# 19. Resume Analysis

Users can upload their resume.

The system can extract:

* Skills
* Education
* Experience
* Projects
* Certifications
* Keywords

The system should identify:

* Missing skills
* Career alignment
* Skill inconsistencies
* Potential improvements
* Recommended roles

The resume analysis should feed relevant structured information back into the user's career profile where appropriate.

---

# 20. GitHub Profile Analysis

Users can provide a GitHub profile.

The system can analyze:

* Public repositories
* Languages
* Project activity
* Repository topics
* Contribution activity where available
* Project diversity

Potential output:

```text
Frontend Development     Strong
JavaScript               Strong
Backend Development      Developing
Python                   Basic
Open Source Activity     Moderate
```

GitHub analysis should never claim private information that is not publicly accessible.

---

# 21. Course Recommendations

Courses should be recommended based on:

```text
Career
   +
Skill Gap
   +
Current Skill Level
   +
Learning Goal
```

Each course record should ideally contain:

* Name
* Provider
* Skill
* Level
* Duration
* Link
* Optional cost
* Rating/source metadata where available

---

# 22. Internship Recommendations

Internship recommendations should consider:

* Skills
* Career target
* Education level
* Location
* Experience
* Project portfolio

The system should prioritize relevance rather than simply displaying a generic internship list.

---

# 23. Personalized Notifications

Examples:

> You have completed 60% of your roadmap.

> You have not completed your Node.js task.

> A recommended skill has been added to your roadmap.

> Your career profile has changed significantly.

Notifications should be useful and non-spammy.

---

# 24. AI Career Assistant

The chatbot should answer questions such as:

> Why was Full Stack recommended for me?

> What should I learn after React?

> I only have 5 hours per week. Can you modify my roadmap?

> What skills are required for DevOps?

The assistant should use the user's structured profile and roadmap context where appropriate.

---

# 25. Dashboard

The dashboard acts as the user's career command center.

It should show:

* Career readiness
* Top career match
* Career recommendations
* Skill gaps
* Current roadmap
* Today's recommended action
* Progress
* Recommended courses
* Recommended internships
* Quick access to career tools

---

# 26. Career Readiness Score

The system may calculate a high-level readiness score based on:

* Required skill coverage
* Projects
* Certifications
* Experience
* Assessment performance
* Roadmap completion

This score must be clearly presented as an **internal platform metric**, not an industry-certified score.

---

# 27. Data Requirements

Core datasets:

## Career

* Career ID
* Career name
* Description
* Category
* Industry

## Skills

* Skill ID
* Skill name
* Category

## Career Skills

* Career ID
* Skill ID
* Importance
* Required proficiency

## Courses

* Course ID
* Name
* Provider
* Skill
* Level
* Duration
* URL

## Projects

* Project ID
* Name
* Career
* Skills
* Difficulty

## Internships

* Internship ID
* Role
* Skills
* Company/source
* Location
* Eligibility
* URL

---

# 28. Non-Functional Requirements

## Performance

* Dashboard should load quickly.
* API responses should be optimized.
* Large datasets should use pagination/filtering.

## Security

* Passwords must never be stored in plain text.
* User data must be protected.
* Resume files must be handled securely.
* Authentication must be enforced on private APIs.

## Scalability

The architecture should allow additional:

* Careers
* Skills
* Courses
* Internships
* Users

without major architectural changes.

## Maintainability

* Modular frontend
* Modular backend
* Clear API contracts
* Centralized configuration
* Git-based development workflow

---

# 29. MVP Scope

The MVP must contain:

### Authentication

* Signup
* Login
* Logout

### Profile

* Education
* Skills
* Interests
* Career preferences

### Assessment

* Career assessment

### Core Intelligence

* Career recommendation
* Skill-gap analysis
* Personalized roadmap

### Dashboard

* Recommendations
* Skill gaps
* Roadmap
* Progress tracking

### Differentiator

* Career What-If Simulator

---

# 30. Phase 2

After the MVP:

* Resume analysis
* Course recommendations
* Career comparison
* Career explorer
* AI career assistant

---

# 31. Phase 3

If time permits:

* GitHub analysis
* Internship recommendations
* Personalized notifications
* Advanced ML
* Advanced analytics
* More sophisticated personalization

---

# 32. Success Criteria

The prototype should demonstrate:

1. A new user can create an account.
2. The user can complete career onboarding.
3. The system creates a structured career profile.
4. The system recommends multiple careers.
5. The system explains its recommendations.
6. The system identifies skill gaps.
7. The system generates a roadmap.
8. The user can track roadmap progress.
9. The user can modify roadmap tasks.
10. The user can run a career What-If simulation.
11. Recommendations change when user data changes.
12. The complete flow works through a real deployed prototype.

---

# 33. Core Product Loop

```text
PROFILE
   ↓
ASSESS
   ↓
RECOMMEND
   ↓
IDENTIFY GAPS
   ↓
GENERATE ROADMAP
   ↓
LEARN
   ↓
BUILD
   ↓
TRACK
   ↓
REASSESS
   ↓
UPDATE RECOMMENDATIONS
```

This loop is the heart of the product.
