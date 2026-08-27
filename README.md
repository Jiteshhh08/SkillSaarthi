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


## Notifications & Streak (summary)

> In-app notifications are per-recipient docs in the `notifications` collection (user-scoped permissions) with a bell dropdown (Realtime `appwriteClient.subscribe` + 45s polling fallback). Admins can broadcast via `POST /api/admin/notifications` (email or all users). System notifications fire on recommendation/roadmap generation. Streak is `current_streak`/`best_streak`/`last_active_date` on `profiles`, updated once per day (`touchStreak`) and shown as `🔥 {n} day streak`.
>
> **Single source:** workflow and lifecycle → [`docs/rules.md` §7](docs/rules.md) (Notifications & Streaks, Hybrid Internship workflow) and [`docs/main_architecture.md` §32](docs/main_architecture.md) (API Architecture — Notifications). Single notification collection spec is in main_architecture §17, UI details in [`docs/design.md`](docs/design.md).

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

# 🧠 Intelligent Recommendation System (summary)

> Hybrid architecture: User Profile → Data Processing → Rule-Based + Skill + optional ML → Career Ranking → Skill Gap → Roadmap. MVP works without large ML dataset; weights are configurable.
>
> **Single source:** scoring formula and gap engine → [`docs/main_architecture.md` §23](docs/main_architecture.md) (Recommendation Engine) and §24 (Skill Gap Engine). See there for weights, importance-weighted skill match, and breakdown fields.

---

# 🛠️ Technology Stack (summary)

> Full stack at a glance: **React + Tailwind + Appwrite (Auth/DB/Storage/Realtime) + Node/Express (scoring/catalog/GitHub/profile) + Python FastAPI (resume-only)**. Frontend caches JWT until 60s before expiry and lazy-loads routes (662k→409k). Backend rate-limits 30/min on `/api/github|resume|admin` and proxies resume to Python; all other scoring is Node-native. Appwrite is the primary data store (NoSQL). Design tokens and layout rules are the single source in [`docs/design.md`](docs/design.md).
>
> **Single source:** architecture diagram + responsibility matrix → [`docs/main_architecture.md` §2–§3](docs/main_architecture.md) (2 High-Level Architecture, 3 Responsibility Matrix). See there for the canonical diagram, layer responsibilities, and placement of `scoring.js` / `careerCatalog.js` / `profile.builder.js` / `github.service.js`.

# 🏗️ System Architecture (summary)

