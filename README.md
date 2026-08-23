# 🎯 skillsaarthi — One-Stop Personalized Career & Education Advisor

> **An intelligent, personalized career and education guidance platform that helps students and learners discover suitable career paths, identify skill gaps, build personalized roadmaps, and track their progress.**

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

**skillsaarthi** is a personalized career and education advisor designed for:

* High school students
* College students
* Job seekers
* Learners exploring new career paths

Instead of providing generic career advice, skillsaarthi analyzes a user's:

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

skillsaarthi brings these capabilities together into a single platform.

---

# 💡 Our Solution

skillsaarthi creates a **personalized career profile** for each user.

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

## 3. Build Your Career Profile (4-step wizard)

The user provides information via `src/pages/private/Onboarding.jsx` — 4 steps: **Education → Academics → Skills & Interests (tabs) → Goals & Assessment (sub-step)** (previously 6; silent auto-add at proficiency 2 removed):

* Education / Academic performance / Subjects & strengths
* Skills (proficiency 1–5) & Interests (tabs)
* Goals & career preferences; assessment bundled as sub-step

---

## 4. Complete Assessment (now inside onboarding)

The assessment (10 questions covering interests, aptitude, work preferences, technical inclination, problem-solving, creativity) runs as a sub-step of Goals; `/assessment` remains available to retake anytime.

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
| 👥 Community Hub              | Posts, comments, likes, bookmarks    |
| 🔔 Personalized Notifications | In-app inbox + admin broadcasts       |
| 🔥 Daily Activity Streak      | Consecutive-day engagement counter   |
| 📈 Progress Tracking          | Track roadmap completion             |
| 🧭 Career Explorer            | Explore different career paths       |


## Notifications (Realtime)

In-app notifications are stored in the `notifications` collection (one document per
recipient, user-scoped permissions) and shown in a bell dropdown in the top bar:

```text
Recommendation / roadmap generated (or admin announcement)
        ↓
Node Backend  (server/src/services/notification.service.js — notify / notifyAllUsers)
        ↓
Appwrite Databases  (notifications collection)
        ↓
Notification Bell  (src/components/layout/NotificationBell.jsx — appwriteClient.subscribe to databases.*.collections.notifications.documents + 45s polling fallback)
        ↓
User inbox
```

Admins can broadcast from `/admin` (profile menu) via `POST /api/admin/notifications`,
targeting a single user by **email** or all users, and the system notifies on new career
matches or roadmap. (Email lookup uses Appwrite `Users` service → `users.read` scope on the backend API key.)

## Daily Activity Streak

The top bar shows a `🔥 {n} day streak` pill backed by real daily-activity counters on
the user profile (`current_streak`, `best_streak`, `last_active_date`). `touchStreak`
records one visit per day — consecutive days grow the streak, gaps reset it — and the
dashboard surfaces both current and best streaks.

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

skillsaarthi uses a **hybrid recommendation architecture** rather than relying entirely on a machine-learning model.

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

* React + JavaScript + Tailwind CSS + React Router
* Axios via `src/services/api.js` — **JWT cached until 60s before expiry** (avoids per-request `createJWT`)
* Lazy routes via `src/routes/AppRoutes.jsx` (`React.lazy` + `Suspense`, main chunk 662k → 409k)
* Appwrite Web SDK (auth, DB, storage, Realtime)

## Infrastructure & Data

* Appwrite Authentication
* Appwrite Databases (primary data store — NoSQL)
* Appwrite Storage
* Appwrite Messaging
* Appwrite Realtime

## Backend (server/)

* Node.js + Express + `express-rate-limit` (30/min on `/api/github|resume|admin` in `server/src/app.js`)
* Business logic + **scoring/catalog/GitHub/profile** (`server/src/services/scoring.js`, `careerCatalog.js`, `github.service.js` with `ContributionGrid`, `profile.builder.js`)
* Appwrite server integration + external APIs + resume-only AI orchestration (`/ai/resume/*`)

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
* Community posts, comments, likes, and bookmarks

## AI / ML — resume-only

