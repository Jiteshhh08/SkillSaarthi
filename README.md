# 🎯 Skill_Guide — One-Stop Personalized Career & Education Advisor

> **An intelligent, personalized career and education guidance platform that helps students and learners discover suitable career paths, identify skill gaps, build personalized roadmaps, and track their progress.**

---

## 🏆 Smart India Hackathon

**Problem Statement:** One-Stop Personalized Career & Education Advisor
**PS ID:** SIH25094
**Theme:** Education & Skill Development
**Institution:** Thakur College of Engineering and Technology, Kandivali, Mumbai

The project is being developed as a Smart India Hackathon solution based on the provided problem statement document.

---

# 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem](#-problem)
* [Our Solution](#-our-solution)
* [How It Works](#-how-it-works)
* [Key Features](#-key-features)
* [Target Users](#-target-users)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Development Workflow](#-development-workflow)
* [Documentation](#-documentation)
* [Roadmap](#-roadmap)
* [Contributing](#-contributing)

---

# 🚀 About the Project

**Skill_Guide** is a personalized career and education advisor designed for:

* High school students
* College students
* Job seekers
* Learners exploring new career paths

Instead of providing generic career advice, Skill_Guide analyzes a user's:

* Education
* Skills
* Interests
* Goals
* Assessment results
* Projects
* Experience
* Career preferences

and uses this information to generate personalized career recommendations and learning roadmaps.

The platform is designed around a continuous career-development loop:

```text
Understand User
      ↓
Recommend Careers
      ↓
Identify Skill Gaps
      ↓
Create Personalized Roadmap
      ↓
Learn & Build
      ↓
Track Progress
      ↓
Reassess
      ↓
Improve Recommendations
```

---

# ❓ Problem

Students and learners often face difficulty answering questions such as:

> "Which career is right for me?"

> "What skills do I need?"

> "What am I missing?"

> "Which course should I take?"

> "What should I build?"

> "Am I ready for an internship?"

> "What happens if I learn another skill?"

Career information is often distributed across multiple platforms, making it difficult for users to create a clear and personalized path.

Skill_Guide brings these capabilities together into a single platform.

---

# 💡 Our Solution

Skill_Guide creates a **personalized career profile** for each user.

The platform then analyzes that profile against career requirements and generates:

### 🎯 Career Recommendations

Multiple career paths ranked according to the user's profile.

### 🧩 Skill Gap Analysis

Shows which skills the user already has and which skills they need to develop.

### 🗺️ Personalized Roadmap

Creates an actionable sequence of learning activities, projects, certifications, and preparation tasks.

### 🔮 What-If Career Simulator

Allows users to experiment with hypothetical skills and see how their career recommendations may change.

### 📄 Resume Analysis

Analyzes a user's resume and identifies relevant skills, experience, projects, and potential gaps.

### 🐙 GitHub Profile Analysis

Analyzes publicly available GitHub information to understand the user's technical profile and project activity.

### 🎓 Course Recommendations

Suggests learning resources according to career goals and skill gaps.

### 💼 Internship Recommendations

Helps users discover internship opportunities relevant to their profile.

### 🤖 AI Career Assistant

Provides conversational career guidance using the user's career context.

---

# 🔄 How It Works

## 1. Create an Account

The user signs up and logs into the platform.

```text
Sign Up
   ↓
Login
```

---

## 2. Select Education Level

The user selects their current stage:

```text
High School
College Student
Job Seeker
```

The onboarding process adapts according to the selected category.

---

## 3. Build Your Career Profile

The user provides information such as:

* Education
* Academic performance
* Skills
* Interests
* Projects
* Experience
* Certifications
* Career preferences
* Goals

---

## 4. Complete Assessment

The system collects additional information related to:

* Interests
* Aptitude
* Work preferences
* Career preferences
* Technical inclination
* Problem-solving
* Creativity

---

## 5. Get Career Recommendations

The recommendation engine analyzes the profile and generates multiple career matches.

Example:

```text
Full Stack Developer       87%
Software Engineer          82%
Backend Developer          76%
Data Analyst               64%
```

The scores represent **internal recommendation scores**, not guaranteed career outcomes.

---

## 6. Understand Your Skill Gaps

The system compares the user's current skills with the skills required for a selected career.

```text
JavaScript       █████████░  Strong
React            ████████░░  Strong
Node.js          ████░░░░░░  Developing
SQL              ███░░░░░░░  Developing
Docker           ██░░░░░░░░  Beginner
```

---

## 7. Generate a Roadmap

The system generates an ordered learning and development roadmap.

Example:

```text
Phase 1
JavaScript Advanced Concepts
       ↓
Phase 2
Node.js + Express
       ↓
Phase 3
SQL + Database Design
       ↓
Phase 4
REST APIs
       ↓
Phase 5
Full-Stack Project
       ↓
Phase 6
Resume + Interview Preparation
```

---

## 8. Track Progress

Users can:

* Start tasks
* Complete tasks
* Pause tasks
* Modify tasks
* Reorder tasks
* Add custom tasks

Their progress is reflected on the dashboard.

---

# ✨ Key Features

| Feature                       | Description                          |
| ----------------------------- | ------------------------------------ |
| 🎯 Career Recommendations     | Personalized career suggestions      |
| 🧩 Skill Gap Analysis         | Identifies missing skills            |
| 🗺️ Personalized Roadmap      | Creates an actionable career path    |
| 🔮 What-If Simulator          | Simulates changes in skills          |
| 📊 Career Comparison          | Compare different career paths       |
| 📄 Resume Analysis            | Analyze resume alignment             |
| 🐙 GitHub Analysis            | Analyze public GitHub profile        |
| 🎓 Course Recommendations     | Discover relevant learning resources |
| 💼 Internship Recommendations | Discover relevant internships        |
| 🤖 AI Career Assistant        | Conversational career guidance       |
| 🔔 Personalized Notifications | Progress and recommendation updates  |
| 📈 Progress Tracking          | Track roadmap completion             |
| 🧭 Career Explorer            | Explore different career paths       |


## Notifications

Roadmap task due
       ↓
Node Backend
       ↓
Appwrite Messaging
       ↓
User notification

## Resume Analysis

User
 ↓
React
 ↓
Appwrite Storage
 ↓
Resume PDF
 ↓
Node Backend
 ↓
Python AI Service
 ↓
Resume Analysis

---

# 👥 Target Users

## 🎒 High School Students

For students beginning to explore possible career directions.

---

## 🎓 College Students

For students developing skills, building projects, and preparing for internships and employment.

---

## 💼 Job Seekers

For graduates and professionals exploring employment opportunities or career transitions.

---

# 🧠 Intelligent Recommendation System

Skill_Guide uses a **hybrid recommendation architecture** rather than relying entirely on a machine-learning model.

```text
                User Profile
                     ↓
              Data Processing
                     ↓
          ┌──────────┼──────────┐
          ↓          ↓          ↓
      Rule-Based   Skill      Optional
       Matching   Matching       ML
          │          │          │
          └──────────┼──────────┘
                     ↓
             Career Ranking
                     ↓
              Skill Gap Analysis
                     ↓
             Roadmap Generation
```

This approach allows the MVP to work reliably even without a large machine-learning dataset.

---

# 🛠️ Technology Stack

## Frontend

* React
* JavaScript
* Tailwind CSS
* React Router
* Axios (Node backend calls)
* Appwrite Web SDK

## Infrastructure & Data

* Appwrite Authentication
* Appwrite Databases (primary data store — NoSQL)
* Appwrite Storage
* Appwrite Messaging
* Appwrite Realtime

## Backend (server/)

* Node.js + Express
* REST APIs
* Business logic
* Appwrite server integration
* External APIs
* AI service orchestration

## Data Model

* Appwrite Databases collections
* Users' career data
* Skills
* Careers
* Career-skill mappings
* Recommendations
* Roadmaps
* Courses
* Internships
* Assessments

## AI / ML

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn
* Optional LLM integration

## Development

* Git
* GitHub

---

# 🏗️ System Architecture

```text
                    USER
                      │
                      ▼
              ┌───────────────┐
              │ React +       │
              │ Tailwind      │
              └───────┬───────┘
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
   ┌──────────────┐        ┌──────────────┐
   │   Appwrite   │        │ Node/Express  │
   │              │        │   Backend     │
   │ Auth         │        │               │
   │ Databases    │        │ Business      │
   │ Storage      │        │ Logic         │
   │ Messaging    │        │ APIs          │
   │ Realtime     │        └───────┬───────┘
   └──────────────┘                │
                                   ▼
                          ┌──────────────┐
                          │ Python AI    │
                          │ FastAPI      │
                          └──────────────┘
```

For the complete architecture, database design, ER diagram, API architecture, AI architecture, and data flows:

📖 **See [`docs/main_architecture.md`](docs/main_architecture.md)**

---

# 📂 Project Structure

```text
skill-guide/
│
├── src/                      # React frontend (repo root)
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── private/           # Dashboard, Assessment, EducationLevel
│   │   └── onboarding/        # Multi-step profile wizard
│   ├── services/             # appwrite.js, api.js, auth.js, profile.js, skills.js, interests.js, assessment.js, careers.js, recommendations.js
│   ├── hooks/
│   ├── context/
│   ├── routes/
│   └── App.jsx
│
├── public/
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/      # career, recommendation
│   │   ├── services/         # appwrite, ai, career, recommendation
│   │   ├── middleware/       # auth, error
│   │   ├── routes/           # health, careers, recommendations
│   │   └── utils/
│   └── package.json
│
├── ai-service/               # Python AI/ML service
│   ├── app/
│   │   ├── recommendation/   # careers.py (dataset), scoring.py (engine)
│   │   └── main.py           # /health, /ai/careers, /ai/recommend-careers, /ai/skill-gaps
│   ├── models/
│   ├── data/
│   └── requirements.txt
│
├── docs/
│   ├── PRD.md
│   ├── main_architecture.md
│   └── rules.md
│
├── .env
├── .env.sample
├── .gitignore
├── vite.config.js
└── package.json
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.x
* Git
* An Appwrite project (cloud at https://cloud.appwrite.io or a self-hosted instance)

---

# 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd skill-guide
```

---

# 2. Setup Appwrite

1. Create an Appwrite project in the console and enable the **Email/Password** authentication provider.
2. Create an **API key** in Settings → API Keys with `databases.*` and `storage.*` scopes.
3. Run the setup script to create the database, collections, attributes, indexes, and resume bucket:

```bash
cp scripts/.env.setup.example scripts/.env.setup
# fill in APPWRITE_PROJECT_ID and APPWRITE_API_KEY in scripts/.env.setup

npm run setup:appwrite
```

4. Copy `.env.sample` to `.env` and fill in `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`, and `VITE_APPWRITE_DATABASE_ID`.
5. Seed the global catalogs (`skills`, `interests`, `careers`, `courses`, `internships`) so the onboarding skill/interest steps and Phase 3 have data to work with:

```bash
npm run seed:catalog
```

> The setup and seed scripts are idempotent — safe to re-run after pulling new schema changes.

---

# 3. Setup Frontend (repo root)

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

# 4. Setup Backend

Open another terminal:

```bash
cd server
npm install
npm run dev
```

Create `server/.env` with the backend variables from the Environment Variables section below (Appwrite API key, database ID, AI service URL).

---

# 5. Setup AI Service

Open another terminal:

```bash
cd ai-service
python -m venv venv
```

Install dependencies using the venv's own Python. The Windows PowerShell execution policy often blocks the `.ps1` activation script, so preferring to call the venv directly avoids an activation step entirely.

### Windows (PowerShell)

```powershell
cd ai-service
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### macOS / Linux

```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
```

Run the service:

### Windows (PowerShell)

```powershell
cd ai-service
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### macOS / Linux

```bash
cd ai-service
source venv/bin/activate
uvicorn app.main:app --reload
```

The service runs at `http://127.0.0.1:8000` — health check: `http://127.0.0.1:8000/health`.

Endpoints:

```text
GET  /health                     service health
GET  /ai/careers                 scoring catalog (13 careers)
POST /ai/recommend-careers       ranked recommendations + explanations
POST /ai/skill-gaps              strong vs needs-improvement for one career
```

> **Windows note:** PowerShell 5.1 does not support `&&` (use `;` to chain commands). If you prefer to activate the venv explicitly, run `Set-ExecutionPolicy -Scope Process RemoteSigned` once, then activate with `.\venv\Scripts\Activate.ps1`.

---

# 🧭 Phase 2 — Profile & Onboarding

Phase 2 (complete) builds the user's structured career profile in Appwrite. This profile is the primary input to the Phase 3 recommendation engine.

## User flow

```text
Sign up
   ↓
/onboarding — multi-step wizard
   ├── 1. Education level
   ├── 2. Academic info (fields vary by education level)
   ├── 3. Skills (+ proficiency 1–5)
   ├── 4. Interests
   ├── 5. Career preferences
   └── 6. Career assessment (10-question questionnaire)
       ↓
Onboarding marked complete → /dashboard
```

* New users land on `/onboarding` right after signup.
* The wizard resumes at the first **incomplete** step for returning users (each step can be skipped).
* `/assessment` is available any time to retake the career assessment and compare scores.
* `/onboarding/education-level` lets users change their education level later from the dashboard.
* `/dashboard` is gated by `ProfileCompleteRoute`, which requires `onboarding_completed = true`.

## Profile data

The `profiles` document (document ID = the Appwrite user `$id`) stores:

| Field | Purpose |
|---|---|
| `education_level` | `high_school`, `college`, or `job_seeker` |
| `degree`, `branch`, `study_year`, `cgpa` | College academic info |
| `subjects`, `academic_strengths` | Academic information (all levels) |
| `experience_years` | Work experience (job seekers) |
| `career_goal`, `preferred_role`, `preferred_industry`, `preferred_location`, `work_preference` | Career preferences |
| `assessment_score` | Latest career assessment score (0–100) |
| `onboarding_completed` | Flags a complete profile; gates `/dashboard` |

Skills, interests, and assessment attempts live in their own collections:

| Collection | Stores |
|---|---|
| `user_skills` | `user_id`, `skill_id`, `proficiency` (1–5) |
| `user_interests` | `user_id`, `interest_id` |
| `assessments` | `user_id`, `type`, `score`, `responses`, `created_at` |

* The global `skills` and `interests` catalogs are seeded via `npm run seed:catalog`. Until then, the frontend falls back to a built-in list so the flow always works in dev.

## Upgrading an existing Appwrite setup

Phase 2 added attributes to `profiles` (`subjects`, `academic_strengths`, `preferred_role`, `work_preference`, `experience_years`, `assessment_score`, `onboarding_completed`). The setup script is idempotent — re-run it to add the missing attributes and indexes:

```bash
npm run setup:appwrite
```

## Frontend services

* `src/services/profile.js` — profile CRUD, academic info, career preferences, onboarding completion
* `src/services/skills.js` — skill catalog + `user_skills` CRUD (proficiency)
* `src/services/interests.js` — interest catalog + `user_interests` CRUD
* `src/services/assessment.js` — questionnaire, scoring, persistence
* `src/pages/onboarding/` — the multi-step wizard
* `src/pages/private/Assessment.jsx` — standalone assessment page

---

# 🧠 Phase 3 — Core Intelligence

Phase 3 (complete) implements the product's core intelligence: the career/skill
datasets, the career-skill mapping, the recommendation engine, skill-gap analysis,
and explainable recommendations.

## What was built

| Sub-part | Where |
|---|---|
| Career dataset | `ai-service/app/recommendation/careers.py` (13 careers) + Appwrite `careers` collection |
| Skill dataset | Appwrite `skills` collection (seeded) |
| Career-skill mapping | Appwrite `career_skills` collection (`required_level` 1–5, `importance` 1–5) |
| Recommendation engine | `ai-service/app/recommendation/scoring.py` (`score_careers`) |
| Skill-gap analysis | `ai-service/app/recommendation/scoring.py` (`analyze_skill_gaps`) + `/ai/skill-gaps` |
| Recommendation explanations | `reasons`, `strengths`, `next_steps`, score `breakdown` in every recommendation |

## Recommendation scoring

The engine implements the hybrid weighted formula from
[`docs/main_architecture.md`](docs/main_architecture.md) §23:

```text
Career Score =
    Skill Match       × 0.40   (importance-weighted, skill proficiency 1–5)
  + Interest Match    × 0.20
  + Assessment Match  × 0.15
  + Education Match   × 0.10   (against the career's accepted education levels)
  + Goal Match        × 0.10
  + Experience Match  × 0.05
```

Every recommendation includes an explainable payload:

* `score` — 0–100 internal match score (not a career guarantee)
* `breakdown` — per-factor contribution (skill/interest/education/goal/assessment/experience)
* `reasons` — why this career matches ("Strong React skills (3/4)", "Interest in Web Development")
* `strengths` — skills the user already meets
* `skill_gaps` — required skills the user has not yet met
* `next_steps` — ordered "Learn/Strengthen X (level a → b)" actions

## API endpoints (Node backend)

All routes require `Authorization: Bearer <jwt>` (Appwrite session token).

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/careers` | List career catalog with required skills |
| `GET` | `/api/careers/:careerId` | Single career with required skills |
| `POST` | `/api/recommendations/generate` | Generate + persist recommendations for the user (`body: { top_n? }`) |
| `GET` | `/api/recommendations` | Saved recommendations |
| `GET` | `/api/recommendations/:id` | Single saved recommendation |
| `GET` | `/api/recommendations/careers/:careerId/skill-gaps` | Skill-gap analysis for a career |

> If the AI service is down, `/api/recommendations/generate` returns a controlled
> `503 AI_SERVICE_UNAVAILABLE` error (per architecture §42) and the frontend can
> show "Recommendations are temporarily unavailable."

## Frontend services

* `src/services/careers.js` — career catalog + skill-gap API calls
* `src/services/recommendations.js` — generate/list/get recommendation API calls

## Upgrading an existing Appwrite setup

Phase 3 changed `career_skills` semantics: `required_level` is now on the user
proficiency scale (1–5) and `importance` on 1–5 (previously mixed scales). The
seed script now **updates** existing `career_skills` documents instead of skipping
them, so re-running it repairs existing data:

```bash
npm run seed:catalog
```

---

# 🔐 Environment Variables

Create `.env` files based on `.env.sample`.

## Frontend (repo root)

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_API_BASE_URL=http://localhost:5000
```

## Backend (`server/.env`)

```env
PORT=5000

APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=

AI_SERVICE_URL=http://localhost:8000

GITHUB_TOKEN=
LLM_API_KEY=
```

## AI Service (`ai-service/.env`)

```env
PORT=8000

LLM_API_KEY=
```

> Never commit real secrets to GitHub.

---

# 🌱 Development Workflow

We use feature branches.

```text
main
 │
 ├── feature/authentication
 ├── feature/dashboard
 ├── feature/career-recommendation
 ├── feature/roadmap
 └── feature/resume-analysis
```

Basic workflow:

```bash
git checkout -b feature/<feature-name>

git add .

git commit -m "feat: add <feature>"

git push origin feature/<feature-name>
```

Then create a Pull Request.

The `main` branch should remain stable.

For complete development rules:

📖 **See [`docs/rules.md`](docs/rules.md)**

---

# 🗺️ Development Roadmap

## Phase 1 — Foundation

* [x] Repository setup
* [x] Frontend setup
* [x] Backend setup
* [x] Appwrite setup (project, database, collections)
* [x] Authentication
* [x] Basic UI system

---

## Phase 2 — User Profile

* [x] Education-level selection
* [x] Profile onboarding
* [x] Skills
* [x] Interests
* [x] Career preferences
* [x] Assessment

---

## Phase 3 — Core Intelligence

* [x] Career dataset
* [x] Skill dataset
* [x] Career-skill mapping
* [x] Recommendation engine
* [x] Skill-gap analysis
* [x] Recommendation explanations

---

## Phase 4 — Roadmap

* [ ] Roadmap generator
* [ ] Roadmap tasks
* [ ] Progress tracking
* [ ] Task modification
* [ ] Dashboard

---

## Phase 5 — Differentiating Features

* [ ] What-If simulator
* [ ] Career comparison
* [ ] Career explorer
* [ ] Resume analysis
* [ ] Course recommendations

---

## Phase 6 — Advanced Features

* [ ] GitHub analysis
* [ ] Internship recommendations
* [ ] AI career assistant
* [ ] Personalized notifications
* [ ] Advanced ML recommendation

---

# 📚 Documentation

| Document                                            | Purpose                                         |
| --------------------------------------------------- | ----------------------------------------------- |
| [`PRD.md`](docs/PRD.md)                             | Product requirements and feature specifications |
| [`main_architecture.md`](docs/main_architecture.md) | Complete system and database architecture       |
| [`rules.md`](docs/rules.md)                         | Development and team rules                      |

Future documentation:

```text
docs/
├── PRD.md
├── main_architecture.md
├── rules.md
├── API.md
├── DATABASE.md
├── AI.md
├── SETUP.md
└── CONTRIBUTING.md
```

---

# 🔒 Security

Skill_Guide handles personal user information.

The application follows these principles:

* Passwords are hashed.
* Authentication is required for private resources.
* Users can only access their own private data.
* API inputs are validated.
* Secrets are stored in environment variables.
* Resume files are handled securely.
* Private GitHub data is never accessed without authorization.
* External API failures are handled gracefully.

---

# ⚠️ Important Disclaimer

Skill_Guide provides **personalized guidance and recommendations**.

Career recommendations are not guarantees of:

* Employment
* Salary
* Admission
* Academic success
* Career success

Recommendation scores are internal platform metrics intended to help users understand their current alignment with different career paths.

Users should use the platform as a decision-support tool and consider additional factors when making important education and career decisions.

---

# 🎯 Project Goal

Skill_Guide aims to move career guidance from:

```text
"What career should I choose?"
```

to:

```text
"Here are the careers that currently match your profile,
here is why,
here are your skill gaps,
and here is exactly what you can work on next."
```

---

# 🤝 Contributing

Before contributing:

1. Read [`docs/rules.md`](docs/rules.md)
2. Check existing issues/tasks.
3. Create a feature branch.
4. Implement the feature.
5. Test it locally.
6. Commit using the project commit convention.
7. Create a Pull Request.
8. Request review.
9. Fix review comments.
10. Merge only after approval.

---

# ⭐ Project Principle

> **Build one coherent product, not six separate mini-projects.**

Every feature should strengthen the central product loop:

```text
UNDERSTAND USER
      ↓
RECOMMEND CAREER
      ↓
IDENTIFY GAPS
      ↓
CREATE ROADMAP
      ↓
LEARN & BUILD
      ↓
TRACK PROGRESS
      ↓
UPDATE RECOMMENDATIONS
```

---

## 🚀 Skill_Guide

**Understand yourself. Discover possibilities. Build your path.**
