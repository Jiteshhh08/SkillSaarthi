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
├── .vscode/tasks.json    # VS Code tasks: launch all 3 services in integrated terminals
├── dev.ps1               # Windows: launch all 3 services in separate OS windows
├── dev.sh                # macOS/Linux: launch all 3 services in separate OS windows
├── dev-install.ps1       # Windows: one-time dependency installer
├── dev-install.sh        # macOS/Linux: one-time dependency installer
├── dev-cleanup.ps1       # Windows: kill leftover dev servers on 5173/5000/8000
├── dev-cleanup.sh        # macOS/Linux: kill leftover dev servers on 5173/5000/8000
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

> **Keep it running.** The AI service is a standalone process and must stay up for recommendations
> to work. The Node backend calls it on demand at `AI_SERVICE_URL=http://localhost:8000`; if it is
> down, the app stays usable but the career/skill-gap/GitHub analysis endpoints return a controlled
> "temporarily unavailable" error (see [docs/main_architecture.md §42](docs/main_architecture.md)).
> So during local development you keep **three** things running at once:

| # | Service | Folder | Command | URL |
|---|---------|--------|---------|-----|
| 1 | Frontend (Vite) | repo root | `npm run dev` | http://localhost:5173 |
| 2 | Backend (Express) | `server/` | `npm run dev` | http://localhost:5000 |
| 3 | AI Service (FastAPI) | `ai-service/` | `.\venv\Scripts\python.exe -m uvicorn app.main:app --reload` | http://localhost:8000 |

---

# 6. Start Everything at Once

## Option A — VS Code integrated terminals (recommended)

If you use VS Code, the included **tasks** launch each service in its **own integrated terminal
panel** inside the editor (no external windows). Definitions live in `.vscode/tasks.json`.