* Python + FastAPI — `GET /health` + 5 resume endpoints (`POST /ai/resume/{extract,analyze,match,optimize,generate}`)
* pypdf / LLM provider (resume prompts) / optional LaTeX (`tectonic`/`pdflatex`)
* Scoring, careers catalog, skill-gaps, compare/what-if, GitHub moved to Node (see Backend)

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
              │ Tailwind      │  lazy routes AppRoutes.jsx (662k→409k)
              │ JWT cache     │  api.js (reuse until 60s before exp)
              └───────┬───────┘
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
   ┌──────────────┐        ┌──────────────────────┐
   │   Appwrite   │        │   Node/Express       │
   │              │        │   Backend (server/)  │
   │ Auth         │        │                      │
   │ Databases    │        │ Business Logic       │
   │ Storage      │        │ + Scoring/catalog    │  scoring.js, careerCatalog.js, profile.builder.js
   │ Messaging    │        │ + GitHub 13 metrics  │  github.service.js → ContributionGrid.jsx
   │ Realtime     │◄───────│ + Rate-limit 30/min  │  /api/github|resume|admin
   └──────────────┘        └───────────┬──────────┘
                                      │ resume-only
                                      ▼
                             ┌──────────────────┐
                             │ Python AI (resume)│
                             │ FastAPI           │
                              │ 5 endpoints       │  /health + /ai/resume/{extract,analyze,match,optimize,generate}
                             └──────────────────┘
                     (TopBar 3 hubs: Discover / Build / Opportunities; Homes merged Home.jsx; CommunityFab in App.jsx; NotificationBell Realtime + polling)
```

For the complete architecture, database design, ER diagram, API architecture, AI architecture, and data flows:

📖 **See [`docs/main_architecture.md`](docs/main_architecture.md)**

---

# 📂 Project Structure

```text
skillsaarthi/
│
├── src/                      # React frontend (repo root)
│   ├── assets/
│   ├── components/
│   │   ├── layout/           # TopBar.jsx (3 hubs: Discover:Matches/Gaps/Compare/What-If, Build:Roadmap/Resume/GitHub, Opportunities:Internships/Community), NotificationBell.jsx (Realtime+polling), CommunityFab.jsx (App.jsx)
│   │   ├── github/           # ContributionGrid.jsx (13 metrics, warm bg, tooltip "22 Sept 2026 — N contributions")
│   │   ├── career/           # GapDrawer.jsx (in-page on Recommendations)
│   │   └── ...               # common, auth, profile, roadmap, resume, courses, internships, assistant
│   ├── pages/
│   │   ├── public/           # Home.jsx (merged public+private — single component)
│   │   ├── auth/
│   │   ├── private/          # Dashboard.jsx (8 cards + 800ms retry), Recommendations.jsx (auto-generate 6 + GapDrawer), Onboarding.jsx (4 steps)
│   │   └── onboarding/       # (legacy) now consolidated into pages/private/Onboarding.jsx — 4 steps
│   ├── services/             # appwrite.js (appwriteClient for Realtime), api.js (JWT cache 60s), auth.js, profile.js, skills.js, interests.js, assessment.js, careers.js, recommendations.js, roadmaps.js, streak.js, notifications.js, github.js, comparison.js, whatif.js
│   ├── hooks/
│   ├── context/
│   ├── routes/               # AppRoutes.jsx (React.lazy + Suspense, 662k→409k)
│   └── App.jsx               # CommunityFab kept
│
├── public/
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/      # career, recommendation, roadmap, community, etc.
│   │   ├── services/         # scoring.js, careerCatalog.js, profile.builder.js, github.service.js (13 metrics, private count fix, languageShare incl. forks), appwrite, ai (resume-only), career, recommendation, roadmap, community, notification
│   │   ├── middleware/       # auth, error, rateLimit (express-rate-limit 30/min on /api/github|resume|admin)
│   │   ├── routes/           # health, careers, recommendations, roadmaps, resume, github, what-if, comparison, community, admin
│   │   ├── app.js            # mounts rate limiters
│   │   └── utils/
│   └── package.json
│
├── ai-service/               # Python resume-only LLM service
│   ├── app/
│   │   ├── ai/               # LLM gateway client
│   │   ├── resume/           # ingest.py, pipeline.py, prompts.py, schema.py, scoring.py, latex/
│   │   └── main.py           # GET /health + POST /ai/resume/{extract,analyze,match,optimize,generate}
│   ├── tests/                # test_health + resume pipeline/schema/scoring/ingest/latex tests
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
cd skillsaarthi
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

Endpoints (resume-only — scoring/catalog/GitHub moved to Node `scoring.js`/`careerCatalog.js`/`github.service.js`):

```text
GET  /health                     service health
POST /ai/resume/extract          extract text from resume bytes
POST /ai/resume/analyze          LLM resume analysis (main)
POST /ai/resume/match            resume ↔ career matching
POST /ai/resume/optimize         resume optimization suggestions
POST /ai/resume/generate         LaTeX/PDF generation (degrades to .tex without compiler)
```

> **Windows note:** PowerShell 5.1 does not support `&&` (use `;` to chain commands). If you prefer to activate the venv explicitly, run `Set-ExecutionPolicy -Scope Process RemoteSigned` once, then activate with `.\venv\Scripts\Activate.ps1`.