> User → React (TopBar 3 hubs: Discover/Build/Opportunities) → Appwrite (Auth/DB/Storage/Realtime) and Node/Express (business logic + scoring/GitHub) → Python AI (resume-only, 5 endpoints + `/health`). Topology, trust-proxy, rate-limit, and deployment order are detailed in the single source.
>
> **Single source:** [`docs/main_architecture.md` §2–§3](docs/main_architecture.md) for diagram, §47 for topology/deployment, and [`docs/design.md`](docs/design.md) for tokens. The in-repo diagram below is intentionally omitted — see the canonical diagram in main_architecture §2.

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
│   │   ├── layout/           # TopBar, NotificationBell, CommunityFab
│   │   ├── github/           # ContributionGrid (13 metrics)
│   │   ├── career/           # GapDrawer (inline gaps)
│   │   └── ...               # common, auth, profile, roadmap, resume, courses, internships, assistant
│   ├── pages/
│   │   ├── public/           # Home (merged public+private)
│   │   ├── auth/
│   │   └── private/          # Dashboard, Recommendations, Onboarding, etc.
│   ├── services/             # appwrite, api (JWT cache), auth, profile, skills, interests, assessment, careers, recommendations, roadmaps, streak, notifications, github, comparison, whatif
│   ├── hooks/  context/  routes/  # AppRoutes (lazy + Suspense)
│   └── App.jsx               # CommunityFab kept
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── config/  controllers/  services/  middleware/  routes/  utils/
│   │   └── app.js            # rate limiters
│   └── package.json
│
├── ai-service/               # Python resume-only LLM service
│   ├── app/
│   │   ├── ai/               # LLM gateway client
│   │   ├── resume/           # ingest, pipeline, prompts, schema, scoring, latex
│   │   └── main.py           # GET /health + POST /ai/resume/*
│   ├── tests/                # resume pipeline tests
│   └── requirements.txt
│
├── docs/  PRD.md  main_architecture.md  rules.md  design.md
│
├── .env  .env.sample  .gitignore  vite.config.js  package.json
├── .vscode/tasks.json · dev.ps1/dev.sh · dev-install.* · dev-cleanup.*
└── scripts/  setup-appwrite.mjs  seed-catalog.mjs  import-internships.mjs
```

> Full file:line references and hub details are in the single source [`docs/main_architecture.md` §5–§6](docs/main_architecture.md) and [`PROJECT_AUDIT.md`](PROJECT_AUDIT.md). Design tokens → [`docs/design.md`](docs/design.md).

---

# ⚙️ Getting Started (summary)

> Prerequisites: Node.js + npm, Python 3.x, Git, and an Appwrite project (cloud or self-hosted). Create the Appwrite project, enable Email/Password auth, create API key (`databases.*` + `storage.*` + `users.read`), then run the idempotent setup/seed scripts, then start the three services.
>
> ```bash
> git clone <REPOSITORY_URL> && cd skillsaarthi
> cp scripts/.env.setup.example scripts/.env.setup  # fill APPWRITE_PROJECT_ID + APPWRITE_API_KEY
> npm run setup:appwrite            # creates DB, collections, indexes, buckets (idempotent)
> cp .env.sample .env               # fill VITE_APPWRITE_* + VITE_API_BASE_URL
> npm run seed:catalog              # seeds skills/interests/careers/courses/internships
> npm install && npm run dev        # frontend at http://localhost:5173
> cd server && npm install && npm run dev          # backend at http://localhost:5000 (server/.env)
> cd ai-service && .\venv\Scripts\python.exe -m pip install -r requirements.txt && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload  # AI at http://localhost:8000/health
> ```
>
> Keep three terminals (Vite 5173, Express 5000, FastAPI 8000) or use VS Code tasks (`.vscode/tasks.json`) / `dev.ps1`/`dev.sh` (separate windows) / `dev-cleanup.*` to kill stale ports. See below for “Start Everything at Once” and verify `GET /health` on each service.
>
> **Single sources:** env tables → [`docs/rules.md` §5](docs/rules.md); architecture + local topology → [`docs/main_architecture.md` §37–§38](docs/main_architecture.md); production hosting → [`docs/main_architecture.md` §47](docs/main_architecture.md); design → [`docs/design.md`](docs/design.md).

# 6. Start Everything at Once (summary)

> **VS Code:** `Terminal → Run Task…` → `dev: restart everything (clean, then run)` (Ctrl/Cmd+Shift+B) or `dev: run all three` — opens Frontend/Backend/AI Service panels (5173/5000/8000). **Any editor:** `\dev.ps1` (Windows, allow `Set-ExecutionPolicy -Scope Process RemoteSigned`) or `./dev.sh` (macOS/Linux) — one window per service. Keep all three open (auto-reload); confirm AI via `http://localhost:8000/health` → `{"status":"ok"}`. If `Port 5173 is in use` → run `dev: restart everything` or `cleanup: stop running dev servers`.
>
> **Single source:** [`docs/main_architecture.md` §37–§38](docs/main_architecture.md) (local dev).

---

# 🧭 Phase 2 — Profile & Onboarding (4-step, updated)

> 4-step wizard at `Onboarding.jsx` (Education → Academics → Skills & Interests tabs (proficiency 1–5 explicit) → Goals & Assessment sub-step (preferences + 10-Q)). New users land on `/onboarding`; admins (`ADMIN_EMAILS`) skip to `/home`; wizard resumes at first incomplete step; `/assessment` retake any time; `/onboarding/education-level` later; `/dashboard` gated by `ProfileCompleteRoute` (`onboarding_completed`, admins exempt). Lazy routes keep main chunk 662k→409k.
>
> **Data:** `profiles` (doc ID = Appwrite user `$id`) + `user_skills`/`user_interests`/`assessments` collections; global `skills`/`interests` seeded via `npm run seed:catalog` (frontend falls back to built-in list). Attributes `subjects`, `academic_strengths`, `preferred_role`, `work_preference`, `experience_years`, `assessment_score`, `onboarding_completed`, `current_streak`/`best_streak`/`last_active_date` added in Phase 2 — re-run `npm run setup:appwrite` to add idempotently.
>
> **Single source:** collections + indexes → [`docs/main_architecture.md` §17–§18](docs/main_architecture.md); conventions → [`docs/rules.md` §6–§7](docs/rules.md); services at `profile.js`/`skills.js`/`interests.js`/`assessment.js`.