1. Open the Skill_Guide folder in VS Code.
2. Run **Terminal → Run Task…** and pick one:
   - **`dev: restart everything (clean, then run)`** (default, **Ctrl/Cmd + Shift + B**) — stops any
     stale dev servers on ports 5173/5000/8000, then starts all three fresh. Use this whenever a
     terminal is missing or a port is reported as "in use".
   - **`dev: run all three`** — starts Frontend, Backend, and AI Service in parallel
   - **`dev: setup then run all three`** — same as above, but first runs the dependency installer
     (use on a fresh clone; afterwards it's a no-op)
   - **`setup: install all dependencies`** — install frontend/backend `node_modules` and create
     `ai-service/venv` + `pip install -r requirements.txt`
   - **`cleanup: stop running dev servers`** — manually kills anything left listening on
     5173/5000/8000

> The frontend task pins Vite to port `5173` with `--strictPort`. If you ever see
> `Port 5173 is in use, trying another one...` or `EADDRINUSE`, it means a previous run is still
> alive — run **`dev: restart everything`** (or **`cleanup`**) to clear it before starting.

Three terminal panels open (Frontend / Backend / AI Service):

| Panel | What it runs | Open at |
|-------|--------------|---------|
| Frontend | Vite | http://localhost:5173 |
| Backend | Express | http://localhost:5000 |
| AI Service | FastAPI (`uvicorn --reload`) | http://localhost:8000 |

## Option B — Standalone terminal windows (any editor)

Covers the case where you are not using VS Code (or prefer separate OS windows). The bundled
scripts install missing dependencies, then open **one terminal window per service**.

### Windows (PowerShell)

```powershell
.\dev.ps1
```

If PowerShell blocks the script, allow it for the current session once:

```powershell
Set-ExecutionPolicy -Scope Process RemoteSigned
```

### macOS / Linux

```bash
./dev.sh
```

## After either option

Keep all three terminals open — closing one stops that service. Everything runs in auto-reload
mode, so changes to frontend/backend code or `ai-service/` Python files restart on save. Confirm the
AI service is ready by opening `http://localhost:8000/health` — it should return
`{"status":"ok","service":"ai-service","version":"0.1.0"}`.

> **Tip:** if the AI service terminal shows nothing, check it for the venv creation/install step
> output — the installers create `ai-service/venv` and pip-install `requirements.txt` automatically
> when they are missing.

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
* **Admins skip onboarding** — if the signup email is in `ADMIN_EMAILS`, signup sends the user
  to `/home` instead, the home page shows an "Open admin panel" CTA, and `ProfileCompleteRoute`
  lets admins through without a completed profile.
* The wizard resumes at the first **incomplete** step for returning users (each step can be skipped).
* `/assessment` is available any time to retake the career assessment and compare scores.
* `/onboarding/education-level` lets users change their education level later from the dashboard.
* `/dashboard` is gated by `ProfileCompleteRoute`, which requires `onboarding_completed = true` (admins exempt).

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

> If the AI service is down, the backend falls back to a rule-based scorer in
> `server/src/services/recommendation.service.js`: it returns `200` with
> `source: "fallback"` estimates instead of the controlled
> `503 AI_SERVICE_UNAVAILABLE` error (see the Phase 4 — AI section below).

## Frontend services

* `src/services/careers.js` — career catalog + skill-gap API calls
* `src/services/recommendations.js` — generate/list/get recommendation API calls

## Frontend pages

Phase 3 UI is wired and routed behind `ProfileCompleteRoute`:

| Page | Route | What it does |
|---|---|---|
| `src/pages/private/Recommendations.jsx` | `/recommendations` | Lists saved matches; "Generate recommendations" rebuilds them from the latest profile |
| `src/pages/private/SkillGaps.jsx` | `/skill-gaps/:careerId?` | Career dropdown + strong/needs-improvement gap analysis (deep-linked from each recommendation) |

The rule of three: if the AI service is running (ai-service on `:8000`), generate + skill-gap
analysis run in Python; if it is down, the backend returns rule-based estimates with
`source: "fallback"` and the pages show an "Estimated · AI offline" badge on each card.

## Upgrading an existing Appwrite setup

Phase 3 changed `career_skills` semantics: `required_level` is now on the user
proficiency scale (1–5) and `importance` on 1–5 (previously mixed scales). The
seed script now **updates** existing `career_skills` documents instead of skipping
them, so re-running it repairs existing data:

```bash
npm run seed:catalog
```

---

# 🤖 Phase 4 — AI

Phase 4 (complete) implements the AI layer as an independent Python service and hardens
the Phase 3 engine against failure.

## What was built

| Sub-part | Where |
|---|---|
| Python AI service | `ai-service/` — FastAPI app on port 8000 |
| Endpoints | `GET /health`, `GET /ai/careers`, `POST /ai/recommend-careers`, `POST /ai/skill-gaps`, `POST /ai/github/analyze` |
| Skill matching + ranking | `ai-service/app/recommendation/scoring.py` (`score_careers`, hybrid weights from §23) |
| Skill-gap analysis | `ai-service/app/recommendation/scoring.py` (`analyze_skill_gaps`, strong vs needs_improvement) |
| Tests | `ai-service/tests/` (pytest) — 15 tests: ranking, explainability, validation, alias normalization |
| Fallback scorer | `server/src/services/recommendation.service.js` — rule-based estimates when the AI service is down |

## Fallback behavior

If the AI service is unreachable, the Node backend still returns recommendations and
skill-gaps (instead of a hard failure):

* `POST /api/recommendations/generate` → `200` rule-based matches with `source: "fallback"` (embedded in each explanation)
* `GET /api/recommendations/careers/:careerId/skill-gaps` → `200` rule-based gaps with `source: "fallback"`
* The React pages show an **"Estimated · AI offline"** badge so users know the scores are estimates

Successful AI runs are tagged `source: "ai"`, and live AI results are mapped back to Appwrite
career documents by name.

## Running the tests

```bash
cd ai-service
python -m pytest        # 15 passed
```

---

# 📄 Resume Analysis

An advanced career tool that reads a user's resume (PDF / DOC / DOCX) and turns it
into a structured profile: skills with confidence, estimated experience, projects,
education, contact, strengths, action items, and best career matches. It is backed
by the Python AI service and reuses the same skill dataset as the recommendation
engine.

## User flow

```text
User uploads resume (or drops it on the drop zone)
    ↓
React / Appwrite Storage  (the resume file is stored in the `resumes` bucket)
    ↓
Node backend fetches the file bytes
    ↓
Python AI service /ai/resume/analyze
    ├── text-layer extraction (pypdf)
    ├── letter-spacing normalization (handles letter-spaced PDF fonts)
    └── skill/experience/project/education/contact detection
    ↓
Analysis persisted to resume_analyses  (latest analysis per user)
    ↓
Optional: detected skills applied to the user profile (feeds recommendations)
    ↓
Results rendered on /resume
```
# 🗺️ Phase 5 — Roadmap

Phase 5 (complete) turns your skill gaps into an ordered, editable, trackable learning plan.

## What was built

| Sub-part | Where |
|---|---|
| Frontend page | `src/pages/private/ResumeAnalysis.jsx` at `/resume` (drag-and-drop upload, results, "add skills to profile" checkbox) |
| API client | `src/services/resume.js` (upload → analyze → fetch) |
| Appwrite bucket | `resumes` (max 5 MB, pdf/doc/docx) — `create` permission added so users can upload |
| Node service | `server/src/services/resume.service.js` — fetch bytes via `storage.getFileDownload`, orchestrate AI, persist result, optional skill apply |
| Node routes | `server/src/routes/resume.routes.js` — `POST /api/resume/analyze`, `GET /api/resume/analysis/:id` (owner only) |
| Python analyzer | `ai-service/app/resume/analyzer.py` + `POST /ai/resume/analyze` |
| Resume dataset | `resume_analyses` collection (`user_id`, `appwrite_file_id`, `file_name`, `extracted_data`, `analysis_result`, `created_at`) |
| Tests | `ai-service/tests/test_resume.py` — skill detection, experience, education, letter-spacing densify, API |

## Extraction & normalization

The analyzer extracts text with **pypdf**, then runs a **letter-spacing normalizer**
(`densify_text`). Some resume fonts render the text layer with a space between every
glyph (`D e v e l o p e r` instead of `Developer`), which would otherwise defeat every
keyword/word-boundary detector. The normalizer detects that pattern (there are almost
no multi-character runs) and reconstructs words while leaving normal resumes untouched.

Detected signals:

* **Skills** — up to 16, each with a confidence % and proficiency (1–5)
* **Experience** — estimated years from explicit mentions or date ranges
* **Projects** — bullet items that describe built/developed work
* **Education** — highest degree hinted at (doctorate → high school)
* **Contact** — email extraction
* **Strengths / areas to improve** — derived from the above
* **Career matches** — scored against the career-skill catalog (same scoring as §23)

If the AI service is unavailable, the backend returns a rule-based read with
`source: "fallback"` instead of failing.

---

# ⚖️ Career Comparison

An advanced career tool that lets a user select two or more careers and see them
side by side. Each career card shows the hybrid match score, a difficulty
estimate, the reasons it matches, the user's current strengths, the exact skills
to grow (with current → required levels), and next steps — plus a "best pick"
highlight and a natural-language summary of which career fits best.

It reuses the same hybrid scoring formula as recommendations (docs
`main_architecture.md` §23 / `PRD.md` §18) and the career-skill catalog, so the
scores and skill gaps stay consistent with the rest of the product.

## User flow

```text
User opens /career-compare and selects 2+ careers from the catalog
    ↓
Node backend builds the user profile (skills, interests, goals, assessment, experience)
    ↓
Python AI service /ai/compare-careers scores each selected career
    ├── hybrid §23 score + reasons + strengths + skill gaps + next steps
    ├── difficulty estimate (required proficiency, assessment bar, years)
    └── recommended best pick + summary
    ↓
Backend maps results back to Appwrite career ids and returns them
    ↓
Results rendered side by side on /career-compare
```

## What was built

| Sub-part | Where |
|---|---|
| Frontend page | `src/pages/private/CareerComparison.jsx` at `/career-compare` (multi-select catalog, side-by-side cards, best-pick banner, difficulty badge) |
| API client | `src/services/comparison.js` |
| Node service | `server/src/services/comparison.service.js` — builds the user profile, orchestrates the AI call, maps results to catalog ids, fallback when AI is down |
| Node routes | `server/src/routes/comparison.routes.js` — `POST /api/careers/compare` (requires ≥ 2 career ids) |
| Python compare engine | `ai-service/app/recommendation/scoring.py` `compare_careers(...)` + `POST /ai/compare-careers` |
| Tests | `ai-service/tests/test_scoring.py` — name filtering, catalog fallback, metadata, gap details, recommended pick |
| Navigation | Top-bar "Compare" link + Dashboard "Career Comparison" card |

Like the other AI features, comparison is **stateless**: it scores the selected
careers on demand and does not persist anything. If the AI service is down, the
backend returns the built-in skills-based fallback with `source: "fallback"`.

---

## Upgrading an existing Appwrite setup

Resume analysis added the `resumes` storage bucket and the `resume_analyses`
collection, and requires the bucket to allow authenticated users to create files.
Apply the schema (idempotent — safe to re-run):

```bash
npm run setup:appwrite
```

> If your `resumes` bucket already exists, re-running setup just reuses it — confirm
> its permissions include `create("users")` so the frontend upload works
> (`storage.updateBucket` can add it if not).
| Data model | `roadmaps` + `roadmap_tasks` collections (user-scoped, already deployed) |
| Generator | `server/src/services/roadmap.service.js` — builds `Learn/Strengthen {skill}` tasks from `analyzeCareerGaps` (AI or fallback), plus project + interview milestones |
| Task lifecycle | `pending → in_progress → paused → completed`, reorder, add custom tasks |
| Progress | `completed / total × 100`, auto-recomputed and stored on `roadmaps.progress_percent` |
| API | `server/src/routes/roadmap.routes.js` — full CRUD under `/api/roadmaps` |

**Behavior notes**

- Reopening, adding, or removing a task recalculates progress and automatically flips a
  `completed` roadmap back to `active` — the status never stays "completed" with unfinished tasks.
- Reorder is a single batch call (`PUT /api/roadmaps/:id/tasks` with the full ordered id list).
- Backend operations parallelize independent Appwrite reads/writes and return state from
  memory instead of re-fetching, so mutations stay fast (a status change ~0.8s, a full
  10-task generation ~1.5s on Appwrite cloud).

## Roadmap endpoints

All routes require `Authorization: Bearer <jwt>` (Appwrite session token).

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/roadmaps` | Generate + save a roadmap for a career (`body: { career_id, title? }`) |
| `GET` | `/api/roadmaps` | List your roadmaps (active first) |
| `GET` | `/api/roadmaps/:id` | Roadmap with its tasks, ordered |
| `PUT` | `/api/roadmaps/:id` | Rename / pause / mark completed |
| `DELETE` | `/api/roadmaps/:id` | Delete roadmap + tasks |
| `POST` | `/api/roadmaps/:id/tasks` | Add a custom task |
| `PUT` | `/api/roadmaps/:id/tasks` | Reorder all tasks (`body: { order: [taskId, …] }`) |
| `PUT` | `/api/roadmaps/:id/tasks/:taskId` | Start, pause, complete, or reorder a task |
| `DELETE` | `/api/roadmaps/:id/tasks/:taskId` | Remove a task |

## Frontend pages

| Page | Route | What it does |
|---|---|---|
| `src/pages/private/Roadmaps.jsx` | `/roadmaps` | Generate a roadmap from any career; progress bars per roadmap |
| `src/pages/private/RoadmapDetail.jsx` | `/roadmaps/:id` | Task controls (start/pause/complete/reopen), reorder, custom tasks, rename, delete |

The dashboard shows your current roadmap and its progress, and the top nav links to it.

---

# 🐙 GitHub Analysis & Internships

Two implemented advanced career tools backed by the Node backend + Python AI service.

## GitHub analysis

Analyzes **publicly accessible** GitHub data (profile + repository metadata only —
never private content) and translates it into a technical profile with
languages, skill signals, active domains, activity/open-source indicators, and
career matches.

## What was built

| Sub-part | Where |
|---|---|
| Node provider + orchestration | `server/src/services/github.service.js` (`analyzeGitHub`) — GitHub API fetch → AI call → persist → optional skill apply |
| Fallback analyzer | `computeFallbackAnalysis` in the same service — same output shape when the AI service is down |
| Python analyzer | `ai-service/app/github/analyzer.py` + `POST /ai/github/analyze` |
| Frontend page | `src/pages/private/GitHubAnalysis.jsx` at `/github` |
| API client | `src/services/github.js` |
| Internship scoring | `server/src/services/internship.service.js` — weighted matching, top-10 persisted to `internship_recommendations` |
| Internship seed data | 8 internships, each with `skills` (JSON array) + `eligibility` |
| Internship frontend | `src/pages/private/Internships.jsx` at `/internships` (recommended grid + searchable catalog) |
| Admin backend | `server/src/routes/admin.routes.js` + `requireAdmin` (`ADMIN_EMAILS`) |
| Admin approval page | `src/pages/private/AdminInternships.jsx` at `/admin/internships` (approve/reject/delete + add form with description; status counts stay live via client-side filtering) |
| Import scheduler | `scripts/import-internships.mjs` + `npm run import:internships` (JSON feed default + Remotive adapter, dedup, pending by default) |

## Internship scoring

```text
Internship Score =
    Skill Match            × 0.55   (against the user's skill proficiencies)
  + Role/Goals/Interests   × 0.20   (preferred_role, career_goal, interests)
  + Education Match        × 0.15   (against the internship eligibility text)
  + Location Match         × 0.10   (preferred_location, remote/hybrid preference)
```

## API endpoints (Node backend)

All routes require `Authorization: Bearer <jwt>` (Appwrite session token).

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/github/analyze` | Analyze a public GitHub username (`body: { username, apply_skills? }`). Returns `{ username, source, analysis, analysis_id, skills_added }` |
| `GET` | `/api/github/analysis/:id` | Fetch a saved analysis (owner only) |
| `GET` | `/api/internships` | List **active, non-expired** internships (`query: { search?, company?, location? }`) |
| `GET` | `/api/internships/recommended` | Top-10 ranked matches for the user, persisted to `internship_recommendations` |
| `GET` | `/api/admin/me` | `{ is_admin }` check (admin only) |
| `GET` | `/api/admin/internships` | List all listings, filter by `status` (admin only) |
| `POST` | `/api/admin/internships` | Add a listing (created as `pending`) (admin only) |
| `PATCH` | `/api/admin/internships/:id` | Update fields/`status` — Approve/Reject/Restore (admin only) |
| `DELETE` | `/api/admin/internships/:id` | Delete a listing (admin only) |

> If the AI service is down, GitHub analysis returns the built-in heuristic
> result with `source: "fallback"` instead of failing.

## Keeping the catalog fresh (hybrid)

Internships go through an **approval gate** — new openings are never published
automatically:

1. **Collect** — run the importer on a schedule (cron / Task Scheduler / GitHub Actions):

   ```bash
   npm run import:internships                          # read scripts/feeds/internships.json (new rows = pending)
   npm run import:internships -- --dry-run             # fetch + report without writing
   npm run import:internships -- --source remotive     # pull from the Remotive API instead
   ```

   Its default source (`file`) reads `scripts/feeds/internships.json`
   (`FEED_FILE` points at a different file if needed) — replace its contents with
   your aggregator's output; `--source remotive` uses the Remotive API directly.
   Feed entries look like:

   ```json
   {
     "title": "Software Engineering Intern",
     "company": "Example Inc",
     "location": "Remote",
     "description": "…",
     "url": "https://example.com/careers/intern",
     "skills": ["JavaScript", "React", "Node.js", "SQL", "Git"]
   }
   ```

   Importer behavior/config lives in `scripts/.env.setup`: it dedups by `source_key`
   (`<feed>:<title>:<company>`), refreshes existing rows in
   place (keeping their status), and stamps `expires_at` (default 30 days, override with
   `INTERNSHIP_TTL_DAYS`).
2. **Approve** — sign in as an admin (see `ADMIN_EMAILS` below) and open
   `/admin/internships` to approve (→ `active`), reject (→ `rejected`), or delete rows.
   The page lists every status with live counts (client-side filter/search, no re-fetch),
   and the manual "Add internship" form includes a description field and pre-fills
   `expires_at` 30 days out to match the importer's default TTL.
3. **Auto-expire** — the public list only returns `active` rows whose `expires_at` has
   not passed, so stale listings vanish without manual cleanup.

Admin API is disabled until you set `ADMIN_EMAILS` in `server/.env` (comma-separated
emails). Seeded catalog rows are `active`; manually added rows are `pending`.
Importer vars in `scripts/.env.setup` are all optional (`SOURCE`, `FEED_FILE`,
`INTERNSHIP_TTL_DAYS`, `IMPORT_MAX`) — omit them to use the defaults above.

## Upgrading an existing Appwrite setup

The GitHub + internships work added `profiles.github_username`, `internships.skills` /
`internships.eligibility`, and the internship lifecycle attributes
(`status`, `source`, `source_key`, `expires_at`, `fetched_at`). Apply the schema,
then refresh the internship catalog:

```bash
npm run setup:appwrite
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

# Comma-separated emails allowed to use the admin routes (empty = admin API disabled)
ADMIN_EMAILS=
```

## AI Service (`ai-service/.env`)

```env
PORT=8000

LLM_API_KEY=
```

## Scripts (`scripts/.env.setup`)

Used by the Appwrite setup/seed/importer scripts.

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=

# Internship importer (scripts/import-internships.mjs)
SOURCE=file             # file (JSON feed) or remotive (API)
FEED_FILE=              # path to the JSON feed (default: scripts/feeds/internships.json)
INTERNSHIP_TTL_DAYS=30  # how long imported listings stay visible before auto-expiring
IMPORT_MAX=50           # max openings imported per run
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
 ├── feature/resume-analysis
 ├── feature/github-analysis
 └── feature/internships
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

## Phase 4 — AI

* [x] Python AI service (FastAPI)
* [x] Skill matching + ranking
* [x] Skill-gap analysis
* [x] AI test suite (pytest)
* [x] Rule-based fallback when the AI service is down

---

## Phase 5 — Roadmap

* [x] Roadmap generator
* [x] Roadmap tasks
* [x] Progress tracking
* [x] Task modification
* [x] Dashboard

---

## Phase 6 — Advanced Features

* [x] GitHub analysis
* [x] Resume analysis
* [ ] What-If simulator
* [x] Career comparison
* [ ] AI career assistant

---

## Phase 7 — External Integrations

* [x] Internship recommendations
* [ ] Courses
* [ ] Personalized notifications

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