> **Keep it running.** The resume LLM is the only Python-dependent flow; scoring, recommendations, skill-gaps, compare/what-if, and GitHub are Node-native (`scoring.js`/`careerCatalog.js`/`github.service.js`/`profile.builder.js`) and work even if the AI service is down. The Node backend calls Python only for `/ai/resume/*` at `AI_SERVICE_URL=http://localhost:8000`; if it is down, resume returns a heuristic fallback (`source:"fallback"`) while other features stay fully functional (see [docs/main_architecture.md §42](docs/main_architecture.md)).
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

1. Open the skillsaarthi folder in VS Code.
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

# 🧭 Phase 2 — Profile & Onboarding (4-step, updated)

Phase 2 (complete) builds the user's structured career profile in Appwrite. This profile is the primary input to the Phase 3 recommendation engine. Updated this session: 6 → 4 steps, tabs consolidation, no silent proficiency-2 auto-add.

## User flow

```text
Sign up
   ↓
/onboarding — 4-step wizard (src/pages/private/Onboarding.jsx)
   ├── 1. Education level
   ├── 2. Academics (fields vary by education level — subjects, grades/CGPA, strengths)
   ├── 3. Skills & Interests (two tabs in one step; proficiency 1–5 explicit — removed silent auto-add at 2)
   └── 4. Goals & Assessment (career preferences + 10-question assessment as sub-step)
        ↓
Onboarding marked complete → auto-generates 6 recommendations → /dashboard (8 cards, 800ms retry avoids 0-skills flash)
```

* New users land on `/onboarding` right after signup.
* **Admins skip onboarding** — if the signup email is in `ADMIN_EMAILS`, signup sends the user
  to `/home` (merged `src/pages/public/Home.jsx` + `private/Home.jsx` — single `Home` component) instead, the hero shows an "Open admin panel" CTA via the profile menu (Admin moved from TopBar to profile dropdown), and `ProfileCompleteRoute`
  lets admins through without a completed profile.
* The wizard resumes at the first **incomplete** step for returning users (each step can be skipped).
* `/assessment` is available any time to retake the career assessment and compare scores.
* `/onboarding/education-level` lets users change their education level later from the dashboard.
* `/dashboard` is gated by `ProfileCompleteRoute`, which requires `onboarding_completed = true` (admins exempt). Lazy routes in `src/routes/AppRoutes.jsx` keep the main chunk small (662k→409k).

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
| `current_streak`, `best_streak`, `last_active_date` | Daily-activity streak counters (`touchStreak` in `src/services/streak.js`) |

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

# 🧠 Phase 3 — Core Intelligence (Node-native, updated)

Phase 3 (complete) implements the product's core intelligence: the career/skill
datasets, the career-skill mapping, the recommendation engine, skill-gap analysis,
and explainable recommendations — now **entirely Node** (`server/src/services/scoring.js` + `careerCatalog.js` + `profile.builder.js`), no Python.

## What was built

| Sub-part | Where |
|---|---|
| Career dataset | `server/src/services/careerCatalog.js` (13 careers) + Appwrite `careers` collection |
| Skill dataset | Appwrite `skills` collection (seeded) |
| Career-skill mapping | Appwrite `career_skills` collection (`required_level` 1–5, `importance` 1–5) |
| Recommendation engine | `server/src/services/scoring.js` (`scoreCareers`) + `profile.builder.js` |
| Skill-gap analysis | `server/src/services/scoring.js` (`analyzeSkillGaps`) — Node in-process, no `/ai/skill-gaps` |
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

## API endpoints (Node backend — no Python call)