---

# 🧠 Phase 3 — Core Intelligence (Node-native, updated)

> Career/skill datasets, career-skill mapping, recommendation engine, skill-gap, explanations — all **Node** (`scoring.js` + `careerCatalog.js` 13 careers + `profile.builder.js`), no Python. Scoring via `scoreCareers`, gaps via `analyzeSkillGaps` (in-process). Each recommendation includes `score`/`breakdown`/`reasons`/`strengths`/`skill_gaps`/`next_steps`.
>
> **APIs (JWT `Authorization: Bearer <jwt>`, cached 60s):** `GET /api/careers` (+ `:careerId`), `POST /api/recommendations/generate` (auto 6 on onboarding), `GET /api/recommendations`/`/:id`, `GET /api/recommendations/careers/:careerId/skill-gaps` — all Node, no fallback needed (resume is only fallback path). Frontend `careers.js`/`recommendations.js`; UI `Recommendations.jsx` (`/recommendations`, GapDrawer inline) + `SkillGaps.jsx` (`/skill-gaps/:careerId`); TopBar Discover hub.
>
> **Upgrading:** `career_skills` `required_level`/`importance` now 1–5; seed script **updates** existing docs — re-run `npm run seed:catalog`.
>
> **Single source:** formula → [`docs/main_architecture.md` §23](docs/main_architecture.md); pipeline → §22 summary; gaps → §24 summary.

---

# 🤖 Phase 4 — AI (resume-only, lightweight — updated)

> **Built:** Python resume-only FastAPI (port 8000, `GET /health` + 5 `POST /ai/resume/{extract,analyze,match,optimize,generate}` at `pypdf`/LLM/LaTeX), Node scoring/catalog/GitHub (`scoring.js`, `careerCatalog.js`, `github.service.js` + `profile.builder.js`), resume pipeline `ai-service/app/resume/` (ingest/pipeline/prompts/schema/scoring/latex), tests `ai-service/tests/` (resume pipeline/schema/scoring/ingest/latex + AI client).
>
> **Fallback:** only `POST /api/resume/analyze` has `source:"fallback"` heuristic when Python down; `recommendations`/`skill-gaps`/`compare`/`what-if`/`github` are Node-direct (always succeed, no `fallback` tag). Run `python -m pytest` in `ai-service/` (health + resume only).
>
> **Single source:** service scope → [`docs/main_architecture.md` §19–§21](docs/main_architecture.md) (resume-only) and §42 (AI Failure Handling).

---

# 📄 Resume Analysis (summary)

> Resume (PDF/DOC/DOCX) → Appwrite `resumes` bucket → Node fetches bytes → Python `POST /ai/resume/analyze` (pypdf + `densify_text` letter-spacing normalizer) → structured skills/confidence, experience, projects, education, strengths/next-steps, career matches → persisted in `resume_analyses` (latest per user) → optionally applied to `user_skills` → rendered at `/resume` (drag-and-drop, add-skills checkbox). If AI is down, Node returns heuristic `source:"fallback"` (200). Setup re-runs `npm run setup:appwrite` (idempotent).
>
> **Single source:** flow and collection spec → [`docs/main_architecture.md` §27](docs/main_architecture.md) (Resume Analysis) and §19–§21 (AI Service, resume-only). Prompts/schema/LaTeX are in `ai-service/app/resume/`.

---

# 🗺️ Phase 5 — Roadmap (summary)

> Turns skill gaps into ordered trackable plan. **Data:** `roadmaps` + `roadmap_tasks` (user-scoped, statuses `pending→in_progress→paused→completed`, reorder + custom tasks, `progress_percent` auto `completed/total×100`, revert `completed→active` if tasks reopened). **Generator:** `roadmap.service.js` builds `Learn/Strengthen {skill}` tasks via `analyzeCareerGaps` + project/interview milestones (parallel Appwrite ops, batch reorder). **APIs:** `POST/GET /api/roadmaps`, `GET/PUT/DELETE /api/roadmaps/:id`, `POST /api/roadmaps/:id/tasks`, `PUT /api/roadmaps/:id/tasks` (batch reorder `{order:[id,…]}`), `PUT/DELETE /api/roadmaps/:id/tasks/:taskId`. UI `/roadmaps` + `/roadmaps/:id`; Dashboard shows current roadmap.
>
> **Single source:** generation/progress/performance → [`docs/main_architecture.md` §25](docs/main_architecture.md) (Roadmap Generation) and §17–§18 (collections), §32 (API — Roadmaps).

---

# ⚖️ Career Comparison (Node-native, summary)

> Select ≥2 careers at `/career-compare` → Node `profile.builder` + `scoring.js` + `careerCatalog.js` (no Python) reuses §23 formula to produce side-by-side cards with scores, difficulty (proficiency/assessment/years), `reasons`/`strengths`/`skill_gaps`/`next_steps`, `best pick` highlight and summary. Stateless, no persistence, no fallback needed. TopBar **Discover → Compare**, Dashboard card.
>
> **Single source:** [`docs/main_architecture.md` §23](docs/main_architecture.md) (scoring) + §32 (API — `/api/careers/compare`).

---

# 🔮 What-If Simulator (Node-native, summary)

> Safe read-only simulator at `/what-if`: add hypothetical `{name, proficiency 1–5}` changes → Node copies profile (`_applyWhatIfChanges`), re-scores full catalog via `scoring.js` for baseline vs simulated, returns per-career deltas + summary (scores are **estimated**). Real profile never mutated. Validates 1–5, stateless, rate-limited, no Python, no fallback.
>
> **Single source:** [`docs/main_architecture.md` §26](docs/main_architecture.md) (What-If) and §23 (scoring). See also [`docs/rules.md` §7](docs/rules.md) for API conventions.

---

# 🐙 GitHub Analysis (Node-native) & Internships (summary)

> **GitHub (Node-only, 13 metrics):** Public profile + repos via GitHub REST + GraphQL `contributionsCollection` (needs `GITHUB_TOKEN`, else `fallbackDaysFromRepos` from `pushed_at`). Metrics: contributions grid (5 intensity levels), streaks, totals, avg, most active day/month, languages (`languageShare` by `repo.size`, includes forks), public/private repos (private via `repositories(privacy:PRIVATE)` only), followers/PRs/issues/reviews. Persisted to `github_analyses`; rendered in `ContributionGrid` (warm `bg-warm` outer, `bg-white` inner, tooltip `22 Sept — N contributions`). Rate-limited 30/min. No Python.
>
> **Internships (scoring + lifecycle):** Weighted match `Skill×0.55 + Role/Goals/Interests×0.20 + Education×0.15 + Location×0.10` in `internship.service.js`, top-10 in `internship_recommendations`. Catalog `internships` has `skills` (JSON) + `eligibility`, plus lifecycle `status`/`source`/`source_key`/`expires_at`/`fetched_at`. Freshness via hybrid gate: importer (`npm run import:internships`, `file` or `remotive`, dedup `source_key`, TTL 30d) creates `pending`, admin approves at `/admin/internships` → `active`, public list auto-expires. Seeded rows `active`, manual `pending`. `ADMIN_EMAILS` enables admin.
>
> **Single sources:** GitHub internals → [`docs/main_architecture.md` §28](docs/main_architecture.md); Internship workflow → [`docs/rules.md` §7](docs/rules.md) (Hybrid Internship Catalog) and [`docs/main_architecture.md` §31](docs/main_architecture.md) for formula/lifecycle.

---

# 👥 Community (summary)

> Lightweight hub: 5 collections (`community_profiles`, `community_posts`, `community_comments`, `post_likes`, `post_bookmarks`), Node `community.service.js` (posts draft/published, comments, like/bookmark toggles, search/filter/sort, live author via `Users.get` cached 120s), API under `/api/community` (`requireAuth`, ownership checks), pages `/community` (+ `/posts/:id`, `/saved`, `/drafts`, `/users/:userId`), components `Avatar`/`PostCard`/`PostComposer`/`CommentSection` etc., nav via `CommunityFab` (sticky green) + TopBar **Opportunities → Community**. Likes send one in-app notification (marker `actor_id`/`post_id` + `user_actor_post_idx`).
>
> **Single source:** data model + API → [`docs/main_architecture.md` §17](docs/main_architecture.md) (collections) and §32 (API — Community). Rules → [`docs/rules.md` §7](docs/rules.md) and design → [`docs/design.md`](docs/design.md).