All routes require `Authorization: Bearer <jwt>` (Appwrite session token, cached in `src/services/api.js` until 60s before expiry).

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/careers` | List career catalog with required skills (`careerCatalog.js`) |
| `GET` | `/api/careers/:careerId` | Single career with required skills |
| `POST` | `/api/recommendations/generate` | Generate + persist recommendations via `scoring.js` (`body: { top_n? }`) — auto-generates 6 on onboarding complete |
| `GET` | `/api/recommendations` | Saved recommendations |
| `GET` | `/api/recommendations/:id` | Single saved recommendation |
| `GET` | `/api/recommendations/careers/:careerId/skill-gaps` | Skill-gap analysis via `scoring.js` for a career |

> Node-native — no AI failure mode for recommendations. Python is only for resume (`/ai/resume/*` with `source:"fallback"` heuristic); scoring/compare/what-if/GitHub never call Python.

## Frontend services

* `src/services/careers.js` — career catalog + skill-gap API calls
* `src/services/recommendations.js` — generate/list/get recommendation API calls

## Frontend pages

Phase 3 UI is wired and routed behind `ProfileCompleteRoute` (lazy via `src/routes/AppRoutes.jsx`):

| Page | Route | What it does |
|---|---|---|
| `src/pages/private/Recommendations.jsx` | `/recommendations` | Lists saved matches; auto-generates 6 on onboarding complete; "Generate recommendations" rebuilds; in-page `GapDrawer` (`src/components/career/GapDrawer.jsx`) shows gaps without navigation |
| `src/pages/private/SkillGaps.jsx` | `/skill-gaps/:careerId?` | Career dropdown + strong/needs-improvement gap analysis (also via GapDrawer) |

TopBar 3 hubs: **Discover** (Matches/Gaps/Compare/What-If), **Build** (Roadmap/Resume/GitHub), **Opportunities** (Internships/Community); Admin moved to profile menu.

## Upgrading an existing Appwrite setup

Phase 3 changed `career_skills` semantics: `required_level` is now on the user
proficiency scale (1–5) and `importance` on 1–5 (previously mixed scales). The
seed script now **updates** existing `career_skills` documents instead of skipping
them, so re-running it repairs existing data:

```bash
npm run seed:catalog
```

---

# 🤖 Phase 4 — AI (resume-only, lightweight — updated)

Phase 4 now implements the AI layer as a **resume-only** Python service; scoring, catalog, and GitHub have moved to Node.

## What was built

| Sub-part | Where |
|---|---|
| Python AI service (resume-only) | `ai-service/` — FastAPI on port 8000 — `GET /health` + 5 resume endpoints (`POST /ai/resume/{extract,analyze,match,optimize,generate}`) |
| Scoring / catalog / GitHub | **Node-native**: `server/src/services/scoring.js`, `careerCatalog.js`, `github.service.js` + `profile.builder.js` (no Python endpoints) |
| Resume pipeline | `ai-service/app/resume/` — LLM extraction, analysis, matching, optimization, LaTeX/PDF generation |
| Tests | `ai-service/tests/` — resume pipeline, schema, scoring, ingest, LaTeX, and AI client tests |

## Fallback behavior

Only the resume path has a fallback — other features are Node-native and need none:

* `POST /api/resume/analyze` → `200` heuristic `computeFallbackAnalysis` with `source:"fallback"` if Python is down (resume untouched per hold)
* `POST /api/recommendations/generate`, `/skill-gaps`, `/compare`, `/what-if`, `/github/analyze` → Node-direct via `scoring.js`/`github.service.js` — always succeed, no `source:"fallback"` tag

## Running the tests

```bash
cd ai-service
python -m pytest        # health + resume only (scoring tests removed — now Node)
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

## What was built

| Sub-part | Where |
|---|---|
| Frontend page | `src/pages/private/ResumeAnalysis.jsx` at `/resume` (drag-and-drop upload, results, "add skills to profile" checkbox) |
| API client | `src/services/resume.js` (upload → analyze → fetch) |
| Appwrite bucket | `resumes` (max 5 MB, pdf/doc/docx) — `create` permission added so users can upload |
| Node service | `server/src/services/resume.service.js` — fetch bytes via `storage.getFileDownload`, orchestrate AI, persist result, optional skill apply |
| Node routes | `server/src/routes/resume.routes.js` — `POST /api/resume/analyze`, `GET /api/resume/analysis/:id` (owner only) |
| Python AI | `ai-service/app/resume/pipeline.py` + `POST /ai/resume/{extract,analyze,match,optimize,generate}` |
| Resume dataset | `resume_analyses` collection (`user_id`, `appwrite_file_id`, `file_name`, `extracted_data`, `analysis_result`, `created_at`) |
| Tests | `ai-service/tests/` — resume pipeline, schema, scoring, ingest, LaTeX, AI client tests |

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

---

# 🗺️ Phase 5 — Roadmap

Phase 5 (complete) turns your skill gaps into an ordered, editable, trackable learning plan.

## What was built

| Sub-part | Where |
|---|---|
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

# ⚖️ Career Comparison (Node-native, updated)

An advanced career tool that lets a user select two or more careers and see them
side by side. Each career card shows the hybrid match score, a difficulty
estimate, the reasons it matches, the user's current strengths, the exact skills
to grow (with current → required levels), and next steps — plus a "best pick"
highlight and a natural-language summary.

It reuses the same Node hybrid scoring formula as recommendations (`server/src/services/scoring.js` + `careerCatalog.js` + `profile.builder.js`, §23) so scores stay consistent.

## User flow

```text
User opens /career-compare and selects 2+ careers
    ↓
Node backend (profile.builder.js builds normalized profile)
    ↓
scoring.js + careerCatalog.js (in-process, no Python)
    ├── §23 score + reasons + strengths + skill gaps + next steps
    ├── difficulty estimate (required proficiency, assessment bar, years)
    └── best pick + summary
    ↓
Results rendered side by side on /career-compare
```

## What was built

| Sub-part | Where |
|---|---|
| Frontend page | `src/pages/private/CareerComparison.jsx` at `/career-compare` (multi-select catalog, side-by-side cards, best-pick banner, difficulty badge) |
| API client | `src/services/comparison.js` |
| Node service | `server/src/services/comparison.service.js` → `scoring.js` + `careerCatalog.js` + `profile.builder.js` (Node-native, no AI call) |
| Node routes | `server/src/routes/comparison.routes.js` — `POST /api/careers/compare` (≥ 2 ids) |
| Python | Removed — `ai-service/app/recommendation/scoring.py` + all Python recommendation endpoints deleted |
| Navigation | TopBar **Discover** hub → Compare + Dashboard "Career Comparison" card (Dashboard now 8 cards, 800ms retry) |

Stateless — scores on demand, nothing persisted, no fallback needed (Node-direct).

---

# 🔮 What-If Simulator (Node-native, updated)

A safe, read-only tool that lets a user answer *"What happens if I learn Python?"* before investing time. It runs the recommendation engine
against a **temporary copy** of the user's profile — the real profile is never
modified (§26).

Each simulated change is a skill with a target proficiency (1–5), e.g. "Python
at level 4". The engine re-scores the whole catalog and returns the current
(baseline) and hypothetical (simulated) rankings side by side, with per-career
score deltas and a plain-language summary. All scores are **estimated**, not guarantees.

## User flow

```text
User opens /what-if and adds hypothetical skill changes
    ↓
Node backend (profile.builder.js builds real profile)
    ↓
scoring.js + careerCatalog.js apply changes to in-memory copy (_applyWhatIfChanges)
    ├── baseline ranking  (real profile)
    ├── simulated ranking (modified profile)
    └── delta per career + summary
    ↓
Results rendered on /what-if (biggest movers, ranking shift, unchanged careers)
```

## What was built

| Sub-part | Where |
|---|---|
| Frontend page | `src/pages/private/WhatIfSimulator.jsx` at `/what-if` (skill+level builder, biggest-movers cards, baseline vs simulated ranking shift) |
| API client | `src/services/whatif.js` |
| Node service | `server/src/services/whatif.service.js` → `scoring.js` + `profile.builder.js` + `careerCatalog.js` (Node-native, validates `{name, proficiency 1–5}`, copies profile, never writes real profile) |
| Node routes | `server/src/routes/whatif.routes.js` — `POST /api/what-if/simulate` (≥ 1 change; proficiency 1–5) — rate-limited via `server/src/app.js` |
| Python | Removed — `ai-service/app/recommendation/scoring.py` + all Python recommendation endpoints deleted |
| Navigation | TopBar **Discover** hub → What-If + Dashboard "What-If Simulator" card |

Stateless — nothing persisted, no fallback needed (Node-direct).

---

# 🐙 GitHub Analysis (Node-native) & Internships

Two implemented advanced career tools — GitHub is now **Node-only** (no Python), internships unchanged.

## GitHub analysis (Node-native, 13 metrics)

Analyzes **publicly accessible** GitHub data (profile + repository metadata only —
never private content) and translates it into a technical profile with
`src/components/github/ContributionGrid.jsx` — warm background with contrast, tooltip `"22 Sept 2026 — N contributions"`, 13 metrics: current/longest streak, total contributions, avg daily, most active day/month, top languages (includes forks via `languageShare`), public/private repos (private count = only private repos), followers, PRs/issues/reviews. Rate-limited 30/min (`server/src/app.js`).

## What was built

| Sub-part | Where |
|---|---|
| Node analyzer (no Python) | `server/src/services/github.service.js` (`analyzeGitHub`) — GitHub API fetch → local heuristics (13 metrics) → persist → optional skill apply; `languageShare` includes forks, private count correct |
| Frontend grid | `src/components/github/ContributionGrid.jsx` — 13 metrics, warm bg contrast, tooltip `"22 Sept 2026 — N contributions"` |
| Python analyzer | **Removed** — `ai-service/app/github/analyzer.py` + `POST /ai/github/analyze` deleted |
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

## API endpoints (Node backend — JWT cached 60s before exp; `/api/github|resume|admin` rate-limited 30/min)

All routes require `Authorization: Bearer <jwt>` (Appwrite session token).

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/github/analyze` | Node-native via `github.service.js` (no Python) — analyze a public username (`body: { username, apply_skills? }`). Returns `{ username, source, analysis, analysis_id, skills_added }` with 13 ContributionGrid metrics |
| `GET` | `/api/github/analysis/:id` | Fetch a saved analysis (owner only) |
| `GET` | `/api/internships` | List **active, non-expired** internships (`query: { search?, company?, location? }`) |
| `GET` | `/api/internships/recommended` | Top-10 ranked matches for the user, persisted to `internship_recommendations` |
| `GET` | `/api/admin/me` | `{ is_admin }` check (admin only) |
| `GET` | `/api/admin/internships` | List all listings, filter by `status` (admin only) |
| `POST` | `/api/admin/internships` | Add a listing (created as `pending`) (admin only) |
| `PATCH` | `/api/admin/internships/:id` | Update fields/`status` — Approve/Reject/Restore (admin only) |
| `DELETE` | `/api/admin/internships/:id` | Delete a listing (admin only) |

> GitHub is Node-native — no Python call, no `source:"fallback"` needed. Resume is the only fallback path.

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

# 👥 Community

A lightweight community hub where learners share questions, resources, success
stories, and advice. Purely frontend + Node backend + Appwrite — **no AI features,
no new services**.

## What was built

| Sub-part | Where |
|---|---|
| Data model | 5 new Appwrite collections (`community_profiles`, `community_posts`, `community_comments`, `post_likes`, `post_bookmarks`) |
| Backend service | `server/src/services/community.service.js` — posts (draft/published), comments, like/bookmark toggles, saved posts, community profiles, search/filter/sort, live author identity |
| Backend API | `server/src/routes/community.routes.js` + `server/src/controllers/community.controller.js` under `/api/community` (all `requireAuth`) |
| Frontend service | `src/services/community.js` |
| Reusable components | `src/components/community/` — `Avatar`, `PostCard`, `PostComposer`, `CommentSection`, `ProfileEditor`, `PressSection` (news carousel) |
| Frontend pages | `src/pages/private/Community*.jsx` routed behind `ProfileCompleteRoute` |
| Navigation | Floating Community button (`src/components/layout/CommunityFab.jsx` kept in `src/App.jsx`) — sticky bottom-right green square that expands into "Community" pill on hover + footer link; TopBar now 3 hubs (Discover/Build/Opportunities) — Admin moved to profile menu |

## Posts

- Posts have a `title`, `content`, `category` (one of Career Guidance / Skill
  Building / Internship / Success Story / Resource / General), up to 8 `tags`,
  and a `status` of `draft` or `published`.
- **Drafts** are private: authors see them via the drafts scope, other users get
  `404` on a private draft, and the feed only ever shows published posts.
- Counters (`likes_count`, `comments_count`) are stored denormalized on the post
  so the feed can sort by popularity without joins.
- **Author identity is live** — the backend resolves each author's display name
  and avatar from the Appwrite account (`Users.get`, reused from the existing
  User model) with a 120s in-memory cache. The backend API key needs the
  `users.read` scope (already required by admin notifications).

## In The Press

The `/community` page is split into two sections. Above the posts, an
**In The Press** strip (`src/components/community/PressSection.jsx`) shows a
curated **auto-advancing carousel** of tech news — it slides on a timer, pauses
on hover, and has prev/next arrows + dot navigation.

- **Prototype:** the news is hardcoded in `PressSection.jsx` for now — no API or
  collection yet, so it always renders.
- **Planned:** news items will come from an admin-approved/rejected feed (its own
  collection with a `status` of `approved`/`rejected`), with admins reviewing
  submissions in the admin area.

## Like notifications

When someone likes a post, the post author gets **one** in-app notification
(`"New like on your post"`), no matter how many times that same user likes,
unlikes, and re-likes. The `notifications` collection gained two marker
attributes (`actor_id`, `post_id`) and a `user_actor_post_idx` index; the
community service checks for an existing marker before sending, and a failed
notification never blocks the like itself.

## API endpoints

All routes require `Authorization: Bearer <jwt>` (Appwrite session token).

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/community/posts` | Published feed — `query: { category?, sort (newest\|popular), search?, scope (published\|mine\|drafts), offset?, limit? }` |
| `POST` | `/api/community/posts` | Create a post (`body: { title, content, category?, tags?, status? }`) |
| `GET` | `/api/community/posts/:id` | Post detail (owner can see draft; others get 404 for drafts) |
| `PUT` | `/api/community/posts/:id` | Update post (owner only) |
| `DELETE` | `/api/community/posts/:id` | Delete post + its comments/likes/bookmarks (owner only) |
| `POST` | `/api/community/posts/:id/like` | Toggle like (`{ liked, likes_count }`) |
| `POST` | `/api/community/posts/:id/bookmark` | Toggle bookmark (`{ bookmarked }`) |
| `GET` | `/api/community/posts/:id/comments` | List comments (oldest first, with author) |
| `POST` | `/api/community/posts/:id/comments` | Add a comment |
| `PUT` | `/api/community/comments/:commentId` | Update comment (owner only) |
| `DELETE` | `/api/community/comments/:commentId` | Delete comment (owner only) |
| `GET` | `/api/community/saved` | Posts you bookmarked |
| `GET` | `/api/community/profile` | Your community profile + account name/avatar |
| `PUT` | `/api/community/profile` | Upsert your community profile (`bio`, `location`, `role`, `interests`) |
| `GET` | `/api/community/users/:userId` | Public profile + up to 20 published posts |

## Frontend pages

| Page | Route | What it does |
|---|---|---|
| `src/pages/private/Community.jsx` | `/community` | Two sections: "In The Press" news carousel on top, "Posts" feed below (search, category chips, newest/popular sort, composer, inline delete) |
| `src/pages/private/CommunityPostDetail.jsx` | `/community/posts/:id` | Full post, like/bookmark, edit/delete (owner), comment section |
| `src/pages/private/CommunitySaved.jsx` | `/community/saved` | Bookmarked posts |
| `src/pages/private/CommunityDrafts.jsx` | `/community/drafts` | My unpublished drafts (edit / publish / delete) |
| `src/pages/private/CommunityUserProfile.jsx` | `/community/users/:userId` | Public profile view + community profile editor (own) |

## Upgrading an existing Appwrite setup

The Community feature adds 5 collections (`community_profiles`, `community_posts`,
`community_comments`, `post_likes`, `post_bookmarks`) with their attributes and
indexes. One-shot like notifications also extend the `notifications` collection
with `actor_id` + `post_id` attributes and a `user_actor_post_idx` compound index.
The setup script is idempotent — apply the schema by re-running:

```bash
npm run setup:appwrite
```

> The `users.read` API-key scope is required so the feed can resolve author names
> and avatars live from the Appwrite account (the scope is already documented for
> admin notifications).

---

# 🔐 Environment Variables

Create `.env` files based on `.env.sample`.

## Frontend (repo root)

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_RESUME_BUCKET_ID=resumes
VITE_APPWRITE_AVATAR_BUCKET_ID=resumes
VITE_API_BASE_URL=http://localhost:5000
```

> The Appwrite free plan allows a single storage bucket, so avatars share the
> resume bucket (its allowed extensions include images). If you upgrade your
> plan, you can set `VITE_APPWRITE_AVATAR_BUCKET_ID` to a dedicated bucket.

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

# 🌐 Deployment / Production Hosting

The product runs as four independent services. Frontend and the two backends are hosted on
platforms with free tiers; all data/auth stays on Appwrite Cloud.

## Live URLs

| Service | Platform | URL | Health check |
| --- | --- | --- | --- |
| Frontend (React + Vite) | Vercel | `https://skillsaarthi.vercel.app` | — |
| Backend (Node.js + Express) | Render | `https://skillsaarthi-node.onrender.com` | `/api/health` |
| AI service (Python + FastAPI) | Render | `https://skillsaarthi-f14x.onrender.com` | `/health` |
| Appwrite | Appwrite Cloud | `https://cloud.appwrite.io` | — |

## Production topology

```text
Browser
  │
  ▼
https://skillsaarthi.vercel.app            (Vercel — static React frontend)
  │                                      │
  │ direct: auth, DB reads/writes,       │ business logic + AI orchestration
  │ storage (Appwrite Web SDK)           │
  ▼                                      ▼
Appwrite Cloud                    https://skillsaarthi-node.onrender.com
(cloud.appwrite.io)               (Render — Node.js backend)
                                             │
                                             ▼
                                      https://skillsaarthi-f14x.onrender.com
                                      (Render — Python FastAPI AI service)
```

## Production environment variables

### Frontend (Vercel → Settings → Environment Variables)

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<your-project-id>
VITE_APPWRITE_DATABASE_ID=<your-database-id>
VITE_APPWRITE_RESUME_BUCKET_ID=resumes
VITE_APPWRITE_AVATAR_BUCKET_ID=resumes
VITE_API_BASE_URL=https://skillsaarthi-node.onrender.com
```

### Backend (Render → `skillsaarthi-node` → Environment)

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<your-project-id>
APPWRITE_DATABASE_ID=<your-database-id>
APPWRITE_RESUME_BUCKET_ID=resumes
APPWRITE_API_KEY=<your-api-key>
AI_SERVICE_URL=https://skillsaarthi-f14x.onrender.com
GITHUB_TOKEN=<optional>
LLM_API_KEY=<optional>
ADMIN_EMAILS=admin@skillguide.com
```

> `PORT` is injected by Render automatically — do not override it.

### AI service (Render → `skillsaarthi-ai` → Environment)

```env
PYTHON_VERSION=3.12.10
LLM_API_KEY=<optional>
```

> The AI service must run on **Python 3.12** (set via the `PYTHON_VERSION` env var). The pinned
> dependencies (`pandas==2.2.3`, `numpy==2.2.1`, `scikit-learn==1.6.0`, `pydantic==2.10.4`) ship
> prebuilt wheels only through Python 3.12 — on Render's default Python 3.14 pip compiles from
> source and the `pydantic-core` build fails. `PORT` is injected by Render.

> **Resume PDF generation** — the LaTeX compiler is **optional** and detected at runtime
> (`app/resume/latex/compile.py`). Without one, the `/ai/resume/generate` endpoint still returns
> the `.tex` source with `compiled: false` and the UI shows a clear "PDF compiler not found"
> message instead of the download button. Nothing breaks. On a local Windows machine the compiler
> can be installed with `winget install MiKTeX.MiKTeX`; on Render's Linux containers it must be
> installed at deploy time. Two supported options when you want PDFs in production:
>
> 1. **Tectonic** (recommended) — add `tectonic` to the AI service build command (single ~100MB
>    binary, downloads LaTeX packages on demand, fits the free-tier disk), and add `tectonic` to
>    the `COMPILERS` tuple in `app/resume/latex/compile.py`.
> 2. **TeX Live via apt** — prepend the AI service build command with
>    `apt-get update && apt-get install -y texlive-latex-extra texlive-fonts-recommended`
>    (heavy, ~1.5GB, may exceed free-tier disk) — provides `pdflatex`/`xelatex` with no code change.

## Render service settings

| Setting | `skillsaarthi-node` (backend) | `skillsaarthi-ai` (AI service) |
| --- | --- | --- |
| Environment | Node | Python |
| Root Directory | `server` | `ai-service` |
| Build Command | `npm install` | `pip install -r requirements.txt` |
| Start Command | `npm start` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Python Version | — | `3.12.10` (via `PYTHON_VERSION`) |

## Vercel settings

* Framework preset: **Vite** (auto-detected)
* Build command: `npm run build`
* Output directory: `dist`
* SPA fallback (React Router) is handled automatically by Vercel's Vite preset.

## Deployment order

1. Deploy the **AI service** first, copy its URL.
2. Deploy the **backend** with `AI_SERVICE_URL` pointing at the AI service URL.
3. Deploy the **frontend** with `VITE_API_BASE_URL` pointing at the backend URL.
4. Add `https://skillsaarthi.vercel.app` to **Appwrite → Settings → Platforms** (Web App) —
   without this, email/password login fails in production.
5. Run `npm run setup:appwrite` and `npm run seed:catalog` once against the cloud project.

## Production notes

* Render free tier services sleep after ~15 minutes of inactivity. Two **cron-job.org** cron jobs
  (every 5 minutes) ping the backend and AI service to keep them awake. Point them at the
  lightweight health endpoints (not the bare root):
  `https://skillsaarthi-node.onrender.com/health` and `https://skillsaarthi-f14x.onrender.com/health`.
  Warm them up manually before a demo as a backup.
* The backend exposes lightweight root `/` and `/health` routes for uptime monitoring (both return a
  small JSON body); all data API routes live under `/api/*` (e.g. `/api/health`). Cron checks must
  call `/health` on each service — never a heavy data endpoint.
* Secrets (Appwrite API key, GitHub token, LLM key) live only in the hosting dashboards — `.env`
  files are gitignored and never committed.
* All user data persists in Appwrite Cloud, so the stateless Node/Python services can be
  redeployed freely without data loss.
* **Resume PDF** generation works locally when a LaTeX compiler is installed (e.g. MiKTeX via
  `winget install MiKTeX.MiKTeX`). In production it requires a compiler on the AI service — see
  the "Resume PDF generation" note under the AI service environment section above. Until then the
  app degrades gracefully: users still get the `.tex` download.

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

## Phase 4 — AI (resume-only, updated)

* [x] Python AI service (FastAPI) — resume-only 6 endpoints (`/health` + `/ai/resume/*`)
* [x] Scoring / catalog / GitHub moved to Node (`scoring.js`, `careerCatalog.js`, `github.service.js`, `profile.builder.js`)
* [x] Resume test suite only (`test_health` + `test_resume`; `test_scoring` removed)
* [x] Rate limiting 30/min (`express-rate-limit` on `/api/github|resume|admin`), JWT cache (60s), lazy routes (662k→409k)

---

## Phase 5 — Roadmap

* [x] Roadmap generator
* [x] Roadmap tasks
* [x] Progress tracking
* [x] Task modification
* [x] Dashboard

---

## Phase 6 — Advanced Features (updated)

* [x] GitHub analysis — Node-native with ContributionGrid 13 metrics (warm bg, tooltip date, correct private count, languageShare incl. forks)
* [x] Resume analysis — untouched per hold (Python `/ai/resume/*` + fallback)
* [x] What-If simulator — Node-native (`scoring.js` + `profile.builder.js`)
* [x] Career comparison — Node-native (`scoring.js` + `careerCatalog.js`)
* [x] Recommendations — auto-generate 6 on onboarding + GapDrawer in-page
* [x] Notifications — Realtime (`appwriteClient.subscribe` + 45s polling fallback)
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

skillsaarthi handles personal user information.

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

skillsaarthi provides **personalized guidance and recommendations**.

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

skillsaarthi aims to move career guidance from:

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

## 🚀 skillsaarthi

**Understand yourself. Discover possibilities. Build your path.**