---

# 🆕 Today’s Changes — 26 Sept 2026 (summary)

> 26 Sept fixes: GitHub Node-only (`github.service.js` + `ContributionGrid` 13 metrics, warm bg contrast, `Sept` tooltip, private-count fix, `languageShare` includes forks), TopBar 3 hubs (Discover/Build/Opportunities, Admin in ProfileMenu, hamburger iPhone <460px fix), Homes merged (single `Home`), lazy routes (662k→409k), JWT cache (60s), rate-limit `express-rate-limit` 30/min (`trust proxy 1`), NotificationBell Realtime + 45s polling, Dashboard 800ms retry, Community `PressSection` removed, `ai-service` trimmed to resume-only (`GET /health` + 5 `POST /ai/resume/*`), scoring moved to Node (`scoring.js` + `careerCatalog.js` + `profile.builder.js`), email OFF (mock `_dev_otp`, Resend HTTPS ready).
>
> **Single source (changelog):** [`PROJECT_AUDIT.md`](PROJECT_AUDIT.md) (feature inventory, workflow problems, priorities). Architecture diffs → [`docs/main_architecture.md`](docs/main_architecture.md) §1/§5/§19/§47, rules → [`docs/rules.md` §12–§15](docs/rules.md).

---

# 🔐 Environment Variables (summary)

> Copy `.env.sample` → `.env` (gitignored). Frontend `VITE_*` are build-time (Vite inlines `import.meta.env`, needs redeploy); backend `server/.env` is server-only via `server/src/config/environment.js`; AI `ai-service/.env` is Python gateway; scripts use `scripts/.env.setup` for setup/seed/importer. Appwrite free plan reuses `resumes` bucket for avatars; paid plan uses `avatars`. Render blocks SMTP, so prefer Resend HTTPS; trust-proxy + rate-limit need `GITHUB_TOKEN`/`ADMIN_EMAILS` etc.
>
> **Single source:** all env tables + prod wiring → [`docs/rules.md` §5](docs/rules.md) (Environment Variables) and [`docs/main_architecture.md` §36](docs/main_architecture.md) (summary) + §47 (Production Hosting). Never commit secrets; production vars live in Vercel/Render dashboards.

---

# 🌐 Deployment / Production Hosting (summary)

> Four services: Frontend (Vercel static, `https://skillsaarthi.vercel.app`), Backend Node (Render `https://skillsaarthi-node.onrender.com` `/api/health`), AI Python (Render `https://skillsaarthi-f14x.onrender.com` `/health`), Data (Appwrite Cloud). Set `VITE_API_BASE_URL` to Render backend (must redeploy), backend `APPWRITE_*` + `AI_SERVICE_URL` + `GITHUB_TOKEN`/`ADMIN_EMAILS`/`FRONTEND_URL`/`RESEND_API_KEY` on Render (PYTHON_VERSION=3.12.10 for AI), add Vercel URL to Appwrite Platforms, run `setup:appwrite` + `seed:catalog`, keep free tier awake via cron-job.org every 5min on `/health`.
>
> **Single source:** full topology, env mappings, build/start commands, order, and verification → [`docs/main_architecture.md` §47](docs/main_architecture.md) (Production Hosting & Deployment) and [`docs/rules.md` §15](docs/rules.md) (Production Hosting). Design → [`docs/design.md`](docs/design.md).

---

# 🌱 Development Workflow (summary)

> Feature branches (`main` stable): `git checkout -b feature/<name>` → add/commit (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`) → push → PR → review → merge after approval. Do not push to `main` or commit secrets (`.env` gitignored). Rebase/merge with `main` before PR. Keep components small, services in `src/services/`, routes protected, controllers thin/services thick, parallelize Appwrite calls, batch reorder via single `PUT`.
>
> **Single source:** conventions → [`docs/rules.md` §8–§10](docs/rules.md) (Git Workflow, Commit Conventions, Code Standards) and [`docs/main_architecture.md` §43–§44](docs/main_architecture.md) (Repo Architecture, Development Strategy). Full rules → [`docs/rules.md`](docs/rules.md).

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
